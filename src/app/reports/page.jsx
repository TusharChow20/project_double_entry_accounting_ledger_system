import Link from "next/link";
import { FileText, BarChart3, DollarSign } from "lucide-react";

export const metadata = {
  title: "Financial Reports | Accounting Ledger",
  description:
    "Access all financial reports including journal, balance sheet, and income statement",
};

export default function ReportsPage() {
  const reports = [
    {
      title: "Journal Report",
      description:
        "Chronological list of all transactions with debits and credits",
      href: "/reports/journal",
      icon: FileText,
      color: "blue",
    },
    {
      title: "Balance Sheet",
      description:
        "Current financial position showing assets, liabilities, and equity",
      href: "/reports/balance-sheet",
      icon: BarChart3,
      color: "green",
    },
    {
      title: "Income Statement",
      description: "Profit and loss statement showing revenues and expenses",
      href: "/reports/income-statement",
      icon: DollarSign,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Financial Reports
            </h1>
            <p className="text-gray-600">
              Select a report to view detailed financial information
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 font-semibold text-gray-700"
          >
            ← Home
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Link key={report.href} href={report.href}>
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer border border-gray-200 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`rounded-full p-4 mb-4 bg-${report.color}-50`}
                    >
                      <Icon className={`w-8 h-8 text-${report.color}-600`} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">
                      {report.title}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {report.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            About Financial Reports
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Journal:</strong> Shows every transaction in chronological
              order, displaying which accounts were debited and credited.
            </p>
            <p>
              <strong>Balance Sheet:</strong> Displays your financial position
              at a specific point in time, following the accounting equation:
              Assets = Liabilities + Equity.
            </p>
            <p>
              <strong>Income Statement:</strong> Shows profitability over a
              period by summarizing revenues and expenses to calculate net
              income.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
