"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarNavigationItems } from "./navigation-items";
import { cn } from "@/lib/utils";

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-white/70 bg-white/62 px-5 py-6 text-slate-950 shadow-[18px_0_70px_rgba(37,99,235,0.08)] backdrop-blur-2xl lg:block">
      <div>
        <p className="text-sm font-black text-blue-600">Ace AI Coach</p>
        <h2 className="mt-2 text-xl font-black leading-7">AI 掼蛋训练空间</h2>
      </div>
      <nav className="mt-8 grid gap-2">
        {sidebarNavigationItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-black text-slate-500 transition hover:bg-blue-50 hover:text-blue-700",
                isActive && "bg-blue-600 text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)] hover:bg-blue-600 hover:text-white"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
