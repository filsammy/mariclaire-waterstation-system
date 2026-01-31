import { prisma } from "@/lib/prisma";
import { RiderForm } from "@/components/admin/RiderForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditRiderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const rider = await prisma.deliveryRider.findUnique({
        where: { id },
        include: {
            user: true
        }
    });

    if (!rider) {
        notFound();
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Edit Rider</h1>
                <p className="text-gray-500">Update account details for {rider.user.name}.</p>
            </div>

            <RiderForm rider={rider as any} />
        </div>
    );
}
