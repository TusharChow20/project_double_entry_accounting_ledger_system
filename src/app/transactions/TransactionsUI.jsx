"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

export default function TransactionsUI() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState([
    { account_id: "", debit_amount: "", credit_amount: "" },
    { account_id: "", debit_amount: "", credit_amount: "" },
  ]);

  const exportToCSV = () => {
    if (!transactions.length) {
      return Swal.fire("No data", "No transactions to export", "info");
    }

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

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const openCreateModal = () => {
    resetForm();
    setEditingTransaction(null);
    document.getElementById("transaction_modal").showModal();
  };

  /* ---------------- FETCH ---------------- */

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
    setLoading(false);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setDate(transaction.transaction_date.split("T")[0]);
    setDescription(transaction.description);

    setLines(
      transaction.lines.map((l) => ({
        account_id: String(l.account_id),
        debit_amount: l.debit_amount > 0 ? String(l.debit_amount) : "",
        credit_amount: l.credit_amount > 0 ? String(l.credit_amount) : "",
      }))
    );

    document.getElementById("transaction_modal").showModal();
  };

  /* ---------------- FORM LOGIC ---------------- */

  const addLine = () =>
    setLines([
      ...lines,
      { account_id: "", debit_amount: "", credit_amount: "" },
    ]);

  const removeLine = (index) => {
    if (lines.length > 2) setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;

    if (field === "debit_amount" && value) updated[index].credit_amount = "";
    if (field === "credit_amount" && value) updated[index].debit_amount = "";

    setLines(updated);
  };

  const totals = {
    debit: lines.reduce((s, l) => s + Number(l.debit_amount || 0), 0),
    credit: lines.reduce((s, l) => s + Number(l.credit_amount || 0), 0),
  };

  const totalDebits = totals.debit;
  const totalCredits = totals.credit;
  const isBalanced =
    Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;
  const difference = Math.abs(totalDebits - totalCredits);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isBalanced) {
      return Swal.fire("Invalid", "Debits must equal credits", "error");
    }

    const payload = {
      date,
      description,
      lines: lines.filter(
        (l) => l.account_id && (l.debit_amount || l.credit_amount)
      ),
    };

    const res = await fetch("/api/transactions", {
      method: editingTransaction ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingTransaction ? { ...payload, id: editingTransaction.id } : payload
      ),
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById("transaction_modal").close();
      await Swal.fire({
        icon: "success",
        title: editingTransaction ? "Updated" : "Created",
        timer: 1800,
        showConfirmButton: false,
      });
      resetForm();
      fetchTransactions();
    } else {
      Swal.fire("Error", data.error || "Failed", "error");
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    const ok = await Swal.fire({
      title: "Delete transaction?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
    });

    if (!ok.isConfirmed) return;

    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });

    Swal.fire("Deleted", "Transaction removed", "success");
    fetchTransactions();
  };

  const resetForm = () => {
    setEditingTransaction(null);
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setLines([
      { account_id: "", debit_amount: "", credit_amount: "" },
      { account_id: "", debit_amount: "", credit_amount: "" },
    ]);
  };

  const closeModal = () => {
    document.getElementById("transaction_modal").close();
    resetForm();
  };

  /* ---------------- UI ---------------- */

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
            className="px-6 py-3 bg-gray-800 rounded-lg shadow hover:shadow-lg transition border border-gray-700 font-semibold text-gray-100 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Search and Actions */}
        <div className="rounded-xl shadow-lg p-6 mb-6">
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
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
              onClick={openCreateModal}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Transactions History */}
        <div className="rounded-xl shadow-lg p-6">
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
                onClick={openCreateModal}
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
                    className=" border border-gray-800 rounded-lg p-4 hover:shadow-md hover:border-gray-600 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-gray-200">
                          {t.description}
                        </p>
                        <p className="text-sm text-gray-400">
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
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded transition"
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
                              <span className="text-green-400">
                                Dr ${l.debit_amount}
                              </span>
                            )}
                            {l.credit_amount > 0 && (
                              <span className="text-blue-400">
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-700 gap-4">
                  <p className="text-sm text-gray-300">
                    Page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition flex items-center gap-1"
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
                      className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition flex items-center gap-1"
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

        {/* modal seectionn  */}
        <dialog id="transaction_modal" className="modal modal-middle">
          <div className="modal-box max-w-4xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingTransaction ? "Edit Transaction" : "New Transaction"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Enter transaction details with balanced debits and credits
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Date and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Office supplies purchase"
                    className="w-full bg-gray-700/50 border border-gray-600 text-gray-100 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Transaction Lines */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Journal Entries
                  </label>
                  <span className="text-xs text-gray-500">
                    {lines.length} {lines.length === 1 ? "line" : "lines"}
                  </span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-gray-800/50 rounded-t-lg border-b border-gray-700">
                  <div className="col-span-5 text-xs font-semibold text-gray-400 uppercase">
                    Account
                  </div>
                  <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase text-right">
                    Debit
                  </div>
                  <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase text-right">
                    Credit
                  </div>
                  <div className="col-span-1"></div>
                </div>

                {/* Lines */}
                <div className="max-h-96 overflow-y-auto bg-gray-800/30 rounded-b-lg">
                  {lines.map((line, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors items-center"
                    >
                      {/* Account Select */}
                      <div className="col-span-5">
                        <select
                          value={line.account_id}
                          onChange={(e) =>
                            updateLine(index, "account_id", e.target.value)
                          }
                          className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select account...</option>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.account_name} • {acc.account_type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Debit */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={line.debit_amount}
                          onChange={(e) =>
                            updateLine(index, "debit_amount", e.target.value)
                          }
                          className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      {/* Credit */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={line.credit_amount}
                          onChange={(e) =>
                            updateLine(index, "credit_amount", e.target.value)
                          }
                          className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1 flex justify-center">
                        {lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1.5 rounded transition-colors"
                            title="Remove line"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Line Button */}
                <button
                  type="button"
                  onClick={addLine}
                  className="w-full mt-3 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-500/50 rounded-lg py-3 text-indigo-400 hover:bg-indigo-900/20 hover:border-indigo-500 transition-all"
                >
                  <Plus size={18} />
                  <span className="font-medium">Add Another Line</span>
                </button>
              </div>

              {/* Balance Summary */}
              <div
                className={`rounded-lg p-5 mb-6 transition-all ${
                  isBalanced
                    ? "bg-green-900/20 border-2 border-green-600/50"
                    : "bg-red-900/20 border-2 border-red-600/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">
                      Total Debits
                    </span>
                    <span className="text-2xl font-bold text-white">
                      ${totalDebits.toFixed(2)}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isBalanced
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                    }`}
                  >
                    {isBalanced ? (
                      <Check size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    <span className="font-semibold">
                      {isBalanced
                        ? "Balanced"
                        : `Off by $${difference.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 mb-1">
                      Total Credits
                    </span>
                    <span className="text-2xl font-bold text-white">
                      ${totalCredits.toFixed(2)}
                    </span>
                  </div>
                </div>

                {!isBalanced && totalDebits + totalCredits > 0 && (
                  <p className="text-sm text-red-400 text-center mt-2">
                    Debits must equal credits before saving
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isBalanced}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                    isBalanced
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/50"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {editingTransaction
                    ? "Update Transaction"
                    : "Create Transaction"}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-backdrop" onClick={closeModal}></div>
        </dialog>
      </div>
    </div>
  );
}
