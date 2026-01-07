/**
 * Shared constants for boards feature
 */

import type { LabelOption } from "@/components/ui/multi-select-input";

// Board background images from Unsplash (free to use)
export const BOARD_BACKGROUNDS = [
  {
    id: "none",
    name: "None",
    url: null,
    thumbnail: null,
    category: "default",
  },
  {
    id: "1",
    name: "Mountain Lake",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    category: "nature",
  },
  {
    id: "2",
    name: "Ocean Waves",
    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-505142468610-359e7d316be0?w=400&q=80",
    category: "nature",
  },
  {
    id: "3",
    name: "Forest Path",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
    category: "nature",
  },
  {
    id: "4",
    name: "Desert Dunes",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80",
    category: "nature",
  },
  {
    id: "5",
    name: "Northern Lights",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80",
    category: "nature",
  },
  {
    id: "6",
    name: "City Skyline",
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80",
    category: "urban",
  },
  {
    id: "7",
    name: "Neon Lights",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&q=80",
    category: "urban",
  },
  {
    id: "8",
    name: "Minimalist Office",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
    category: "workspace",
  },
  {
    id: "9",
    name: "Workspace Desk",
    url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80",
    category: "workspace",
  },
  {
    id: "10",
    name: "Coffee Shop",
    url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&q=80",
    category: "workspace",
  },
  {
    id: "11",
    name: "Gradient Blue",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80",
    category: "abstract",
  },
  {
    id: "12",
    name: "Gradient Purple",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80",
    category: "abstract",
  },
  {
    id: "13",
    name: "Colorful Paint",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80",
    category: "abstract",
  },
  {
    id: "14",
    name: "Geometric Shapes",
    url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400&q=80",
    category: "abstract",
  },
  {
    id: "15",
    name: "Pastel Clouds",
    url: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=400&q=80",
    category: "nature",
  },
  {
    id: "16",
    name: "Sunset Sky",
    url: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=400&q=80",
    category: "nature",
  },
  {
    id: "17",
    name: "Cherry Blossoms",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&q=80",
    category: "nature",
  },
  {
    id: "18",
    name: "Tropical Beach",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
    category: "nature",
  },
  {
    id: "19",
    name: "Autumn Forest",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    category: "nature",
  },
  {
    id: "20",
    name: "Starry Night",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80",
    category: "nature",
  },
] as const;

export type BoardBackgroundId = (typeof BOARD_BACKGROUNDS)[number]["id"];

// Column background colors with Tailwind classes
export const COLUMN_COLORS = [
  { name: "Gray", value: "gray", className: "bg-gray-100" },
  { name: "Red", value: "red", className: "bg-red-100" },
  { name: "Orange", value: "orange", className: "bg-orange-100" },
  { name: "Amber", value: "amber", className: "bg-amber-100" },
  { name: "Yellow", value: "yellow", className: "bg-yellow-100" },
  { name: "Lime", value: "lime", className: "bg-lime-100" },
  { name: "Green", value: "green", className: "bg-green-100" },
  { name: "Teal", value: "teal", className: "bg-teal-100" },
  { name: "Blue", value: "blue", className: "bg-blue-100" },
  { name: "Purple", value: "purple", className: "bg-purple-100" },
] as const;

// Map for quick lookup of column colors by value
export const COLUMN_COLOR_MAP: Record<string, string> = COLUMN_COLORS.reduce(
  (acc, color) => {
    acc[color.value] = color.className;
    return acc;
  },
  {} as Record<string, string>,
);

// Card priority options
export const CARD_PRIORITIES = [
  { value: "low", label: "Low", className: "bg-green-100 text-green-800" },
  {
    value: "medium",
    label: "Medium",
    className: "bg-yellow-100 text-yellow-800",
  },
  { value: "high", label: "High", className: "bg-red-100 text-red-800" },
] as const;

// Predefined card labels
export const CARD_LABELS: LabelOption[] = [
  { value: "bug", label: "Bug", color: "red" },
  { value: "feature", label: "Feature", color: "blue" },
  { value: "enhancement", label: "Enhancement", color: "green" },
  { value: "documentation", label: "Documentation", color: "purple" },
  { value: "urgent", label: "Urgent", color: "orange" },
  { value: "blocked", label: "Blocked", color: "red" },
  { value: "in-progress", label: "In Progress", color: "yellow" },
  { value: "review", label: "Review", color: "indigo" },
  { value: "testing", label: "Testing", color: "pink" },
  { value: "design", label: "Design", color: "purple" },
  { value: "backend", label: "Backend", color: "blue" },
  { value: "frontend", label: "Frontend", color: "indigo" },
  { value: "database", label: "Database", color: "gray" },
  { value: "api", label: "API", color: "green" },
  { value: "security", label: "Security", color: "red" },
  { value: "performance", label: "Performance", color: "orange" },
];

// Type exports for type safety
export type ColumnColorValue = (typeof COLUMN_COLORS)[number]["value"];
export type CardPriorityValue = (typeof CARD_PRIORITIES)[number]["value"];
