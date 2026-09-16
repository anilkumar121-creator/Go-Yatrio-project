"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, MapPin, Calendar, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { encodeStops, decodeStops } from "@/lib/cab-search-utils";

type LookupItem = {
  id: string;
  value: string;
  label: string;
  description: string | null;
  sortOrder: number;
};

type CityOption = {
  id: string;
  name: string;
};

type CabSearchWidgetProps = {
  tripTypes: LookupItem[];
  allCities: CityOption[];
  vehicleTypes?: LookupItem[];
};

const cabSearchSchema = z
  .object({
    trip: z.string().min(1, "Trip type is required"),
    originCityId: z.string().min(1, "Pickup city is required"),
    destinationCityId: z.string().optional(),
    travelDate: z.string().min(1, "Pickup date is required"),
    pickupTime: z.string().min(1, "Pickup time is required"),
    returnDate: z.string().optional(),
    returnTime: z.string().optional(),
    stops: z
      .array(
        z.object({
          location: z.string().min(1, "Stop location is required"),
          cityId: z.string().optional(),
        }),
      )
      .max(20, "Maximum 20 stops allowed")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.trip !== "LOCAL") {
      if (!data.destinationCityId && data.trip !== "MULTI_WAY") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Drop city is required",
          path: ["destinationCityId"],
        });
      }
    }

    if (data.trip === "ROUND_TRIP" || data.trip === "MULTI_DAY") {
      if (!data.returnDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Return date is required",
          path: ["returnDate"],
        });
      }
      if (!data.returnTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Return time is required",
          path: ["returnTime"],
        });
      }

      if (data.travelDate && data.returnDate) {
        const start = new Date(data.travelDate);
        const end = new Date(data.returnDate);
        if (end < start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Return date must be after pickup date",
            path: ["returnDate"],
          });
        }
      }
    }

    if (data.trip === "MULTI_WAY") {
      if (!data.stops || data.stops.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one stop is required for multi-way trips",
          path: ["stops"],
        });
      }
    }
  });

type CabSearchValues = z.infer<typeof cabSearchSchema>;

