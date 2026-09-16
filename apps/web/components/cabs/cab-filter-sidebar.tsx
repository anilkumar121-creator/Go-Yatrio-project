"use client";

import React, { useRef } from "react";
import { Filter, X, Settings2 } from "lucide-react";
import { Button } from "@/components/common/button";

type LookupItem = {
  id: string;
  value: string;
  label: string;
};

type Props = {
  vehicleTypes: LookupItem[];
  defaultValues: {
    type?: string;
    fuelType?: string;
    ac?: string;
    minCapacity?: string;
    originCityId?: string;
    destinationCityId?: string;
    travelDate?: string;
    trip?: string;
    search?: string;
    sort?: string;
  };
};

export function CabFilterSidebar({ vehicleTypes, defaultValues }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAutoSubmit = () => {
    // Small delay to allow radio/checkbox state to update
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 50);
  };

  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      {/* Hidden inputs to preserve other search params */}
      <input type="hidden" name="originCityId" value={defaultValues.originCityId ?? ""} />
      <input type="hidden" name="destinationCityId" value={defaultValues.destinationCityId ?? ""} />
      <input type="hidden" name="travelDate" value={defaultValues.travelDate ?? ""} />
      <input type="hidden" name="trip" value={defaultValues.trip ?? ""} />
      <input type="hidden" name="search" value={defaultValues.search ?? ""} />
      <input type="hidden" name="sort" value={defaultValues.sort ?? ""} />

      {/* Vehicle Type Filter */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Settings2 className="size-4" />
          Vehicle Category
        </h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="radio"
              name="type"
              value=""
              defaultChecked={!defaultValues.type}
              onChange={handleAutoSubmit}
              className="accent-primary size-4"
            />
            Any Category
          </label>
          {vehicleTypes.map((vt) => (
            <label
              key={vt.value}
              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
            >
              <input
                type="radio"
                name="type"
                value={vt.value}
                defaultChecked={defaultValues.type === vt.value}
                onChange={handleAutoSubmit}
                className="accent-primary size-4"
              />
              {vt.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border/50" />

      {/* Capacity Filter */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground">Seating Capacity</h4>
        <div className="flex flex-col gap-2">
          {[
            { label: "Any", value: "" },
            { label: "4+ Seats", value: "4" },
            { label: "6+ Seats", value: "6" },
            { label: "8+ Seats", value: "8" },
            { label: "12+ Seats", value: "12" },
          ].map((cap) => (
            <label
              key={cap.value}
              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
            >
              <input
                type="radio"
                name="minCapacity"
                value={cap.value}
                defaultChecked={(defaultValues.minCapacity ?? "") === cap.value}
                onChange={handleAutoSubmit}
                className="accent-primary size-4"
              />
              {cap.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border/50" />

      {/* AC Filter */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground">AC Requirement</h4>
        <div className="flex flex-col gap-2">
          {[
            { label: "Any", value: "" },
            { label: "AC Only", value: "true" },
            { label: "Non-AC Only", value: "false" },
          ].map((acOpt) => (
            <label
              key={acOpt.value}
              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
            >
              <input
                type="radio"
                name="ac"
                value={acOpt.value}
                defaultChecked={(defaultValues.ac ?? "") === acOpt.value}
                onChange={handleAutoSubmit}
                className="accent-primary size-4"
              />
              {acOpt.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border/50" />

      {/* Fuel Filter */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground">Fuel Type</h4>
        <div className="flex flex-col gap-2">
          {[
            { label: "Any", value: "" },
            { label: "Diesel", value: "DIESEL" },
            { label: "Petrol", value: "PETROL" },
            { label: "CNG", value: "CNG" },
            { label: "Electric", value: "ELECTRIC" },
          ].map((fuel) => (
            <label
              key={fuel.value}
              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
            >
              <input
                type="radio"
                name="fuelType"
                value={fuel.value}
                defaultChecked={(defaultValues.fuelType ?? "") === fuel.value}
                onChange={handleAutoSubmit}
                className="accent-primary size-4"
              />
              {fuel.label}
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full text-xs"
          onClick={() => {
            if (formRef.current) {
              const radios = formRef.current.querySelectorAll('input[type="radio"]');
              radios.forEach((r) => {
                const radio = r as HTMLInputElement;
                if (radio.value === "") {
                  radio.checked = true;
                } else {
                  radio.checked = false;
                }
              });
              handleAutoSubmit();
            }
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-6 border-primary/20 bg-primary/5 text-primary"
          onClick={() => setIsOpen(true)}
        >
          <Filter className="size-5" />
          Filter Catalogue
        </Button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-background p-6 shadow-xl z-50 slide-in-from-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>
            <form ref={formRef} method="get" action="/cabs">
              <FilterContent />
              <div className="mt-8 sticky bottom-0 bg-background pt-4 pb-4 border-t border-border">
                <Button type="submit" className="w-full">
                  Apply Filters
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
            <Filter className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Filter Cabs</h2>
          </div>
          <form ref={formRef} method="get" action="/cabs">
            <FilterContent />
            {/* Fallback submit button for non-JS/accessibility */}
            <noscript>
              <Button type="submit" className="w-full mt-4">
                Apply Filters
              </Button>
            </noscript>
          </form>
        </div>
      </div>
    </>
  );
}
