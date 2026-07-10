import type { ReactNode } from "react";
import Image from "next/image";
import { BottomNavigation } from "./BottomNavigation";
import { ResponsiveContainer } from "./ResponsiveContainer";
import { SidebarNavigation } from "./SidebarNavigation";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: "default" | "wide";
}

export function AppShell({
  children,
  subtitle,
  title,
  variant = "default"
}: AppShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9f9ff] text-[#111c2d]">
      <SidebarNavigation />
      <main className="min-h-screen pb-28 lg:pl-64 lg:pb-10">
        <header className="sticky top-0 z-10 hidden h-16 items-center justify-between border-b border-[#e7eeff] bg-white/90 px-6 backdrop-blur lg:flex">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-[#0058be]">
              auto_awesome
            </span>
            <h1 className="text-lg font-black text-[#0058be]">Guandan Memory Lab</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-72 items-center gap-2 rounded-xl border border-[#d8e3fb] bg-[#f9f9ff] px-4 text-sm font-semibold text-[#424754]">
              <span className="material-symbols-outlined text-[18px] text-[#727785]">
                search
              </span>
              <span>搜索课程或技巧</span>
            </div>
            <button
              aria-label="通知"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#424754] transition hover:bg-[#e7eeff] hover:text-[#0058be]"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button
              aria-label="设置"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#424754] transition hover:bg-[#e7eeff] hover:text-[#0058be]"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#adc6ff] bg-[#d4e3ff]">
              <Image
                alt="用户头像"
                className="h-full w-full object-cover"
                height={36}
                src="/assets/coach/coach-master-certification.png"
                width={36}
              />
            </div>
          </div>
        </header>
        <div className="px-0 py-5 lg:py-7">
          <ResponsiveContainer variant={variant}>
            {title || subtitle ? (
              <div className="mb-5 lg:hidden">
                {title ? <h1 className="text-2xl font-black leading-8">{title}</h1> : null}
                {subtitle ? (
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#424754]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            ) : null}
            {children}
          </ResponsiveContainer>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
