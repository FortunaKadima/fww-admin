"use client";

import { useState } from "react";

export default function InviteAdmin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to send invite.");
    } else {
      setSuccess(true);
      setEmail("");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-[#015d25] bg-[#d0ffd9] px-3 py-2 rounded-lg">
          ✓ Invite sent! They&apos;ll receive an email with setup instructions.
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-medium transition"
          style={{ color: "var(--fww-green)" }}
        >
          Invite another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleInvite} className="flex flex-col gap-2.5">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@school.edu"
        className="w-full px-3.5 py-2.5 border border-[#e6eadc] rounded-[9px] text-xs font-normal bg-[#fbf9f6] text-[#1a1f15] focus:outline-none focus:border-[#008236] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,130,54,.1)] transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2.25 text-white text-xs font-medium rounded-[9px] disabled:opacity-60 transition whitespace-nowrap"
        style={{ backgroundColor: "var(--fww-green)" }}
      >
        {loading ? "Sending…" : "Send Invite"}
      </button>
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </form>
  );
}
