import type { User, Report, DatabaseSchema } from "./types"

const STORAGE_KEY = "nsu_plagiarism_db"

function getDefaultData(): DatabaseSchema {
  return {
    users: [
      {
        id: "admin-001",
        name: "System Admin",
        email: "admin@northsouth.edu",
        password: "admin123",
        role: "admin",
        nsuId: "ADM-0001",
        department: "Administration",
        verified: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "teacher-001",
        name: "Dr. Rahman Khan",
        email: "rahman.khan@northsouth.edu",
        password: "teacher123",
        role: "teacher",
        nsuId: "FAC-1001",
        department: "Computer Science",
        verified: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "student-001",
        name: "Ariful Islam",
        email: "ariful.islam@northsouth.edu",
        password: "student123",
        role: "student",
        nsuId: "2012345678",
        department: "Computer Science",
        verified: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "student-002",
        name: "Fatima Noor",
        email: "fatima.noor@northsouth.edu",
        password: "student123",
        role: "student",
        nsuId: "2013456789",
        department: "Electrical Engineering",
        verified: true,
        createdAt: new Date().toISOString(),
      },
    ],
    reports: [
      {
        id: "report-001",
        fileName: "CSE311_Final_Report.pdf",
        fileType: "pdf",
        fileSize: 2400000,
        uploadedBy: "teacher-001",
        uploadedByName: "Dr. Rahman Khan",
        studentId: "student-001",
        studentName: "Ariful Islam",
        status: "accepted",
        similarityPercentage: 12,
        verdict: "accepted",
        verdictBy: "teacher-001",
        verdictByName: "Dr. Rahman Khan",
        verdictAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "report-002",
        fileName: "EEE201_Lab_Report.docx",
        fileType: "docx",
        fileSize: 1800000,
        uploadedBy: "teacher-001",
        uploadedByName: "Dr. Rahman Khan",
        studentId: "student-002",
        studentName: "Fatima Noor",
        status: "rejected",
        similarityPercentage: 45,
        verdict: "rejected",
        verdictBy: "teacher-001",
        verdictByName: "Dr. Rahman Khan",
        verdictAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "report-003",
        fileName: "CSE327_Project_Proposal.pdf",
        fileType: "pdf",
        fileSize: 3200000,
        uploadedBy: "student-001",
        uploadedByName: "Ariful Islam",
        studentId: "student-001",
        studentName: "Ariful Islam",
        status: "pending",
        similarityPercentage: null,
        verdict: null,
        verdictBy: null,
        verdictByName: null,
        verdictAt: null,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "report-004",
        fileName: "CSE373_Algorithm_Analysis.pdf",
        fileType: "pdf",
        fileSize: 1500000,
        uploadedBy: "student-002",
        uploadedByName: "Fatima Noor",
        studentId: "student-002",
        studentName: "Fatima Noor",
        status: "processing",
        similarityPercentage: 22,
        verdict: null,
        verdictBy: null,
        verdictByName: null,
        verdictAt: null,
        createdAt: new Date().toISOString(),
      },
    ],
  }
}

function getData(): DatabaseSchema {
  if (typeof window === "undefined") return getDefaultData()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  const defaultData = getDefaultData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
  return defaultData
}

function saveData(data: DatabaseSchema) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getUsers(): User[] {
  return getData().users
}

export function getUser(id: string): User | undefined {
  return getData().users.find((u) => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return getData().users.find((u) => u.email === email)
}

export function createUser(user: User): User {
  const data = getData()
  data.users.push(user)
  saveData(data)
  return user
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const data = getData()
  const index = data.users.findIndex((u) => u.id === id)
  if (index === -1) return undefined
  data.users[index] = { ...data.users[index], ...updates }
  saveData(data)
  return data.users[index]
}

export function deleteUser(id: string): boolean {
  const data = getData()
  const index = data.users.findIndex((u) => u.id === id)
  if (index === -1) return false
  data.users.splice(index, 1)
  saveData(data)
  return true
}

export function getReports(): Report[] {
  return getData().reports
}

export function getReportsByStudent(studentId: string): Report[] {
  return getData().reports.filter((r) => r.studentId === studentId)
}

export function getReportsByUploader(uploaderId: string): Report[] {
  return getData().reports.filter((r) => r.uploadedBy === uploaderId)
}

export function createReport(report: Report): Report {
  const data = getData()
  data.reports.push(report)
  saveData(data)
  return report
}

export function updateReport(id: string, updates: Partial<Report>): Report | undefined {
  const data = getData()
  const index = data.reports.findIndex((r) => r.id === id)
  if (index === -1) return undefined
  data.reports[index] = { ...data.reports[index], ...updates }
  saveData(data)
  return data.reports[index]
}

export function authenticate(email: string, password: string): User | null {
  const user = getUserByEmail(email)
  if (!user || user.password !== password) return null
  return user
}

export function resetStore() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