export function CabSearchWidget({ tripTypes, allCities }: CabSearchWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read defaults from URL
  const defaultTrip = searchParams.get("trip") || "LOCAL";
  const defaultOrigin = searchParams.get("originCityId") || "";
  const defaultDest = searchParams.get("destinationCityId") || "";
  const defaultDate = searchParams.get("travelDate") || "";
  const defaultTime = searchParams.get("pickupTime") || "";
  const defaultRetDate = searchParams.get("returnDate") || "";
  const defaultRetTime = searchParams.get("returnTime") || "";
  const defaultStops = decodeStops(searchParams.get("stops"));

  const form = useForm<CabSearchValues>({
    resolver: zodResolver(cabSearchSchema),
    defaultValues: {
      trip: defaultTrip,
      originCityId: defaultOrigin,
      destinationCityId: defaultDest,
      travelDate: defaultDate,
      pickupTime: defaultTime,
      returnDate: defaultRetDate,
      returnTime: defaultRetTime,
      stops: defaultStops,
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = form;
  const currentTripType = watch("trip");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stops",
  });

  const onSubmit = (data: CabSearchValues) => {
    const params = new URLSearchParams(searchParams.toString());

    // Clear page param if it exists when doing a new search
    params.delete("page");

    params.set("trip", data.trip);
    params.set("originCityId", data.originCityId);

    if (data.travelDate) params.set("travelDate", data.travelDate);
    else params.delete("travelDate");

    if (data.pickupTime) params.set("pickupTime", data.pickupTime);
    else params.delete("pickupTime");

    if (data.trip !== "LOCAL" && data.destinationCityId && data.trip !== "MULTI_WAY") {
      params.set("destinationCityId", data.destinationCityId);
    } else {
      params.delete("destinationCityId");
    }

    if (data.trip === "ROUND_TRIP" || data.trip === "MULTI_DAY") {
      if (data.returnDate) params.set("returnDate", data.returnDate);
      if (data.returnTime) params.set("returnTime", data.returnTime);
    } else {
      params.delete("returnDate");
      params.delete("returnTime");
    }

    if (data.trip === "MULTI_WAY" && data.stops && data.stops.length > 0) {
      params.set("stops", encodeStops(data.stops));
    } else {
      params.delete("stops");
    }

    router.push(`/cabs?${params.toString()}`);
  };

  const showDropCity = currentTripType !== "LOCAL" && currentTripType !== "MULTI_WAY";
  const showReturnDate = currentTripType === "ROUND_TRIP" || currentTripType === "MULTI_DAY";
  const showStops = currentTripType === "MULTI_WAY";

  return (
    <div className="bg-background rounded-2xl shadow-xl p-4 sm:p-6 text-foreground max-w-4xl mx-auto border border-border/50 backdrop-blur-sm">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Trip Type Selector */}
        <fieldset className="flex flex-wrap items-center justify-center gap-2">
          {tripTypes.map((trip) => (
            <label key={trip.value} className="relative cursor-pointer">
              <input
                type="radio"
                value={trip.value}
                {...register("trip")}
                className="peer sr-only"
                onChange={(e) => {
                  setValue("trip", e.target.value);
                  if (e.target.value === "MULTI_WAY" && fields.length === 0) {
                    append({ location: "", cityId: "" });
                  }
                }}
              />
              <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full border border-border/60 bg-muted/30 text-foreground peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary transition-all hover:bg-muted">
                {trip.label}
              </span>
            </label>
          ))}
        </fieldset>
        {errors.trip && (
          <p className="text-destructive text-sm text-center">{errors.trip.message}</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pickup City */}
          <div className="relative col-span-1 lg:col-span-2">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
              <MapPin className="size-5" />
            </div>
            <select
              {...register("originCityId")}
              className={`w-full rounded-xl border ${errors.originCityId ? "border-destructive" : "border-input"} bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
            >
              <option value="">Pickup City</option>
              {allCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.originCityId && (
              <p className="text-destructive text-xs mt-1 absolute -bottom-5">
                {errors.originCityId.message}
              </p>
            )}
          </div>

          {/* Pickup Date */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
              <Calendar className="size-5" />
            </div>
            <input
              type="date"
              {...register("travelDate")}
              className={`w-full rounded-xl border ${errors.travelDate ? "border-destructive" : "border-input"} bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
            />
            {errors.travelDate && (
              <p className="text-destructive text-xs mt-1 absolute -bottom-5">
                {errors.travelDate.message}
              </p>
            )}
          </div>

          {/* Pickup Time */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
              <Clock className="size-5" />
            </div>
            <input
              type="time"
              {...register("pickupTime")}
              className={`w-full rounded-xl border ${errors.pickupTime ? "border-destructive" : "border-input"} bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
            />
            {errors.pickupTime && (
              <p className="text-destructive text-xs mt-1 absolute -bottom-5">
                {errors.pickupTime.message}
              </p>
            )}
          </div>

          {/* Multi-Way Stops */}
          {showStops && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col gap-3 mt-2 border border-border/50 rounded-xl p-4 bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Intermediate Stops</span>
                {fields.length < 20 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 rounded-full"
                    onClick={() => append({ location: "", cityId: "" })}
                  >
                    <Plus className="size-3" /> Add Stop
                  </Button>
                )}
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                >
                  <div className="flex-1 w-full relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {index + 1}
                    </div>
                    <Input
                      placeholder="Stop Location (e.g. Hotel, Station, Landmark)"
                      {...register(`stops.${index}.location`)}
                      className={`w-full rounded-xl border ${errors.stops?.[index]?.location ? "border-destructive" : "border-input"} bg-background pl-10 pr-3 py-3`}
                    />
                  </div>
                  {/* Optional City Selection for Stop */}
                  <div className="w-full sm:w-1/3 shrink-0">
                    <select
                      {...register(`stops.${index}.cityId`)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm font-medium appearance-none"
                    >
                      <option value="">City (Optional)</option>
                      {allCities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0 self-end sm:self-auto"
                    onClick={() => remove(index)}
                  >
                    <X className="size-4" />
                  </Button>
                  {errors.stops?.[index]?.location && (
                    <p className="text-destructive text-xs w-full block sm:hidden">
                      {errors.stops[index]?.location?.message}
                    </p>
                  )}
                </div>
              ))}
              {errors.stops && !Array.isArray(errors.stops) && (
                <p className="text-destructive text-sm mt-1">{errors.stops.message}</p>
              )}
            </div>
          )}

          {/* Drop City */}
          {(showDropCity || showStops) && (
            <div className="relative col-span-1 lg:col-span-2">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                <MapPin className="size-5" />
              </div>
              <select
                {...register("destinationCityId")}
                className={`w-full rounded-xl border ${errors.destinationCityId ? "border-destructive" : "border-input"} bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
              >
                <option value="">{showStops ? "Final Drop City" : "Drop City"}</option>
                {allCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.destinationCityId && (
                <p className="text-destructive text-xs mt-1 absolute -bottom-5">
                  {errors.destinationCityId.message}
                </p>
              )}
            </div>
          )}

          {/* Return Date */}
          {showReturnDate && (
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                <Calendar className="size-5" />
              </div>
              <input
                type="date"
                {...register("returnDate")}
                className={`w-full rounded-xl border ${errors.returnDate ? "border-destructive" : "border-input"} bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
              />
              {errors.returnDate && (
                <p className="text-destructive text-xs mt-1 absolute -bottom-5">
                  {errors.returnDate.message}
                </p>
              )}
            </div>
          )}

          {/* Return Time */}
          {showReturnDate && (
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                <Clock className="size-5" />
              </div>
              <input
                type="time"
                {...register("returnTime")}
                className={`w-full rounded-xl border ${errors.returnTime ? "border-destructive" : "border-input"} bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
              />
              {errors.returnTime && (
                <p className="text-destructive text-xs mt-1 absolute -bottom-5">
                  {errors.returnTime.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto rounded-xl text-base font-semibold shadow-md px-10 py-6"
          >
            <Search className="size-5 mr-2" />
            Search Cabs
          </Button>
        </div>
      </form>
    </div>
  );
}
