import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");
  return <AdminDashboard />;
}
