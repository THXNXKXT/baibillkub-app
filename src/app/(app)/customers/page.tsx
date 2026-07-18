import { listCustomers } from "@/lib/actions";
import CustomersClient from "./client";

export default async function CustomersPage() {
  const customers = await listCustomers();
  return <CustomersClient customers={customers} />;
}
