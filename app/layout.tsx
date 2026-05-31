import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Trade Adhyayan | The Ultimate Trading Journal & Analytics Platform",
  description: "Advanced trading journal and analytics platform for Indian traders. Track trades, identify mistakes, and master your trading psychology.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#1E1E2E",
              color: "#E2E8F0",
              border: "1px solid #2D2D44",
              borderRadius: "14px",
              fontSize: "12px",
              fontWeight: "700",
              padding: "12px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            },
            success: {
              iconTheme: { primary: "#15B77A", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#E94B8A", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}