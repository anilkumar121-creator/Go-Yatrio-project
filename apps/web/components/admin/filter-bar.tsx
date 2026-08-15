"use client";

import { Button } from "@/components/common/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";
import { Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
};

type FilterBarProps = {
  filters: FilterGroup[];
  onReset?: () => void;
  className?: string;
};

export function FilterBar({ filters, onReset, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
        <Filter className="size-3.5" />
        <span>Filters:</span>
      </div>
      {filters.map((filter) => (
        <Select
          key={filter.id}
          value={filter.value}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className="w-40 text-xs">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {onReset ? (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground">
          <RotateCcw className="size-3.5 mr-1" />
          Reset
        </Button>
      ) : null}
    </div>
  );
}