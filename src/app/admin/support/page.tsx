import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyTokenForPage } from "@/utils/verifyToken";
import AdminSupportClient from "./AdminSupportClient";

export const metadata = { title: "Support inbox" };

const AdminSupportPage = () => {
  const token = cookies().get("jwtToken")?.value;
  if (!token) redirect("/");
  const payload = verifyTokenForPage(token);
  if (!payload?.isAdmin) redirect("/");

  return <AdminSupportClient />;
};

export default AdminSupportPage;
