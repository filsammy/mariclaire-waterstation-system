"use client";

import { useState, useMemo, useEffect } from "react";
import { Product, Customer } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { orderSchema } from "@/lib/schema";
import { ALL_BARANGAYS, getDeliveryTypeForBarangay, getDeliveryMethodName } from "@/lib/deliveryConfig";

// Extended product type with inventory
type ProductWithStock = Product & { inventory: { currentStock: number } | null };

interface OrderWizardProps {
    products: ProductWithStock[];
    customer: Customer;
}

export function OrderWizard({ products, customer }: OrderWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [cart, setCart] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Delivery State
    const [deliveryInfo, setDeliveryInfo] = useState({
        barangay: customer.barangay,
        address: customer.address,
        notes: "",
        deliveryType: getDeliveryTypeForBarangay(customer.barangay)
    });

    // Auto-update delivery type when barangay changes
    useEffect(() => {
        const newDeliveryType = getDeliveryTypeForBarangay(deliveryInfo.barangay);
        setDeliveryInfo(prev => ({ ...prev, deliveryType: newDeliveryType }));
    }, [deliveryInfo.barangay]);

    // Derived State
    const cartItemCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

    const cartTotal = useMemo(() => {
        // Reseller Logic check
        let totalWaterBottles = 0;
        Object.entries(cart).forEach(([id, qty]) => {
            const product = products.find(p => p.id === id);
            if (product?.type === "WATER") totalWaterBottles += qty;
        });

        // @ts-ignore - customerType might not be in the generated type yet but exists in DB
        const isResellerDiscount = customer.customerType === "OUTLET_RESELLER" && totalWaterBottles >= 10;

        return Object.entries(cart).reduce((total, [id, qty]) => {
            const product = products.find(p => p.id === id);
            if (!product) return total;

            let price = product.price;
            if (product.type === "WATER" && isResellerDiscount) {
                price = 20.00;
            }
            return total + (price * qty);
        }, 0);
    }, [cart, products, customer]);

    // Handlers
    const addToCart = (productId: string) => {
        setCart(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[productId] > 1) {
                newCart[productId]--;
            } else {
                delete newCart[productId];
            }
            return newCart;
        });
    };

    const submitOrder = async () => {
        setLoading(true);
        setError("");

        try {
            if (Object.keys(cart).length === 0) {
                throw new Error("Your cart is empty. Please add at least one product.");
            }

            const items = Object.entries(cart).map(([productId, quantity]) => ({
                productId,
                quantity
            }));

            // Prepare payload
            const payload = {
                items,
                deliveryBarangay: deliveryInfo.barangay,
                deliveryAddress: deliveryInfo.address,
                deliveryNotes: deliveryInfo.notes || undefined, // undefined if empty string
                deliveryType: deliveryInfo.deliveryType,
                paymentMethod: "COD"
            };

            // Step 2: Zod Validation
            const validation = orderSchema.safeParse(payload);

            if (!validation.success) {
                // Get the first validation error message
                const firstError = validation.error.issues?.[0];
                const message = firstError?.message || "Please check your order details and try again.";
                throw new Error(message);
            }

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validation.data) // Use sanitized/validated data
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to place order");

            // Success
            router.push(`/customer/tracking/${data.order.id}?new=true`);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Render Steps

    if (step === 1) {
        // PRODUCT SELECTION
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Select Products</h2>
                    <p className="text-gray-500 text-sm">Tap + to add to cart</p>
                </div>

                <div className="space-y-4">
                    {products.map(product => (
                        <Card key={product.id} className="p-4 flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{product.name}</h3>
                                <p className="text-blue-600 font-bold">{formatCurrency(product.price)}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {cart[product.id] ? (
                                    <>
                                        <button
                                            onClick={() => removeFromCart(product.id)}
                                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold"
                                        >-</button>
                                        <span className="font-bold w-4 text-center">{cart[product.id]}</span>
                                    </>
                                ) : null}

                                <button
                                    onClick={() => addToCart(product.id)}
                                    disabled={product.inventory!.currentStock <= 0}
                                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md disabled:bg-gray-300"
                                >
                                    {product.inventory!.currentStock <= 0 ? "X" : "+"}
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Sticky Bottom Summary */}
                {cartItemCount > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg md:sticky md:bottom-4 md:rounded-lg md:border">
                        <div className="max-w-md mx-auto flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-xl font-bold text-blue-900">{formatCurrency(cartTotal)}</p>
                            </div>
                            <Button onClick={() => setStep(2)}>
                                Next: Delivery ({cartItemCount})
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (step === 2) {
        // DELIVERY INFO
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Delivery Details</h2>
                    <p className="text-gray-500 text-sm">Where should we deliver?</p>
                </div>

                <Card className="p-4 space-y-4">
                    <Select
                        label="Barangay"
                        options={ALL_BARANGAYS.map(b => ({ label: b, value: b }))}
                        value={deliveryInfo.barangay}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, barangay: e.target.value })}
                    />

                    <Input
                        label="Detailed Address"
                        value={deliveryInfo.address}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Delivery Notes (Optional)</label>
                        <Input
                            placeholder="e.g. Yellow gate, near chapel"
                            value={deliveryInfo.notes}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })}
                        />
                    </div>

                    {/* Auto-determined Delivery Method */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Delivery Method</p>
                                <p className="text-xs text-gray-500">Auto-selected based on your barangay</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-blue-700">
                                    {deliveryInfo.deliveryType === "FLEXIBLE" ? "🛺 Tricycle" : "🚚 Truck"}
                                </p>
                                <p className="text-xs text-blue-600">
                                    {getDeliveryMethodName(deliveryInfo.deliveryType as any)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1" onClick={() => setStep(3)}>Next: Confirm</Button>
                </div>
            </div>
        );
    }

    if (step === 3) {
        // REVIEW & CONFIRM
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Review Order</h2>
                    <p className="text-gray-500 text-sm">Please check details before placing</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold border-b pb-2">Order Summary</h3>
                    <ul className="space-y-2 text-sm">
                        {Object.entries(cart).map(([id, qty]) => {
                            const product = products.find(p => p.id === id);
                            if (!product) return null;

                            // Calculate specific item price for display
                            // (Repeating logic slightly for display purposes - ideally reusable function)
                            let totalWaterBottles = 0;
                            Object.entries(cart).forEach(([pid, q]) => {
                                const p = products.find(prod => prod.id === pid);
                                if (p?.type === "WATER") totalWaterBottles += q;
                            });
                            // @ts-ignore
                            const isResellerDiscount = customer.customerType === "OUTLET_RESELLER" && totalWaterBottles >= 10;

                            let effectivePrice = product.price;
                            const hasDiscount = product.type === "WATER" && isResellerDiscount;
                            if (hasDiscount) effectivePrice = 20.00;

                            return (
                                <li key={id} className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span>{qty}x {product.name}</span>
                                        {hasDiscount && (
                                            <span className="text-xs text-purple-600 bg-purple-50 px-1 rounded w-fit">
                                                Reseller Price (₱20.00)
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="font-medium block">{formatCurrency(effectivePrice * qty)}</span>
                                        {hasDiscount && (
                                            <span className="text-xs text-gray-400 line-through">
                                                {formatCurrency(product.price * qty)}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="flex justify-between border-t pt-2 font-bold text-lg">
                        <span>Total</span>
                        <span className="text-blue-700">{formatCurrency(cartTotal)}</span>
                    </div>
                </Card>

                <Card className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Deliver To:</span>
                        <span className="font-medium text-right">{deliveryInfo.address}, {deliveryInfo.barangay}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Method:</span>
                        <span className="font-medium">{deliveryInfo.deliveryType === 'FLEXIBLE' ? 'Tricycle Delivery' : 'Truck Delivery'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Payment:</span>
                        <span className="font-medium">Cash on Delivery (COD)</span>
                    </div>
                </Card>

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={loading}>Back</Button>
                    <Button className="flex-[2]" onClick={submitOrder} isLoading={loading}>
                        Confirm Order - {formatCurrency(cartTotal)}
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
