interface HeaderBoxProps {
  title: string;
  subtitle?: string;
}

export default function HeaderBox({ title, subtitle }: HeaderBoxProps) {
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
        )}
      </div>
      <p className="text-muted-foreground text-sm">{today}</p>
    </div>
  );
}
