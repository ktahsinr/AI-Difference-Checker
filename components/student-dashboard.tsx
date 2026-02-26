"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Upload, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getReportsByStudent } from "@/lib/store"
import type { Report } from "@/lib/types"

export function StudentDashboard() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    if (user) {
      setReports(getReportsByStudent(user.id))
    }
  }, [user])

  const pending = reports.filter((r) => r.status === "pending" || r.status === "processing").length
  const accepted = reports.filter((r) => r.verdict === "accepted").length
  const rejected = reports.filter((r) => r.verdict === "rejected").length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{reports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{accepted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{rejected}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Submissions</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/submissions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
              <Button asChild size="sm">
                <Link href="/dashboard/upload">Upload Your First Report</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{report.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={report.status} verdict={report.verdict} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({
  status,
  verdict,
}: {
  status: string
  verdict: string | null
}) {
  if (verdict === "accepted") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Accepted</Badge>
  }
  if (verdict === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>
  }
  if (status === "processing") {
    return <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20">Processing</Badge>
  }
  return <Badge variant="secondary">Pending</Badge>
}
