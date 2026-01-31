"use client";

import { useState, useMemo, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Product, Inventory } from "@prisma/client";

type ProductWithInventory = Product & { inventory: Inventory | null };

export function InventoryTable({ initialProducts }: { initialProducts: ProductWithInventory[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [products] = useState<ProductWithInventory[]>(initialProducts);
    const [isPending, startTransition] = useTransition();

    // Step 1: Debounce the search term to avoid filtering on every keystroke
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Step 3: Memoize the filtering logic
    const filteredProducts = useMemo(() => {
        return products.filter((p) =>
            p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [products, debouncedSearchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Step 4: useTransition to keep UI responsive
        startTransition(() => {
            setSearchTerm(value);
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search products..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <Button onClick={() => window.alert("Add Product Modal - Coming Soon")}>
                    + Add Product
                </Button>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Level
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => {
                            const stock = product.inventory?.currentStock || 0;
                            const minStock = product.inventory?.minStock || 0;
                            const isLowStock = stock <= minStock;

                            return (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-500">{product.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant="secondary">{product.type}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(product.price)} / {product.unit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className={`text-sm font-bold ${isLowStock ? "text-red-600" : "text-green-600"}`}>
                                                {stock}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.isActive ? (
                                            <Badge variant="success">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">No products found.</div>
                )}
            </div>
        </div>
    );
}
