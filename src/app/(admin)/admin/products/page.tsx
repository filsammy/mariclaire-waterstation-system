import { prisma } from "@/lib/prisma";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        include: {
            inventory: {
                select: {
                    currentStock: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Product Management</h1>
                <p className="text-gray-500">Manage your products and pricing</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <ProductsTable initialProducts={products} />
                </CardContent>
            </Card>
        </div>
    );
}
