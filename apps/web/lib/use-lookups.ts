"use client";

import { useEffect, useState } from "react";

export type LookupOption = {
  id: string;
  label: string;
  value: string;
  icon?: string | null;
  color?: string | null;
};

type LookupGroupPayload = {
  key: string;
  name: string;
  items: LookupOption[];
};

const cache = new Map<string, LookupGroupPayload[]>();

export function useLookups(
  groupKeys: string[],
  fallback: Record<string, string[]> = {},
): { options: Record<string, LookupOption[]>; loading: boolean; hasData: boolean } {
  const [data, setData] = useState<Record<string, LookupOption[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupKeys.length === 0) {
      setLoading(false);
      return;
    }

    const cacheKey = groupKeys.join(",");
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      const mapped: Record<string, LookupOption[]> = {};
      cached.forEach((g) => {
        mapped[g.key] = g.items ?? [];
      });
      setData(mapped);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/lookups?groupKey=${groupKeys.join(",")}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        if (cancelled) return;
        const groups: LookupGroupPayload[] = Array.isArray(payload?.data) ? payload.data : [];
        const mapped: Record<string, LookupOption[]> = {};
        groups.forEach((g) => {
          mapped[g.key] = g.items ?? [];
        });
        cache.set(cacheKey, groups);
        setData(mapped);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Backward-compatible fallback: build options from legacy constants.
        const mapped: Record<string, LookupOption[]> = {};
        groupKeys.forEach((key) => {
          mapped[key] = (fallback[key] ?? []).map((value, idx) => ({
            id: `legacy-${key}-${idx}`,
            label: value,
            value,
          }));
        });
        setData(mapped);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [groupKeys.join(",")]);

  const hasData = Object.values(data).some((items) => items.length > 0);

  return { options: data, loading, hasData };
}
