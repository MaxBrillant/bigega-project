import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
