import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ไทยช่วยไทย Plus — คำนวณสิทธิ์และยอดจ่ายเอง",
  description: "คำนวณรัฐช่วยจ่าย 60% สูงสุด 200 บาทต่อวัน แสดงยอดจ่ายเองและส่วนเพิ่มชัดเจน จำข้อมูลในเครื่อง ใช้ง่ายบนมือถือ",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
