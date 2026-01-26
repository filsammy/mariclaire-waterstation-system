import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function RiderProfilePage() {
    const session = await getServerSession(authOptions);

    const rider = await prisma.deliveryRider.findUnique({
        where: { userId: session?.user?.id },
        include: { user: true }
    });

    if (!rider) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Rider Profile</h1>

            <Card>
                <CardHeader>
                    <CardTitle>My Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-500">Name</label>
                        <p className="font-medium">{rider.user.name}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Vehicle</label>
                        <div className="p-2 bg-gray-50 rounded border flex justify-between">
                            <span>{rider.vehicleType}</span>
                            <span className="font-mono text-gray-600">{rider.plateNumber}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-4">
                <SignOutButton />
            </div>
        </div>
    );
}
