"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavigationItems } from "./navigation-items";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto border-t border-white/75 bg-white/82 px-3 py-2 text-slate-950 shadow-[0_-18px_54px_rgba(37,99,235,0.12)] backdrop-blur-2xl lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {mobileNavigationItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "rounded-2xl px-2 py-2 text-center text-xs font-black text-slate-500 transition",
                isActive && "bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.2)]"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
