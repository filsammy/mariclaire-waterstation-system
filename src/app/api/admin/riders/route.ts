import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const riders = await prisma.deliveryRider.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                        status: true
                    }
                }
            },
            where: {
                user: {
                    status: "ACTIVE"
                }
            }
        });

        return NextResponse.json({ riders });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch riders" }, { status: 500 });
    }
}
