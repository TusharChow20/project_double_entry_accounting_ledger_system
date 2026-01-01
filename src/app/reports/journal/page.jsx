"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, RefreshCw } from "lucide-react";

export default function JournalPage() {
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
        `/api/reports?type=journal&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      if (data.success) {
        setReportData(data.report);
      }
    } catch (error) {
      console.error("Error fetching journal:", error);
    }
    setLoading(false);
  };

  const groupedTransactions = reportData.reduce((acc, row) => {
    if (!acc[row.id]) {
      acc[row.id] = {
        id: row.id,
        date: row.transaction_date,
        description: row.description,
        lines: [],
      };
    }
    acc[row.id].lines.push({
      account: row.account_name,
      debit: parseFloat(row.debit_amount),
      credit: parseFloat(row.credit_amount),
    });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Journal Report
            </h1>
            <p className="text-gray-600">
              Chronological list of all transactions
            </p>
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchReport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading journal entries...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(groupedTransactions).map((trans) => (
              <div
                key={trans.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {trans.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(trans.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    ID: {trans.id}
                  </span>
                </div>

                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Account
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Debit
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trans.lines.map((line, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-900">
                          {line.account}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {line.debit > 0 ? `$${line.debit.toFixed(2)}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {line.credit > 0 ? `$${line.credit.toFixed(2)}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {Object.keys(groupedTransactions).length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  No transactions found in this period.
                </p>
                <Link
                  href="/transactions"
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Create your first transaction →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
