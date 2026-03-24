"use server";

import bcrypt from "bcryptjs";
import prisma from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addMonths, subDays, getYear } from "date-fns";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type ActionState = {
  success?: boolean;
  email?: string | null;
  espaceId?: string | null;
  error?: string | null;
};

/**
 * Action pour la création initiale (Inscription + Premier Espace)
 */
export async function creerEspace(prevState: any, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nomEspace = formData.get('nomEspace') as string;
  const siret = formData.get('siret') as string;
  const anneeActuelle = new Date().getFullYear().toString();

  let createdEspaceId: string | null = null;

  try {
    const siretExistant = await prisma.espace.findUnique({ where: { siret } });
    if (siretExistant) return { error: "Ce numéro SIRET est déjà rattaché à une société." };

    await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await tx.user.create({
          data: { email, password: hashedPassword }
        });
      }

      const nouvelEspace = await tx.espace.create({
        data: { nom: nomEspace, siret, userId: user.id }
      });

      createdEspaceId = nouvelEspace.id;

      await tx.exercice.create({
        data: {
          code: anneeActuelle,
          dateDebut: new Date(Date.UTC(+anneeActuelle, 0, 1)),
          dateFin: new Date(Date.UTC(+anneeActuelle, 11, 31)),
          isActif: true,
          espaceId: nouvelEspace.id
        }
      });
    });

    revalidatePath('/');
    return { success: true, email, espaceId: createdEspaceId, error: null };

  } catch (err) {
    console.error("Erreur creation :", err);
    return { error: "Erreur lors de la configuration de l'espace." };
  }
}

/**
 * ✅ ACTION MANQUANTE : Modifier ou créer un exercice fiscal
 * Assurez-vous que le mot-clé 'export' est bien présent ici.
 */
export async function modifierOuCreerExerciceAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const espaceId = formData.get("espaceId")?.toString();
  const dateDebutStr = formData.get("dateDebut") as string;
  const objectifStr = formData.get("objectif") as string;

  if (!dateDebutStr || !espaceId) return;

  const dateDebut = new Date(dateDebutStr);
  const dateFin = subDays(addMonths(dateDebut, 12), 1);
  const code = getYear(dateFin).toString();
  const objectif = parseFloat(objectifStr) || 0;

  try {
    if (id && id !== "undefined" && id !== "") {
      await prisma.exercice.update({
        where: { id },
        data: { dateDebut, dateFin, code, objectif },
      });
    } else {
      // Désactiver les autres exercices
      await prisma.exercice.updateMany({
        where: { espaceId },
        data: { isActif: false }
      });

      await prisma.exercice.create({
        data: {
          espaceId,
          dateDebut,
          dateFin,
          code,
          isActif: true,
          objectif,
        },
      });
    }
    revalidatePath(`/dashboard/${espaceId}`);
  } catch (error) {
    console.error("Erreur exercice :", error);
  }
}

/**
 * Action pour ajouter une société supplémentaire (depuis le dashboard)
 */
export async function ajouterSocieteAction(prevState: any, formData: FormData) {
  const nomEspace = formData.get('nomEspace') as string;
  const siret = formData.get('siret') as string;
  const anneeActuelle = new Date().getFullYear().toString();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Session expirée." };

  const userId = session.user.id;
  let createdEspaceId: string | null = null;

  try {
    const siretExistant = await prisma.espace.findUnique({ where: { siret } });
    if (siretExistant) return { error: "SIRET déjà rattaché." };

    await prisma.$transaction(async (tx) => {
      const nouvelEspace = await tx.espace.create({
        data: { nom: nomEspace, siret, userId }
      });
      createdEspaceId = nouvelEspace.id;

      await tx.exercice.create({
        data: {
          code: anneeActuelle,
          dateDebut: new Date(Date.UTC(+anneeActuelle, 0, 1)),
          dateFin: new Date(Date.UTC(+anneeActuelle, 11, 31)),
          isActif: true,
          espaceId: nouvelEspace.id
        }
      });
    });

    revalidatePath('/dashboard', 'layout');
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: "Erreur lors de l'ajout de la société." };
  }

  if (createdEspaceId) {
    redirect(`/dashboard/${createdEspaceId}?nouveau=true`);
  }
}

export async function updateEspaceAction(id: string, formData: FormData) {
  await prisma.espace.update({
    where: { id },
    data: {
      nom: formData.get("nom") as string,
      formeJuridique: formData.get("formeJuridique") as string,
      dirigeantPrenom: formData.get("dirigeantPrenom") as string,
      dirigeantNom: formData.get("dirigeantNom") as string,
      adresse: formData.get("adresse") as string,
      codePostal: formData.get("codePostal") as string,
      ville: formData.get("ville") as string,
      email: formData.get("email") as string,
      telephone: formData.get("telephone") as string,
    }
  });
  revalidatePath(`/dashboard/${id}`);
}