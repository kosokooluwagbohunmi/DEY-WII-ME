import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEY WII ME — A Visual Journal",
  description: "Pictures, perspectives, pieces of life. An ongoing visual journal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
