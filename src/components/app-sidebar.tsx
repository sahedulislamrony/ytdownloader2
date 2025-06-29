"use client"

import { usePathname } from "next/navigation"
import { Home, Download, History, Settings, Bot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar"

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton
          asChild
          size="lg"
          className="justify-center group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12"
          tooltip={{
            children: "Avalonia Studio",
            side: "right",
            align: "center",
          }}
        >
          <a href="#">
            <Bot className="text-primary size-6 group-data-[collapsible=icon]:size-6" />
            <span className="text-lg font-headline">Avalonia Studio</span>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{
                  children: item.label,
                  side: "right",
                  align: "center",
                }}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add user profile or other footer items here */}
      </SidebarFooter>
    </Sidebar>
  )
}
