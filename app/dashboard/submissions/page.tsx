"use client"

import { useEffect, useState } from "react"
import { FileText, Clock, CheckCircle2, XCircle, Loader2, Eye } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import ComparisonView from "@/components/comparison-view"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { ReportDetailsDialog } from "@/components/report-details-dialog"

interface Report {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedByName: string
  studentId: string
  studentName: string
  status: string
  similarityPercentage: number | null
  matches?: any[]
  verdict: string | null
  verdictBy: string | null
  verdictByName: string | null
  verdictAt: string | null
  createdAt: string
}

function StatusBadge({ status, verdict }: { status: string; verdict: string | null }) {
  if (verdict === "accepted") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Accepted</Badge>
  }
  if (verdict === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>
  }
  if (status === "processing") {
    return (
      <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing
      </Badge>
    )
  }
  return <Badge variant="secondary">Pending</Badge>
}

function StatusIcon({ status, verdict }: { status: string; verdict: string | null }) {
  if (verdict === "accepted") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
  if (verdict === "rejected") return <XCircle className="h-5 w-5 text-destructive" />
  if (status === "processing") return <Loader2 className="h-5 w-5 animate-spin text-accent" />
  return <Clock className="h-5 w-5 text-muted-foreground" />
}

export default function SubmissionsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?userId=${user?.id}&role=${user?.role}`)
      const data = await response.json()

      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setDialogOpen(true)
  }

  return (
    <>
      <DashboardHeader title="My Submissions" />
      <div className="flex-1 p-8">
        <ReportDetailsDialog report={selectedReport} open={dialogOpen} onOpenChange={setDialogOpen} />
        {comparisonData && (
          <ComparisonView
            open={comparisonOpen}
            onOpenChange={setComparisonOpen}
            similarity={comparisonData.similarity}
            matches={comparisonData.matches}
            fileName={comparisonData.fileName}
          />
        )}

        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading submissions...</p>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">No submissions yet</p>
              <p className="text-sm text-muted-foreground">
                Upload a report to get started with plagiarism checking.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Cards view for mobile */}
            <div className="space-y-4 md:hidden">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon status={report.status} verdict={report.verdict} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{report.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            For: {report.studentName}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={report.status} verdict={report.verdict} />
                    </div>
                    {report.similarityPercentage !== null && (
                      <div className="mt-3 flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                        <span className="text-xs text-muted-foreground">Similarity:</span>
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
                        {report.matches && report.matches.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="ml-3 text-sm text-primary underline">Preview</button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Open comparison</span>
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
                        )}
                      </div>
                    )}
                    {report.verdictByName && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Reviewed by {report.verdictByName}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table for desktop */}
            <Card className="hidden md:block">
              <CardHeader>
                <CardTitle className="text-foreground">Submission History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Similarity</TableHead>
                      <TableHead>Matches</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{report.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.studentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {report.similarityPercentage !== null ? (
                            <span
                              className={`font-bold ${
                                report.similarityPercentage > 30
                                  ? "text-destructive"
                                  : report.similarityPercentage > 15
                                    ? "text-accent"
                                    : "text-emerald-600"
                              }`}
                            >
                              {report.similarityPercentage}%
                            </span>
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
                                  <span className="text-sm">Preview comparison</span>
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
                          <StatusBadge status={report.status} verdict={report.verdict} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
