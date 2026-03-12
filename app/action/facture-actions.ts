"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StatutFacture } from "../generated/prisma"; 
import { Resend } from 'resend';
import React from "react";
import { pdf } from "@react-pdf/renderer";
import InvoiceTemplate from "@/app/dashboard/[id]/_components/pdf/InvoiceTemplate";

/**
 * ACTION : CONVERTIR UN DEVIS EN FACTURE
 */
export async function convertirDevisEnFacture(id: string, espaceId: string) {
  try {
    const devis = await prisma.facture.findUnique({ where: { id } });
    if (!devis) throw new Error("Document introuvable");

    await prisma.facture.update({
      where: { id },
      data: {
        type: "FACTURE",
        statut: "VALIDE" as StatutFacture, 
        numero: devis.numero.replace("DEV", "FAC"),
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/${espaceId}/gestion`);
    return { success: true };
  } catch (error) {
    console.error("Erreur Conversion:", error);
    return { error: "Erreur lors de la conversion." };
  }
}

/**
 * ACTION : CHANGER LE STATUT (PAYÉ, ANNULÉ, etc.)
 */
export async function changerStatutFacture(
  factureId: string, 
  nouveauStatut: StatutFacture, 
  espaceId: string
) {
  try {
    await prisma.facture.update({
      where: { id: factureId },
      data: { statut: nouveauStatut },
    });
    revalidatePath(`/dashboard/${espaceId}/gestion`);
    return { success: true };
  } catch (error) {
    console.error("Erreur Statut:", error);
    return { error: "Erreur lors du changement de statut." };
  }
}

/**
 * ACTION : CRÉER UN DEVIS
 */
export async function createDevis(formData: FormData, lignes: any[], espaceId: string) {
  const clientId = formData.get("clientId") as string;
  const exerciceId = formData.get("exerciceId") as string;

  // 1. CALCULS DES TOTAUX (SÉCURITÉ SERVEUR)
  let totalNetHT = 0;
  let totalTVA = 0;

  const lignesPreparees = lignes.map(l => {
    const qte = parseFloat(l.quantite) || 0;
    const pu = parseFloat(l.prixUnitaire) || 0;
    const remisePct = parseFloat(l.remise) || 0;
    const tvaPct = parseFloat(l.tva) || 0;

    // Calcul du montant HT après remise pour la ligne
    const sousTotalBrut = qte * pu;
    const montantRemise = sousTotalBrut * (remisePct / 100);
    const sousTotalNetHT = sousTotalBrut - montantRemise;
    
    // Calcul de la TVA pour la ligne
    const montantTVA = sousTotalNetHT * (tvaPct / 100);

    totalNetHT += sousTotalNetHT;
    totalTVA += montantTVA;

    return {
      designation: l.designation,
      quantite: qte,
      prixUnitaire: pu,
      remise: remisePct, // Inclus car ajouté au schéma
      tva: tvaPct,       // Inclus car ajouté au schéma
    };
  });

  try {
    const numeroAuto = `DEV-${Math.floor(10000 + Math.random() * 90000)}`;

    // 2. INSERTION EN BASE DE DONNÉES
    await prisma.facture.create({
      data: {
        numero: numeroAuto,
        type: "DEVIS",
        statut: "BROUILLON" as StatutFacture,
        montantHT: totalNetHT,    // Total net de remises
        montantTVA: totalTVA,    // Valeur désormais requise
        totalTTC: totalNetHT + totalTVA, // Valeur désormais requise
        clientId: clientId,
        espaceId: espaceId,
        exerciceId: exerciceId,
        lignes: {
          create: lignesPreparees
        }
      }
    });

    revalidatePath(`/dashboard/${espaceId}/gestion`);
  } catch (error) {
    console.error("Erreur Création:", error);
    return { error: "Erreur lors de la création." };
  }
  redirect(`/dashboard/${espaceId}/gestion`);
}

// On initialise Resend uniquement si la clé existe
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;


export async function envoyerEmailClient(docId: string, espaceId: string) {
  if (!resend) return { error: "Resend non configuré" };

  try {
    // 1. On récupère le document ET les infos de l'utilisateur (via l'espace)
    const doc = await prisma.facture.findUnique({
      where: { id: docId },
      include: { 
        client: true, 
        lignes: true, 
        espace: {
          include: {
            // Assurez-vous d'avoir une relation 'user' dans votre modèle Espace
            // ou récupérez l'email du user via votre système d'auth
            user: true 
          }
        } 
      }
    });

    if (!doc || !doc.client.email) return { error: "Email client introuvable" };

    // 2. Préparation des variables dynamiques
    const nomSociete = doc.espace.nom; // Le nom de la société active
    const emailUser = doc.espace.user?.email || "contact@votre-domaine.com";

    // 3. Génération du PDF (votre code actuel)
    const pdfInstance = pdf(React.createElement(InvoiceTemplate, { data: doc }) as any);
    const blob = await pdfInstance.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 4. ENVOI DE L'EMAIL
    await resend.emails.send({
      from: `${nomSociete} <onboarding@resend.dev>`, // En mode gratuit/test, Resend n'autorise QUE onboarding@resend.dev comme expéditeur.
      
      // Très important : permet au client de répondre directement à l'utilisateur
      replyTo: emailUser, 
      
      to: doc.client.email,
      subject: `${doc.type} n°${doc.numero} - ${nomSociete}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4f46e5;">Bonjour ${doc.client.nom},</h2>
          <p>Vous trouverez ci-joint votre <strong>${doc.type.toLowerCase()} n°${doc.numero}</strong> édité par <strong>${nomSociete}</strong>.</p>
          <div style="background-color: #f8faff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">Montant total : <strong>${doc.montantHT.toLocaleString('fr-FR')} €</strong></p>
          </div>
          <p>Nous restons à votre disposition pour toute question.</p>
          <br/>
          <p>Cordialement,<br/><strong>L'équipe ${nomSociete}</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `${doc.numero}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur complète envoi email:", error);
    return { error: "Erreur lors de la génération ou de l'envoi du PDF." };
  }
}



export async function updateDocument(
  docId: string, 
  formData: FormData, 
  lignes: any[], 
  espaceId: string
) {
  const clientId = formData.get("clientId") as string;
  
  // --- RE-CALCULS DE SÉCURITÉ ---
  let totalNetHT = 0;
  let totalTVA = 0;

  const lignesPreparees = lignes.map(l => {
    const qte = parseFloat(l.quantite) || 0;
    const pu = parseFloat(l.prixUnitaire) || 0;
    const remisePct = parseFloat(l.remise) || 0;
    const tvaPct = parseFloat(l.tva) || 0;

    const netHT = (qte * pu) * (1 - remisePct / 100);
    const montantTVA = netHT * (tvaPct / 100);

    totalNetHT += netHT;
    totalTVA += montantTVA;

    return {
      designation: l.designation,
      quantite: qte,
      prixUnitaire: pu,
      remise: remisePct,
      tva: tvaPct,
    };
  });

  try {
    const docActuel = await prisma.facture.findUnique({ where: { id: docId } });
    if (!docActuel) throw new Error("Document introuvable");
    if (docActuel.statut === "PAYE") return { error: "Modification impossible pour un document payé." };

    await prisma.facture.update({
      where: { id: docId },
      data: {
        clientId: clientId,
        montantHT: totalNetHT,
        montantTVA: totalTVA,
        totalTTC: totalNetHT + totalTVA,
        updatedAt: new Date(),
        lignes: {
          deleteMany: {}, // On nettoie les anciennes lignes
          create: lignesPreparees // On insère les nouvelles avec TVA/Remise
        }
      }
    });

    revalidatePath(`/dashboard/${espaceId}/gestion`);
  } catch (error) {
    console.error("Erreur Modification:", error);
    return { error: "Erreur lors de la mise à jour." };
  }
  
  redirect(`/dashboard/${espaceId}/gestion`);
}