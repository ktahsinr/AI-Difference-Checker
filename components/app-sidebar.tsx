"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  ShieldCheck,
  LogOut,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["student", "teacher", "admin"],
  },
  {
    label: "Upload Report",
    href: "/dashboard/upload",
    icon: Upload,
    roles: ["student", "teacher"],
  },
  {
    label: "My Submissions",
    href: "/dashboard/submissions",
    icon: FileText,
    roles: ["student"],
  },
  {
    label: "Results Table",
    href: "/dashboard/results",
    icon: FileText,
    roles: ["teacher"],
  },
  {
    label: "User Management",
    href: "/dashboard/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Teacher Approvals",
    href: "/dashboard/admin/approvals",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    label: "All Reports",
    href: "/dashboard/admin/reports",
    icon: FileText,
    roles: ["admin"],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  )

  return (
    <aside className="flex h-screen w-64 flex-col bg-[hsl(210,100%,15%)] text-[hsl(210,20%,96%)]">
      <div className="flex items-center gap-3 border-b border-[hsl(210,80%,25%)] px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(43,72%,52%)]">
          <GraduationCap className="h-5 w-5 text-[hsl(210,100%,10%)]" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-[hsl(0,0%,100%)]">NSU</p>
          <p className="text-xs text-[hsl(210,20%,70%)]">Plagiarism Checker</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(210,100%,22%)] text-[hsl(43,72%,52%)]"
                  : "text-[hsl(210,20%,70%)] hover:bg-[hsl(210,100%,22%)] hover:text-[hsl(0,0%,100%)]",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[hsl(210,80%,25%)] p-3">
        <div className="mb-3 rounded-lg bg-[hsl(210,100%,22%)] px-3 py-2.5">
          <p className="text-sm font-medium text-[hsl(0,0%,100%)]">{user.name}</p>
          <p className="text-xs text-[hsl(210,20%,70%)]">{user.email}</p>
          <p className="mt-1 text-xs capitalize text-[hsl(43,72%,52%)]">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(210,20%,70%)] transition-colors hover:bg-[hsl(210,100%,22%)] hover:text-[hsl(0,0%,100%)]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
