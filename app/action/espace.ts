"use server";

import bcrypt from "bcryptjs"; import prisma from '../../lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addMonths, subDays, getYear } from "date-fns";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function creerEspace(prevState: any, formData: FormData) {
  // Récupération des données du formulaire
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nomEspace = formData.get('nomEspace') as string
  const siret = formData.get('siret') as string
  const anneeActuelle = new Date().getFullYear().toString()

  // Variable pour stocker l'ID de l'espace créé afin de rediriger après
  let createdEspaceId: string | null = null;

  try {
    // 1. Vérifications de sécurité
    const siretExistant = await prisma.espace.findUnique({ where: { siret } })
    if (siretExistant) {
      return { error: "Ce numéro SIRET est déjà rattaché à une société." }
    }

    // 2. Transaction Atomique
    await prisma.$transaction(async (tx) => {

      // On cherche si l'utilisateur existe déjà, sinon on le crée
      let user = await tx.user.findUnique({ where: { email } })

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await tx.user.create({
          data: {
            email,
            password: hashedPassword
          }
        })
      }

      // Création de la société (Espace) liée à cet utilisateur
      const nouvelEspace = await tx.espace.create({
        data: {
          nom: nomEspace,
          siret: siret,
          userId: user.id
        }
      })

      // On stocke l'ID pour la redirection
      createdEspaceId = nouvelEspace.id;

      // Création automatique du premier exercice comptable
      await tx.exercice.create({
        data: {
          code: anneeActuelle,
          dateDebut: new Date(Date.UTC(+anneeActuelle, 0, 1)),
          dateFin: new Date(Date.UTC(+anneeActuelle, 11, 31)),
          isActif: true,
          espaceId: nouvelEspace.id
        }
      })
    })

    revalidatePath('/')

  } catch (err) {
    console.error("Erreur lors de la création :", err)
    return { error: "Une erreur est survenue lors de la configuration de votre espace." }
  }

  // 3. Redirection directe vers le Dashboard de la société créée
  if (createdEspaceId) {
    redirect(`/dashboard/${createdEspaceId}?nouveau=true`);
  }
}

export async function modifierOuCreerExerciceAction(formData: FormData) {
  const id = formData.get("id") as string; // ID de l'exercice si modification
  const espaceId = formData.get("espaceId") as string;
  const dateDebutStr = formData.get("dateDebut") as string;

  const dateDebut = new Date(dateDebutStr);

  // RÈGLE : Calcul automatique de la date de fin (Date début + 12 mois - 1 jour)
  // Exemple : 01/01/2024 -> 31/12/2024
  const dateFin = subDays(addMonths(dateDebut, 12), 1);

  // RÈGLE : Le code prend l'année de la date de FIN
  const code = getYear(dateFin).toString();

  if (id) {
    // Modification
    await prisma.exercice.update({
      where: { id },
      data: {
        dateDebut,
        dateFin,
        code,
      },
    });
  } else {
    // Création (on s'assure qu'il est actif)
    await prisma.exercice.create({
      data: {
        espaceId,
        dateDebut,
        dateFin,
        code,
        isActif: true,
      },
    });
  }

  revalidatePath(`/dashboard/${espaceId}`, "layout");
}

export async function ajouterSocieteAction(prevState: any, formData: FormData) {
  const nomEspace = formData.get('nomEspace') as string;
  const siret = formData.get('siret') as string;
  const anneeActuelle = new Date().getFullYear().toString();

  // 1. Récupération de l'utilisateur connecté
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Session expirée ou non autorisée." };
  }

  const userId = session.user.id;
  let createdEspaceId: string | null = null;

  try {
    const siretExistant = await prisma.espace.findUnique({ where: { siret } });
    if (siretExistant) {
      return { error: "Ce numéro SIRET est déjà rattaché à une société." };
    }

    await prisma.$transaction(async (tx) => {
      // Création de la nouvelle société
      const nouvelEspace = await tx.espace.create({
        data: {
          nom: nomEspace,
          siret,
          userId,
        }
      });
      createdEspaceId = nouvelEspace.id;

      // Création de l'exercice fiscal initial
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

    // ✅ On revalide tout le layout du dashboard pour que le SpaceSwitcher 
    // affiche la nouvelle société immédiatement sans rafraîchir la page
    revalidatePath('/dashboard', 'layout');

  } catch (err) {
    console.error("Erreur création société :", err);
    return { error: "Une erreur est survenue lors de la création de la société." };
  }

  // ✅ Redirection vers le dashboard de la société fraîchement créée
  if (createdEspaceId) {
    redirect(`/dashboard/${createdEspaceId}?nouveau=true`);
  }
}
