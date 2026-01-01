import Link from "next/link";
import { FileText, BarChart3, DollarSign, MoveLeft } from "lucide-react";

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
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col-reverse md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              Financial Reports
            </h1>
            <p className="text-gray-300">
              Select a report to view detailed financial information
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 hover:bg-amber-100 hover:text-black rounded-lg shadow hover:shadow-lg transition border border-gray-200 font-semibold text-gray-300"
          >
            <div className="flex">
              <MoveLeft></MoveLeft> Home
            </div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Link key={report.href} href={report.href}>
                <div className="e rounded-xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer border border-gray-200 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`rounded-full p-4 mb-4 bg-${report.color}-50`}
                    >
                      <Icon className={`w-8 h-8 text-${report.color}-600`} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-200">
                      {report.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {report.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
