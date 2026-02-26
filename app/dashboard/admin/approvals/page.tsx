"use client"

import { useEffect, useState, useCallback } from "react"
import { ShieldCheck, CheckCircle2, XCircle, UserCog } from "lucide-react"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getUsers, updateUser, deleteUser } from "@/lib/store"
import type { User } from "@/lib/types"

export default function ApprovalsPage() {
  const [teachers, setTeachers] = useState<User[]>([])

  const refreshTeachers = useCallback(() => {
    setTeachers(getUsers().filter((u) => u.role === "teacher"))
  }, [])

  useEffect(() => {
    refreshTeachers()
  }, [refreshTeachers])

  const pending = teachers.filter((t) => !t.verified)
  const approved = teachers.filter((t) => t.verified)

  const handleToggle = (userId: string, currentVerified: boolean) => {
    updateUser(userId, { verified: !currentVerified })
    refreshTeachers()
    toast.success(!currentVerified ? "Teacher approved" : "Teacher access revoked")
  }

  const handleReject = (userId: string, name: string) => {
    deleteUser(userId)
    refreshTeachers()
    toast.success(`${name} has been rejected and removed`)
  }

  return (
    <>
      <DashboardHeader title="Teacher Approvals" />
      <div className="flex-1 space-y-6 p-8">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <CardTitle className="text-foreground">Pending Approvals</CardTitle>
              {pending.length > 0 && (
                <Badge className="bg-accent/20 text-accent-foreground">{pending.length}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                <p className="text-sm text-muted-foreground">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <UserCog className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.department} &mdash; {teacher.nsuId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleToggle(teacher.id, false)}
                        className="gap-1 bg-emerald-600 text-primary-foreground hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(teacher.id, teacher.name)}
                        className="gap-1 text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Teachers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Approved Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            {approved.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No approved teachers yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>NSU ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approved.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{teacher.nsuId}</TableCell>
                      <TableCell className="text-muted-foreground">{teacher.department}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(teacher.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">
                            {teacher.verified ? "Active" : "Revoked"}
                          </span>
                          <Switch
                            checked={teacher.verified}
                            onCheckedChange={() => handleToggle(teacher.id, teacher.verified)}
                            aria-label={`Toggle access for ${teacher.name}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
