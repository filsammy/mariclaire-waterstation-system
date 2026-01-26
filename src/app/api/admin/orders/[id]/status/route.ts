import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const statusSchema = z.object({
    status: z.enum(["CONFIRMED", "CANCELLED", "DELIVERED", "PREPARING", "OUT_FOR_DELIVERY"])
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = statusSchema.parse(body);

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
