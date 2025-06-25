import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ClientRootProvider from '@/components/ClientRootProvider';

export const metadata: Metadata = {
  title: 'CBDC Connect',
  description: 'Revolutionizing cross-border CBDC settlements with AI-powered fraud detection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ClientRootProvider>
          {children}
        </ClientRootProvider>
        <Toaster />
      </body>
    </html>
  );
}
