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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Accounts Management
            </h1>
            <p className="text-gray-600">Manage your chart of accounts</p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 font-semibold text-gray-700 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Message */}
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

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Types</option>
                  {accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-semibold shadow hover:bg-cyan-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Account
            </button>
          </div>
        </div>

        {/* Accounts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500 mb-4">No accounts found</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition"
            >
              Create Your First Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
              <div
                key={type}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      type === "Asset"
                        ? "bg-green-500"
                        : type === "Liability"
                        ? "bg-red-500"
                        : type === "Equity"
                        ? "bg-blue-500"
                        : type === "Revenue"
                        ? "bg-emerald-500"
                        : "bg-orange-500"
                    }`}
                  ></span>
                  {type}
                  <span className="text-sm font-normal text-gray-500">
                    ({typeAccounts.length})
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Account Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Description
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeAccounts.map((account) => (
                        <tr
                          key={account.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {account.account_name}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {account.description || (
                              <span className="text-gray-400 italic">
                                No description
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(account)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Edit account"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(account.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                title="Delete account"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                {editingAccount ? "Edit Account" : "Create New Account"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) =>
                      setFormData({ ...formData, account_name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="e.g., Cash, Accounts Receivable"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Type *
                  </label>
                  <select
                    value={formData.account_type}
                    onChange={(e) =>
                      setFormData({ ...formData, account_type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Type</option>
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Additional details about this account"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAccount(null);
                      setFormData({
                        account_name: "",
                        account_type: "",
                        description: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition"
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
