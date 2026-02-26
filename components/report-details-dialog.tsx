"use client"

import { FileText, Download, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import ComparisonView from "@/components/comparison-view"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileViewer } from "@/components/file-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ReportDetailsProps {
  report: any
  open: boolean
  onOpenChange: (open: boolean) => void
  autoOpenComparison?: boolean
}

export function ReportDetailsDialog({ report, open, onOpenChange }: ReportDetailsProps) {
  if (!report) return null

  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)
  // When dialog opens with this flag, auto open the comparison view
  useEffect(() => {
    if (open && report && (report.matches && report.matches.length > 0)) {
      // if parent passed autoOpenComparison via props, open comparison
      // We read it from (report.__autoOpenComparison) if set by caller
      if ((report as any).__autoOpenComparison) {
        setComparisonData({ similarity: report.similarityPercentage, matches: report.matches, fileName: report.fileName })
        setComparisonOpen(true)
        // clear the flag so subsequent opens don't auto-open
        delete (report as any).__autoOpenComparison
      }
    }
  }, [open, report])

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSimilarityColor = (percentage: number | null) => {
    if (!percentage) return 'text-muted-foreground'
    if (percentage > 30) return 'text-destructive'
    if (percentage > 15) return 'text-amber-600'
    return 'text-emerald-600'
  }

  const getStatusColor = (verdict: string | null) => {
    if (verdict === 'accepted') return 'bg-emerald-100 text-emerald-700'
    if (verdict === 'rejected') return 'bg-red-100 text-red-700'
    return 'bg-blue-100 text-blue-700'
  }

  const getStatusText = (status: string, verdict: string | null) => {
    if (verdict === 'accepted') return 'Accepted'
    if (verdict === 'rejected') return 'Rejected'
    if (status === 'processing') return 'Processing'
    if (status === 'pending') return 'Pending Review'
    return status
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {report.fileName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="preview">File Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                📄 {report.fileName}
              </p>
              <FileViewer
                reportId={report.id}
                fileName={report.fileName}
                fileType={report.fileType}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* File Information */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">File Information</h3>
              <div className="space-y-2 rounded-lg bg-muted p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">File Type:</span>
                  <span className="text-sm font-medium text-foreground uppercase">{report.fileType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">File Size:</span>
                  <span className="text-sm font-medium text-foreground">{formatBytes(report.fileSize)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Submitted:</span>
                  <span className="text-sm font-medium text-foreground">{formatDate(report.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Student Information</h3>
              <div className="space-y-2 rounded-lg bg-muted p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Student Name:</span>
                  <span className="text-sm font-medium text-foreground">{report.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Student ID:</span>
                  <span className="text-sm font-medium text-foreground">ID: {report.studentId.substring(0, 8)}...</span>
                </div>
              </div>
            </div>

            {/* Uploaded By */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Uploaded By</h3>
              <div className="rounded-lg bg-muted p-4">
                <span className="text-sm text-foreground">{report.uploadedByName}</span>
              </div>
            </div>

            {/* Analysis Results (if available) */}
            {report.similarityPercentage !== null && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Plagiarism Analysis</h3>
                <div className="space-y-3 rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Similarity:</span>
                    <span className={`text-lg font-bold ${getSimilarityColor(report.similarityPercentage)}`}>
                      {report.similarityPercentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background">
                    <div
                      className={`h-full rounded-full ${
                        report.similarityPercentage > 30
                          ? 'bg-destructive'
                          : report.similarityPercentage > 15
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(report.similarityPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Review Status */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Review Status</h3>
              <div className="space-y-3 rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(report.verdict)}>
                    {getStatusText(report.status, report.verdict)}
                  </Badge>
                </div>
                {report.verdictByName && (
                  <>
                    <div className="flex justify-between">
                  {report.matches && report.matches.length > 0 && (
                    <div className="mt-3">
                      <Button onClick={() => {
                        setComparisonData({ similarity: report.similarityPercentage, matches: report.matches, fileName: report.fileName })
                        setComparisonOpen(true)
                      }}>
                        View Comparison
                      </Button>
                    </div>
                  )}
                      <span className="text-sm text-muted-foreground">Reviewed By:</span>
                      <span className="text-sm font-medium text-foreground">{report.verdictByName}</span>
                    </div>
                    {report.verdictAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Review Date:</span>
                        <span className="text-sm font-medium text-foreground">{formatDate(report.verdictAt)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {comparisonData && (
          <ComparisonView
            open={comparisonOpen}
            onOpenChange={setComparisonOpen}
            similarity={comparisonData.similarity}
            matches={comparisonData.matches}
            fileName={comparisonData.fileName}
          />
        )}

      </DialogContent>
    </Dialog>
  )
}
