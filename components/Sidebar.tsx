"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Settings, User, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/athletes", label: "Athletes", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#003219] text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 fixed md:sticky w-[250px] min-w-[250px] bg-[#003219] border-r border-[#003219] flex flex-col top-0 h-screen overflow-hidden z-40`}>
      {/* Top */}
      <div className="p-5 pt-[20px]">
        <div className="mb-10 flex flex-col" style={{ width: '200px', height: '103px', opacity: 1, paddingTop: '10px' }}>
          <div className="text-white leading-none italic uppercase" style={{ fontSize: '40px', fontWeight: 900 }}>Final</div>
          <div className="text-white leading-none italic uppercase" style={{ fontSize: '40px', fontWeight: 900, paddingLeft: '20px' }}>Whistle</div>
          <div className="text-white leading-none italic uppercase" style={{ fontSize: '40px', fontWeight: 900 }}>Wealth</div>
        </div>

        {/* Nav */}
        <div className="mt-[90px] border-t border-[#004d2c] pt-6 pb-6 border-b border-[#004d2c]">
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map(({ href, label, icon: Icon }, index) => {
              const active = pathname.startsWith(href);
              return (
                <div key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] font-medium transition ${
                      active
                        ? "text-[#7FFF9E] font-semibold"
                        : "text-[#a8d5ba] hover:text-white"
                    }`}
                    style={{ fontSize: '15px' }}
                  >
                    {label === "Dashboard" ? (
                      <Image src="/icon-dashboard.png" alt="Dashboard" width={16} height={16} style={{ opacity: active ? 1 : 0.7 }} />
                    ) : label === "Athletes" ? (
                      <Image src="/icon-athletes.png" alt="Athletes" width={16} height={16} style={{ opacity: active ? 1 : 0.7 }} />
                    ) : label === "Settings" ? (
                      <Image src="/icon-settings.png" alt="Settings" width={16} height={16} style={{ opacity: active ? 1 : 0.7 }} />
                    ) : (
                      <Icon size={16} className={active ? "opacity-100" : "opacity-70"} />
                    )}
                    {label}
                  </Link>
                  {(index === 0 || index === 1) && <div className="my-2 border-t border-[#004d2c]"></div>}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-auto p-4">
        <div className="flex items-center justify-center gap-2.5 p-2 rounded-[10px] cursor-pointer hover:bg-[#004d2c] transition">
          <div className="w-[30px] h-[30px] rounded-full border-2 border-[#a8d5ba] flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-[#a8d5ba]" />
          </div>
          <div className="text-xs text-[#a8d5ba] truncate">{adminEmail}</div>
        </div>
        <button className="w-full mt-1.5 px-2 py-2 border border-[#004d2c] rounded-full text-[#003219] hover:bg-[#004d2c] hover:text-white transition flex items-center justify-center gap-2 uppercase" style={{ backgroundColor: '#55695F', fontFamily: 'Albert Sans', fontWeight: 900, fontSize: '15px', lineHeight: '100%', letterSpacing: '0%', verticalAlign: 'middle' }}>
          Sign out
        </button>
      </div>
    </aside>
    </>
  );
}
