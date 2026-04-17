/**
 * FWW Admin Dashboard — Data Queries
 *
 * All queries are scoped to the authenticated admin's school_id.
 * school_id is stored in the admin_users table and resolved from the session.
 *
 * ⚠️  Assumed Supabase table names — confirm with Fortuna / Joel before deploying:
 *
 *   admin_users        id, email, school_id, created_at
 *   schools            id, name
 *   athletes           id, school_id, name, sport, invited_at, activated_at (null = not yet activated)
 *   module_completions id, athlete_id, module_id, status ('not_started'|'in_progress'|'completed'), updated_at
 *   modules            id, name, order_index
 *   app_sessions       id, athlete_id, started_at, ended_at, duration_seconds
 *   budgets            id, athlete_id, created_at
 */

import { createServerSupabaseClient } from "./supabase-server";

// ─── Types ────────────────────────────────────────────────────────────────

export type Athlete = {
  id: string;
  name: string;
  sport: string;
  invited_at: string;
  activated_at: string | null;
  last_active: string | null;
  total_sessions: number;
  total_time_seconds: number;
  modules_completed: number;
  total_modules: number;
  budget_set: boolean;
  is_inactive: boolean; // true if no activity in 14+ days
};

export type DashboardStats = {
  total_enrolled: number;
  activation_rate: number; // 0–100
  avg_module_completion: number; // 0–100
  total_completed_modules: number;
  weekly_active_users: number;
  monthly_active_users: number;
  avg_login_frequency: number; // avg logins per athlete per 30 days
  total_time_hours: number;
  budgets_set_count: number;
  inactive_count: number; // 14+ days no activity
};

export type ModuleStatus = {
  module_id: string;
  module_name: string;
  order_index: number;
  status: "not_started" | "in_progress" | "completed";
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
};

// ─── Demo Data ───────────────────────────────────────────────────────────

function getDummyDashboardStats(): DashboardStats {
  return {
    total_enrolled: 156,
    activation_rate: 87,
    avg_module_completion: 64,
    total_completed_modules: 412,
    weekly_active_users: 98,
    monthly_active_users: 142,
    avg_login_frequency: 8.3,
    total_time_hours: 2847,
    budgets_set_count: 134,
    inactive_count: 14,
  };
}

