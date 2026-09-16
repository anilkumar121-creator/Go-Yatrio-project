import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { MapPin, Calendar, Car } from "lucide-react";

type BookingItem = {
  id: string;
  serviceType: string;
  status: string;
  bookingReference: string;
  totalAmount?: number | null;
  cabBooking?: {
    vehicle?: { vehicleName: string };
    pickupCity?: { name: string };
    dropCity?: { name: string };
    pickupDate: string;
  } | null;
};

export const metadata = {
  title: "My Bookings",
};

async function getMyBookings(token: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${API_URL}/api/bookings?limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error("Failed to fetch bookings");
  }

  return res.json();
}

export default async function BookingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("goyatrio_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const response = await getMyBookings(token);

  if (!response) {
    redirect("/login");
  }

  const bookings = response.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Booking History</h2>
      </div>

      {bookings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't made any bookings with us yet.
          </p>
          <Button asChild>
            <Link href="/cabs">Book a Cab</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking: BookingItem) => (
            <Card
              key={booking.id}
              className="flex flex-col overflow-hidden transition-all hover:border-primary/50"
            >
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">{booking.serviceType}</CardTitle>
                    <div className="text-xs text-muted-foreground font-mono">
                      Ref: {booking.bookingReference}
                    </div>
                  </div>
                  <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 flex flex-col gap-4">
                {booking.serviceType === "CAB" && booking.cabBooking && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Car className="h-4 w-4 text-primary" />
                      <span className="font-medium truncate">
                        {booking.cabBooking.vehicle?.vehicleName || "Assigned Vehicle"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {booking.cabBooking.pickupCity?.name} →{" "}
                          {booking.cabBooking.dropCity?.name || "Same City"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                          {new Date(booking.cabBooking.pickupDate).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                  <div className="font-semibold">
                    {booking.totalAmount != null ? `₹${booking.totalAmount}` : "Fare Pending"}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/bookings/${booking.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
