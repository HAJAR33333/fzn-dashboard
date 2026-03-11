"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(prevState: any, formData: FormData) {
  const nom = formData.get("nom") as string;
  const email = formData.get("email") as string;
  const espaceId = formData.get("espaceId") as string;

  try {
    await prisma.client.create({
      data: {
        nom,
        email,
        espaceId,
      },
    });

    revalidatePath(`/dashboard/${espaceId}/clients`);
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la création du client." };
  }
}
export async function updateClientAction(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const espaceId = formData.get("espaceId") as string;

  await prisma.client.update({
    where: { id: clientId },
    data: {
      formeJuridique: formData.get("formeJuridique") as string,
      siret: formData.get("siret") as string,
      contactPrenom: formData.get("contactPrenom") as string,
      contactNom: formData.get("contactNom") as string,
      adresse: formData.get("adresse") as string,
      codePostal: formData.get("codePostal") as string,
      ville: formData.get("ville") as string,
      telephone: formData.get("telephone") as string,
      statutClient: formData.get("statutClient") as string,
      pays: "France"
    },
  });

  revalidatePath(`/dashboard/${espaceId}/clients`);
}