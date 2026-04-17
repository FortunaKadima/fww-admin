import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { adminId } = await req.json();
    if (!adminId) return NextResponse.json({ error: "adminId required" }, { status: 400 });

    // Auth check — get calling admin
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Can't remove yourself
    if (adminId === user.id) {
      return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 });
    }

    // Verify both admins are at same school
    const { data: callerData } = await supabase
      .from("admin_users")
      .select("school_id")
      .eq("id", user.id)
      .single();

    const { data: targetData } = await supabase
      .from("admin_users")
      .select("school_id")
      .eq("id", adminId)
      .single();

    if (!callerData || !targetData || callerData.school_id !== targetData.school_id) {
      return NextResponse.json({ error: "Cannot remove admin from another school." }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Remove from admin_users table
    await adminClient.from("admin_users").delete().eq("id", adminId);

    // Disable auth user (doesn't delete, just prevents login)
    await adminClient.auth.admin.updateUserById(adminId, { ban_duration: "876600h" }); // ~100 years

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Remove admin error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
