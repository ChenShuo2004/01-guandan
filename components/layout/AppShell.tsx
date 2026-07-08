import type { ReactNode } from "react";
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
    <div className="min-h-screen overflow-x-hidden bg-guandan-background text-guandan-text">
      <SidebarNavigation />
      <main className="min-h-screen pb-28 pt-5 lg:pl-64 lg:pb-10 lg:pt-8">
        <ResponsiveContainer variant={variant}>
        {title ? (
          <header className="mb-5 lg:mb-8">
            <p className="text-sm font-semibold text-guandan-gold">掼蛋 AI 教练</p>
            <h1 className="mt-1 text-2xl font-bold leading-8 lg:text-4xl lg:leading-[3rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-guandan-subtext lg:text-base lg:leading-7">
                {subtitle}
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
        </ResponsiveContainer>
      </main>
      <BottomNavigation />
    </div>
  );
}
