import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // 1. Verificar que el usuario puso algo en los campos
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Por favor, rellena todos los campos");
                }

                // 2. Buscar al usuario en la base de datos por su email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // 3. Si no existe el usuario o no tiene contraseña (hash)
                if (!user || !user.passwordHash) {
                    throw new Error("Usuario no registrado");
                }

                // 4. Comparar la contraseña escrita con la de la BD usando bcrypt
                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isCorrectPassword) {
                    throw new Error("Contraseña incorrecta");
                }

                // 5. Si todo está bien, devolvemos el usuario
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
};