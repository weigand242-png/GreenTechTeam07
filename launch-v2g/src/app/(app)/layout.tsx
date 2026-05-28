import Sidebar from "@/components/shared/organisms/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid h-dvh grid-cols-[auto_1fr]">
      <Sidebar />
      <main className="flex flex-col overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
