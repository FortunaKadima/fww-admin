"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/athletes", label: "Athletes", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] min-w-[220px] bg-white border-r border-[#e6eadc] flex flex-col sticky top-0 h-screen overflow-hidden">
      {/* Top */}
      <div className="p-5 pt-[20px]">
        <div className="flex items-center gap-2.5 p-3 bg-[#f4f6f0] rounded-[12px] mb-6">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "var(--fww-green)" }}
          >
            FW
          </div>
          <div>
            <div className="text-xs font-semibold text-[#1a1f15]">Your School</div>
            <div className="text-[10px] text-[#636858] mt-0.5">Admin</div>
          </div>
        </div>

        {/* Nav */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9aa489] px-4 mb-1">
            Menu
          </div>
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm font-medium transition ${
                    active
                      ? "bg-[#d0ffd9] text-[#015d25] font-semibold"
                      : "text-[#636858] hover:bg-[#f4f6f0] hover:text-[#1a1f15]"
                  }`}
                >
                  <Icon size={16} className={active ? "opacity-100" : "opacity-70"} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-auto p-4 border-t border-[#e6eadc]">
        <div className="flex items-center gap-2.5 p-2 rounded-[10px] cursor-pointer hover:bg-[#f4f6f0] transition">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#e6eadc] flex items-center justify-center text-xs font-bold text-[#4a5041] flex-shrink-0">
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <div className="text-xs text-[#636858] truncate">{adminEmail}</div>
        </div>
        <button className="w-full mt-1.5 px-2 py-2 border border-[#e6eadc] rounded-[9px] bg-transparent text-xs text-[#636858] hover:bg-[#f4f6f0] hover:text-[#1a1f15] font-medium transition flex items-center justify-center gap-2">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
