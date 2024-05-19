import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full mx-auto sm:max-w-md">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
