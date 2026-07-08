"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/paths", label: "学习" },
  { href: "/practice", label: "练习" },
  { href: "/coach", label: "教练" },
  { href: "/profile", label: "我的" }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-guandan-border bg-guandan-background/95 px-3 py-2 backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
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
