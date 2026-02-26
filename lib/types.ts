export type UserRole = "student" | "teacher" | "admin"

export type SubmissionStatus = "pending" | "processing" | "accepted" | "rejected"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  nsuId: string
  department: string
  verified: boolean
  createdAt: string
}

export interface Report {
  id: string
  fileName: string
  fileType: "pdf" | "docx"
  fileSize: number
  uploadedBy: string
  uploadedByName: string
  studentId: string
  studentName: string
  status: SubmissionStatus
  similarityPercentage: number | null
  // optional match details for side-by-side comparison
  matches?: any[]
  verdict: "accepted" | "rejected" | null
  verdictBy: string | null
  verdictByName: string | null
  verdictAt: string | null
  createdAt: string
}

export interface AuthState {
  user: Omit<User, "password"> | null
  isAuthenticated: boolean
}

export interface DatabaseSchema {
  users: User[]
  reports: Report[]
}
