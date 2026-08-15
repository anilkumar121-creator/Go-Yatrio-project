import { Card } from "@/components/common/card";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  className?: string;
};

export function DataTable<T>({ columns, data, keyExtractor, className }: DataTableProps<T>) {
  return (
    <Card className={cn("overflow-hidden border border-border p-0 shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={cn("px-6 py-3.5", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)} className="transition-colors hover:bg-muted/30">
                  {columns.map((col, idx) => (
                    <td key={idx} className={cn("px-6 py-4 text-foreground", col.className)}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? (row[col.accessorKey] as React.ReactNode)
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}