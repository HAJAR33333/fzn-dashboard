"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StatutFrais } from "@/app/generated/prisma";

export async function creerFraisKilometrique(formData: FormData) {
  try {
    // 1. Extraction et logs de debug
    const espaceId = formData.get("espaceId") as string;
    const userId = formData.get("userId") as string;
    const clientId = formData.get("clientId") as string; // Provient du select
    const distanceRaw = formData.get("distance"); // Provient de l'input hidden
    const dateStr = formData.get("date") as string;
    
    // On récupère les calculs faits par le front pour plus de précision
    const montantTotal = formData.get("montantTotal");
    const tauxApplique = formData.get("tauxApplique");

    // 2. Vérification stricte (Le crash arrivait ici car distance était null)
    if (!userId || !distanceRaw || !dateStr || !espaceId) {
      console.error("Données manquantes :", { userId, distanceRaw, dateStr, espaceId });
      return { success: false, error: "Veuillez remplir tous les champs obligatoires." };
    }

    const distance = parseFloat(distanceRaw as string);
    const montant = montantTotal ? parseFloat(montantTotal as string) : 0;
    const taux = tauxApplique ? parseFloat(tauxApplique as string) : 0;

    // 3. Gestion du Nom du Client
    // Si ta base de données attend 'clientNom' (String) mais que tu as un 'clientId' (UUID)
    let nomFinalClient = "Client non spécifié";
    if (clientId) {
      const clientDb = await prisma.client.findUnique({
        where: { id: clientId },
        select: { nom: true }
      });
      if (clientDb) nomFinalClient = clientDb.nom;
    }

    // 4. Création en base de données
    await prisma.fraisKilometrique.create({
      data: {
        date: new Date(dateStr),
        clientNom: nomFinalClient, // On utilise le nom récupéré
        distance,
        taux,
        montant,
        userId,
        espaceId,
        statut: "EN_ATTENTE",
      },
    });

    revalidatePath(`/dashboard/${espaceId}/frais`);
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la création du frais:", error);
    return { success: false, error: "Erreur technique lors de l'enregistrement." };
  }
}

export async function updateStatutFrais(id: string, statut: string, espaceId: string) {
  try {
    await prisma.fraisKilometrique.update({
      where: { id },
      data: { 
        statut: statut as StatutFrais // Cast pour Prisma
      },
    });
    
    // On revalide la page pour mettre à jour les compteurs (Total à régulariser)
    revalidatePath(`/dashboard/${espaceId}/frais`);
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false };
  }
}