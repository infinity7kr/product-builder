import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "휴먼디자인 분석",
  description: "생년월일시로 휴먼디자인 바디그래프를 계산하고 AI가 해설해주는 개인용 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="bg-decor" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
