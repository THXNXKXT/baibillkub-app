import { listTrash } from "@/lib/actions";
import TrashClient from "./client";

export default async function TrashPage() {
  await listTrash(); // auto-purge
  return <TrashClient />;
}
