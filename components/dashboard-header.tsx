"use client"

import { useAuth } from "@/lib/auth-context"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardHeader({ title }: { title: string }) {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-8 py-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">
          North South University &mdash; Plagiarism Checker
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9"
          />
        </div>
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <Avatar className="h-9 w-9 border-2 border-accent">
          <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
            {user?.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
