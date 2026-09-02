import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Research Demo 测试台",
  description: "闲鱼、网盘、小红书、B站会员购自动化脚本联调",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
