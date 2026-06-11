// Shared color/category constants for the map and analytics sections.

// Cool hues so markers stay readable on the warm red-to-green choropleth.
export const FACILITY_COLORS: Record<string, string> = {
  Hospital: '#3b82f6',
  Clinic: '#a855f7',
  'Health Center': '#f8fafc',
  'Birthing Center': '#f472b6',
};

export const FACILITY_TYPES = Object.keys(FACILITY_COLORS);

export const CATEGORY_ORDER = [
  'Very Low Access',
  'Low Access',
  'Moderate Access',
  'High Access',
  'Very High Access',
] as const;

// Matches the choropleth interpolation stops.
export const CATEGORY_COLORS: Record<string, string> = {
  'Very Low Access': '#dc2626',
  'Low Access': '#f97316',
  'Moderate Access': '#facc15',
  'High Access': '#84cc16',
  'Very High Access': '#22c55e',
};

// Badge styling per access category (light + dark variants).
export const CATEGORY_STYLES: Record<string, string> = {
  'Very Low Access': 'border-red-500/30 text-red-600 dark:text-red-400',
  'Low Access': 'border-orange-500/30 text-orange-600 dark:text-orange-400',
  'Moderate Access': 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
  'High Access': 'border-lime-500/30 text-lime-600 dark:text-lime-400',
  'Very High Access': 'border-green-500/30 text-green-600 dark:text-green-400',
};
