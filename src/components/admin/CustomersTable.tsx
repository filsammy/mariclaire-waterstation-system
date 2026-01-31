"use client";

import { useState } from "react";
import { Customer, User } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

// Combined type
type CustomerWithUser = Customer & {
    user: {
        name: string;
        email: string;
        phone: string;
        status: string;
    };
    _count?: {
        orders: number;
    }
};

interface CustomersTableProps {
    initialCustomers: CustomerWithUser[];
}

export function CustomersTable({ initialCustomers }: CustomersTableProps) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"ALL" | "REGULAR" | "OUTLET_RESELLER">("ALL");

    const filteredCustomers = customers.filter((c) => {
        const matchesSearch =
            c.user.name.toLowerCase().includes(search.toLowerCase()) ||
            c.user.email.toLowerCase().includes(search.toLowerCase()) ||
            c.address.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = typeFilter === "ALL" || c.customerType === typeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search name, email, address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64"
                    />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="px-3 py-2 border rounded"
                    >
                        <option value="ALL">All Types</option>
                        <option value="REGULAR">Regular Customers</option>
                        <option value="OUTLET_RESELLER">Outlets / Resellers</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold">Type</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold">Orders</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredCustomers.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="font-medium">{c.user.name}</p>
                                        <p className="text-xs text-gray-500">Joined {formatDate(c.createdAt)}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <p>{c.user.email}</p>
                                    <p className="text-gray-500">{c.user.phone}</p>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <p>{c.barangay}</p>
                                    <p className="text-gray-500 truncate max-w-[150px]" title={c.address}>
                                        {c.address}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {c.customerType === "OUTLET_RESELLER" ? (
                                        <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
                                            Reseller
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Regular</Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center text-sm">
                                    {c._count?.orders || 0}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Badge variant={c.user.status === "ACTIVE" ? "success" : "destructive"}>
                                        {c.user.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/admin/customers/${c.id}/edit`}>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No customers found
                </div>
            )}
        </div>
    );
}
