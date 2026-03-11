import { NextAuthOptions, DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Identifiants manquants");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    throw new Error("Aucun utilisateur trouvé avec cet email");
                }

                const isValidPassword = await bcrypt.compare(credentials.password, user.password);

                if (!isValidPassword) {
                    throw new Error("Mot de passe incorrect");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.nom,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: "/login",
    },
};
