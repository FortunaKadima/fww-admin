import { getDashboardStats } from "@/lib/queries";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of your athletes' progress" />

      <div className="max-w-[1100px]">
        {/* Enrollment & Activation */}
        <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9aa489] mb-2.5 mt-5.5">
          Enrollment & Activation
        </div>
        <div className="grid grid-cols-4 gap-3 mb-1">
          <StatCard label="Total Enrolled Athletes" value={stats.total_enrolled} />
          <StatCard
            label="Activation Rate"
            value={`${stats.activation_rate}%`}
            subtext="Signed up vs. invited"
          />
          <StatCard
            label="Avg. Module Completion"
            value={`${stats.avg_module_completion}%`}
            subtext="Across all athletes"
          />
          <StatCard label="Total Completed Modules" value={stats.total_completed_modules} />
        </div>

        {/* Engagement */}
        <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9aa489] mb-2.5 mt-5.5">
          Engagement
        </div>
        <div className="grid grid-cols-4 gap-3 mb-1">
          <StatCard
            label="Weekly Active Users"
            value={stats.weekly_active_users}
            subtext="Last 7 days"
          />
          <StatCard
            label="Monthly Active Users"
            value={stats.monthly_active_users}
            subtext="Last 30 days"
          />
          <StatCard
            label="Avg. Login Frequency"
            value={`${stats.avg_login_frequency}×`}
            subtext="Per athlete / 30 days"
          />
          <StatCard
            label="Total Time in App"
            value={`${stats.total_time_hours}h`}
            subtext="All athletes combined"
          />
        </div>

        {/* Financial */}
        <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#9aa489] mb-2.5 mt-5.5">
          Financial
        </div>
        <div className="grid grid-cols-4 gap-3 mb-1">
          <StatCard
            label="Budgets Set"
            value={stats.budgets_set_count}
            subtext={`of ${stats.total_enrolled} athletes`}
          />
          <Link href="/athletes" className="cursor-pointer">
            <StatCard
              label="Inactivity Alerts"
              value={stats.inactive_count}
              subtext="No activity in 14+ days"
            />
          </Link>
        </div>
      </div>
    </>
  );
}
