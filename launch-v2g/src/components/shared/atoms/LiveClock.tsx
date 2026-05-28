"use client";

import { useEffect, useState } from "react";

function format(now: Date): string {
  return now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

interface LiveClockProps {
  className?: string;
}

export default function LiveClock({ className }: LiveClockProps) {
  // Render an empty string on the server / first paint so the client and
  // server markup match — then fill in the real time after hydration.
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () => setTime(format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {time || " "}
    </span>
  );
}
