"use client";

import SidebarButton from "@/components/shared/atoms/SidebarButton";
import { cn } from "@/lib/utils";
import { sidebarLinks } from "@/types/navigation";
import { Zap } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

export default function Sidebar({ className }: ComponentProps<"aside">) {
  return (
    <aside
      className={cn(
        "sticky top-0 left-0 flex h-dvh w-fit flex-col gap-2 border-r border-border bg-sidebar px-2 py-4 lg:px-3 2xl:w-56 2xl:px-4",
        className
      )}
    >
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 px-2 2xl:mb-8"
      >
        <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
          <Zap className="size-5" />
        </span>
        <span className="hidden text-base font-semibold text-sidebar-foreground 2xl:inline">
          V2G Fleet
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {sidebarLinks.map((item) => (
          <SidebarButton
            key={item.route}
            item={item}
          />
        ))}
      </nav>
    </aside>
  );
}
