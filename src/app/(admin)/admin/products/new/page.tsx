import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <ProductForm mode="create" />
        </div>
    );
}
