import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderWizard } from "@/components/customer/OrderWizard";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
    const session = await getServerSession(authOptions);

    // 1. Fetch available products
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { inventory: { select: { currentStock: true } } },
        orderBy: { type: 'asc' } // Water first, then containers
    });

    // 2. Fetch customer profile for pre-filling address
    const customer = await prisma.customer.findUnique({
        where: { userId: session?.user?.id }
    });

    if (!customer) return <div>Error loading profile</div>;

    return (
        <div className="pb-24"> {/* Extra padding for sticky footer */}
            <OrderWizard products={products} customer={customer} />
        </div>
    );
}
