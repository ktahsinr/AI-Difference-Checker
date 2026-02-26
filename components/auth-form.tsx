"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UserRole } from "@/lib/types"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email").refine((e) => e.endsWith("@northsouth.edu"), {
    message: "Must use an NSU email (@northsouth.edu)",
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  nsuId: z.string().min(3, "NSU ID is required"),
  department: z.string().min(2, "Department is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof signupSchema>

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, signup } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<UserRole>("student")

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      nsuId: "",
      department: "",
    },
  })

  async function onLogin(data: LoginValues) {
    try {
      const result = await login(data.email, data.password)
      if (result.success) {
        toast.success("Welcome back!")
        router.push("/dashboard")
      } else {
        toast.error(result.error || "Login failed")
      }
    } catch (error) {
      toast.error("An error occurred during login")
    }
  }

  async function onSignup(data: SignupValues) {
    try {
      const result = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role,
        nsuId: data.nsuId,
        department: data.department,
      })
      if (result.success && role === "teacher") {
        toast.info("Account created. Awaiting admin approval before you can log in.")
        router.push("/login")
      } else if (result.success) {
        toast.success("Account created!")
        router.push("/dashboard")
      } else {
        toast.error(result.error || "Sign up failed")
      }
    } catch (error) {
      toast.error("An error occurred during signup")
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex lg:w-[480px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <GraduationCap className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <p className="font-bold tracking-wide">North South University</p>
            <p className="text-xs text-primary-foreground/70">Plagiarism Checker</p>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-balance">
            Ensuring Academic Integrity, One Report at a Time.
          </h2>
          <p className="text-sm leading-relaxed text-primary-foreground/70">
            Upload, analyze, and manage academic reports with our comprehensive
            plagiarism detection system designed for NSU faculty and students.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} North South University. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <GraduationCap className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="font-bold text-foreground">NSU Plagiarism Checker</p>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mb-8 mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to access your dashboard"
              : "Register with your NSU credentials"}
          </p>

          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@northsouth.edu"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Sign In
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Demo Credentials</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="font-medium text-foreground">Admin:</span> admin@northsouth.edu / admin123</p>
                  <p><span className="font-medium text-foreground">Teacher:</span> rahman.khan@northsouth.edu / teacher123</p>
                  <p><span className="font-medium text-foreground">Student:</span> ariful.islam@northsouth.edu / student123</p>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label>I am a</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...signupForm.register("name")} />
                {signupForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{signupForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-email">NSU Email</Label>
                <Input id="s-email" type="email" placeholder="you@northsouth.edu" {...signupForm.register("email")} />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nsuId">NSU ID</Label>
                  <Input id="nsuId" placeholder="2012345678" {...signupForm.register("nsuId")} />
                  {signupForm.formState.errors.nsuId && (
                    <p className="text-xs text-destructive">{signupForm.formState.errors.nsuId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="Computer Science" {...signupForm.register("department")} />
                  {signupForm.formState.errors.department && (
                    <p className="text-xs text-destructive">{signupForm.formState.errors.department.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-password">Password</Label>
                <div className="relative">
                  <Input
                    id="s-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    {...signupForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{signupForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  {...signupForm.register("confirmPassword")}
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Create Account
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
