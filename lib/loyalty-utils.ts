const DEFAULT_TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
};

export function getTierColor(tierName?: string | null) {
  if (!tierName) return null;
  const normalized = tierName.toLowerCase();
  return DEFAULT_TIER_COLORS[normalized] || null;
}

export function getReadableTextColor(background?: string | null) {
  if (!background) return "#111827";
  if (!background.startsWith("#")) return "#111827";
  const hex = background.replace("#", "");
  if (hex.length !== 6) return "#111827";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111827" : "#FFFFFF";
}
