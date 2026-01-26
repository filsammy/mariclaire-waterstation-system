export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-4xl font-bold text-red-600">403</h1>
            <h2 className="mt-4 text-2xl font-semibold">Access Denied</h2>
            <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
            <a
                href="/"
                className="mt-8 rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            >
                Go Home
            </a>
        </div>
    );
}
