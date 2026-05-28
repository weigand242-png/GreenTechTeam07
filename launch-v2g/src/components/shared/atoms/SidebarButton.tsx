"use client";

import { cn } from "@/lib/utils";
import type { RouteItem } from "@/types/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarButton({ item }: { item: RouteItem }) {
  const pathname = usePathname();
  const isActive =
    item.route === "/"
      ? pathname === "/"
      : pathname === item.route || pathname.startsWith(`${item.route}/`);

  const Icon = item.icon;

  return (
    <Link
      href={item.route}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center justify-center gap-3 rounded-lg border border-transparent px-3 py-2 text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-accent-foreground 2xl:justify-start",
        isActive &&
          "border-border bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="hidden text-sm font-medium 2xl:inline">
        {item.label}
      </span>
    </Link>
  );
}
