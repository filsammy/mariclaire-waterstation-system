import { RiderForm } from "@/components/admin/RiderForm";

export default function NewRiderPage() {
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Add New Rider</h1>
                <p className="text-gray-500">Create an account for a delivery rider.</p>
            </div>

            <RiderForm />
        </div>
    );
}
