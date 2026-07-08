import type { ReactNode } from "react";
import { ShinyText } from "@/components/ui/ShinyText";
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
              <p className="text-sm font-semibold text-guandan-gold">Ace AI Coach</p>
              <h1 className="mt-1 text-2xl font-bold leading-8 lg:text-4xl lg:leading-[3rem]">
                <ShinyText
                  color="#F8FAFC"
                  delay={0.8}
                  shineColor="#F6C65B"
                  speed={2.8}
                  text={title}
                />
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
