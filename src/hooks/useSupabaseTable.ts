import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

type FilterOperator = "eq" | "ilike" | "contains" | "is" | "gt" | "lt" | "gte" | "lte";

type Filter = {
  column: string;
  op: FilterOperator;
  value: any;
};

type Options<T> = {
  table: string;
  select?: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  filters?: Filter[];
};

export default function useSupabaseTable<T = any>(opts: Options<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const schemaReloadAttempted = useRef(false);

  useEffect(() => {
    schemaReloadAttempted.current = false;
  }, [opts.table]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

      try {
      let query = supabase.from(opts.table).select(opts.select ?? "*");

      if (opts.filters) {
        for (const f of opts.filters) {
          switch (f.op) {
            case "eq":
              query = query.eq(f.column, f.value);
              break;
            case "ilike":
              query = query.ilike(f.column, f.value);
              break;
            case "contains":
              query = query.contains(f.column, f.value);
              break;
            case "is":
              query = query.is(f.column, f.value);
              break;
            case "gt":
              query = query.gt(f.column, f.value);
              break;
            case "lt":
              query = query.lt(f.column, f.value);
              break;
            case "gte":
              query = query.gte(f.column, f.value);
              break;
            case "lte":
              query = query.lte(f.column, f.value);
              break;
          }
        }
      }

      if (opts.order) {
        query = query.order(opts.order.column, { ascending: opts.order.ascending ?? false });
      }

      if (opts.limit) {
        query = query.limit(opts.limit);
      }

        let { data, error } = await query;

        if (
          error &&
          !schemaReloadAttempted.current &&
          (
            (typeof error.message === "string" && error.message.includes("schema cache")) ||
            (typeof error.message === "string" && error.message.includes("'randomization_enabled'"))
          )
        ) {
          schemaReloadAttempted.current = true;
          try {
            await supabase.rpc('reload_schema_cache');
          } catch {
            // ignore failure; fall through to retry
          }

          // Retry the original query after attempting schema reload
          const retry = await supabase.from(opts.table).select(opts.select ?? "*");
          data = retry.data;
          error = retry.error;
        }

      if (error) {
        setError(error);
      } else {
        setItems((data as any) ?? []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(opts)]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function insert(values: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(opts.table)
      .insert(values)
      .select()
      .single();

    if (error) throw error;
    await fetchAll();
    return data as T;
  }

  async function update(idColumn: string, idValue: any, values: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(opts.table)
      .update(values)
      .eq(idColumn, idValue)
      .select()
      .single();

    if (error) throw error;
    await fetchAll();
    return data as T;
  }

  async function remove(idColumn: string, idValue: any): Promise<void> {
    const { error } = await supabase
      .from(opts.table)
      .delete()
      .eq(idColumn, idValue);

    if (error) throw error;
    await fetchAll();
  }

  return { items, loading, error, fetchAll, insert, update, remove };
}
