import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

const MAX_ADMINS = 5;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Auth check — get calling admin's school
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: callerData } = await supabase
      .from("admin_users")
      .select("school_id")
      .eq("id", user.id)
      .single();

    if (!callerData) return NextResponse.json({ error: "Admin record not found" }, { status: 403 });
    const { school_id } = callerData;

    // Check cap
    const { count } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })
      .eq("school_id", school_id);

    if ((count ?? 0) >= MAX_ADMINS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_ADMINS} admins reached for your school.` },
        { status: 400 }
      );
    }

    // Use service-role client to invite user
    const adminClient = createAdminClient();
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
        data: { school_id, role: "school_admin" },
      }
    );

    if (inviteError) throw inviteError;

    // Insert into admin_users table
    if (inviteData?.user) {
      await adminClient.from("admin_users").insert({
        id: inviteData.user.id,
        email,
        school_id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Invite error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
