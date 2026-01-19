import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "쿠팡 파트너스 자동 블로그",
  description: "키워드 기반 쿠팡 파트너스 상품 자동 수집 및 AI 블로그 글 작성 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
