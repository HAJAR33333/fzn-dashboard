"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addMonths, subDays, getYear } from "date-fns";


export async function creerExerciceAuto(espaceId: string) {
  const annee = new Date().getFullYear().toString();
  
  await prisma.exercice.create({
    data: {
      code: annee,
      dateDebut: new Date(`${annee}-01-01`),
      dateFin: new Date(`${annee}-12-31`),
      isActif: true,
      espaceId: espaceId,
    }
  });

  revalidatePath(`/dashboard/${espaceId}`);
}

/**
 * Action pour modifier un exercice comptable existant.
 * Force la revalidation du layout complet pour mettre à jour la Sidebar.
 */
export async function modifierExerciceAction(id: string, formData: FormData) {
  try {
    const code = formData.get('code') as string;
    const dateDebut = new Date(formData.get('dateDebut') as string);
    const dateFin = new Date(formData.get('dateFin') as string);

    if (!id || !code || isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
      return { success: false, error: "Données de formulaire invalides." };
    }

    // 1. Mise à jour dans la base de données via Prisma
    await prisma.exercice.update({
      where: { id },
      data: { 
        code, 
        dateDebut, 
        dateFin 
      }
    });

    // 2. REVALIDATION GLOBALE (CRUCIAL) : 
    // On revalide le chemin parent avec l'option 'layout'.
    // Cela force Next.js à régénérer la Sidebar (layout) ET la Page.
    revalidatePath('/dashboard/[id]', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'action de modification d'exercice:", error);
    return { success: false, error: "Une erreur technique est survenue." };
  }
}


export async function mettreAJourExerciceAction(id: string, dateDebutStr: string) {
  try {
    const dateDebut = new Date(dateDebutStr);
    
    // RÈGLE : Calcul automatique de la date de fin (12 mois)
    const dateFin = subDays(addMonths(dateDebut, 12), 1);
    
    // RÈGLE : Le code prend l'année de la fin
    const code = getYear(dateFin).toString();

    await prisma.exercice.update({
      where: { id },
      data: {
        dateDebut,
        dateFin,
        code,
      },
    });

    revalidatePath("/dashboard/[id]", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}