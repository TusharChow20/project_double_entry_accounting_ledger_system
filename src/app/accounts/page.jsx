"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Plus, Edit2, Trash2, Search, Filter } from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    account_name: "",
    account_type: "",
    description: "",
  });

  const accountTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

  useEffect(() => {
    fetchAccounts();
  }, [searchTerm, filterType]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterType) params.append("type", filterType);

      const res = await fetch(`/api/accounts?${params}`);
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const method = editingAccount ? "PUT" : "POST";
      const body = editingAccount
        ? { ...formData, id: editingAccount.id }
        : formData;

      const res = await fetch("/api/accounts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `✓ Account ${
            editingAccount ? "updated" : "created"
          } successfully!`,
        });
        setShowModal(false);
        setEditingAccount(null);
        setFormData({ account_name: "", account_type: "", description: "" });
        fetchAccounts();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: `❌ ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to save account" });
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      account_name: account.account_name,
      account_type: account.account_type,
      description: account.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "✓ Account deleted successfully" });
        fetchAccounts();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: `❌ ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to delete account" });
    }
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormData({ account_name: "", account_type: "", description: "" });
    setShowModal(true);
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Accounts Management</h1>
            <p className="opacity-70">Manage your chart of accounts</p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition border border-gray-700 font-semibold flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Status Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-900/30 border-green-500 text-green-200"
                : "bg-red-900/30 border-red-500 text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-800 text-white">
                    All Types
                  </option>
                  {accountTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="bg-gray-800 text-white"
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-semibold shadow hover:bg-cyan-500 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Account
            </button>
          </div>
        </div>

        {/* Accounts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
            <p className="opacity-50 mb-4">No accounts found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
              <div
                key={type}
                className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700"
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
                  {type}
                  <span className="text-sm font-normal opacity-50">
                    ({typeAccounts.length})
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold opacity-70">
                          Account Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold opacity-70">
                          Description
                        </th>
                        <th className="text-right py-3 px-4 font-semibold opacity-70">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeAccounts.map((account) => (
                        <tr
                          key={account.id}
                          className="border-b border-gray-700/50 hover:bg-gray-900/50 transition"
                        >
                          <td className="py-3 px-4 font-medium">
                            {account.account_name}
                          </td>
                          <td className="py-3 px-4 text-sm opacity-60">
                            {account.description || "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(account)}
                                className="p-2 hover:bg-gray-700 rounded text-cyan-400 transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(account.id)}
                                className="p-2 hover:bg-gray-700 rounded text-red-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">
                {editingAccount ? "Edit Account" : "Create New Account"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-80">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) =>
                      setFormData({ ...formData, account_name: e.target.value })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-80">
                    Account Type *
                  </label>
                  <select
                    value={formData.account_type}
                    onChange={(e) =>
                      setFormData({ ...formData, account_type: e.target.value })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none appearance-none"
                    required
                  >
                    <option value="" className="bg-gray-800 text-white">
                      Select Type
                    </option>
                    {accountTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                        className="bg-gray-800 text-white"
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-80">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    rows="3"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-500 transition"
                  >
                    {editingAccount ? "Update" : "Create"}
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
