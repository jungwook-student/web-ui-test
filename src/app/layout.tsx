import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"], // 'korean' subset is often implicitly covered or use 'latin' for wider char support
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "아이북",
  description: "우리 아이를 위한 맞춤 도서 추천 서비스",
  manifest: "/manifest.json", // For PWA capabilities
  icons: {
    // Placeholder icons, replace with actual app icons
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={cn("font-sans antialiased", notoSansKR.variable)}>
        <AuthProvider>
          <div className="flex flex-col">
            <main className="flex-grow h-fit">{children}</main>
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
