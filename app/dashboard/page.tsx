// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
    const session = await getServerSession(authOptions);

    // 1. Si pas connecté, retour au login
    if (!session?.user?.id) {
        redirect("/");
    }

    // 2. Trouver l'ID du premier espace de cet utilisateur
    const espace = await prisma.espace.findFirst({
        where: { userId: session.user.id },
        select: { id: true }
    });

    // 3. Redirection intelligente
    if (!espace) {
        // Si l'utilisateur n'a aucune société, on l'envoie en créer une
        redirect("/selection-espace/nouveau");
    }

    // Si trouvé, on va sur dashboard/[id]
    redirect(`/dashboard/${espace.id}`);
}