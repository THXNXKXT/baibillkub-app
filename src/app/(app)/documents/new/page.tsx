import { listCustomers } from "@/lib/actions";
import DocForm from "../doc-form";

export default async function NewDocumentPage() {
  const customers = await listCustomers();
  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-[17px] font-semibold">สร้างเอกสาร</h1>
      <DocForm customers={customers} />
    </div>
  );
}
