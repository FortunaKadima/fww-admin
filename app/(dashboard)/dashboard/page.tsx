import { getDashboardStats } from "@/lib/queries";
import StatCard from "@/components/StatCard";
import ActivationChart from "@/components/ActivationChart";
import EngagementChart from "@/components/EngagementChart";
import ModuleCompletionChart from "@/components/ModuleCompletionChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const pendingAthletes = stats.total_enrolled - Math.round((stats.activation_rate / 100) * stats.total_enrolled);

  return (
    <>
      <div className="w-full pl-[25px] pr-8">
        {/* Dashboard Header */}
        <div className="mt-16 mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-2 md:gap-0 mb-4">
            <h1 className="text-xl md:text-[35px] font-black text-[#003219]" style={{ lineHeight: '100%', letterSpacing: '-2px' }}>Your Dashboard</h1>
            <p className="text-sm md:text-[15px] font-normal italic text-[#003219]" style={{ lineHeight: '130%', letterSpacing: '0' }}>Overview of your athletes' progress.</p>
          </div>
          {/* Divider */}
          <div style={{ width: '100%', height: '0px', border: '0.5px solid #55695F', opacity: 1 }}></div>
        </div>

        {/* Enrollment & Activation */}
        <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#015d25] mb-2.5 mt-0">
          Enrollment & Activation
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-1">
          <StatCard label="Athletes Enrolled" value={stats.total_enrolled} />
          <StatCard
            label="Activation Rate"
            value={`${stats.activation_rate}%`}
          />
          <StatCard
            label="Model Completed"
            value={stats.total_completed_modules}
          />
          <StatCard label="Completion Rate" value={`${stats.avg_module_completion}%`} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 mt-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#015d25] mb-2.5">
              Activation Status
            </div>
            <ActivationChart
              activated={Math.round((stats.activation_rate / 100) * stats.total_enrolled)}
              pending={pendingAthletes}
            />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#015d25] mb-2.5">
              Active Users
            </div>
            <EngagementChart weeklyActive={stats.weekly_active_users} monthlyActive={stats.monthly_active_users} />
          </div>
        </div>

        {/* Engagement */}
        <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#015d25] mb-2.5 mt-5.5">
          Engagement
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-1">
          <StatCard
            label="Weekly Active Users"
            value={stats.weekly_active_users}
          />
          <StatCard
            label="Monthly Active Users"
            value={stats.monthly_active_users}
          />
          <StatCard
            label="Logins per Athlete"
            value={stats.avg_login_frequency}
          />
          <StatCard
            label="Total Hours in App"
            value={stats.total_time_hours}
          />
        </div>

        {/* Learning Progress */}
        <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#015d25] mb-2.5 mt-5.5">
          Learning Progress
        </div>
        <div className="mb-6 mt-0">
          <ModuleCompletionChart
            avgCompletion={stats.avg_module_completion}
            totalCompleted={stats.total_completed_modules}
          />
        </div>

        {/* Financial */}
        <div className="text-[11px] font-bold uppercase tracking-[.07em] text-[#015d25] mb-2.5 mt-5.5">
          Financial
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-1">
          <StatCard
            label="Budgets Set"
            value={stats.budgets_set_count}
          />
          <Link href="/athletes" className="cursor-pointer">
            <StatCard
              label="Inactivity Alerts"
              value={stats.inactive_count}
            />
          </Link>
        </div>
      </div>
    </>
  );
}
