import { OrdersTable } from "@/components/admin/OrdersTable";

export default function OrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
            </div>

            <OrdersTable />
        </div>
    );
}
