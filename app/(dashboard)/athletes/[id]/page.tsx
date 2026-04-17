import { getAthleteDetail } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import { ArrowLeft, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

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

function daysSince(iso: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

type Props = { params: Promise<{ id: string }> };

export default async function AthleteDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getAthleteDetail(id);
  const { athlete, modules } = data;
  const daysSinceActive = daysSince(athlete.last_active);

  return (
    <>
      <Topbar title={athlete.name} subtitle={athlete.sport} />

      <div className="max-w-[840px]">
        {/* Back link */}
        <Link
          href="/athletes"
          className="inline-flex items-center gap-1.5 text-xs text-[#636858] hover:text-[#1a1f15] mb-5 transition"
        >
          <ArrowLeft size={14} />
          All Athletes
        </Link>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white border border-[#e6eadc] rounded-[14px] px-[18px] py-4">
            <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[#9aa489] mb-[7px]">
              Enrolled
            </p>
            <p className="text-lg font-bold tracking-[-.02em] text-[#1a1f15]">{formatDate(athlete.invited_at)}</p>
          </div>
          <div className="bg-white border border-[#e6eadc] rounded-[14px] px-[18px] py-4">
            <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[#9aa489] mb-[7px]">
              Last Active
            </p>
            <p className="text-lg font-bold tracking-[-.02em] text-[#1a1f15]">{formatDate(athlete.last_active)}</p>
          </div>
          <div className="bg-white border border-[#e6eadc] rounded-[14px] px-[18px] py-4">
            <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[#9aa489] mb-[7px]">
              Total Sessions
            </p>
            <p className="text-lg font-bold tracking-[-.02em] text-[#1a1f15]">{athlete.total_sessions}</p>
          </div>
          <div className="bg-white border border-[#e6eadc] rounded-[14px] px-[18px] py-4">
            <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[#9aa489] mb-[7px]">
              Time in App
            </p>
            <p className="text-lg font-bold tracking-[-.02em] text-[#1a1f15]">
              {formatSeconds(athlete.total_time_seconds)}
            </p>
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-white border border-[#e6eadc] rounded-[14px] px-[18px] py-4 flex items-center gap-3.5 mb-4">
          <div
            className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: athlete.budget_set ? "var(--fww-green-light)" : "#f4f6f0",
            }}
          >
            <Wallet size={20} style={{ stroke: athlete.budget_set ? "var(--fww-green)" : "#9aa489" }} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1a1f15]">Budget</p>
            <p className="text-xs text-[#636858] mt-0.5">
              {athlete.budget_set ? "Budget has been set in the app" : "No budget set yet"}
            </p>
          </div>
        </div>

        {/* Module progress */}
        <div className="bg-white border border-[#e6eadc] rounded-[14px] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e6eadc] flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#1a1f15]">Learning Progress</h2>
            <span className="text-xs text-[#9aa489]">
              {athlete.modules_completed} of {athlete.total_modules} completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="px-5 py-3.5 border-b border-[#f4f6f0]">
            <div className="w-full bg-[#e6eadc] rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.round((athlete.modules_completed / athlete.total_modules) * 100)}%`,
                  backgroundColor: "var(--fww-green-cta)",
                }}
              />
            </div>
          </div>

          {/* Module rows */}
          <div className="divide-y divide-[#f4f6f0]">
            {modules.map((mod) => (
              <div key={mod.module_id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-[22px] h-[22px] rounded-md bg-[#f4f6f0] flex items-center justify-center text-[10px] font-bold text-[#636858] flex-shrink-0">
                    {mod.order_index}
                  </div>
                  <span className="text-sm font-medium text-[#1a1f15]">{mod.module_name}</span>
                </div>
                <span
                  className={`px-2.25 py-[3px] text-[11px] font-semibold rounded-full inline-flex items-center gap-1 ${
                    mod.status === "completed"
                      ? "bg-[#d0ffd9] text-[#015d25]"
                      : mod.status === "in_progress"
                        ? "bg-[#dbeafe] text-[#1e40af]"
                        : "bg-[#f4f6f0] text-[#636858] border border-[#e6eadc]"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        mod.status === "completed"
                          ? "var(--fww-green-cta)"
                          : mod.status === "in_progress"
                            ? "#60a5fa"
                            : "#d4dcc4",
                    }}
                  />
                  {mod.status === "completed"
                    ? "Completed"
                    : mod.status === "in_progress"
                      ? "In Progress"
                      : "Not Started"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
