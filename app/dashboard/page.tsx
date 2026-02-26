"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { StudentDashboard } from "@/components/student-dashboard"
import { TeacherDashboard } from "@/components/teacher-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="flex-1 p-8">
        {user.role === "student" && <StudentDashboard />}
        {user.role === "teacher" && <TeacherDashboard />}
        {user.role === "admin" && <AdminDashboard />}
      </div>
    </>
  )
}
