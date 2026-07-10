import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookList",
  description: "Track what you're reading and build a soundtrack for every book.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const navUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true },
      })
    : null;
  const unreadNotificationCount = navUser ? await getUnreadNotificationCount(navUser.id) : 0;

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans">
        <Navbar user={navUser} unreadNotificationCount={unreadNotificationCount} />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
