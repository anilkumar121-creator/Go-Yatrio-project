import { Search } from "lucide-react";
import { Input } from "@/components/common/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ value, onChange, placeholder = "Search...", className }: SearchBarProps) {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
}