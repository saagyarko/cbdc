// src/components/layout/nav-menu.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar'; // Import useSidebar
import { useSession } from 'next-auth/react';

export function NavMenu() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar(); // Get sidebar state
  const { data: session } = useSession();
  const userRole = session?.user ? (session.user as any).role : undefined;

  return (
    <SidebarMenu>
      {NAV_ITEMS.filter(item => !item.roles || (userRole && item.roles.includes(userRole))).map((item) => {
        const isActive = item.match ? item.match(pathname) : pathname.startsWith(item.href);
        const buttonContent = (
          <>
            <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover/menu-button:text-sidebar-accent-foreground")} />
            <span className={cn(
              "group-data-[collapsible=icon]:hidden",
              isActive ? "font-semibold" : ""
            )}>
              {item.label}
            </span>
          </>
        );

        const sidebarMenuButton = (
           <SidebarMenuButton
              asChild
              isActive={isActive}
              variant="ghost"
              className={cn(
                "justify-start w-full",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-12"
              )}
              disabled={item.disabled}
            >
              <Link href={item.disabled ? "#" : item.href} aria-disabled={item.disabled}>
                {buttonContent}
              </Link>
            </SidebarMenuButton>
        );

        return (
          <SidebarMenuItem key={item.href} className={cn(item.disabled && "opacity-50 cursor-not-allowed")}>
            {sidebarState === 'collapsed' && !isMobile ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>{sidebarMenuButton}</TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              sidebarMenuButton
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
