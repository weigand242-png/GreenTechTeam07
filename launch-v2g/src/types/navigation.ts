import type { LucideIcon } from "lucide-react";
import {
  Car,
  LayoutDashboard,
  Settings,
  Zap,
} from "lucide-react";

export const sidebarLinks: RouteItem[] = [
  {
    icon: LayoutDashboard,
    route: "/",
    label: "Dashboard",
  },
  {
    icon: Car,
    route: "/fleet",
    label: "Fleet",
  },
  {
    icon: Zap,
    route: "/grid",
    label: "Grid",
  },
  {
    icon: Settings,
    route: "/settings",
    label: "Settings",
  },
];

export type RouteItem = {
  icon: LucideIcon;
  route: string;
  label: string;
};
