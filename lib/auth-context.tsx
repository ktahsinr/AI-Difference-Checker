"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User, UserRole } from "./types"

interface AuthContextType {
  user: Omit<User, "password"> | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (data: {
    name: string
    email: string
    password: string
    role: UserRole
    nsuId: string
    department: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = "nsu_session"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)

  useEffect(() => {
    try {
      const session = sessionStorage.getItem(SESSION_KEY)
      if (session) {
        setUser(JSON.parse(session))
      }
    } catch {
      // ignore
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      const safeUser = data.user
      setUser(safeUser)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An error occurred during login' }
    }
  }, [])

  const signup = useCallback(
    async (data: {
      name: string
      email: string
      password: string
      role: UserRole
      nsuId: string
      department: string
    }) => {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          return { success: false, error: result.error || 'Signup failed' }
        }

        // Only auto-login students, teachers need admin approval
        if (data.role === 'student' && result.user) {
          const safeUser = result.user
          setUser(safeUser)
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
        }

        return { 
          success: true, 
          error: result.message || undefined 
        }
      } catch (error) {
        return { success: false, error: 'An error occurred during signup' }
      }
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
