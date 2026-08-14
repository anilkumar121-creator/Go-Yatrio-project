import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";

type EmptySearchProps = {
  query?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptySearch({
  query,
  title = "No results found",
  description,
  action,
}: EmptySearchProps) {
  return (
    <EmptyState
      icon={SearchX}
      title={title}
      description={
        description ??
        (query
          ? `We could not find anything matching "${query}". Try a different search.`
          : "We could not find anything matching your search. Try adjusting the filters.")
      }
      action={action}
    />
  );
}
