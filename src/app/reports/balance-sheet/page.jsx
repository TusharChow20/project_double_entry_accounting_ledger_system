"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, RefreshCw } from "lucide-react";

export default function BalanceSheetPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchReport();
  }, [asOfDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports?type=balance-sheet&startDate=2020-01-01&endDate=${asOfDate}`
      );
      const data = await res.json();
      if (data.success) {
        setReportData(data.report);
      }
    } catch (error) {
      console.error("Error fetching balance sheet:", error);
    }
    setLoading(false);
  };

  const assets = reportData.filter((r) => r.account_type === "Asset");
  const liabilities = reportData.filter((r) => r.account_type === "Liability");
  const equity = reportData.filter((r) => r.account_type === "Equity");

  const totalAssets = assets.reduce((s, r) => s + Number(r.balance), 0);
  const totalLiabilities = liabilities.reduce(
    (s, r) => s + Number(r.balance),
    0
  );
  const totalEquity = equity.reduce((s, r) => s + Number(r.balance), 0);

  return (
    <div className="min-h-screen bg-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              Balance Sheet
            </h1>
            <p className="text-gray-300">Snapshot of financial position</p>
          </div>
          <Link
            href="/reports"
            className="px-6 py-3 text-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 font-semibold text-gray-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Link>
        </div>

        <div className=" rounded-xl shadow-lg p-6 mb-6 ">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-50">
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                As of Date
              </label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchReport}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading balance sheet...</p>
          </div>
        ) : (
          <div className=" rounded-xl shadow-lg p-8 border border-gray-200">
            <h3 className="text-3xl font-bold mb-2 text-center text-gray-300">
              Balance Sheet
            </h3>
            <p className="text-center text-gray-200 mb-8">
              As of{" "}
              {new Date(asOfDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Assets */}
              <div className="border rounded-2xl border-green-200 p-3">
                <h4 className="text-2xl font-bold mb-4 p-3 rounded-lg text-amber-100">
                  ASSETS
                </h4>
                <table className="w-full">
                  <tbody>
                    {assets.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-3 text-gray-300">
                          {row.account_name}
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-400">
                          ${Number(row.balance).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="py-3 text-green-200">Total Assets</td>
                      <td className="py-3 text-right text-green-200">
                        ${totalAssets.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Liabilities & Equity */}
              <div className="border border-red-300 p-4 rounded-2xl">
                <h4 className="text-2xl font-bold mb-4 p-3  rounded-lg text-red-800">
                  LIABILITIES
                </h4>
                <table className="w-full mb-6">
                  <tbody>
                    {liabilities.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-3 text-gray-900">
                          {row.account_name}
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-900">
                          ${Math.abs(row.balance).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold  border-t-2 border-red-400">
                      <td className="py-3 text-red-300">Total Liabilities</td>
                      <td className="py-3 text-right text-red-300">
                        ${Math.abs(totalLiabilities).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h4 className="text-2xl font-bold mb-4 p-3  rounded-lg text-blue-100 mt-6">
                  EQUITY
                </h4>
                <table className="w-full">
                  <tbody>
                    {equity.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-3 text-gray-200">
                          {row.account_name}
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-300">
                          ${Math.abs(row.balance).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold border-t-2 border-blue-600">
                      <td className="py-3 text-blue-300">Total Equity</td>
                      <td className="py-3 text-right text-blue-300">
                        ${Math.abs(totalEquity).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Accounting Equation Check */}
            <div className="mt-8 p-6 rounded-lg border-2 border-gray-300">
              <p className="text-center text-lg font-semibold text-gray-200">
                Assets = Liabilities + Equity
              </p>
              <p className="text-center text-2xl font-bold text-gray-400 mt-2">
                ${totalAssets.toFixed(2)} = $
                {(Math.abs(totalLiabilities) + Math.abs(totalEquity)).toFixed(
                  2
                )}
              </p>
              {Math.abs(
                totalAssets -
                  (Math.abs(totalLiabilities) + Math.abs(totalEquity))
              ) < 0.01 ? (
                <p className="text-center text-green-600 font-semibold mt-2">
                  ✓ Balanced
                </p>
              ) : (
                <p className="text-center text-red-600 font-semibold mt-2">
                  ⚠ Not Balanced
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
