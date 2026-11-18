import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
export const metadata: Metadata = {
  title: "Private Studio",
  robots: { index: false, follow: false },
};
export default function Admin() {
  return <AdminDashboard />;
}
