import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
    // Simple MVP Report: Totals
    // In future, adding date charts with Recharts

    const totalSales = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["DELIVERED", "CONFIRMED"] } }
    });

    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.customer.count();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Business Reports</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-blue-900">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700">
                            {formatCurrency(totalSales._sum.totalAmount || 0)}
                        </div>
                        <p className="text-sm text-blue-600 mt-1">Lifetime Sales</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-gray-500">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{totalOrders}</div>
                        <p className="text-sm text-gray-500 mt-1">Processed orders</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-gray-500">Total Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{totalCustomers}</div>
                        <p className="text-sm text-gray-500 mt-1">Registered users</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sales Chart</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center bg-gray-50 rounded border border-dashed">
                    <p className="text-gray-500">Sales visualization coming in next update...</p>
                </CardContent>
            </Card>
        </div>
    );
}
