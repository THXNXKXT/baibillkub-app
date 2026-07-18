import { listCustomers } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DocForm from "../doc-form";

export default async function NewDocumentPage() {
  const [customers, session] = await Promise.all([listCustomers(), auth.api.getSession({ headers: await headers() })]);
  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-[17px] font-semibold">สร้างเอกสาร</h1>
      <DocForm customers={customers} owner={session!.user as never} />
    </div>
  );
}
