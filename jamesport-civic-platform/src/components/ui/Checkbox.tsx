"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseClasses =
  "h-5 w-5 cursor-pointer rounded border-2 border-slate-400 text-[#0b4f6c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b4f6c]";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => (
  <input ref={ref} type="checkbox" className={cn(baseClasses, className)} {...props} />
));

Checkbox.displayName = "Checkbox";
