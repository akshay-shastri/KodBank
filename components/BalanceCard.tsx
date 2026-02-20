"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"

interface Props {
  balance: number
  accountNumber: string
}

export default function BalanceCard({ balance, accountNumber }: Props) {
  const [animatedBalance, setAnimatedBalance] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let start = 0
    const duration = 600
    const increment = balance / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= balance) {
        start = balance
        clearInterval(counter)
      }
      setAnimatedBalance(start)
    }, 16)

    return () => clearInterval(counter)
  }, [balance])

  const maskedAccount = "XXXX-XXXX-" + accountNumber.slice(-4)

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8">
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-50"></div>

      <div className="relative z-10 text-white">
        <p className="text-xs uppercase tracking-widest opacity-60 font-medium">
          Available Balance
        </p>

        {/* Balance with neon glow and visibility toggle */}
        <div className="relative mt-4 flex items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-indigo-400/30 to-purple-400/30"></div>
            <h1 className="relative text-5xl font-bold tracking-tight transition-opacity duration-200">
              {isVisible ? (
                `₹ ${animatedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ) : (
                "₹ ••••••"
              )}
            </h1>
          </div>

          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-white/70 hover:text-white transition duration-200 p-2 rounded-lg hover:bg-white/10"
            aria-label={isVisible ? "Hide balance" : "Show balance"}
          >
            {isVisible ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest opacity-60 font-medium">
            {maskedAccount}
          </span>
          <span className="text-xs opacity-50">Updated now</span>
        </div>
      </div>
    </div>
  )
}
