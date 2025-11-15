"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 placeholder:text-slate-500",
      "focus-visible:border-[#0b4f6c] focus-visible:ring-2 focus-visible:ring-[#0b4f6c]",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
