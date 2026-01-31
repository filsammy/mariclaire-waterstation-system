import { prisma } from "@/lib/prisma";
import { RidersTable } from "@/components/admin/RidersTable";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RidersPage() {
    const riders = await prisma.deliveryRider.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    status: true,
                },
            },
            _count: {
                select: { deliveries: true }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Rider Management</h1>
                    <p className="text-gray-500">Manage delivery fleet and accounts</p>
                </div>
                <Link href="/admin/riders/new">
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Rider
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-6">
                    <RidersTable riders={riders as any} />
                </CardContent>
            </Card>
        </div>
    );
}
