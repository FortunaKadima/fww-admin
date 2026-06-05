import { getAdmins } from "@/lib/queries";
import InviteAdmin from "@/components/InviteAdmin";
import RemoveAdmin from "@/components/RemoveAdmin";

export const dynamic = "force-dynamic";

const MAX_ADMINS = 5;

export default async function SettingsPage() {
  const admins = await getAdmins();
  const canInvite = admins.length < MAX_ADMINS;

  return (
    <>
      <div className="max-w-[1100px]">
        {/* Settings Header */}
        <div className="mt-16 mb-6">
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-[35px] font-black text-[#003219]" style={{ lineHeight: '100%', letterSpacing: '-2px' }}>Settings</h1>
            <p className="text-[15px] font-normal italic text-[#003219]" style={{ lineHeight: '130%', letterSpacing: '0' }}>Manage admin access for your school</p>
          </div>
          {/* Divider */}
          <div style={{ width: '100%', height: '0px', border: '0.5px solid #55695F', opacity: 1 }}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Admin list */}
          <div className="bg-white border border-[#e6eadc] rounded-none overflow-hidden">
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
          <div className="bg-white border border-[#e6eadc] rounded-none overflow-hidden p-5">
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
