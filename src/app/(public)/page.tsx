import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  // Auto-redirect logged in users to their dashboard
  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "CUSTOMER") redirect("/customer");
    if (session.user.role === "DELIVERY") redirect("/delivery");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="bg-blue-700 px-4 py-16 text-center text-white sm:py-24">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          MariClaire Water Station
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-xl text-blue-100 sm:max-w-3xl">
          Fresh, mineral-rich water delivered straight to your doorstep in Paranas, Samar.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
              Order Now
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-600">
              Create Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Features/Info */}
      <main className="flex-1 overflow-hidden">
        <div className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Why Choose Us?</h2>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Fast Delivery</h3>
                    <p className="mt-2 text-base text-gray-500">
                      We deliver to Zone 1-6, Buray, Lipata, Pequit, and Villas.
                    </p>
                  </CardContent>
                </Card>

                {/* Feature 2 */}
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Affordable</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Refills starting at ₱25. New containers available for ₱250.
                    </p>
                  </CardContent>
                </Card>

                {/* Feature 3 */}
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Quality Guaranteed</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Safe, clean, and mineral-rich water processed daily.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 py-8 text-center text-gray-400">
        <p>&copy; 2026 MariClaire Water Refilling Station. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          {/* Hidden links for staff easy access if they land here */}
          <Link href="/login" className="hover:text-white">Staff Login</Link>
        </div>
      </footer>
    </div>
  );
}