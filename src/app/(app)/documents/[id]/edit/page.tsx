import { getDocument, listCustomers } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DocForm from "../../doc-form";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDocument(id);
  if (!data || data.doc.status !== "draft") redirect(`/documents/${id}`);
  const [customers, session] = await Promise.all([listCustomers(), auth.api.getSession({ headers: await headers() })]);
  return (
    <div className="space-y-6">
      <h1 className="text-[17px] font-semibold">แก้ไข {data.doc.number}</h1>
      <DocForm customers={customers} owner={session!.user as never} initial={data} />
    </div>
  );
}
