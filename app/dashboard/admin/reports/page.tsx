"use client"

import { useEffect, useState, useCallback } from "react"
import { FileText, Search } from "lucide-react"
import ComparisonView from "@/components/comparison-view"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getReports } from "@/lib/store"
import type { Report } from "@/lib/types"

function VerdictBadge({ verdict, status }: { verdict: string | null; status: string }) {
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

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [search, setSearch] = useState("")
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)

  const refreshReports = useCallback(() => {
    setReports(getReports())
  }, [])

  useEffect(() => {
    refreshReports()
  }, [refreshReports])

  const filteredReports = reports.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.fileName.toLowerCase().includes(search.toLowerCase()) ||
      r.uploadedByName.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <DashboardHeader title="All Reports" />
      <div className="flex-1 p-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">System Reports</CardTitle>
                <Badge variant="secondary">{reports.length}</Badge>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No reports found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Similarity</TableHead>
                          <TableHead>Matches</TableHead>
                      <TableHead>Verdict</TableHead>
                      <TableHead>Reviewed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{report.studentName}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{report.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.uploadedByName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {report.similarityPercentage !== null ? (
                            <div className="space-y-1">
                              <span
                                className={`text-sm font-bold ${
                                  report.similarityPercentage > 30
                                    ? "text-destructive"
                                    : report.similarityPercentage > 15
                                      ? "text-accent"
                                      : "text-emerald-600"
                                }`}
                              >
                                {report.similarityPercentage}%
                              </span>
                              <Progress
                                value={report.similarityPercentage}
                                className="h-1.5 w-20"
                              />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">&mdash;</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {report.matches && report.matches.length > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="inline-flex items-center">
                                  <Badge className="bg-emerald-100 text-emerald-700 cursor-pointer">Preview</Badge>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">View line-by-line comparison</span>
                                  <button
                                    className="text-sm text-primary underline"
                                    onClick={() => {
                                      setComparisonData({ similarity: report.similarityPercentage, matches: report.matches, fileName: report.fileName })
                                      setComparisonOpen(true)
                                    }}
                                  >
                                    Open
                                  </button>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">&mdash;</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <VerdictBadge verdict={report.verdict} status={report.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.verdictByName ?? <span>&mdash;</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {comparisonData && (
        <ComparisonView
          open={comparisonOpen}
          onOpenChange={setComparisonOpen}
          similarity={comparisonData.similarity}
          matches={comparisonData.matches}
          fileName={comparisonData.fileName}
        />
      )}
    </>
  )
}
