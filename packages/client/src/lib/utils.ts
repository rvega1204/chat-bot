import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// The cn function is a utility for combining class names conditionally, using clsx for handling various input
// types and twMerge to optimize the final class string by merging Tailwind CSS classes.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
