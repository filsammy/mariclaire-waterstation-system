"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface RiderFormProps {
    rider?: {
        id: string;
        userId: string;
        vehicleType: string;
        plateNumber: string | null;
        user: {
            name: string;
            email: string;
            phone: string | null;
            role: string;
            status: string;
        };
    };
}

export function RiderForm({ rider }: RiderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isEditing = !!rider;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "", // Only required for new riders
        vehicleType: "Tricycle",
        plateNumber: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    });

    // Load data if editing
    useEffect(() => {
        if (rider) {
            setFormData({
                name: rider.user.name,
                email: rider.user.email,
                phone: rider.user.phone || "",
                password: "", // Don't prefill password
                vehicleType: rider.vehicleType,
                plateNumber: rider.plateNumber || "",
                status: rider.user.status as "ACTIVE" | "INACTIVE" | "SUSPENDED",
            });
        }
    }, [rider]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = isEditing
                ? `/api/admin/riders/${rider.id}`
                : "/api/admin/riders";

            const method = isEditing ? "PATCH" : "POST";

            // If editing and no new password, remove it from payload
            const payload = { ...formData };
            if (isEditing && !payload.password) {
                // @ts-ignore
                delete payload.password;
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save rider");
            }

            router.refresh();
            router.push("/admin/riders");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? "Edit Rider Account" : "Register New Rider"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                            {error}
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
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={isEditing} // Prevent email change for now to simplify
                        />
                        <Input
                            label={isEditing ? "New Password (Optional)" : "Initial Password"}
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!isEditing}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                            <select
                                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.vehicleType}
                                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                            >
                                <option value="Tricycle">Tricycle</option>
                                <option value="Motorcycle">Motorcycle</option>
                                <option value="Multicab">Multicab</option>
                                <option value="Truck">Truck</option>
                            </select>
                        </div>
                        <Input
                            label="Plate Number (Optional)"
                            value={formData.plateNumber}
                            onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Employment Status</label>
                        <select
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED" })}
                        >
                            <option value="ACTIVE">Active - Can receive assignments</option>
                            <option value="INACTIVE">Inactive - Temporarily unavailable (e.g., on leave)</option>
                            <option value="SUSPENDED">Suspended - Account restricted (e.g., disciplinary action)</option>
                        </select>
                        <p className="text-xs text-gray-500">Only ACTIVE riders can receive new delivery assignments</p>
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
                            {isEditing ? "Save Changes" : "Create Rider Account"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
