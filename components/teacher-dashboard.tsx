"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Upload, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getReports } from "@/lib/store"
import type { Report } from "@/lib/types"

export function TeacherDashboard() {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    setReports(getReports())
  }, [])

  const pending = reports.filter((r) => !r.verdict).length
  const accepted = reports.filter((r) => r.verdict === "accepted").length
  const rejected = reports.filter((r) => r.verdict === "rejected").length
  const avgSimilarity =
    reports.filter((r) => r.similarityPercentage !== null).length > 0
      ? Math.round(
          reports
            .filter((r) => r.similarityPercentage !== null)
            .reduce((acc, r) => acc + (r.similarityPercentage ?? 0), 0) /
            reports.filter((r) => r.similarityPercentage !== null).length,
        )
      : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Average Similarity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground">{avgSimilarity}%</span>
              <span className="mb-1 text-sm text-muted-foreground">across all reports</span>
            </div>
            <Progress value={avgSimilarity} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {avgSimilarity < 20
                ? "Overall similarity is within acceptable range"
                : avgSimilarity < 40
                  ? "Some reports may need closer review"
                  : "High similarity detected across submissions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start gap-3" variant="outline">
              <Link href="/dashboard/upload">
                <Upload className="h-4 w-4" />
                Upload New Report
              </Link>
            </Button>
            <Button asChild className="w-full justify-start gap-3" variant="outline">
              <Link href="/dashboard/results">
                <FileText className="h-4 w-4" />
                View Results Table
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
