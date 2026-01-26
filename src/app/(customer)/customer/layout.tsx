import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CustomerNav } from "@/components/layout/CustomerNav";

export default async function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== "CUSTOMER") {
        redirect("/unauthorized");
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-gray-50 pb-16 md:pb-0">
            <CustomerNav />

            <main className="flex-1 p-4 md:p-8 w-full max-w-lg mx-auto md:max-w-4xl">
                {children}
            </main>
        </div>
    );
}