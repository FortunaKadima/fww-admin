import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fbf9f6]">
      <Sidebar adminEmail="demo@example.com" />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-7">{children}</div>
      </main>
    </div>
  );
}
