"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { adminId: string; adminEmail: string };

export default function RemoveAdmin({ adminId, adminEmail }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setLoading(true);
    const res = await fetch("/api/admin/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to remove admin.");
    }
    setLoading(false);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-xs font-medium text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] px-2 py-1.5 rounded-md transition disabled:opacity-50"
        >
          {loading ? "Removing…" : "Remove"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-[#636858] hover:text-[#1a1f15] px-2 py-1.5"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-[#9aa489] bg-transparent hover:text-[#dc2626] hover:bg-[#fef2f2] px-2 py-1.5 rounded-md transition"
    >
      Remove
    </button>
  );
}