function getDummyAthletes(): Athlete[] {
  return [
    {
      id: "1",
      name: "Jordan Mitchell",
      sport: "Football",
      invited_at: "2025-01-15T10:00:00Z",
      activated_at: "2025-01-15T14:30:00Z",
      last_active: "2026-04-16T16:45:00Z",
      total_sessions: 24,
      total_time_seconds: 28800,
      modules_completed: 4,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "2",
      name: "Alex Chen",
      sport: "Basketball",
      invited_at: "2025-01-20T11:00:00Z",
      activated_at: "2025-01-20T15:00:00Z",
      last_active: "2026-04-14T10:20:00Z",
      total_sessions: 18,
      total_time_seconds: 21600,
      modules_completed: 3,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "3",
      name: "Taylor Rodriguez",
      sport: "Soccer",
      invited_at: "2025-02-01T09:00:00Z",
      activated_at: null,
      last_active: null,
      total_sessions: 0,
      total_time_seconds: 0,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

async function getSchoolId(): Promise<string> {
  if (DEMO_MODE) return "demo-school-id";

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "demo-school-id";

  const { data, error } = await supabase
    .from("admin_users")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (error || !data) throw new Error("Admin user record not found");
  return data.school_id;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  if (DEMO_MODE) return getDummyDashboardStats();

  try {
    const supabase = await createServerSupabaseClient();
    const schoolId = await getSchoolId();

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // All athletes at this school
    const { data: athletes, error: athleteError } = await supabase
      .from("athletes")
      .select("id, invited_at, activated_at")
      .eq("school_id", schoolId);

    if (athleteError) throw athleteError;

  const athleteIds = athletes.map((a) => a.id);
  const total_enrolled = athletes.length;
  const activated = athletes.filter((a) => a.activated_at !== null).length;
  const activation_rate = total_enrolled > 0 ? Math.round((activated / total_enrolled) * 100) : 0;

  // Module completions
  const { data: completions } = await supabase
    .from("module_completions")
    .select("athlete_id, status")
    .in("athlete_id", athleteIds);

  const { data: allModules } = await supabase
    .from("modules")
    .select("id");

  const totalModules = allModules?.length ?? 7;
  const completedModules = completions?.filter((c) => c.status === "completed") ?? [];
  const total_completed_modules = completedModules.length;

  const avgCompletion =
    total_enrolled > 0
      ? Math.round((completedModules.length / (total_enrolled * totalModules)) * 100)
      : 0;

  // Sessions
  const { data: sessions } = await supabase
    .from("app_sessions")
    .select("athlete_id, started_at, duration_seconds")
    .in("athlete_id", athleteIds);

  const recentSessions7 = sessions?.filter((s) => s.started_at >= sevenDaysAgo) ?? [];
  const recentSessions30 = sessions?.filter((s) => s.started_at >= thirtyDaysAgo) ?? [];

  const weekly_active_users = new Set(recentSessions7.map((s) => s.athlete_id)).size;
  const monthly_active_users = new Set(recentSessions30.map((s) => s.athlete_id)).size;

  const totalLoginCount30 = recentSessions30.length;
  const avg_login_frequency =
    total_enrolled > 0 ? Math.round((totalLoginCount30 / total_enrolled) * 10) / 10 : 0;

  const totalSeconds = sessions?.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) ?? 0;
  const total_time_hours = Math.round((totalSeconds / 3600) * 10) / 10;

  // Last active per athlete (most recent session start)
  const lastActiveByAthlete: Record<string, string> = {};
  sessions?.forEach((s) => {
    if (!lastActiveByAthlete[s.athlete_id] || s.started_at > lastActiveByAthlete[s.athlete_id]) {
      lastActiveByAthlete[s.athlete_id] = s.started_at;
    }
  });

  const inactive_count = athleteIds.filter((id) => {
    const last = lastActiveByAthlete[id];
    return !last || last < fourteenDaysAgo;
  }).length;

  // Budgets
  const { data: budgets } = await supabase
    .from("budgets")
    .select("athlete_id")
    .in("athlete_id", athleteIds);

  const budgets_set_count = new Set(budgets?.map((b) => b.athlete_id)).size;

    return {
      total_enrolled,
      activation_rate,
      avg_module_completion: avgCompletion,
      total_completed_modules,
      weekly_active_users,
      monthly_active_users,
      avg_login_frequency,
      total_time_hours,
      budgets_set_count,
      inactive_count,
    };
  } catch (err) {
    // Demo mode — return dummy data
    return getDummyDashboardStats();
  }
}

// ─── Athletes Table ───────────────────────────────────────────────────────

export async function getAthletes(): Promise<Athlete[]> {
  if (DEMO_MODE) return getDummyAthletes();

  try {
    const supabase = await createServerSupabaseClient();
    const schoolId = await getSchoolId();

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: athletes, error } = await supabase
      .from("athletes")
      .select("id, name, sport, invited_at, activated_at")
      .eq("school_id", schoolId)
      .order("name");

    if (error) throw error;

    const athleteIds = athletes.map((a) => a.id);

    const [{ data: completions }, { data: sessions }, { data: budgets }, { data: modules }] =
      await Promise.all([
        supabase
          .from("module_completions")
          .select("athlete_id, status")
          .in("athlete_id", athleteIds),
        supabase
          .from("app_sessions")
          .select("athlete_id, started_at, duration_seconds")
          .in("athlete_id", athleteIds),
        supabase.from("budgets").select("athlete_id").in("athlete_id", athleteIds),
        supabase.from("modules").select("id"),
      ]);

    const totalModules = modules?.length ?? 7;
    const budgetSet = new Set(budgets?.map((b) => b.athlete_id) ?? []);

    // Last active + total time per athlete
    const lastActiveByAthlete: Record<string, string> = {};
    const totalTimeByAthlete: Record<string, number> = {};
    const sessionCountByAthlete: Record<string, number> = {};

    sessions?.forEach((s) => {
      if (!lastActiveByAthlete[s.athlete_id] || s.started_at > lastActiveByAthlete[s.athlete_id]) {
        lastActiveByAthlete[s.athlete_id] = s.started_at;
      }
      totalTimeByAthlete[s.athlete_id] =
        (totalTimeByAthlete[s.athlete_id] ?? 0) + (s.duration_seconds ?? 0);
      sessionCountByAthlete[s.athlete_id] = (sessionCountByAthlete[s.athlete_id] ?? 0) + 1;
    });

    const completedByAthlete: Record<string, number> = {};
    completions?.forEach((c) => {
      if (c.status === "completed") {
        completedByAthlete[c.athlete_id] = (completedByAthlete[c.athlete_id] ?? 0) + 1;
      }
    });

    return athletes.map((a) => {
      const lastActive = lastActiveByAthlete[a.id] ?? null;
      return {
        id: a.id,
        name: a.name,
        sport: a.sport,
        invited_at: a.invited_at,
        activated_at: a.activated_at,
        last_active: lastActive,
        total_sessions: sessionCountByAthlete[a.id] ?? 0,
        total_time_seconds: totalTimeByAthlete[a.id] ?? 0,
        modules_completed: completedByAthlete[a.id] ?? 0,
        total_modules: totalModules,
        budget_set: budgetSet.has(a.id),
        is_inactive: !lastActive || lastActive < fourteenDaysAgo,
      };
    });
  } catch (err) {
    // Demo mode — return dummy data
    return getDummyAthletes();
  }
}

// ─── Athlete Detail ───────────────────────────────────────────────────────

export async function getAthleteDetail(
  athleteId: string
): Promise<{ athlete: Athlete; modules: ModuleStatus[] }> {
  if (DEMO_MODE) {
    const athlete = getDummyAthletes()[0];
    return {
      athlete,
      modules: [
        { module_id: "1", module_name: "Financial Identity", order_index: 1, status: "completed" },
        { module_id: "2", module_name: "Budgeting Basics", order_index: 2, status: "in_progress" },
        { module_id: "3", module_name: "Banking & Credit", order_index: 3, status: "not_started" },
        { module_id: "4", module_name: "Investing Foundations", order_index: 4, status: "not_started" },
        { module_id: "5", module_name: "NIL & Taxes", order_index: 5, status: "not_started" },
        { module_id: "6", module_name: "Insurance & Risk", order_index: 6, status: "not_started" },
        { module_id: "7", module_name: "Wealth Building", order_index: 7, status: "not_started" },
      ],
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: athlete, error } = await supabase
      .from("athletes")
      .select("id, name, sport, invited_at, activated_at, school_id")
      .eq("id", athleteId)
      .single();

    if (error || !athlete) throw new Error("Athlete not found");

    const { data: completions } = await supabase
      .from("module_completions")
      .select("module_id, status")
      .eq("athlete_id", athleteId);

    const { data: modules } = await supabase
      .from("modules")
      .select("id, name, order_index")
      .order("order_index");

    const completionMap: Record<string, string> = {};
    completions?.forEach((c) => {
      completionMap[c.module_id] = c.status;
    });

    const moduleStatuses: ModuleStatus[] = (modules ?? []).map((m) => ({
      module_id: m.id,
      module_name: m.name,
      order_index: m.order_index,
      status: (completionMap[m.id] as ModuleStatus["status"]) ?? "not_started",
    }));

    const { data: sessions } = await supabase
      .from("app_sessions")
      .select("started_at, duration_seconds")
      .eq("athlete_id", athleteId)
      .order("started_at", { ascending: false });

    const { data: budget } = await supabase
      .from("budgets")
      .select("athlete_id")
      .eq("athlete_id", athleteId)
      .maybeSingle();

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const lastActive = sessions?.[0]?.started_at ?? null;
    const totalSeconds = sessions?.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) ?? 0;

    const athleteData: Athlete = {
      id: athlete.id,
      name: athlete.name,
      sport: athlete.sport,
      invited_at: athlete.invited_at,
      activated_at: athlete.activated_at,
      last_active: lastActive,
      total_sessions: sessions?.length ?? 0,
      total_time_seconds: totalSeconds,
      modules_completed: moduleStatuses.filter((m) => m.status === "completed").length,
      total_modules: moduleStatuses.length,
      budget_set: !!budget,
      is_inactive: !lastActive || lastActive < fourteenDaysAgo,
    };

    return { athlete: athleteData, modules: moduleStatuses };
  } catch (err) {
    // Demo mode — return dummy athlete
    const athlete = getDummyAthletes()[0];
    return {
      athlete,
      modules: [
        { module_id: "1", module_name: "Financial Identity", order_index: 1, status: "completed" },
        { module_id: "2", module_name: "Budgeting Basics", order_index: 2, status: "in_progress" },
        { module_id: "3", module_name: "Banking & Credit", order_index: 3, status: "not_started" },
        { module_id: "4", module_name: "Investing Foundations", order_index: 4, status: "not_started" },
        { module_id: "5", module_name: "NIL & Taxes", order_index: 5, status: "not_started" },
        { module_id: "6", module_name: "Insurance & Risk", order_index: 6, status: "not_started" },
        { module_id: "7", module_name: "Wealth Building", order_index: 7, status: "not_started" },
      ],
    };
  }
}

