"use client"

import { useEffect } from "react"

interface Props {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-pulse">
      {message}
    </div>
  )
}