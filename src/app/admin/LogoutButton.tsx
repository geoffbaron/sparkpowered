"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-xl border border-black/10 text-sm font-medium text-muted hover:bg-surface-light hover:text-foreground transition-colors"
    >
      Sign out
    </button>
  );
}
