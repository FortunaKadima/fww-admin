import { getAdmins } from "@/lib/queries";
import InviteAdmin from "@/components/InviteAdmin";
import RemoveAdmin from "@/components/RemoveAdmin";
import Topbar from "@/components/Topbar";

export const dynamic = "force-dynamic";

const MAX_ADMINS = 5;

export default async function SettingsPage() {
  const admins = await getAdmins();
  const canInvite = admins.length < MAX_ADMINS;

  return (
    <>
      <Topbar title="Settings" subtitle="Manage admin access for your school" />

      <div className="max-w-[840px]">
        <div className="grid grid-cols-2 gap-5">
          {/* Admin list */}
          <div className="bg-white border border-[#e6eadc] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e6eadc] flex items-center justify-between">
              <h2 className="font-bold text-sm text-[#1a1f15]">Admin Users</h2>
              <span className="inline-block px-2.25 py-1 text-[11px] font-semibold bg-[#f4f6f0] border border-[#e6eadc] text-[#636858] rounded-full">
                {admins.length} / {MAX_ADMINS}
              </span>
            </div>

            <div className="divide-y divide-[#f4f6f0]">
              {admins.map((admin) => (
                <div key={admin.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-[#e6eadc] flex items-center justify-center text-[10px] font-bold text-[#4a5041] flex-shrink-0">
                      {admin.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1a1f15]">{admin.email}</p>
                      <p className="text-[11px] text-[#9aa489] mt-0.5">
                        Added {new Date(admin.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <RemoveAdmin adminId={admin.id} adminEmail={admin.email} />
                </div>
              ))}
            </div>
          </div>

          {/* Invite form */}
          <div className="bg-white border border-[#e6eadc] rounded-[16px] overflow-hidden p-5">
            <h2 className="font-bold text-sm text-[#1a1f15] mb-1">Invite Admin</h2>
            {canInvite ? (
              <>
                <p className="text-xs text-[#636858] leading-[1.5] mb-4">
                  They&apos;ll receive an email to set their password and access the dashboard.
                </p>
                <div className="text-[12px] text-[#636858] bg-[#f4f6f0] border border-[#e6eadc] px-3 py-2 rounded-lg mb-4 text-center">
                  {MAX_ADMINS - admins.length} slot{MAX_ADMINS - admins.length !== 1 ? "s" : ""} remaining
                </div>
                <InviteAdmin />
              </>
            ) : (
              <p className="text-xs text-[#636858] bg-[#f4f6f0] border border-[#e6eadc] px-3 py-2 rounded-lg mt-3">
                Maximum reached. Remove an admin to invite another.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
