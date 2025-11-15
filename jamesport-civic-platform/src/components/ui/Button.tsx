"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  asChild?: boolean;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-colors disabled:opacity-60";

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#0b4f6c] text-white hover:bg-[#093d52] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0b4f6c]",
  secondary: "bg-white text-[#0b4f6c] border border-[#0b4f6c] hover:bg-[#e0f2fe]",
  ghost: "bg-transparent text-[#0b4f6c] hover:bg-[#e0f2fe]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth, asChild, ...props }, ref) => {
    const composedClasses = cn(baseClasses, fullWidth && "w-full", variantMap[variant], className);

    if (asChild) {
      return <Slot className={composedClasses} {...props} />;
    }

    return <button ref={ref} className={composedClasses} {...props} />;
  }
);

Button.displayName = "Button";
