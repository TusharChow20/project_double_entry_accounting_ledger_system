"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState([
    { account_id: "", debit_amount: "", credit_amount: "" },
    { account_id: "", debit_amount: "", credit_amount: "" },
  ]);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm]);

  const fetchAccounts = async () => {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    if (data.success) setAccounts(data.accounts);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    setLoading(false);
  };

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
    setMessage({ type: "", text: "" });

    const { totalDebits, totalCredits } = calculateTotals();
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      setMessage({ type: "error", text: "❌ Debits must equal Credits" });
      return;
    }

    const validLines = lines.filter(
      (l) => l.account_id && (l.debit_amount || l.credit_amount)
    );
    if (validLines.length < 2) {
      setMessage({
        type: "error",
        text: "❌ At least 2 transaction lines required",
      });
      return;
    }

    try {
      const method = editingTransaction ? "PUT" : "POST";
      const body = editingTransaction
        ? { id: editingTransaction.id, date, description, lines: validLines }
        : { date, description, lines: validLines };

      const res = await fetch("/api/transactions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `✓ Transaction ${
            editingTransaction ? "updated" : "created"
          } successfully!`,
        });
        resetForm();
        fetchTransactions();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: `❌ ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to save transaction" });
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setDate(transaction.transaction_date.split("T")[0]);
    setDescription(transaction.description);
    setLines(
      transaction.lines.map((line) => ({
        account_id: line.account_id.toString(),
        debit_amount: line.debit_amount > 0 ? line.debit_amount.toString() : "",
        credit_amount:
          line.credit_amount > 0 ? line.credit_amount.toString() : "",
      }))
    );
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage({
          type: "success",
          text: "✓ Transaction deleted successfully",
        });
        fetchTransactions();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to delete transaction" });
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setLines([
      { account_id: "", debit_amount: "", credit_amount: "" },
      { account_id: "", debit_amount: "", credit_amount: "" },
    ]);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Description", "Account", "Debit", "Credit"];
    const rows = transactions.flatMap((t) =>
      t.lines.map((line) => [
        t.transaction_date,
        t.description,
        line.account_name,
        line.debit_amount || 0,
        line.credit_amount || 0,
      ])
    );

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const { totalDebits, totalCredits } = calculateTotals();
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-200 mb-2">
              Transactions
            </h1>
            <p className="text-gray-300">
              Create and manage your accounting entries
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-800 rounded-lg shadow hover:shadow-lg transition border border-gray-200 font-semibold text-gray-100 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Message texts*/}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border-2 ${
              message.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search and Actions */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-6 ">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold shadow hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Transactions History */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 ">
          <h2 className="text-2xl font-bold mb-6 text-gray-200">
            Transaction History
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-300">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">No transactions found</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              >
                Create Your First Transaction
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-gray-200">
                          {t.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(t.transaction_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {t.lines.map((l, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm  rounded p-2"
                        >
                          <span className="font-medium text-gray-300">
                            {l.account_name}
                          </span>
                          <span className="font-semibold">
                            {l.debit_amount > 0 && (
                              <span className="text-green-700">
                                Dr ${l.debit_amount}
                              </span>
                            )}
                            {l.credit_amount > 0 && (
                              <span className="text-blue-700">
                                Cr ${l.credit_amount}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for bulk entities */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-300">
                    Page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(pagination.totalPages, p + 1)
                        )
                      }
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal for Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-200">
                {editingTransaction
                  ? "Edit Transaction"
                  : "Create New Transaction"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Sold goods to customer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction Lines
                  </label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {lines.map((line, index) => (
                      <div
                        key={index}
                        className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-500">
                            Line {index + 1}
                          </span>
                          {lines.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              className="text-red-600 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <select
                          value={line.account_id}
                          onChange={(e) =>
                            updateLine(index, "account_id", e.target.value)
                          }
                          className="w-full border rounded-lg px-3 py-2 mb-2"
                        >
                          <option value="">Select Account</option>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.account_name} ({acc.account_type})
                            </option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={line.debit_amount}
                            onChange={(e) =>
                              updateLine(index, "debit_amount", e.target.value)
                            }
                            className="border rounded-lg px-3 py-2"
                            placeholder="Debit"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={line.credit_amount}
                            onChange={(e) =>
                              updateLine(index, "credit_amount", e.target.value)
                            }
                            className="border rounded-lg px-3 py-2"
                            placeholder="Credit"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addLine}
                    className="mt-3 w-full border-2 border-dashed border-indigo-300 rounded-lg py-2 text-indigo-600 font-semibold hover:bg-indigo-50"
                  >
                    + Add Line
                  </button>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    isBalanced ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex justify-between font-semibold">
                    <span>Debits: ${totalDebits.toFixed(2)}</span>
                    <span>Credits: ${totalCredits.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isBalanced}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                      isBalanced
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {editingTransaction ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
