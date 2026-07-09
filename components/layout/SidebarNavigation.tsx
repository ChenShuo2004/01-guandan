"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarNavigationItems } from "./navigation-items";
import { cn } from "@/lib/utils";

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[#d8e3fb] bg-[#f0f3ff] px-4 py-6 text-[#111c2d] lg:block">
      <div className="px-2">
        <h2 className="text-[28px] font-black leading-8 text-[#0058be]">掼蛋大师</h2>
        <p className="mt-1 text-sm font-semibold text-[#727785]">AI 进阶训练平台</p>
      </div>
      <nav className="mt-10 grid gap-2">
        {sidebarNavigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href) ||
                (item.href === "/learning-path" && pathname.startsWith("/lessons"));

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-[#424754] transition hover:bg-[#d4e3ff] hover:text-[#0058be]",
                isActive && "bg-[#d4e3ff] text-[#0058be] shadow-[inset_-4px_0_0_#0058be]"
              )}
              href={item.href}
              key={item.href}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-6 left-4 right-4">
        <Link
          className="flex h-12 items-center justify-center rounded-xl bg-[#0058be] text-sm font-black text-white shadow-[0_12px_26px_rgba(0,88,190,0.24)]"
          href="/training"
        >
          开始训练
        </Link>
      </div>
    </aside>
  );
}
