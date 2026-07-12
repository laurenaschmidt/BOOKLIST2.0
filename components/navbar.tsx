"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { Bell, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { UserAvatar } from "@/components/user-avatar";

type NavUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const links = [
  { href: "/library", label: "Library" },
  { href: "/search", label: "Search" },
  { href: "/playlists", label: "Playlists" },
  { href: "/people", label: "People" },
];

export function Navbar({ user, unreadNotificationCount = 0 }: { user: NavUser | null; unreadNotificationCount?: number }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          <motion.span
            className="inline-block"
            whileHover={{ rotate: [-2, 3, -2, 0], scale: 1.04 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            BookList
          </motion.span>
        </Link>

        {user && (
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative rounded-full p-2 text-ink-muted transition-colors hover:text-ink"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationCount > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground"
                >
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </motion.span>
              )}
            </Link>
            <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="rounded-full outline-none ring-accent/40 transition focus-visible:ring-2">
                <UserAvatar name={user.name ?? user.email ?? "?"} image={user.image ?? null} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={10}
                className="z-50 min-w-48 rounded-xl border border-border bg-surface p-1.5 text-ink shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href="/profile"
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                      "hover:bg-surface-hover focus:bg-surface-hover"
                    )}
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onSelect={async () => {
                    await logoutAction();
                    window.location.href = "/";
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-surface-hover focus:bg-surface-hover"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
