"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/athletes", label: "Athletes" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav
      className="h-16 flex items-center px-6 border-b border-gray-100 bg-white sticky top-0 z-30"
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 mr-10">
        {/* ⚠️ Replace span with <Image> and real FWW logo once Cait provides asset */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--fww-green)" }}
        >
          <span className="text-white text-xs font-bold">FW</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">Final Whistle Wealth</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1 flex-1">
        {navLinks.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              style={active ? { backgroundColor: "var(--fww-green)" } : {}}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* User + sign out */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400 hidden sm:block">{adminEmail}</span>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-900 transition"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
