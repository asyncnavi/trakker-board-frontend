"use client";

import { Command } from "lucide-react";
import { NavUser } from "./NavUser";
import { useUserQuery } from "@/services/user";

export function SiteHeader() {
  const { data: user } = useUserQuery();

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) items-center gap-2 px-4 justify-between w-full">
        <a href="#" className="flex gap-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Command className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium text-xl">Trakker.</span>
          </div>
        </a>
        {user && <NavUser user={user} />}
      </div>
    </header>
  );
}
