import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(value: string | Date) {
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return value instanceof Date ? value.toDateString() : value;
  }
}

export function isNotEmpty<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
