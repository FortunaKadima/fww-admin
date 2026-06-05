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
    {
      id: "4",
      name: "Makenna Harris",
      sport: "Tennis",
      invited_at: "2025-01-10T08:00:00Z",
      activated_at: "2025-01-10T12:00:00Z",
      last_active: "2026-05-20T14:30:00Z",
      total_sessions: 22,
      total_time_seconds: 36000,
      modules_completed: 5,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "5",
      name: "Shai Tsai",
      sport: "Football",
      invited_at: "2025-01-25T09:00:00Z",
      activated_at: "2025-01-25T13:00:00Z",
      last_active: "2026-05-17T11:15:00Z",
      total_sessions: 20,
      total_time_seconds: 28800,
      modules_completed: 4,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "6",
      name: "Florin Lear",
      sport: "Basketball",
      invited_at: "2025-02-05T10:00:00Z",
      activated_at: "2025-02-05T14:00:00Z",
      last_active: "2026-05-15T09:45:00Z",
      total_sessions: 16,
      total_time_seconds: 19200,
      modules_completed: 3,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "7",
      name: "Charlie Adler",
      sport: "Soccer",
      invited_at: "2025-01-28T11:00:00Z",
      activated_at: "2025-01-28T15:30:00Z",
      last_active: "2026-05-10T16:20:00Z",
      total_sessions: 19,
      total_time_seconds: 25200,
      modules_completed: 3,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "8",
      name: "Will Kemper",
      sport: "Basketball",
      invited_at: "2025-02-10T08:00:00Z",
      activated_at: "2025-02-10T12:00:00Z",
      last_active: "2026-05-01T13:45:00Z",
      total_sessions: 15,
      total_time_seconds: 18000,
      modules_completed: 3,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "9",
      name: "Emily Saracen",
      sport: "Lacrosse",
      invited_at: "2025-02-08T09:00:00Z",
      activated_at: "2025-02-08T13:30:00Z",
      last_active: "2026-04-30T15:10:00Z",
      total_sessions: 18,
      total_time_seconds: 21600,
      modules_completed: 3,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "10",
      name: "Bam Fitzpatrick",
      sport: "Golf",
      invited_at: "2025-02-12T10:00:00Z",
      activated_at: "2025-02-12T14:00:00Z",
      last_active: "2026-04-22T12:30:00Z",
      total_sessions: 14,
      total_time_seconds: 16800,
      modules_completed: 3,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "11",
      name: "Julia Jao",
      sport: "Lacrosse",
      invited_at: "2025-02-15T08:30:00Z",
      activated_at: "2025-02-15T12:30:00Z",
      last_active: "2026-04-12T10:45:00Z",
      total_sessions: 17,
      total_time_seconds: 20400,
      modules_completed: 3,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "12",
      name: "Trish Brickhouse",
      sport: "Soccer",
      invited_at: "2025-02-18T09:00:00Z",
      activated_at: null,
      last_active: null,
      total_sessions: 0,
      total_time_seconds: 0,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "13",
      name: "Arlo Zin",
      sport: "Track & Field",
      invited_at: "2025-02-20T10:00:00Z",
      activated_at: null,
      last_active: null,
      total_sessions: 0,
      total_time_seconds: 0,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "14",
      name: "Casey Williams",
      sport: "Volleyball",
      invited_at: "2025-01-12T08:00:00Z",
      activated_at: "2025-01-12T11:30:00Z",
      last_active: "2026-05-18T14:20:00Z",
      total_sessions: 21,
      total_time_seconds: 25200,
      modules_completed: 4,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "15",
      name: "Morgan Hayes",
      sport: "Swimming",
      invited_at: "2025-01-22T09:00:00Z",
      activated_at: "2025-01-22T13:00:00Z",
      last_active: "2026-05-16T10:30:00Z",
      total_sessions: 19,
      total_time_seconds: 23400,
      modules_completed: 4,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "16",
      name: "Devon Cross",
      sport: "Baseball",
      invited_at: "2025-02-03T10:30:00Z",
      activated_at: "2025-02-03T14:30:00Z",
      last_active: "2026-05-14T15:45:00Z",
      total_sessions: 17,
      total_time_seconds: 20400,
      modules_completed: 3,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "17",
      name: "Riley Stone",
      sport: "Hockey",
      invited_at: "2025-02-07T08:30:00Z",
      activated_at: "2025-02-07T12:00:00Z",
      last_active: "2026-05-12T13:20:00Z",
      total_sessions: 16,
      total_time_seconds: 19200,
      modules_completed: 3,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "18",
      name: "Jamie Foster",
      sport: "Tennis",
      invited_at: "2025-02-14T09:30:00Z",
      activated_at: "2025-02-14T13:30:00Z",
      last_active: "2026-05-08T11:50:00Z",
      total_sessions: 15,
      total_time_seconds: 18000,
      modules_completed: 3,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "19",
      name: "Parker Quinn",
      sport: "Football",
      invited_at: "2025-02-17T10:00:00Z",
      activated_at: "2025-02-17T14:00:00Z",
      last_active: "2026-05-05T16:15:00Z",
      total_sessions: 14,
      total_time_seconds: 16800,
      modules_completed: 2,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "20",
      name: "Skylar Bennett",
      sport: "Basketball",
      invited_at: "2025-02-19T11:00:00Z",
      activated_at: "2025-02-19T15:00:00Z",
      last_active: "2026-05-02T12:30:00Z",
      total_sessions: 13,
      total_time_seconds: 15600,
      modules_completed: 2,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "21",
      name: "Cameron Price",
      sport: "Football",
      invited_at: "2025-02-21T08:00:00Z",
      activated_at: "2025-02-21T12:00:00Z",
      last_active: "2026-04-28T14:10:00Z",
      total_sessions: 12,
      total_time_seconds: 14400,
      modules_completed: 2,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "22",
      name: "Dakota Miller",
      sport: "Soccer",
      invited_at: "2025-02-23T09:00:00Z",
      activated_at: "2025-02-23T13:30:00Z",
      last_active: "2026-04-25T11:20:00Z",
      total_sessions: 11,
      total_time_seconds: 13200,
      modules_completed: 2,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "23",
      name: "Avery Johnson",
      sport: "Volleyball",
      invited_at: "2025-02-25T10:30:00Z",
      activated_at: "2025-02-25T14:30:00Z",
      last_active: "2026-04-22T15:45:00Z",
      total_sessions: 10,
      total_time_seconds: 12000,
      modules_completed: 2,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "24",
      name: "Reese Thompson",
      sport: "Swimming",
      invited_at: "2025-02-26T08:30:00Z",
      activated_at: "2025-02-26T12:30:00Z",
      last_active: "2026-04-20T13:15:00Z",
      total_sessions: 9,
      total_time_seconds: 10800,
      modules_completed: 1,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "25",
      name: "Morgan Davis",
      sport: "Baseball",
      invited_at: "2025-03-01T09:00:00Z",
      activated_at: "2025-03-01T13:00:00Z",
      last_active: "2026-04-18T10:30:00Z",
      total_sessions: 8,
      total_time_seconds: 9600,
      modules_completed: 1,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "26",
      name: "Jordan Lee",
      sport: "Hockey",
      invited_at: "2025-03-03T10:00:00Z",
      activated_at: "2025-03-03T14:00:00Z",
      last_active: "2026-04-15T12:45:00Z",
      total_sessions: 7,
      total_time_seconds: 8400,
      modules_completed: 1,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "27",
      name: "Casey Martin",
      sport: "Tennis",
      invited_at: "2025-03-05T08:00:00Z",
      activated_at: "2025-03-05T12:00:00Z",
      last_active: "2026-04-12T16:20:00Z",
      total_sessions: 6,
      total_time_seconds: 7200,
      modules_completed: 1,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "28",
      name: "River Anderson",
      sport: "Football",
      invited_at: "2025-03-07T09:30:00Z",
      activated_at: "2025-03-07T13:30:00Z",
      last_active: "2026-04-10T14:50:00Z",
      total_sessions: 5,
      total_time_seconds: 6000,
      modules_completed: 1,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "29",
      name: "Blake Wilson",
      sport: "Basketball",
      invited_at: "2025-03-09T10:00:00Z",
      activated_at: "2025-03-09T14:00:00Z",
      last_active: "2026-04-08T11:15:00Z",
      total_sessions: 4,
      total_time_seconds: 4800,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "30",
      name: "Quinn Jackson",
      sport: "Soccer",
      invited_at: "2025-03-11T11:00:00Z",
      activated_at: "2025-03-11T15:00:00Z",
      last_active: "2026-04-05T09:30:00Z",
      total_sessions: 3,
      total_time_seconds: 3600,
      modules_completed: 0,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "31",
      name: "Phoenix Garcia",
      sport: "Volleyball",
      invited_at: "2025-03-13T08:00:00Z",
      activated_at: null,
      last_active: null,
      total_sessions: 0,
      total_time_seconds: 0,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "32",
      name: "Taylor Martinez",
      sport: "Swimming",
      invited_at: "2025-03-15T09:00:00Z",
      activated_at: null,
      last_active: null,
      total_sessions: 0,
      total_time_seconds: 0,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "33",
      name: "Jordan Clark",
      sport: "Baseball",
      invited_at: "2025-03-17T10:00:00Z",
      activated_at: "2025-03-17T14:00:00Z",
      last_active: "2026-03-30T13:45:00Z",
      total_sessions: 6,
      total_time_seconds: 7200,
      modules_completed: 1,
      total_modules: 7,
      budget_set: true,
      is_inactive: true,
    },
    {
      id: "34",
      name: "Casey Rodriguez",
      sport: "Hockey",
      invited_at: "2025-03-19T08:30:00Z",
      activated_at: "2025-03-19T12:30:00Z",
      last_active: "2026-03-25T10:15:00Z",
      total_sessions: 5,
      total_time_seconds: 6000,
      modules_completed: 1,
      total_modules: 7,
      budget_set: false,
      is_inactive: true,
    },
    {
      id: "35",
      name: "Morgan White",
      sport: "Tennis",
      invited_at: "2025-03-21T09:00:00Z",
      activated_at: "2025-03-21T13:00:00Z",
      last_active: "2026-03-20T14:30:00Z",
      total_sessions: 4,
      total_time_seconds: 4800,
      modules_completed: 0,
      total_modules: 7,
      budget_set: true,
      is_inactive: true,
    },
    {
      id: "36",
      name: "Riley Harris",
      sport: "Football",
      invited_at: "2025-03-23T10:30:00Z",
      activated_at: "2025-03-23T14:30:00Z",
      last_active: "2026-03-18T11:45:00Z",
      total_sessions: 3,
      total_time_seconds: 3600,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: true,
    },
    {
      id: "37",
      name: "Alex Turner",
      sport: "Basketball",
      invited_at: "2025-03-25T08:00:00Z",
      activated_at: "2025-03-25T12:00:00Z",
      last_active: "2026-03-15T15:20:00Z",
      total_sessions: 2,
      total_time_seconds: 2400,
      modules_completed: 0,
      total_modules: 7,
      budget_set: true,
      is_inactive: true,
    },
    {
      id: "38",
      name: "Jordan Phillips",
      sport: "Soccer",
      invited_at: "2025-03-27T09:00:00Z",
      activated_at: "2025-03-27T13:00:00Z",
      last_active: "2026-03-10T12:30:00Z",
      total_sessions: 1,
      total_time_seconds: 1200,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: true,
    },
    {
      id: "39",
      name: "Casey Campbell",
      sport: "Volleyball",
      invited_at: "2025-03-29T10:00:00Z",
      activated_at: null,
      last_active: null,
      total_sessions: 0,
      total_time_seconds: 0,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "40",
      name: "Morgan Parker",
      sport: "Swimming",
      invited_at: "2025-03-31T08:30:00Z",
      activated_at: null,
      last_active: null,
      total_sessions: 0,
      total_time_seconds: 0,
      modules_completed: 0,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "41",
      name: "Riley Evans",
      sport: "Baseball",
      invited_at: "2025-04-02T09:00:00Z",
      activated_at: "2025-04-02T13:00:00Z",
      last_active: "2026-05-19T16:10:00Z",
      total_sessions: 20,
      total_time_seconds: 24000,
      modules_completed: 4,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "42",
      name: "Jordan Hall",
      sport: "Hockey",
      invited_at: "2025-04-04T10:00:00Z",
      activated_at: "2025-04-04T14:00:00Z",
      last_active: "2026-05-17T13:25:00Z",
      total_sessions: 18,
      total_time_seconds: 21600,
      modules_completed: 4,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "43",
      name: "Casey Allen",
      sport: "Tennis",
      invited_at: "2025-04-06T08:00:00Z",
      activated_at: "2025-04-06T12:00:00Z",
      last_active: "2026-05-15T14:40:00Z",
      total_sessions: 16,
      total_time_seconds: 19200,
      modules_completed: 3,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "44",
      name: "Morgan Young",
      sport: "Football",
      invited_at: "2025-04-08T09:30:00Z",
      activated_at: "2025-04-08T13:30:00Z",
      last_active: "2026-05-13T11:50:00Z",
      total_sessions: 14,
      total_time_seconds: 16800,
      modules_completed: 3,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "45",
      name: "Riley Hernandez",
      sport: "Basketball",
      invited_at: "2025-04-10T10:00:00Z",
      activated_at: "2025-04-10T14:00:00Z",
      last_active: "2026-05-11T15:15:00Z",
      total_sessions: 12,
      total_time_seconds: 14400,
      modules_completed: 2,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "46",
      name: "Jordan King",
      sport: "Soccer",
      invited_at: "2025-04-12T08:30:00Z",
      activated_at: "2025-04-12T12:30:00Z",
      last_active: "2026-05-09T12:30:00Z",
      total_sessions: 10,
      total_time_seconds: 12000,
      modules_completed: 2,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "47",
      name: "Casey Wright",
      sport: "Volleyball",
      invited_at: "2025-04-14T09:00:00Z",
      activated_at: "2025-04-14T13:00:00Z",
      last_active: "2026-05-07T10:45:00Z",
      total_sessions: 8,
      total_time_seconds: 9600,
      modules_completed: 1,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "48",
      name: "Morgan Lopez",
      sport: "Swimming",
      invited_at: "2025-04-16T10:30:00Z",
      activated_at: "2025-04-16T14:30:00Z",
      last_active: "2026-05-04T14:20:00Z",
      total_sessions: 6,
      total_time_seconds: 7200,
      modules_completed: 1,
      total_modules: 7,
      budget_set: false,
      is_inactive: false,
    },
    {
      id: "49",
      name: "Riley Hill",
      sport: "Baseball",
      invited_at: "2025-04-18T08:00:00Z",
      activated_at: "2025-04-18T12:00:00Z",
      last_active: "2026-05-01T11:15:00Z",
      total_sessions: 4,
      total_time_seconds: 4800,
      modules_completed: 1,
      total_modules: 7,
      budget_set: true,
      is_inactive: false,
    },
    {
      id: "50",
      name: "Jordan Scott",
      sport: "Hockey",
      invited_at: "2025-04-20T09:00:00Z",
      activated_at: "2025-04-20T13:00:00Z",
      last_active: "2026-04-29T13:30:00Z",
      total_sessions: 2,
      total_time_seconds: 2400,
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
    const athletes = getDummyAthletes();
    const sports = [...new Set(athletes.map((a) => a.sport))].sort();
    return sports;
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
    const athletes = getDummyAthletes();
    const sports = [...new Set(athletes.map((a) => a.sport))].sort();
    return sports;
  }
}
