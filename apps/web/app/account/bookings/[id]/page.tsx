import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { MapPin, Calendar, Car, Clock, CreditCard, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/common/button";

export const metadata = {
  title: "Booking Details",
};

async function getBookingDetails(id: string, token: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${API_URL}/api/bookings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 404) return null;
    throw new Error("Failed to fetch booking details");
  }

  return res.json();
}

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("goyatrio_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const booking = await getBookingDetails(params.id, token);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The booking you are looking for does not exist or you do not have access to it.
        </p>
        <Button asChild>
          <Link href="/account/bookings">Back to Bookings</Link>
        </Button>
      </div>
    );
  }

  const cab = booking.cabBooking;
  const pricing = cab?.pricingSnapshot;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/account/bookings">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
                Booking Details
                <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>
                  {booking.status}
                </Badge>
              </h2>
              <div className="text-sm text-muted-foreground font-mono mt-1">
                Ref: {booking.bookingReference} • Booked on{" "}
                {new Date(booking.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          {booking.serviceType === "CAB" && cab && (
            <Card>
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Trip Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Trip Type</div>
                      <div className="font-medium">{cab.tripType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Pickup Location</div>
                      <div className="font-medium flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                        <span>{cab.pickupLocation}</span>
                      </div>
                    </div>
                    {cab.dropLocation && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Drop Location</div>
                        <div className="font-medium flex items-start gap-2">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                          <span>{cab.dropLocation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Pickup Schedule</div>
                      <div className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>
                          {new Date(cab.pickupDate).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })}
                        </span>
                      </div>
                      <div className="font-medium flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{cab.pickupTime}</span>
                      </div>
                    </div>
                    {cab.returnDate && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Return Schedule</div>
                        <div className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>
                            {new Date(cab.returnDate).toLocaleDateString("en-IN", {
                              dateStyle: "medium",
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {booking.serviceType === "CAB" && cab && cab.vehicle && (
            <Card>
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {cab.vehicle.image ? (
                    <div className="h-24 w-36 rounded-md bg-muted overflow-hidden shrink-0">
                      <img
                        src={cab.vehicle.image}
                        alt={cab.vehicle.vehicleName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-36 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Car className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-semibold">{cab.vehicle.vehicleName}</h4>
                    <p className="text-muted-foreground">{cab.vehicle.vehicleType}</p>
                    <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                      <span>Passengers: {cab.passengers}</span>
                      <span>Luggage: {cab.luggageCount || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {pricing ? (
            <Card>
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Fare Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {pricing.baseFare > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Fare</span>
                    <span>₹{pricing.baseFare}</span>
                  </div>
                )}
                {pricing.distanceFare > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance Fare</span>
                    <span>₹{pricing.distanceFare}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-border flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>₹{pricing.totalFare}</span>
                </div>
                {pricing.advanceAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Advance Amount</span>
                      <span>₹{pricing.advanceAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-600 font-medium">
                      <span>Remaining Balance</span>
                      <span>₹{pricing.remainingAmount}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg">Fare Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm">
                  Fare details are pending or manually calculated.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
