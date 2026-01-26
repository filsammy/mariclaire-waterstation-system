"use client";

import { useState, useMemo, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Order, OrderStatus, DeliveryType } from "@prisma/client";
import Link from "next/link";

// Extended type to include relations
type OrderWithRelations = Order & {
    customer: {
        user: { name: string; email: string };
    };
    _count: { items: number };
};

export function OrdersTable({ initialOrders }: { initialOrders: OrderWithRelations[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
    const [orders] = useState<OrderWithRelations[]>(initialOrders);
    const [isPending, startTransition] = useTransition();

    // Step 1: Debounce (Already applied)
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Step 3: Memoize filtering
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order.orderNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                order.customer.user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, debouncedSearchTerm, statusFilter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Step 4: useTransition
        startTransition(() => {
            setSearchTerm(value);
        });
    };

    const getStatusVariant = (status: OrderStatus) => {
        switch (status) {
            case "PENDING": return "warning";
            case "CONFIRMED": return "default";
            case "PREPARING": return "secondary";
            case "OUT_FOR_DELIVERY": return "default";
            case "DELIVERED": return "success";
            case "CANCELLED": return "destructive";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    placeholder="Search order # or customer..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <div className="flex gap-2 text-sm overflow-x-auto pb-2 sm:pb-0">
                    {(["ALL", "PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 rounded-full border transition-colors ${statusFilter === status
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {status === "ALL" ? "All" : status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-blue-600">
                                            <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.deliveryType === "SCHEDULED" ? "🚚 Scheduled" : "🛵 Flexible"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.customer.user.name}</div>
                                        <div className="text-xs text-gray-500">{order.deliveryBarangay}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
                                        <div className="text-xs text-gray-500">{order._count.items} items</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Button size="sm" variant="outline">View</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No orders found matching your filters.
                    </div>
                )}
            </div>
        </div>
    );
}
