import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaturYta - Příprava na maturitu z českého jazyka",
  description: "Webová aplikace pro přípravu na maturitu z českého jazyka: Cermat testy, procvičování chyb, rozbory knih a audioknihy zdarma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
