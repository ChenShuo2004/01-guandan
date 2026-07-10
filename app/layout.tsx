import type { Metadata, Viewport } from "next";
import { TrainingCampMusic } from "@/components/audio/TrainingCampMusic";
import "./globals.css";

export const metadata: Metadata = {
  title: "掼蛋记牌训练",
  description: "通过自动牌局和即时测试训练掼蛋记牌能力。"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#050b16"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body><TrainingCampMusic />{children}</body>
    </html>
  );
}
