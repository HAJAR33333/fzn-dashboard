import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, espaceId, role } = await req.json();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Validation de base
    if (!cleanEmail || !espaceId) {
      return NextResponse.json({ error: "DONNÉES MANQUANTES" }, { status: 400 });
    }

    // 2. VÉRIFICATION D'EXISTENCE EN DB
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      // CAS A : L'utilisateur est déjà dans CET espace
      if (existingUser.espaceId === espaceId) {
        return NextResponse.json(
          { error: "CET UTILISATEUR FAIT DÉJÀ PARTIE DE VOTRE ÉQUIPE" }, 
          { status: 400 }
        );
      }
      
      // CAS B : L'utilisateur existe mais appartient à un AUTRE espace
      // (Optionnel : tu peux décider de le laisser changer d'espace ou bloquer)
      return NextResponse.json(
        { error: "CET EMAIL EST DÉJÀ ASSOCIÉ À UN AUTRE COMPTE FZN" }, 
        { status: 400 }
      );
    }

    // 3. SI L'UTILISATEUR N'EXISTE PAS : ON LE CRÉE
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        nom: cleanEmail.split('@')[0].toUpperCase(),
        espaceId: espaceId,
        role: role || 'COLLABORATEUR',
        // password reste null jusqu'au setup
      },
    });

    // 4. ENVOI DU MAIL
    await sendInvitationEmail(cleanEmail, espaceId);

    return NextResponse.json({ 
      success: true, 
      message: "Invitation envoyée avec succès" 
    });

  } catch (error: any) {
    console.error("❌ INVITE_ERROR:", error);
    return NextResponse.json(
      { error: "ERREUR SERVEUR LORS DE L'INVITATION" }, 
      { status: 500 }
    );
  }
}