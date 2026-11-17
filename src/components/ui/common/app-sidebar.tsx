"use client";

import { signOut } from "@/actions/auth-action";
import {
  SIDEBAR_MENU_LIST,
  SidebarMenuKey,
} from "@/constants/sidebar-constant";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { EllipsisVertical, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../sidebar";

export default function AppSidebar() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const profile = useAuthStore((state) => state.profile);

  const isActive = (url: string) =>
    url === "/admin" ? pathname === url : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-auto justify-center hover:bg-transparent"
              render={<Link href="/" />}
            >
              {/* ganti ke versi putih (sinergy-logo-white.png) kalau ada */}
              <Image
                src="/sinergy-logo.svg"
                alt="Sinergy Roastery"
                width={120}
                height={120}
                priority
                className="h-auto w-24 rounded-md bg-sidebar-foreground p-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-1"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {SIDEBAR_MENU_LIST[profile.role as SidebarMenuKey]?.map(
                (item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                      className={cn(
                        "h-auto rounded-lg px-4 py-3 font-medium",
                        isActive(item.url) &&
                          "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={profile.avatar_url || undefined}
                        alt={profile.name}
                        className="object-cover object-center"
                      />
                      <AvatarFallback className="rounded-lg text-foreground">
                        {profile.name?.charAt(0) ?? "R"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <h4 className="truncate font-medium">{profile.name}</h4>
                      <p className="truncate text-xs capitalize text-sidebar-foreground/70">
                        {profile.role}
                      </p>
                    </div>
                    <EllipsisVertical className="ml-auto size-4" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={profile.avatar_url || undefined}
                          alt={profile.name}
                          className="object-cover object-center"
                        />
                        <AvatarFallback className="rounded-lg">
                          {profile.name?.charAt(0) ?? "R"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <h4 className="truncate font-medium">{profile.name}</h4>
                        <p className="truncate text-xs capitalize text-muted-foreground">
                          {profile.role}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
