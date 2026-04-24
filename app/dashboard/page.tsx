import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
    const session = await getServerSession(authOptions);

    // 1. Sécurité : Si pas de session, retour racine
    if (!session?.user) {
        redirect("/");
    }

    // 2. Récupérer les infos fraîches de l'utilisateur (pour avoir son espaceId actuel)
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { espaceId: true }
    });

    // 3. Redirection intelligente
    if (user?.espaceId) {
        // ✅ Si l'utilisateur est déjà lié à un espace (Owner ou Collaborateur)
        redirect(`/dashboard/${user.espaceId}`);
    } else {
        // ❌ Si l'utilisateur n'a aucun espace lié
        // On vérifie s'il a créé un espace dont il est le propriétaire
        const ownedEspace = await prisma.espace.findFirst({
            where: { userId: session.user.id },
            select: { id: true }
        });

        if (ownedEspace) {
            redirect(`/dashboard/${ownedEspace.id}`);
        } else {
            // Cas où l'utilisateur n'est ni propriétaire ni collaborateur
            redirect("/selection-espace/nouveau");
        }
    }
}