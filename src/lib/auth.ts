import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash,
                );

                if (!isValid) {
                    console.log(`[Auth] Invalid password for ${credentials.email}`);
                    return null;
                }

                if (user.status === "SUSPENDED") {
                    console.log(`[Auth] User ${credentials.email} is SUSPENDED`);
                    throw new Error("Your account has been suspended. Please contact the administrator.");
                }

                console.log(`[Auth] Login successful for ${credentials.email}`);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role, // We'll add this to types later
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore - user.role is not in default types yet
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};
