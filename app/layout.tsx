import type { Metadata, Viewport } from "next";
import { TrainingCampMusic } from "@/components/audio/TrainingCampMusic";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ace AI 掼蛋训练营",
  description: "由 AI Coach 引导的专业掼蛋训练空间"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050b16"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <TrainingCampMusic />
        {children}
      </body>
    </html>
  );
}
