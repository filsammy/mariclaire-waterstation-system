import { prisma } from "@/lib/prisma";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    const customers = await prisma.customer.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    status: true,
                },
            },
            _count: {
                select: { orders: true }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Customer Management</h1>
                <p className="text-gray-500">Manage customers and reseller accounts</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <CustomersTable initialCustomers={customers as any} />
                </CardContent>
            </Card>
        </div>
    );
}
