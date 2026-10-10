import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Visitor Detector | Real-Time Movement & Person Detection",
  description:
    "Lightweight, single-page AI webcam visitor detection application with movement differencing, real-time person sensing, automatic photo capture, and alert sounds.",
  keywords: [
    "AI Visitor Detector",
    "Movement Detection",
    "Person Detection",
    "Webcam Security",
    "Auto Photo Capture",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