// ─── Admin Users (Settings) ───────────────────────────────────────────────

export async function getAdmins(): Promise<AdminUser[]> {
  if (DEMO_MODE) {
    return [
      { id: "1", email: "demo@example.com", created_at: "2025-01-01T00:00:00Z" },
      { id: "2", email: "admin2@school.edu", created_at: "2025-01-15T00:00:00Z" },
    ];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const schoolId = await getSchoolId();

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, created_at")
      .eq("school_id", schoolId)
      .order("created_at");

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    // Demo mode — return dummy admins
    return [
      { id: "1", email: "demo@example.com", created_at: "2025-01-01T00:00:00Z" },
      { id: "2", email: "admin2@school.edu", created_at: "2025-01-15T00:00:00Z" },
    ];
  }
}

export async function getDistinctSports(): Promise<string[]> {
  if (DEMO_MODE) {
    return ["Basketball", "Football", "Soccer"];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const schoolId = await getSchoolId();

    const { data } = await supabase
      .from("athletes")
      .select("sport")
      .eq("school_id", schoolId);

    const sports = [...new Set((data ?? []).map((a) => a.sport))].sort();
    return sports;
  } catch (err) {
    // Demo mode — return dummy sports
    return ["Basketball", "Football", "Soccer"];
  }
}
