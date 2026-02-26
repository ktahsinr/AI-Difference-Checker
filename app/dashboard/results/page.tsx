"use client"

import { useEffect, useState, useCallback } from "react"
import { FileText, CheckCircle2, XCircle, Search, Eye, Loader2 } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import ComparisonView from "@/components/comparison-view"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export default function ResultsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?userId=${user?.id}&role=${user?.role}`)
      const data = await response.json()

      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.role])

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user, fetchReports])

  const filteredReports = reports.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.fileName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setDialogOpen(true)
  }

  const handleVerdict = async (reportId: string, verdict: "accepted" | "rejected") => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict,
          status: verdict,
          verdictBy: user?.id,
          verdictByName: user?.name,
          verdictAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        toast.error('Failed to update report verdict')
        return
      }

      await fetchReports()
      toast.success(`Report ${verdict === "accepted" ? "accepted" : "rejected"} successfully`)
    } catch (error) {
      console.error("Error updating verdict:", error)
      toast.error("An error occurred while updating the verdict")
    }
  }

  return (
    <>
      <DashboardHeader title="Results Table" />
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
        
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-foreground">Plagiarism Results</CardTitle>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by student or file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
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
                      <TableHead>File Name</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Similarity %</TableHead>
                      <TableHead>Matches</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{report.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {report.uploadedByName !== report.studentName
                                ? `Uploaded by ${report.uploadedByName}`
                                : "Self-submitted"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{report.fileName}</span>
                          </div>
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
                          <VerdictBadge verdict={report.verdict} status={report.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewReport(report)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {report.verdict ? (
                              <span className="text-xs text-muted-foreground">
                                {report.verdictByName && `by ${report.verdictByName}`}
                              </span>
                            ) : (
                              <>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="gap-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                                      <CheckCircle2 className="h-3 w-3" /> Accept
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Accept Report</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Accept the report &ldquo;{report.fileName}&rdquo; from{" "}
                                        {report.studentName}? This action will update the
                                        student&apos;s submission status.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleVerdict(report.id, "accepted")}
                                        className="bg-emerald-600 text-primary-foreground hover:bg-emerald-700"
                                      >
                                        Accept
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                      <XCircle className="h-3 w-3" /> Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Report</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Reject the report &ldquo;{report.fileName}&rdquo; from{" "}
                                        {report.studentName}? This action will update the
                                        student&apos;s submission status.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleVerdict(report.id, "rejected")}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Reject
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
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
    </>
  )
}

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
