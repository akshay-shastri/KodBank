"use client"

import { useEffect, useState } from "react"
import BalanceCard from "@/components/BalanceCard"
import TransactionList from "@/components/TransactionList"
import ActionModal from "@/components/ActionModal"
import Toast from "@/components/Toast"
import ProfileMenu from "@/components/ProfileMenu"

export default function Dashboard() {
  const [account, setAccount] = useState<any>(null)
  const [transactions, setTransactions] = useState([])
  const [modalType, setModalType] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const fetchData = async () => {
    const accRes = await fetch("/api/account/me", {
      credentials: "include",
    })
    const accData = await accRes.json()
    
    if (accData.success) {
      setAccount(accData.account)
    }

    const txnRes = await fetch("/api/transactions?page=1&limit=10", {
      credentials: "include",
    })
    const txnData = await txnRes.json()
    
    if (txnData.success) {
      setTransactions(txnData.data.transactions || [])
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black relative overflow-hidden">
      {/* Ambient radial highlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Top Header Bar */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">KodBank</h1>
            </div>
            {account && <ProfileMenu accountNumber={account.accountNumber} />}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-12">

            {/* Page Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-gray-400 text-sm tracking-wide">Welcome back to your financial overview</p>
            </div>

            {/* Top Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {account && (
                <BalanceCard
                  balance={account.balance}
                  accountNumber={account.accountNumber}
                />
              )}

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 flex flex-col justify-center">
                <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">Quick Actions</h2>

                <div className="flex gap-4">
                  <button
                    onClick={() => setModalType("deposit")}
                    className="relative flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl py-4 font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                  >
                    Deposit
                  </button>

                  <button
                    onClick={() => setModalType("withdraw")}
                    className="relative flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl py-4 font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                  >
                    Withdraw
                  </button>

                  <button
                    onClick={() => setModalType("transfer")}
                    className="relative flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl py-4 font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <TransactionList transactions={transactions} />

          </div>
        </div>
      </div>

      {modalType && (
        <ActionModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSuccess={(msg) => {
            setToast(msg)
            fetchData()
          }}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
