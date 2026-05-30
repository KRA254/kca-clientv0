import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount?: number, currency = "KES") {
  const value = amount ?? 0;
  if (Math.abs(value) >= 1_000_000_000) return `${currency} ${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${currency} ${(value / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function labelize(value?: string | number | null) {
  return String(value ?? "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
