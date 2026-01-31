import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for order creation
const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().min(1)
    })).min(1, "Order must have at least one item"),
    deliveryBarangay: z.string().min(1),
    deliveryAddress: z.string().min(1),
    deliveryNotes: z.string().optional(),
    deliveryType: z.enum(["FLEXIBLE", "SCHEDULED"]),
    paymentMethod: z.enum(["COD", "GCASH", "PAYMAYA"]).default("COD"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "CUSTOMER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = createOrderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { items, deliveryBarangay, deliveryAddress, deliveryNotes, deliveryType, paymentMethod } = result.data;

        // Get customer ID
        // We need to look up the Customer record associated with this User
        const customer = await prisma.customer.findUnique({
            where: { userId: session.user.id }
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
        }

        // Generate Order Number (Simple timestamp based or sequential?)
        // Concurrency safe sequential is hard without locking. 
        // Random/Timestamp hybrid is easier for MVP. 
        // e.g. ORD-{YYMMDD}-{4 random digits}
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
        const random = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${dateStr}-${random}`;

        // Transaction: 
        // 1. Calculate totals & Verify Stock
        // 2. Create Order & OrderItems
        // 3. Decrement Inventory

        const order = await prisma.$transaction(async (tx) => {
            let totalAmount = 0;

            // Check stock and calculate prices
            // Fetch all products involved
            const productIds = items.map(i => i.productId);
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
                include: { inventory: true }
            });

            // Verify all products exist and calculate total
            for (const item of items) {
                const product = products.find(p => p.id === item.productId);
                if (!product) throw new Error(`Product ${item.productId} not found`);
                if (!product.isActive) throw new Error(`Product ${product.name} is not available`);

                // Check stock
                if (product.inventory && product.inventory.currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                totalAmount += product.price * item.quantity;
            }

            // --- PRICING LOGIC ---
            // Check for Outlet/Reseller Bulk Discount
            // Rule: If Customer is OUTLET_RESELLER AND Total Water Bottles >= 10, price is 20.00 each.

            // 1. Count total water bottles
            let totalWaterBottles = 0;
            items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product?.type === "WATER") {
                    totalWaterBottles += item.quantity;
                }
            });

            // 2. Determine if discount applies
            const isReseller = customer.customerType === "OUTLET_RESELLER";
            const applyDiscount = isReseller && totalWaterBottles >= 10;
            const OUTLET_PRICE = 20.00;

            // Recalculate totalAmount based on new logic
            totalAmount = 0;

            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    customerId: customer.id,
                    status: "PENDING",
                    deliveryType,
                    deliveryBarangay,
                    deliveryAddress,
                    deliveryNotes,
                    paymentMethod,
                    totalAmount: 0, // Will update after calculating items (or just calc here)
                    items: {
                        create: items.map(item => {
                            const product = products.find(p => p.id === item.productId)!;

                            // Apply discount if product is WATER and discount conditions met
                            let finalPrice = product.price;
                            if (product.type === "WATER" && applyDiscount) {
                                finalPrice = OUTLET_PRICE;
                            }

                            const subtotal = finalPrice * item.quantity;
                            totalAmount += subtotal;

                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                price: finalPrice,
                                subtotal: subtotal
                            };
                        })
                    }
                }
            });

            // Update total amount on the order record
            await tx.order.update({
                where: { id: newOrder.id },
                data: { totalAmount }
            });

            // Update Inventory
            for (const item of items) {
                await tx.inventory.update({
                    where: { productId: item.productId },
                    data: {
                        currentStock: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            // Create separate delivery record? 
            // Schema says: model Delivery is separate. 
            // Usually created when Admin assigns rider. 
            // But maybe we create a stub "UNASSIGNED" delivery record to track status? 
            // Or just rely on Order.status for now until assignment. 
            // Let's rely on Order.status = PENDING.

            return newOrder;
        });

        return NextResponse.json({ order }, { status: 201 });

    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to place order" },
            { status: 500 }
        );
    }
}
