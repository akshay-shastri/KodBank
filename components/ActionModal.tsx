"use client"

import { useState } from "react"

interface Props {
  type: string
  onClose: () => void
  onSuccess: (msg: string) => void
}

export default function ActionModal({ type, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)

    const body: any = { amount: Number(amount) }
    if (type === "transfer") {
      body.toAccount = recipient
      body.idempotencyKey = `${Date.now()}-${Math.random()}`
    }

    const res = await fetch(`/api/account/${type}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    setLoading(false)

    if (data.success) {
      onSuccess(`${type} successful`)
      onClose()
    } else {
      alert(data.message || "Transaction failed")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 rounded-2xl w-full max-w-md text-white space-y-6">
        <h2 className="text-2xl font-bold capitalize tracking-tight">{type}</h2>

        <input
          type="number"
          placeholder="Amount"
          className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 outline-none focus:border-white/40 transition text-white placeholder:text-gray-400"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {type === "transfer" && (
          <input
            type="text"
            placeholder="Recipient Account Number"
            className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/20 outline-none focus:border-white/40 transition text-white placeholder:text-gray-400"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        )}

        <div className="flex gap-4 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 rounded-xl py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 transition-all duration-300 rounded-xl py-3 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
