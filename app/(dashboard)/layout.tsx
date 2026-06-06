import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#E6EBE1]">
      <Sidebar adminEmail="demo@example.com" />
      <main className="flex-1 overflow-auto w-full md:w-auto">
        <div className="px-4 md:px-8 py-7 pt-16 md:pt-7">{children}</div>
      </main>
    </div>
  );
}
