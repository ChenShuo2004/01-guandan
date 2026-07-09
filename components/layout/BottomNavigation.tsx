"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavigationItems } from "./navigation-items";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto border-t border-[#d8e3fb] bg-white/90 px-3 py-2 text-[#111c2d] shadow-[0_-12px_30px_rgba(0,88,190,0.08)] backdrop-blur lg:hidden">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${mobileNavigationItems.length}, minmax(0, 1fr))` }}>
        {mobileNavigationItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-center text-xs font-bold text-[#727785] transition",
                isActive && "bg-[#64a8fe]/25 text-[#0058be]"
              )}
              href={item.href}
              key={item.href}
            >
              <span className="material-symbols-outlined text-[21px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
