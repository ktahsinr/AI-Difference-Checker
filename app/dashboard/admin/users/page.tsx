"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Trash2, Search, ShieldCheck, GraduationCap, UserCog } from "lucide-react"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getUsers, deleteUser } from "@/lib/store"
import type { User } from "@/lib/types"

function RoleIcon({ role }: { role: string }) {
  if (role === "admin") return <ShieldCheck className="h-4 w-4" />
  if (role === "teacher") return <UserCog className="h-4 w-4" />
  return <GraduationCap className="h-4 w-4" />
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return <Badge className="bg-primary text-primary-foreground hover:bg-primary">Admin</Badge>
  }
  if (role === "teacher") {
    return <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20">Teacher</Badge>
  }
  return <Badge variant="secondary">Student</Badge>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")

  const refreshUsers = useCallback(() => {
    setUsers(getUsers())
  }, [])

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.nsuId.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = (userId: string, userName: string) => {
    deleteUser(userId)
    refreshUsers()
    toast.success(`${userName} has been removed`)
  }

  return (
    <>
      <DashboardHeader title="User Management" />
      <div className="flex-1 p-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">All Users</CardTitle>
                <Badge variant="secondary">{users.length}</Badge>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>NSU ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <RoleIcon role={u.role} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.nsuId}</TableCell>
                      <TableCell className="text-muted-foreground">{u.department}</TableCell>
                      <TableCell>
                        <RoleBadge role={u.role} />
                      </TableCell>
                      <TableCell>
                        {u.verified ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Yes</Badge>
                        ) : (
                          <Badge variant="destructive">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.role !== "admin" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete {u.name}</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {u.name} ({u.email})? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(u.id, u.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-xs text-muted-foreground">Protected</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
