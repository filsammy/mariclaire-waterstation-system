import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            user: true
        }
    });

    if (!customer) {
        notFound();
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Manage Customer</h1>

            {/* @ts-ignore - Status enum mismatch safety */}
            <CustomerForm customer={customer} />
        </div>
    );
}
