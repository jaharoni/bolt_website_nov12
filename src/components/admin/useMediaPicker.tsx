import { useState } from "react";
import MediaPickerModal from "./MediaPickerModal";

export function useMediaPicker(options?: { multi?: boolean; title?: string }) {
  const [open, setOpen] = useState(false);
  const [resolver, setResolver] = useState<((ids: string[]) => void) | null>(
    null
  );

  function pick(): Promise<string[]> {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setOpen(true);
    });
  }

  function handleConfirm(ids: string[]) {
    resolver?.(ids);
    setOpen(false);
    setResolver(null);
  }

  function handleClose() {
    resolver?.([]);
    setOpen(false);
    setResolver(null);
  }

  const modal = (
    <MediaPickerModal
      open={open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      multi={options?.multi ?? true}
      title={options?.title}
    />
  );

  return { pick, modal };
}
