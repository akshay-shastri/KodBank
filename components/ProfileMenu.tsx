"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"

interface Props {
  accountNumber: string
}

export default function ProfileMenu({ accountNumber }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const maskedAccount = "XXXX-XXXX-" + accountNumber.slice(-4)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    router.push("/login")
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
        aria-label="Profile menu"
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
              Account
            </p>
            <p className="text-sm text-white font-mono">
              {maskedAccount}
            </p>
          </div>

          <div className="border-t border-white/10"></div>

          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
