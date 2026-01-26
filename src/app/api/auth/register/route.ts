import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password, name, phone, barangay, address } = result.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Transaction: Create User + Create Customer Profile
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    phone,
                    role: UserRole.CUSTOMER,
                },
            });

            await tx.customer.create({
                data: {
                    userId: user.id,
                    barangay,
                    address,
                },
            });

            return user;
        });

        // Remove password from response
        const { passwordHash: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            { message: "Registration successful", user: userWithoutPassword },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Something went wrong during registration" },
            { status: 500 }
        );
    }
}
