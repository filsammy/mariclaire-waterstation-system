import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params; // DeliveryRider ID

        // Get the rider to find the user ID
        const rider = await prisma.deliveryRider.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!rider) {
            return NextResponse.json({ error: "Rider not found" }, { status: 404 });
        }

        // Delete the user (cascade will delete the DeliveryRider profile)
        await prisma.user.delete({
            where: { id: rider.userId }
        });

        return NextResponse.json({ message: "Rider deleted successfully" });
    } catch (error) {
        console.error("Delete Rider Error:", error);
        return NextResponse.json({ error: "Failed to delete rider" }, { status: 500 });
    }
}
