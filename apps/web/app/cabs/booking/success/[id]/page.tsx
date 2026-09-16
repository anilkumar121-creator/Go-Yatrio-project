import Link from "next/link";
import { cookies } from "next/headers";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/common/container";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CabBookingSuccessPage({ params }: Props) {
  const { id } = await params;

  const cookieStore = await cookies();
  const guestCookie = cookieStore.get(`guest_booking_${id}`);

  const headers: HeadersInit = {};
  if (guestCookie) {
    headers.Cookie = `${guestCookie.name}=${guestCookie.value}`;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const res = await fetch(`${apiUrl}/api/bookings/${id}`, {
    headers,
    cache: "no-store",
  });

  const booking = res.ok ? await res.json() : null;

  return (
    <div className="min-h-screen bg-muted/30 py-12 md:py-20 flex items-center justify-center">
      <Container className="max-w-xl">
        <Card className="p-8 text-center border-border shadow-md">
          <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="size-10 text-success" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Booking Requested</h1>
          <p className="text-muted-foreground mb-8">
            Your cab booking request has been successfully received. We will contact you shortly to
            confirm the final fare and payment details.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 mb-8">
            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
            <p className="text-lg font-mono font-bold tracking-wider">
              {booking ? booking.bookingReference : id.toUpperCase().substring(0, 8)}
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/cabs">Browse More Cabs</Link>
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
