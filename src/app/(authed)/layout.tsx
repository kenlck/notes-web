import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    return redirect("/login");
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
