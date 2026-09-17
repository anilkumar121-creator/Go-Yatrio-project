import { cookies } from "next/headers";
import { CabBookingSuccessClient } from "./success-client";

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

  return <CabBookingSuccessClient id={id} initialBooking={booking} />;
}
