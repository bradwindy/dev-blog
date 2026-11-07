import type { Metadata, Viewport } from "next";
import { Jacquard_24, Sono } from "next/font/google";
import { ShaderStage } from "@/components/shader-stage";
import "./globals.css";

const jacquard = Jacquard_24({ weight: "400", subsets: ["latin"], variable: "--font-jacquard" });
const sono = Sono({ subsets: ["latin"], axes: ["MONO"], variable: "--font-sono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.windybank.net"),
  title: { default: "Bradley Windybank", template: "%s - Bradley Windybank" },
  description: "Software engineer in Auckland. I build iOS apps, websites and MCP servers.",
  manifest: "/site.webmanifest",
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffd23f" },
    { media: "(prefers-color-scheme: dark)", color: "#141000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jacquard.variable} ${sono.variable}`}>
      <body>
        <div className="shell">
          <ShaderStage />
          <main className="col">{children}</main>
        </div>
      </body>
    </html>
  );
}
