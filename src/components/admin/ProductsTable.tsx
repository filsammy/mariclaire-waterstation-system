"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

type ProductWithInventory = Product & {
    inventory: { currentStock: number } | null;
};

interface ProductsTableProps {
    initialProducts: ProductWithInventory[];
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
    const [products, setProducts] = useState(initialProducts);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"ALL" | "WATER" | "CONTAINER">("ALL");

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "ALL" || product.type === filter;
        return matchesSearch && matchesFilter;
    });

    const handleDeactivate = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this product?")) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to deactivate product");

            setProducts(products.map(p => p.id === id ? { ...p, isActive: false } : p));
        } catch (error) {
            alert("Error deactivating product");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this product? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/products/${id}?permanent=true`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete product");

            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            alert("Error deleting product");
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-3 py-2 border rounded"
                    >
                        <option value="ALL">All Types</option>
                        <option value="WATER">Water</option>
                        <option value="CONTAINER">Container</option>
                    </select>
                </div>
                <Link href="/admin/products/new">
                    <Button>+ Add Product</Button>
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Price</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Stock</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        {product.description && (
                                            <p className="text-sm text-gray-500">{product.description}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={product.type === "WATER" ? "default" : "outline"}>
                                        {product.type}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {formatCurrency(product.price)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {product.inventory?.currentStock ?? "N/A"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Badge variant={product.isActive ? "success" : "secondary"}>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/products/${product.id}/edit`}>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </Link>
                                        {product.isActive ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeactivate(product.id)}
                                            >
                                                Deactivate
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(product.id)}
                                                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No products found
                </div>
            )}
        </div>
    );
}
