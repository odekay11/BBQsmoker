import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smoker Monitor",
  description: "Live smoker temperature monitoring and control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-950">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-full bg-gray-950">{children}</body>
    </html>
  );
}
