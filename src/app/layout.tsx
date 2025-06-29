import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { DownloadQueueProvider } from '@/context/download-queue-context';

export const metadata: Metadata = {
  title: 'Avalonia Download Studio',
  description: 'A modern YouTube video downloader application.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <DownloadQueueProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col">
              <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold font-headline">Avalonia Download Studio</h1>
              </header>
              <main className="flex-1 overflow-auto p-4 sm:p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </DownloadQueueProvider>
      </body>
    </html>
  );
}
