import React, { createContext, useContext, useMemo, useState } from "react";

type SelectionContextType = {
  selected: Set<string>;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  setMultiple: (ids: string[]) => void;
  clear: () => void;
  count: number;
  has: (id: string) => boolean;
};

const SelectionContext = createContext<SelectionContextType | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const api: SelectionContextType = useMemo(
    () => ({
      selected,
      toggle: (id: string) => {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return next;
        });
      },
      add: (id: string) => {
        setSelected((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      },
      remove: (id: string) => {
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
      setMultiple: (ids: string[]) => {
        setSelected(new Set(ids));
      },
      clear: () => setSelected(new Set()),
      count: selected.size,
      has: (id: string) => selected.has(id),
    }),
    [selected]
  );

  return <SelectionContext.Provider value={api}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within SelectionProvider");
  }
  return context;
}
