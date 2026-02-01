import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const updateCustomerSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    barangay: z.string().optional(),
    address: z.string().optional(),
    customerType: z.enum(["REGULAR", "OUTLET_RESELLER"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params; // This is the CUSTOMER ID, not User ID
        const body = await req.json();
        const data = updateCustomerSchema.parse(body);

        // Update Customer Record
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                barangay: data.barangay,
                address: data.address,
                customerType: data.customerType,
                user: {
                    update: {
                        name: data.name,
                        phone: data.phone,
                        status: data.status,
                    }
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                    }
                }
            }
        });

        return NextResponse.json({ customer, message: "Customer updated successfully" });
    } catch (error) {
        console.error("Update Customer Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
    }
}
