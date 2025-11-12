import React from "react";

interface ConfirmDialogProps {
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialogNew({
  title,
  description,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
      <div className="bg-black/90 border border-white/20 rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-white/10">
          <h3 className="font-semibold text-lg text-white">{title}</h3>
        </div>
        {description && (
          <div className="p-5">
            <p className="text-sm text-white/80">{description}</p>
          </div>
        )}
        <div className="p-5 flex justify-end gap-3 border-t border-white/10">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded text-white transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
