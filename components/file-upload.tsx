"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import ComparisonView from "@/components/comparison-view"
import { useRouter } from "next/navigation"
import { Upload, FileText, X, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Student {
  id: string
  name: string
  nsuId: string
}

export function FileUpload() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [studentId, setStudentId] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null)
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])

  // Fetch students if teacher
  useEffect(() => {
    if (user?.role === "teacher") {
      fetch("/api/users/students")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setStudents(data.students)
        })
        .catch((error) => console.error("Failed to fetch students:", error))
    }
  }, [user?.role])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF and DOCX files are accepted")
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB")
      return false
    }
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) setSelectedFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return
    if (user.role === "teacher" && !studentId) {
      toast.error("Please select a student")
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("uploadedById", user.id)
      formData.append("uploadedByName", user.name)
      
      // Determine target student
      let targetStudentId = user.id
      let targetStudentName = user.name
      
      if (user.role === "teacher") {
        const selectedStudent = students.find((s) => s.id === studentId)
        targetStudentId = selectedStudent?.id || user.id
        targetStudentName = selectedStudent?.name || user.name
      }
      
      formData.append("studentId", targetStudentId)
      formData.append("studentName", targetStudentName)
      formData.append("userRole", user.role)

      // Simulate upload progress
      const steps = [10, 25, 40, 55, 70, 85, 95]
      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setProgress(step)
      }

      // Upload file
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Upload failed")
        setUploading(false)
        return
      }

      // Read estimated time if provided
      if (data.estimatedSeconds) {
        setEtaSeconds(data.estimatedSeconds)
      }

      setProgress(100)
      setDone(true)
      toast.success("Report uploaded successfully!")

      // If server returned match details, show comparison dialog
      if (data.report && data.report.matches) {
        setComparisonData({
          similarity: data.report.similarityPercentage,
          matches: data.report.matches,
          fileName: data.report.fileName,
        })
        setComparisonOpen(true)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("An error occurred during upload")
      setUploading(false)
    }
  }

  const reset = () => {
    setSelectedFile(null)
    setProgress(0)
    setDone(false)
    setStudentId("")
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Upload Complete</h3>
          <p className="text-center text-sm text-muted-foreground">
            Your report has been submitted and is now queued for plagiarism analysis.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={reset}>
              Upload Another
            </Button>
            <Button onClick={() => router.push(user?.role === "teacher" ? "/dashboard/results" : "/dashboard/submissions")}>
              View Submissions
            </Button>
          </div>
          {etaSeconds && (
            <p className="text-sm text-muted-foreground mt-2">Estimated analysis time: {etaSeconds} seconds</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Upload a Report</CardTitle>
          <CardDescription>
            Drag and drop a PDF or DOCX file, or click to browse. Max 10MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user?.role === "teacher" && (
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.nsuId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            role="button"
            tabIndex={0}
            aria-label="File drop zone"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop your file here, or{" "}
                <span className="text-primary">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF or DOCX up to 10MB
              </p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress < 70 ? "Uploading..." : "Analyzing for plagiarism..."}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {etaSeconds && (
                <div className="text-xs text-muted-foreground text-right">Estimated time: {etaSeconds}s</div>
              )}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? "Processing..." : "Upload & Analyze"}
          </Button>
        </CardContent>
      </Card>
      {/* Comparison dialog shown after processing */}
      {comparisonData && (
        <ComparisonView
          open={comparisonOpen}
          onOpenChange={setComparisonOpen}
          similarity={comparisonData.similarity}
          matches={comparisonData.matches}
          fileName={comparisonData.fileName}
        />
      )}
    </div>
  )
}
