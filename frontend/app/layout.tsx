import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: "Magic: The Gathering Card Builder",
  description: "Magic: The Gathering Card Builder",
};
const myFont = localFont({
  src: [
    {
      path: "./Beleren2016-Bold.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-myfont", // Optional: for CSS variables
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={myFont.variable}>
      <body className={myFont.variable}>{children}</body>
    </html>
  );
}
