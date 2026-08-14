"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";

type SearchBoxProps = {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  className?: string;
};

export function SearchBox({
  placeholder = "Search destinations, packages, hotels...",
  defaultValue,
  value,
  onValueChange,
  onSubmit,
  label = "Search",
  className,
}: SearchBoxProps) {
  return (
    <form
      className={cn("flex w-full max-w-xl items-center gap-2", className)}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const query = String(formData.get("query") ?? "").trim();
        onSubmit?.(query);
      }}
    >
      <label className="sr-only" htmlFor="search-box-input">
        {label}
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="search-box-input"
          name="query"
          type="search"
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
          className="pl-9"
        />
      </div>
      <Button type="submit" aria-label={label}>
        Search
      </Button>
    </form>
  );
}
