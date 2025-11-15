import { format, parseISO } from "date-fns";

export const formatDate = (value: string) => {
  try {
    return format(parseISO(value), "MMMM d, yyyy");
  } catch {
    return value;
  }
};
