export function LoadingSpinner() {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="relative h-10 w-10">
                <div className="absolute top-0 h-10 w-10 animate-spin rounded-full border-4 border-blue-200" />
                <div className="absolute top-0 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        </div>
    );
}
