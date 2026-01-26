import { prisma } from "@/lib/prisma";
import { InventoryTable } from "@/components/admin/InventoryTable";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const products = await prisma.product.findMany({
        include: {
            inventory: true,
        },
        orderBy: {
            type: 'asc' // Group types together
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
            </div>

            <InventoryTable initialProducts={products} />
        </div>
    );
}
