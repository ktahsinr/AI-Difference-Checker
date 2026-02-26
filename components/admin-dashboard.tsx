"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, FileText, ShieldCheck, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUsers, getReports } from "@/lib/store"
import type { User, Report } from "@/lib/types"

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    setUsers(getUsers())
    setReports(getReports())
  }, [])

  const students = users.filter((u) => u.role === "student").length
  const teachers = users.filter((u) => u.role === "teacher").length
  const pendingApprovals = users.filter((u) => u.role === "teacher" && !u.verified).length
  const totalReports = reports.length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{students}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{teachers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <ShieldCheck className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">{pendingApprovals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{totalReports}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              View and manage all user accounts in the system.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/admin/users">
                <Users className="mr-2 h-4 w-4" /> Manage Users
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Teacher Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {pendingApprovals > 0
                ? `${pendingApprovals} teacher(s) awaiting approval.`
                : "No pending approvals."}
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/admin/approvals">
                <ShieldCheck className="mr-2 h-4 w-4" /> Review Approvals
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">All Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Oversee all submitted reports across the system.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/admin/reports">
                <FileText className="mr-2 h-4 w-4" /> View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
