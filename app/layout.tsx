import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComparaAI",
  description:
    "Teknoloji haberleri, ürün bilgileri ve karşılaştırmalar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen">
        <Header />
        {children}
      </body>
    </html>
  );
}