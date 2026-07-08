"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "./navigation-items";
import { cn } from "@/lib/utils";

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-guandan-border bg-guandan-background/95 px-5 py-6 backdrop-blur lg:block">
      <div>
        <p className="text-sm font-bold text-guandan-gold">掼蛋 AI 教练</p>
        <h2 className="mt-2 text-xl font-black leading-7">今天只练一个判断</h2>
      </div>
      <nav className="mt-8 grid gap-2">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-bold text-guandan-subtext transition hover:bg-guandan-muted hover:text-guandan-text",
                isActive && "bg-guandan-muted text-guandan-gold"
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
