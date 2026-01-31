"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ALL_BARANGAYS } from "@/lib/deliveryConfig";

interface CustomerFormProps {
    customer: {
        id: string;
        barangay: string;
        address: string;
        customerType: "REGULAR" | "OUTLET_RESELLER";
        user: {
            name: string;
            email: string;
            phone: string;
            status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
        };
    };
}

export function CustomerForm({ customer }: CustomerFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: customer.user.name,
        phone: customer.user.phone,
        barangay: customer.barangay,
        address: customer.address,
        customerType: customer.customerType,
        status: customer.user.status,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/admin/customers/${customer.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update customer");
            }

            setSuccess("Customer updated successfully");
            router.refresh();
            router.push("/admin/customers");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Customer: {customer.user.email}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded text-sm">
                            {success}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Select
                            label="Barangay"
                            value={formData.barangay}
                            onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                            options={ALL_BARANGAYS.map(b => ({ label: b, value: b }))}
                        />
                        <Input
                            label="Detailed Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Customer Type</label>
                            <select
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.customerType}
                                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                            >
                                <option value="REGULAR">Regular Customer</option>
                                <option value="OUTLET_RESELLER">Outlet / Reseller (Bulk Pricing)</option>
                            </select>
                            <p className="text-xs text-gray-500">
                                Outlets get ₱20.00/refill pricing for orders of 10+ bottles.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Account Status</label>
                            <select
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
