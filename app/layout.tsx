import type { Metadata, Viewport } from "next";
import { TrainingCampMusic } from "@/components/audio/TrainingCampMusic";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ace AI 掼蛋训练",
  description: "由 AI 教练引导的掼蛋学习和训练助手"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f9f9ff"
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
