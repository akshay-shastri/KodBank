"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AccountData {
  accountNumber: string;
  balance: number;
}

interface Transaction {
  _id: string;
  type: "deposit" | "withdraw" | "transfer";
  amount: number;
  fromAccount?: string;
  toAccount?: string;
  createdAt: string;
}

function DashboardContent() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeAction, setActiveAction] = useState<"deposit" | "withdraw" | "transfer" | null>(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  
  // Filters and search
  const [filterType, setFilterType] = useState<string>("all");
  const [searchAccount, setSearchAccount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    const token =
      localStorage.getItem("token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

    if (!token) return;

    const accRes = await fetch("/api/account/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const accData = await accRes.json();

    const txRes = await fetch("/api/transactions?page=1&limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const txData = await txRes.json();

    if (accData.success) setAccount(accData.data);
    if (txData.success) {
      setTransactions(txData.data.transactions);
      setFilteredTransactions(txData.data.transactions);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token =
        localStorage.getItem("token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

      if (!token) {
        router.push("/login");
        return;
      }
      await fetchData();
      setLoading(false);
    };
    init();
  }, [router]);

  // Apply filters
  useEffect(() => {
    let filtered = transactions;

    if (filterType !== "all") {
      filtered = filtered.filter((tx) => tx.type === filterType);
    }

    if (searchAccount) {
      filtered = filtered.filter(
        (tx) =>
          tx.fromAccount?.includes(searchAccount) ||
          tx.toAccount?.includes(searchAccount)
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [filterType, searchAccount, transactions]);

  const handleAction = async () => {
    const token =
      localStorage.getItem("token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

    if (!token || !activeAction) return;

    const endpoint =
      activeAction === "deposit"
        ? "/api/account/deposit"
        : activeAction === "withdraw"
        ? "/api/account/withdraw"
        : "/api/account/transfer";

    const body =
      activeAction === "transfer"
        ? {
            amount: Number(amount),
            toAccount: recipient,
            idempotencyKey: `${Date.now()}-${Math.random()}`,
          }
        : { amount: Number(amount) };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      await fetchData();
      alert("Success!");
    } else {
      alert(data.message || "Transaction failed");
    }

    setActiveAction(null);
    setAmount("");
    setRecipient("");
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics
  const depositTotal = transactions
    .filter((tx) => tx.type === "deposit")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const withdrawTotal = transactions
    .filter((tx) => tx.type === "withdraw")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const transferTotal = transactions
    .filter((tx) => tx.type === "transfer")
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">KodBank Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            document.cookie = "token=; path=/; max-age=0";
            router.push("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {account && (
        <div className="mb-6 p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
          <p className="text-sm opacity-80">Account Number</p>
          <p className="text-lg tracking-wider">{account.accountNumber}</p>
          <p className="text-sm mt-6 opacity-80">Available Balance</p>
          <p className="text-4xl font-bold mt-1">
            ₹ {account.balance.toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex gap-4 mb-10">
        <button
          onClick={() => setActiveAction("deposit")}
          className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveAction("withdraw")}
          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700"
        >
          Withdraw
        </button>
        <button
          onClick={() => setActiveAction("transfer")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
        >
          Transfer
        </button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Deposits</p>
          <p className="text-2xl font-bold text-green-600">
            ₹ {depositTotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Withdrawals</p>
          <p className="text-2xl font-bold text-red-600">
            ₹ {withdrawTotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Transfers</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹ {transferTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by account number..."
            value={searchAccount}
            onChange={(e) => setSearchAccount(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-3 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-4 mb-6">
        {paginatedTransactions.map((tx) => {
          const typeColor =
            tx.type === "deposit"
              ? "text-green-600"
              : tx.type === "withdraw"
              ? "text-red-600"
              : "text-blue-600";

          return (
            <div
              key={tx._id}
              className="p-4 bg-white rounded-xl shadow-sm flex justify-between items-center"
            >
              <div>
                <p className={`font-semibold capitalize ${typeColor}`}>
                  {tx.type}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(tx.createdAt).toLocaleString()}
                </p>
                {tx.fromAccount && (
                  <p className="text-xs text-gray-400">From: {tx.fromAccount}</p>
                )}
                {tx.toAccount && (
                  <p className="text-xs text-gray-400">To: {tx.toAccount}</p>
                )}
              </div>
              <p className={`font-bold ${typeColor}`}>
                ₹ {tx.amount.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Action Modal */}
      {activeAction && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4 capitalize">{activeAction}</h2>
            {activeAction === "transfer" && (
              <input
                type="text"
                placeholder="Recipient Account Number"
                className="w-full mb-4 p-3 border rounded-lg"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            )}
            <input
              type="number"
              placeholder="Amount"
              className="w-full mb-6 p-3 border rounded-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={() => setActiveAction(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
