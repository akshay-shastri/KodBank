"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push("/dashboard")
      } else {
        alert(data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-black relative overflow-hidden">
      {/* Ambient radial highlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

      {/* Glass Auth Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Ambient glow behind card */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-2xl"></div>

        <form
          onSubmit={handleLogin}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-10 space-y-6"
        >
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Welcome to KodBank
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to access your account
            </p>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-gray-300 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-gray-300 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl py-3 font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Footer Link */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-gray-400 hover:text-white transition duration-200 underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
