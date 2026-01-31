"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { z } from "zod";

const productSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    price: z.number().positive("Price must be positive"),
    type: z.enum(["WATER", "CONTAINER"]),
    description: z.string().optional(),
    initialStock: z.number().int().nonnegative("Stock must be non-negative").optional(),
});

interface ProductFormProps {
    mode: "create" | "edit";
    initialData?: {
        id: string;
        name: string;
        price: number;
        type: "WATER" | "CONTAINER";
        description?: string | null;
        isActive: boolean;
    };
}

export function ProductForm({ mode, initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        price: initialData?.price?.toString() || "",
        type: initialData?.type || "WATER",
        description: initialData?.description || "",
        initialStock: mode === "create" ? "0" : undefined,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Validate
            const validation = productSchema.safeParse({
                ...formData,
                price: parseFloat(formData.price) || 0,
                initialStock: formData.initialStock !== undefined ? parseInt(formData.initialStock) || 0 : undefined,
            });

            if (!validation.success) {
                setError(validation.error.issues[0].message);
                setLoading(false);
                return;
            }

            const url = mode === "create"
                ? "/api/admin/products"
                : `/api/admin/products/${initialData?.id}`;

            const method = mode === "create" ? "POST" : "PATCH";

            const body = mode === "create"
                ? validation.data
                : {
                    name: validation.data.name,
                    price: validation.data.price,
                    description: validation.data.description,
                };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save product");
            }

            router.push("/admin/products");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{mode === "create" ? "Add New Product" : "Edit Product"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Product Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Select
                        label="Product Type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        options={[
                            { label: "Water Refill", value: "WATER" },
                            { label: "Container", value: "CONTAINER" },
                        ]}
                        disabled={mode === "edit"}
                    />

                    <Input
                        label="Price (₱)"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {mode === "create" && (
                        <Input
                            label="Initial Stock (Optional)"
                            type="number"
                            value={formData.initialStock || ""}
                            onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                        />
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            {mode === "create" ? "Create Product" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
