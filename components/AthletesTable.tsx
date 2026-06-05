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

function getAthleteYear(athleteId: string) {
  const years = ["1", "2", "3", "4", "G"];
  const index = parseInt(athleteId.charCodeAt(0).toString()) % years.length;
  return years[index];
}

type Props = {
  athletes: Athlete[];
  sports: string[];
  initialFilter?: string | null;
};

export default function AthletesTable({ athletes, sports, initialFilter }: Props) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(initialFilter === "inactive" ? "inactive" : "all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const years = Array.from(new Set(athletes.map((a) => getAthleteYear(a.id)))).sort();

  const filtered = athletes.filter((a) => {
    const matchesSearch = search === "" || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesSport = sportFilter === "all" || a.sport === sportFilter;
    const matchesYear = yearFilter === "all" || getAthleteYear(a.id) === yearFilter;
    const matchesStatus =
      statusFilter === "all" ? true :
      statusFilter === "active" ? a.activated_at !== null && !a.is_inactive :
      statusFilter === "inactive" ? a.is_inactive : true;
    return matchesSearch && matchesSport && matchesYear && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAthletes = filtered.slice(startIndex, endIndex);

  return (
    <div>
      <div className="flex gap-3 mb-6 items-center justify-between">
        <div className="flex gap-3 items-center">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-4 py-2 border border-[#e6eadc] rounded-full text-sm font-normal bg-white text-[#1a1f15] focus:outline-none focus:border-[#008236]"
          >
            <option value="all">All Sports</option>
            {sports.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-[#e6eadc] rounded-full text-sm font-normal bg-white text-[#1a1f15] focus:outline-none focus:border-[#008236]"
          >
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-[#e6eadc] rounded-full text-sm font-normal bg-white text-[#1a1f15] focus:outline-none focus:border-[#008236]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="flex-1 relative max-w-xs ml-auto">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-[#e6eadc] rounded-full text-sm font-normal bg-white text-[#1a1f15] focus:outline-none focus:border-[#008236]"
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa489] pointer-events-none" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "0 5px" }}>
          <thead className="bg-[#AFB9AA]">
            <tr style={{ border: "1px solid #e6eadc" }}>
              <th className="text-left px-[18px] py-3 text-[11px] font-medium uppercase tracking-[.07em] text-[#003219]">
                Name
              </th>
              <th className="text-left px-[18px] py-3 text-[11px] font-medium uppercase tracking-[.07em] text-[#003219]">
                Sport
              </th>
              <th className="text-left px-[18px] py-3 text-[11px] font-medium uppercase tracking-[.07em] text-[#003219]">
                Year
              </th>
              <th className="text-left px-[18px] py-3 text-[11px] font-medium uppercase tracking-[.07em] text-[#003219]">
                Modules
              </th>
              <th className="text-left px-[18px] py-3 text-[11px] font-medium uppercase tracking-[.07em] text-[#003219]">
                Last Active
              </th>
              <th className="text-left px-[18px] py-3 text-[11px] font-medium uppercase tracking-[.07em] text-[#003219]">
                Time in App
              </th>
              <th className="text-left px-[18px] py-3 text-[11px] font-medium uppercase tracking-[.07em] text-[#003219]">
                Budget
              </th>
              <th className="text-left px-[18px] py-3 text-[11px] font-medium uppercase tracking-[.07em] text-[#003219]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#9aa489] text-sm">
                  No athletes match your filters.
                </td>
              </tr>
            ) : (
              paginatedAthletes.map((athlete) => (
                <tr key={athlete.id} className="cursor-pointer transition bg-white" style={{ border: "1px solid #e6eadc" }}>
                  <td className="px-[18px] py-4">
                    <Link href={`/athletes/${athlete.id}`} className="font-bold text-[13px] text-[#1a1f15] hover:underline">
                      {athlete.name}
                    </Link>
                  </td>
                  <td className="px-[18px] py-4 text-[13px] text-[#636858]">{athlete.sport}</td>
                  <td className="px-[18px] py-4 text-[13px] text-[#636858]">{getAthleteYear(athlete.id)}</td>
                  <td className="px-[18px] py-4 text-[13px]">
                    <span className="text-[#1a1f15] font-semibold">{athlete.modules_completed}</span>
                    <span className="text-[#9aa489]">/{athlete.total_modules}</span>
                  </td>
                  <td className="px-[18px] py-4 text-[13px] text-[#636858]">{formatDate(athlete.last_active)}</td>
                  <td className="px-[18px] py-4 text-[13px] text-[#636858]">{formatSeconds(athlete.total_time_seconds)}</td>
                  <td className="px-[18px] py-4 text-[13px]">
                    {athlete.budget_set ? (
                      <span className="font-semibold text-[#1a1f15]">Yes</span>
                    ) : (
                      <span className="text-[#9aa489]">No</span>
                    )}
                  </td>
                  <td className="px-[18px] py-4 flex items-center gap-2">
                    {!athlete.activated_at ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#9aa489]" />
                        <span className="text-[13px] font-semibold text-[#636858]">Pending</span>
                      </>
                    ) : athlete.is_inactive ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#9aa489]" />
                        <span className="text-[13px] font-semibold text-[#636858]">Inactive</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#007D32]" />
                        <span className="text-[13px] font-semibold text-[#1a1f15]">Active</span>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#e6eadc] rounded-full text-sm font-medium bg-white text-[#1a1f15] disabled:text-[#9aa489] disabled:border-[#e6eadc] hover:border-[#008236] transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-[#007D32] text-white"
                      : "border border-[#e6eadc] bg-white text-[#1a1f15] hover:border-[#008236]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#e6eadc] rounded-full text-sm font-medium bg-white text-[#1a1f15] disabled:text-[#9aa489] disabled:border-[#e6eadc] hover:border-[#008236] transition"
            >
              Next
            </button>
          </div>
          <p className="text-sm text-[#636858]">
            Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} athletes
          </p>
        </div>
      )}
    </div>
  );
}
