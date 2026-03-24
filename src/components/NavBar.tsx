"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./ThemeToggle";

export function NavBar({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-pink-900/30 bg-white dark:bg-[#110a0e]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/flavors" className="font-bold text-lg hover:opacity-80 transition-opacity flex items-center gap-2">
          <span>🍦</span>
          <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Scoop Shop</span>
        </Link>
        <Link href="/flavors/manage" className="text-sm text-gray-400 hover:text-pink-300 transition-colors">
          Flavor Lab
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
          <button
            onClick={handleSignOut}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
