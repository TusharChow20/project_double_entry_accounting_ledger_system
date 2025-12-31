"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState([
    { account_id: "", debit_amount: "", credit_amount: "" },
    { account_id: "", debit_amount: "", credit_amount: "" },
  ]);
  const [message, setMessage] = useState("");

  const fetchAccounts = async () => {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    if (data.success) setAccounts(data.accounts);
  };

  const fetchTransactions = async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    if (data.success) setTransactions(data.transactions);
    setLoading(false);
  };
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const addLine = () => {
    setLines([
      ...lines,
      { account_id: "", debit_amount: "", credit_amount: "" },
    ]);
  };

  const removeLine = (index) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    if (field === "debit_amount" && value) newLines[index].credit_amount = "";
    if (field === "credit_amount" && value) newLines[index].debit_amount = "";

    setLines(newLines);
  };

  const calculateTotals = () => {
    const totalDebits = lines.reduce(
      (sum, l) => sum + parseFloat(l.debit_amount || 0),
      0
    );
    const totalCredits = lines.reduce(
      (sum, l) => sum + parseFloat(l.credit_amount || 0),
      0
    );
    return { totalDebits, totalCredits };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { totalDebits, totalCredits } = calculateTotals();
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      setMessage("Debits must equal Credits");
      return;
    }

    const validLines = lines.filter(
      (l) => l.account_id && (l.debit_amount || l.credit_amount)
    );

    if (validLines.length < 2) {
      setMessage("At least 2 transaction lines required");
      return;
    }

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, description, lines: validLines }),
    });

    const data = await res.json();
    if (data.success) {
      setDescription("");
      setLines([
        { account_id: "", debit_amount: "", credit_amount: "" },
        { account_id: "", debit_amount: "", credit_amount: "" },
      ]);
      fetchTransactions();
    } else {
      setMessage(data.error);
    }
  };

  const deleteTransaction = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    fetchTransactions();
  };

  const { totalDebits, totalCredits } = calculateTotals();
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Transactions</h1>
          <Link href="/" className="px-4 py-2 rounded-lg border">
            ← Home
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-lg shadow-lg p-6 border">
            <h2 className="text-2xl font-bold mb-6">Create Transaction</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Description"
                required
              />

              {lines.map((line, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <select
                    value={line.account_id}
                    onChange={(e) =>
                      updateLine(index, "account_id", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={line.debit_amount}
                      onChange={(e) =>
                        updateLine(index, "debit_amount", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                      placeholder="Debit"
                    />
                    <input
                      type="number"
                      value={line.credit_amount}
                      onChange={(e) =>
                        updateLine(index, "credit_amount", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                      placeholder="Credit"
                    />
                  </div>

                  {lines.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="text-sm underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <div
                className={`border-2 rounded-lg p-3 ${
                  isBalanced ? "border-green-500" : "border-red-500"
                }`}
              >
                <div className="flex justify-between font-semibold">
                  <span>Debits: {totalDebits.toFixed(2)}</span>
                  <span>Credits: {totalCredits.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="w-full border rounded-lg py-3">
                Create Transaction
              </button>

              {message && (
                <div className="border rounded-lg p-3 text-center">
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* List */}
          <div className="rounded-lg shadow-lg p-6 border">
            <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div key={t.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-semibold">{t.description}</p>
                        <p className="text-sm">
                          {new Date(t.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="underline text-sm"
                      >
                        Delete
                      </button>
                    </div>

                    {t.lines.map((l, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm border rounded p-2"
                      >
                        <span>{l.account_name}</span>
                        <span>
                          {l.debit_amount > 0 && `Dr ${l.debit_amount}`}
                          {l.credit_amount > 0 && ` Cr ${l.credit_amount}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
