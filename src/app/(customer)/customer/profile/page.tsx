import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
// import LogoutButton client component? Or simple signout
// We can reuse the SignOut logic or make a Client Component.
// For MVP, I will make a tiny client component inside here or just a SignOut button.

import SignOutButton from "@/components/auth/SignOutButton";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    const customer = await prisma.customer.findUnique({
        where: { userId: session?.user?.id },
        include: { user: true }
    });

    if (!customer) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Profile</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Read Only for MVP */}
                    <div>
                        <label className="text-sm text-gray-500">Name</label>
                        <div className="font-medium p-2 bg-gray-50 rounded border">{customer.user.name}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <div className="font-medium p-2 bg-gray-50 rounded border">{customer.user.email}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <div className="font-medium p-2 bg-gray-50 rounded border">{customer.user.phone}</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Default Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-500">Barangay</label>
                        <div className="font-medium p-2 bg-gray-50 rounded border">{customer.barangay}</div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Address Details</label>
                        <div className="font-medium p-2 bg-gray-50 rounded border">{customer.address}</div>
                    </div>
                    <Button variant="outline" className="w-full mt-2">Edit Address (Coming Soon)</Button>
                </CardContent>
            </Card>

            <div className="pt-6">
                <SignOutButton />
            </div>
        </div>
    );
}
