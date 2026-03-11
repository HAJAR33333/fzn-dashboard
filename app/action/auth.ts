// app/action/auth.ts
'use server'

import prisma from '../../lib/prisma'
import { redirect } from 'next/navigation'

export async function connecterUtilisateur(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    // 1. On cherche l'utilisateur par son email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { espaces: true } // On inclut ses espaces pour la redirection
    })

    // 2. Vérification simple (à hasher plus tard)
    if (!user || user.password !== password) {
      return { error: "Email ou mot de passe incorrect." }
    }

    // 3. Si l'utilisateur n'a aucun espace (cas rare car on en crée un à l'inscription)
    if (user.espaces.length === 0) {
      return { error: "Aucun espace de travail trouvé pour ce compte." }
    }

    // 4. REDIRECTION : On prend le premier espace trouvé
    // Plus tard, on stockera l'ID de l'utilisateur en session/cookie ici
    const premierEspaceId = user.espaces[0].id
    
    redirect(`/dashboard/${premierEspaceId}`)

  } catch (err) {
    if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) throw err;
    return { error: "Une erreur technique est survenue." }
  }
}