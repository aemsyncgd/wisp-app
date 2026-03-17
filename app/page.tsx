import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  // Redirect authenticated users to admin dashboard
  if (session?.user) {
    redirect("/admin/dashboard");
  }

  // Redirect unauthenticated users to login
  redirect("/auth/signin");
}

