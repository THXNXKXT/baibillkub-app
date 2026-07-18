import { listCustomers } from "@/lib/actions";
import DocForm from "../doc-form";

export default async function NewDocumentPage() {
  const customers = await listCustomers();
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">สร้างเอกสาร</h1>
      <DocForm customers={customers} />
    </div>
  );
}
