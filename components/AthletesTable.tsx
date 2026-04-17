"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Athlete } from "@/lib/queries";

function formatSeconds(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Props = {
  athletes: Athlete[];
  sports: string[];
  initialFilter?: string | null;
};

export default function AthletesTable({ athletes, sports, initialFilter }: Props) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [inactiveOnly, setInactiveOnly] = useState(initialFilter === "inactive");

  useEffect(() => {
    if (initialFilter === "inactive") setInactiveOnly(true);
  }, [initialFilter]);

  const filtered = athletes.filter((a) => {
    const matchesSearch = search === "" || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesSport = sportFilter === "all" || a.sport === sportFilter;
    const matchesInactive = !inactiveOnly || a.is_inactive;
    return matchesSearch && matchesSport && matchesInactive;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-2.5 mb-3.5 items-center">
        <div className="flex-1 relative max-w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa489] pointer-events-none" />
          <input
            type="text"
            placeholder="Search athlete name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.25 border border-[#e6eadc] rounded-[9px] text-xs font-normal bg-white text-[#1a1f15] focus:outline-none focus:border-[#008236] focus:shadow-[0_0_0_3px_rgba(0,130,54,.1)] transition"
          />
        </div>
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="px-3 py-2.25 border border-[#e6eadc] rounded-[9px] text-xs font-normal bg-white text-[#1a1f15] focus:outline-none focus:border-[#008236] min-w-[140px]"
        >
          <option value="all">All Sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-3 py-2.25 border border-[#e6eadc] rounded-[9px] bg-white text-xs font-normal text-[#636858] cursor-pointer hover:border-[#d4dcc4] transition whitespace-nowrap">
          <input type="checkbox" checked={inactiveOnly} onChange={(e) => setInactiveOnly(e.target.checked)} className="cursor-pointer" />
          Inactive only
        </label>
      </div>

      {/* Result count */}
      <p className="text-[12px] text-[#9aa489] mb-2">
        Showing {filtered.length} of {athletes.length} athletes
      </p>

      {/* Table */}
      <div className="bg-white border border-[#e6eadc] rounded-[16px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f4f6f0]">
              <tr className="border-b border-[#e6eadc]">
                <th className="text-left px-[18px] py-[11px] text-[10px] font-bold uppercase tracking-[.07em] text-[#636858]">
                  Name
                </th>
                <th className="text-left px-[18px] py-[11px] text-[10px] font-bold uppercase tracking-[.07em] text-[#636858]">
                  Sport
                </th>
                <th className="text-left px-[18px] py-[11px] text-[10px] font-bold uppercase tracking-[.07em] text-[#636858]">
                  Modules
                </th>
                <th className="text-left px-[18px] py-[11px] text-[10px] font-bold uppercase tracking-[.07em] text-[#636858]">
                  Last Active
                </th>
                <th className="text-left px-[18px] py-[11px] text-[10px] font-bold uppercase tracking-[.07em] text-[#636858]">
                  Time in App
                </th>
                <th className="text-left px-[18px] py-[11px] text-[10px] font-bold uppercase tracking-[.07em] text-[#636858]">
                  Budget
                </th>
                <th className="text-left px-[18px] py-[11px] text-[10px] font-bold uppercase tracking-[.07em] text-[#636858]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#9aa489] text-sm">
                    No athletes match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((athlete) => (
                  <tr key={athlete.id} className="border-b border-[#f4f6f0] hover:bg-[#f4f6f0] cursor-pointer transition">
                    <td className="px-[18px] py-3.5">
                      <Link href={`/athletes/${athlete.id}`} className="font-bold text-[13px] text-[#1a1f15] hover:underline">
                        {athlete.name}
                      </Link>
                    </td>
                    <td className="px-[18px] py-3.5 text-[13px] text-[#636858]">{athlete.sport}</td>
                    <td className="px-[18px] py-3.5 text-[13px]">
                      <span className="text-[#1a1f15] font-semibold">{athlete.modules_completed}</span>
                      <span className="text-[#9aa489]">/{athlete.total_modules}</span>
                    </td>
                    <td className="px-[18px] py-3.5 text-[13px] text-[#636858]">{formatDate(athlete.last_active)}</td>
                    <td className="px-[18px] py-3.5 text-[13px] text-[#636858]">{formatSeconds(athlete.total_time_seconds)}</td>
                    <td className="px-[18px] py-3.5 text-[13px]">
                      {athlete.budget_set ? (
                        <span className="font-semibold text-[#007c33]">Yes</span>
                      ) : (
                        <span className="text-[#9aa489]">No</span>
                      )}
                    </td>
                    <td className="px-[18px] py-3.5">
                      {!athlete.activated_at ? (
                        <span className="inline-flex items-center gap-1 px-[9px] py-[3px] text-[11px] font-semibold rounded-full bg-[#f4f6f0] text-[#636858] border border-[#e6eadc]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4dcc4]" />
                          Pending
                        </span>
                      ) : athlete.is_inactive ? (
                        <span className="inline-flex items-center gap-1 px-[9px] py-[3px] text-[11px] font-semibold rounded-full bg-[#f4f6f0] text-[#4a5041] border border-[#e6eadc]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9aa489]" />
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-[9px] py-[3px] text-[11px] font-semibold rounded-full bg-[#d0ffd9] text-[#015d25]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00b64f]" />
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
