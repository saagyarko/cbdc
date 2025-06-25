// src/components/layout/app-header.tsx
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Bell, Search, User, LogOut, Settings, LifeBuoy } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Assuming this is from your sidebar component
import { APP_NAME } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';


export function AppHeader() {
  const pathname = usePathname();
  const currentNavItem = NAV_ITEMS.find(item => item.href === pathname || (item.match && item.match(pathname)));
  const pageTitle = currentNavItem ? currentNavItem.label : "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground hidden md:block">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-2">
        <form className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions, reports..."
            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-card"
          />
        </form>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
              {/* Basic notification indicator */}
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start">
              <p className="font-medium">New Fraud Alert: TXN7890</p>
              <p className="text-xs text-muted-foreground">High risk score (92) detected.</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start">
              <p className="font-medium">Compliance Report Ready</p>
              <p className="text-xs text-muted-foreground">Monthly AML report generated.</p>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem asChild>
                <Link href="#" className="w-full justify-center text-sm text-primary">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="avatar person" />
                <AvatarFallback>CB</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Central Banker</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
