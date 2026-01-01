"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function IncomeStatementPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports?type=income-statement&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      if (data.success) {
        setReportData(data.report);
      }
    } catch (error) {
      console.error("Error fetching income statement:", error);
    }
    setLoading(false);
  };

  const revenues = reportData.filter((r) => r.account_type === "Revenue");
  const expenses = reportData.filter((r) => r.account_type === "Expense");

  const totalRevenue = revenues.reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = expenses.reduce((s, r) => s + Math.abs(r.amount), 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Income Statement
            </h1>
            <p className="text-gray-600">Profit & Loss Overview</p>
          </div>
          <Link
            href="/reports"
            className="px-6 py-3 bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 font-semibold text-gray-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchReport}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading income statement...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-2 text-center text-gray-900">
              Income Statement
            </h3>
            <p className="text-center text-gray-600 mb-8">
              {new Date(startDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              –{" "}
              {new Date(endDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {/* Revenue Section */}
            <div className="mb-8">
              <h4 className="text-2xl font-bold mb-4 p-3 bg-green-50 rounded-lg text-green-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                REVENUE
              </h4>
              <table className="w-full">
                <tbody>
                  {revenues.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 text-gray-900">{row.account_name}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">
                        ${Number(row.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-green-50 border-t-2 border-green-600">
                    <td className="py-3 text-green-800">Total Revenue</td>
                    <td className="py-3 text-right text-green-800">
                      ${totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Expenses Section */}
            <div className="mb-8">
              <h4 className="text-2xl font-bold mb-4 p-3 bg-red-50 rounded-lg text-red-800 flex items-center gap-2">
                <TrendingDown className="w-6 h-6" />
                EXPENSES
              </h4>
              <table className="w-full">
                <tbody>
                  {expenses.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 text-gray-900">{row.account_name}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">
                        ${Math.abs(row.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-red-50 border-t-2 border-red-600">
                    <td className="py-3 text-red-800">Total Expenses</td>
                    <td className="py-3 text-right text-red-800">
                      ${totalExpenses.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Net Income */}
            <div
              className={`p-6 rounded-lg text-center ${
                netIncome >= 0
                  ? "bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-500"
                  : "bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-500"
              }`}
            >
              <p className="text-sm font-semibold text-gray-700 mb-2">
                NET INCOME
              </p>
              <p
                className={`text-4xl font-bold ${
                  netIncome >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                ${netIncome.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {netIncome >= 0 ? "✓ Profitable Period" : "⚠ Loss Period"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
