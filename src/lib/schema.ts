import { z } from "zod";

export const deliverySchema = z.object({
    barangay: z.string().min(1, "Barangay is required"),
    address: z.string().min(5, "Address must be at least 5 characters").max(100, "Address is too long").regex(/^[a-zA-Z0-9\s,.-]+$/, "Address contains invalid characters"),
    notes: z.string().max(200, "Notes cannot exceed 200 characters").regex(/^[a-zA-Z0-9\s,.-]*$/, "Notes contains invalid characters").transform(val => val === "" ? undefined : val).optional(),
    deliveryType: z.enum(["FLEXIBLE", "SCHEDULED"]),
});

export const orderItemSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive(),
});

export const orderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    deliveryBarangay: deliverySchema.shape.barangay,
    deliveryAddress: deliverySchema.shape.address,
    deliveryNotes: deliverySchema.shape.notes,
    deliveryType: deliverySchema.shape.deliveryType,
    paymentMethod: z.enum(["COD"]),
});
