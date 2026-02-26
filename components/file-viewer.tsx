"use client"

import { useState, useEffect } from "react"
import { Download, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileViewerProps {
  reportId: string
  fileName: string
  fileType: 'pdf' | 'docx'
}

export function FileViewer({ reportId, fileName, fileType }: FileViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileData, setFileData] = useState<string | null>(null)

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching file for report:', reportId)
        const response = await fetch(`/api/reports/${reportId}/file`)
        const data = await response.json()

        console.log('File fetch response:', { status: response.status, data })

        if (!response.ok) {
          setError(data.error || `Failed to load file (${response.status})`)
          return
        }

        if (!data.fileData) {
          setError('No file data received from server')
          return
        }

        setFileData(data.fileData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading the file'
        setError(errorMessage)
        console.error('File fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      fetchFile()
    }
  }, [reportId])

  const handleDownload = () => {
    if (!fileData) return

    const link = document.createElement('a')
    const mimeType = fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    
    link.href = `data:${mimeType};base64,${fileData}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/50 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading file preview...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {fileData && (
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download {fileType.toUpperCase()} instead
          </Button>
        )}
      </div>
    )
  }

  if (!fileData) {
    return (
      <Alert>
        <AlertDescription>No preview available for this file.</AlertDescription>
      </Alert>
    )
  }

  // PDF Viewer
  if (fileType === 'pdf') {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-background p-2">
          <iframe
            src={`data:application/pdf;base64,${fileData}`}
            title={fileName}
            className="h-96 w-full rounded"
            loading="lazy"
          />
        </div>
        <Button onClick={handleDownload} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    )
  }

  // DOCX Viewer - Show download button since preview is complex
  if (fileType === 'docx') {
    return (
      <div className="space-y-3">
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>DOCX file preview not available in browser</span>
          </AlertDescription>
        </Alert>
        <Button onClick={handleDownload} variant="default" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download DOCX File
        </Button>
      </div>
    )
  }

  return null
}
