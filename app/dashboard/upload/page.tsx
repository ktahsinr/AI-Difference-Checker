"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { FileUpload } from "@/components/file-upload"

export default function UploadPage() {
  return (
    <>
      <DashboardHeader title="Upload Report" />
      <div className="flex-1 p-8">
        <FileUpload />
      </div>
    </>
  )
}
