import React from "react";
import Link from "next/link";
import { MenuIcon, UserIcon } from "lucide-react"; // v0.284.0

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

/**
 * Header component that appears at the top of every page in the application.
 * Provides application branding, navigation, and user interface controls.
 */
export function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background shadow-sm"
      role="banner"
      aria-label="Main Header"
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Left side: Application branding and hamburger menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menu"
            className="md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          
          <Link
            href="/"
            className="text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
            aria-label="Organization Configuration Tool Home"
          >
            Organization Configuration Tool
          </Link>
        </div>

        {/* Right side: User menu */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="User menu"
                className="rounded-full"
              >
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/profile" className="w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button className="w-full text-left">Logout</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}