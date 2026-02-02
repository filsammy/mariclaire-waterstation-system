import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";
import { z } from "zod";

const createRiderSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().min(10),
    vehicleType: z.string().optional(),
    plateNumber: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const riders = await prisma.deliveryRider.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                    }
                },
                _count: {
                    select: { deliveries: true } // Deliveries assigned
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ riders });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch riders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const data = createRiderSchema.parse(body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        const hashedPassword = await hash(data.password, 10);

        // Transaction to create User and DeliveryRider profile
        const rider = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    passwordHash: hashedPassword,
                    phone: data.phone,
                    role: "DELIVERY",
                    status: data.status || "ACTIVE" // Use provided status or default to ACTIVE
                }
            });

            const profile = await tx.deliveryRider.create({
                data: {
                    userId: user.id,
                    vehicleType: data.vehicleType || "Tricycle",
                    plateNumber: data.plateNumber
                }
            });

            return profile;
        });

        return NextResponse.json({ rider, message: "Rider created successfully" }, { status: 201 });

    } catch (error: any) {
        console.error("Create Rider Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create rider" }, { status: 500 });
    }
}
