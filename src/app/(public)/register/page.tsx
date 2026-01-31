"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { ZodError } from "zod";
import { ALL_BARANGAYS } from "@/lib/deliveryConfig";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterInput>({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        barangay: "",
        address: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError("");

        try {
            // Client-side validation
            registerSchema.parse(formData);

            // API Call
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.details?.fieldErrors) {
                    // Map API validation errors if any
                    const fieldErrors: Record<string, string> = {};
                    for (const [key, value] of Object.entries(data.details.fieldErrors)) {
                        if (Array.isArray(value)) fieldErrors[key] = value[0] as string;
                    }
                    setErrors(fieldErrors);
                } else {
                    setGeneralError(data.error || "Registration failed");
                }
                return;
            }

            // Success
            router.push("/login?registered=true");

        } catch (err) {
            if (err instanceof ZodError) {
                const fieldErrors: Record<string, string> = {};
                (err as any).errors.forEach((error: any) => {
                    if (error.path[0]) {
                        fieldErrors[error.path[0] as string] = error.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                setGeneralError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const barangayOptions = ALL_BARANGAYS.map(b => ({ label: b, value: b }));

    return (
        <div className="flex min-h-screen items-center justify-center p-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-blue-700">
                        Create Account
                    </CardTitle>
                    <p className="text-center text-gray-500">Join MariClaire Water Station</p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {generalError && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                                {generalError}
                            </div>
                        )}

                        <Input
                            name="name"
                            label="Full Name"
                            placeholder="Juan Dela Cruz"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                        />

                        <Input
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="juan@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />

                        <Input
                            name="phone"
                            label="Phone Number"
                            placeholder="09xxxxxxxxx"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                        />

                        <Select
                            name="barangay"
                            label="Barangay"
                            placeholder="Select your barangay"
                            options={barangayOptions}
                            value={formData.barangay}
                            onChange={handleChange}
                            error={errors.barangay}
                        />

                        <Input
                            name="address"
                            label="Detailed Address"
                            placeholder="House #, Street, Landmark"
                            value={formData.address}
                            onChange={handleChange}
                            error={errors.address}
                        />

                        <Input
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                        />

                        <Input
                            name="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                        />

                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" isLoading={loading}>
                            Register
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-blue-600 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
