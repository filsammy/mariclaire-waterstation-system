"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";

import { Suspense } from "react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check for error parameter in URL (e.g., ?error=Suspended)
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'Suspended') {
            setError("Your account has been suspended. Please contact the administrator.");
            // Clean the URL by removing the error parameter
            router.replace('/login');
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                // Successful login
                // Redirect is handled by the callbackUrl or manually checking role (but for now let's push to root and middleware/role check will handle)
                // Better: Fetch session to know where to redirect?
                // Actually, let's just refresh and let middleware/layout handle routing, OR smart redirect
                router.refresh();

                // Since we don't know the role easily client-side immediately without hook, 
                // a simple page refresh often triggers the middleware redirect if they go to a protected route,
                // or we can redirect to a dashboard.

                // For MVP, simplistic approach:
                window.location.href = "/"; // Force full reload to get fresh session
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-blue-700">
                    MariClaire Water Station
                </CardTitle>
                <p className="text-center text-gray-500">Sign in to your account</p>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}
                    <Input
                        type="email"
                        label="Email"
                        placeholder="juan@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <div className="text-right">
                        <Link href="#" className="text-sm text-blue-600 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" isLoading={loading}>
                        Sign In
                    </Button>
                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-medium text-blue-600 hover:underline">
                            Register here
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Suspense fallback={<div className="text-center">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
