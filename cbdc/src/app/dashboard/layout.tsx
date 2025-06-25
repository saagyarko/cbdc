// src/app/dashboard/layout.tsx
"use client";
import { AppHeader } from '@/components/layout/app-header';
import { NavMenu } from '@/components/layout/nav-menu';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader as UiSidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/constants';
import { Landmark } from 'lucide-react'; // Example Icon
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar 
        variant="sidebar" 
        collapsible="icon" 
        className="border-r shadow-sm"
      >
        <UiSidebarHeader className="p-0 border-b">
            <Link href="/dashboard" className="flex h-16 items-center justify-center px-4 group-data-[collapsible=icon]:hidden">
                <Landmark className="h-8 w-8 text-primary mr-2 shrink-0" />
                <h1 className="text-2xl font-bold text-primary whitespace-nowrap font-headline">{APP_NAME}</h1>
            </Link>
            <Link href="/dashboard" className="flex h-16 items-center justify-center group-data-[collapsible=icon]:flex hidden">
                 <Landmark className="h-8 w-8 text-primary shrink-0" />
            </Link>
        </UiSidebarHeader>
        <SidebarContent className="p-2">
          <ScrollArea className="h-full">
            <NavMenu />
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-secondary/50"> {/* Using a slightly off-white for main content area */}
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background rounded-tl-xl md:shadow-inner"> {/* Main content area has default background */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
