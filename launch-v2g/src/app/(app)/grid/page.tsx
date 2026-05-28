import HeaderBox from "@/components/features/dashboard/HeaderBox";

export default function GridPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <HeaderBox
        title="Grid"
        subtitle="Grid intensity, pricing signals and dispatch windows."
      />
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
