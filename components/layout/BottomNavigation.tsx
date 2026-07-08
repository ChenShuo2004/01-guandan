"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavigationItems } from "./navigation-items";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto border-t border-guandan-border bg-guandan-background/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {mobileNavigationItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "rounded-2xl px-2 py-2 text-center text-xs font-bold text-guandan-subtext transition",
                isActive && "bg-guandan-muted text-guandan-gold"
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
