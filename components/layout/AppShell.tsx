import type { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-guandan-background text-guandan-text">
      <main className="mx-auto min-h-screen w-full max-w-[430px] px-4 pb-28 pt-5">
        {title ? (
          <header className="mb-5">
            <p className="text-sm font-semibold text-guandan-gold">掼蛋 AI 教练</p>
            <h1 className="mt-1 text-2xl font-bold leading-8">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-6 text-guandan-subtext">{subtitle}</p>
            ) : null}
          </header>
        ) : null}
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
