"use client"

interface Transaction {
  _id: string
  type: "deposit" | "withdraw" | "transfer"
  amount: number
  createdAt: string
  relatedAccount?: string
}

interface Props {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-white mb-8 tracking-tight">
        Recent Transactions
      </h2>

      <div className="space-y-4">
        {transactions.map((txn) => {
          const isDeposit = txn.type === "deposit"
          const isWithdraw = txn.type === "withdraw"

          const glowColor =
            isDeposit
              ? "shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              : isWithdraw
              ? "shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              : "shadow-[0_0_15px_rgba(59,130,246,0.3)]"

          const accentGlow =
            isDeposit
              ? "before:bg-green-500/50"
              : isWithdraw
              ? "before:bg-red-500/50"
              : "before:bg-blue-500/50"

          const amountColor =
            isDeposit
              ? "text-green-400"
              : isWithdraw
              ? "text-red-400"
              : "text-blue-400"

          return (
            <div
              key={txn._id}
              className={`relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 flex justify-between items-center hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-xl before:blur-sm ${accentGlow} ${glowColor}`}
            >
              <div>
                <p className="text-white font-semibold capitalize tracking-wide">
                  {txn.type}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(txn.createdAt).toLocaleString()}
                </p>
                {txn.relatedAccount && (
                  <p className="text-gray-500 text-xs mt-1 font-mono">
                    {txn.relatedAccount}
                  </p>
                )}
              </div>

              <p className={`font-bold text-lg ${amountColor}`}>
                {isDeposit ? "+" : "-"}₹ {txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )
        })}

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
