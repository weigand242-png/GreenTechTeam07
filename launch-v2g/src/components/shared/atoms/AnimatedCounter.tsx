"use client";

import { cn } from "@/lib/utils";
import CountUp from "react-countup";
import type { ComponentProps } from "react";

type Props = { className?: string } & ComponentProps<typeof CountUp>;

export default function AnimatedCounter({ className, ...props }: Props) {
  return (
    <span className={cn("tabular-nums", className)}>
      <CountUp preserveValue {...props} />
    </span>
  );
}
