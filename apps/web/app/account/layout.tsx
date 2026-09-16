import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Container } from "@/components/common/container";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("goyatrio_token")?.value;

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-64px)] py-8">
      <Container>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
            <p className="text-muted-foreground mt-1">Manage your bookings and preferences.</p>
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}
