import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        include: {
            customer: {
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            },
            _count: {
                select: { items: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
            </div>

            <OrdersTable initialOrders={orders} />
        </div>
    );
}
