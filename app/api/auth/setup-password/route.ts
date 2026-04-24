import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, spaceId } = await req.json();

    // 1. Validation des champs requis
    if (!email || !password || !spaceId) {
      return NextResponse.json(
        { error: "INFORMATIONS MANQUANTES (EMAIL, MDP OU SPACEID)" }, 
        { status: 400 }
      );
    }

    // 2. Vérification de l'utilisateur en base
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "AUCUN COMPTE ASSOCIÉ À CET EMAIL" }, 
        { status: 404 }
      );
    }

    // 3. Sécurité supplémentaire : Vérifier que l'utilisateur appartient bien à cet espace
    if (user.espaceId !== spaceId) {
      return NextResponse.json(
        { error: "ID D'ESPACE INVALIDE POUR CET UTILISATEUR" }, 
        { status: 403 }
      );
    }

    // 4. Hachage du mot de passe (12 rounds pour un bon compromis sécurité/vitesse)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Mise à jour finale
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { 
        password: hashedPassword,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "COMPTE ACTIVÉ AVEC SUCCÈS" 
    });

  } catch (error: any) {
    console.error("❌ SETUP PASSWORD ERROR:", error.message);
    return NextResponse.json(
      { error: "ERREUR INTERNE LORS DE LA CONFIGURATION" }, 
      { status: 500 }
    );
  }
}