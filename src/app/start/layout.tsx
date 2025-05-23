import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Start fundraising now",
  description: "Raise funds from friends and family in Burundi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={inter.className + "w-full mx-auto sm:max-w-md"}>
      <main>{children}</main>
    </div>
  );
}
