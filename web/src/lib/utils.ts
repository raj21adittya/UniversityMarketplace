import { CATEGORIES, CONDITIONS, LOCATIONS } from "./constants";

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getCategoryIcon(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.icon ?? "📦";
}

export function getConditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export function getLocationLabel(value: string): string {
  return LOCATIONS.find((c) => c.value === value)?.label ?? value;
}
