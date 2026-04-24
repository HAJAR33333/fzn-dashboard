import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInvitationEmail = async (email: string, spaceId: string) => {
  // L'URL pointe vers ta page de setup de mot de passe
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteLink = `${baseUrl}/setuppswrd?email=${encodeURIComponent(email)}&space=${spaceId}`;
  try {
    await resend.emails.send({
      from: 'FZN System <onboarding@resend.dev>', // Remplace par ton domaine une fois validé sur Resend
      to: email,
      subject: '🔑 ACTIVATION DE VOTRE ACCÈS FZN DASH',
      html: `
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px; border-radius: 24px; color: #ffffff;">
          <h1 style="font-size: 24px; font-weight: 900; font-style: italic; text-transform: uppercase; margin-bottom: 24px; letter-spacing: -1px;">
            FZN <span style="color: #3b82f6;">DASH</span>
          </h1>
          
          <div style="border-left: 4px solid #3b82f6; padding-left: 20px; margin: 30px 0;">
            <p style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 8px;">
              Invitation Prioritaire
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #f1f5f9;">
              Un accès collaborateur a été généré pour votre adresse email sur l'espace sécurisé <strong>FZN</strong>.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 30px;">
            Pour activer vos droits et configurer votre mot de passe personnel, veuillez utiliser le bouton ci-dessous :
          </p>

          <a href="${inviteLink}" 
             style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);">
            Activer mon accès
          </a>

          <hr style="border: none; border-top: 1px solid #1e293b; margin: 40px 0;" />

          <p style="font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px;">
            © 2026 FZN System — Cybersecurity Division. <br/>
            Ce lien d'activation est strictement personnel.
          </p>
        </div>
      `
    });
    console.log(`✅ Mail d'invitation envoyé à : ${email}`);
  } catch (error) {
    console.error("❌ Erreur Resend:", error);
    throw new Error("Échec de l'envoi de l'email");
  }
};