import Link from "next/link";
import { Plus, FileText, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-100 bg-clip-text ">
              Accounting Ledger System
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300">
              Double-Entry Bookkeeping Made Simple
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Link href="/accounts">
              <div className=" rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition cursor-pointer border-2 border-cyan-100 hover:border-cyan-300 h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full p-4 mb-4  border-2 border-cyan-200">
                    <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-300">
                    Accounts
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400">
                    Manage your chart of accounts. Create and organize assets,
                    liabilities, equity, revenue, and expenses.
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/transactions">
              <div className=" rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition cursor-pointer border-2 border-indigo-100 hover:border-indigo-300 h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full p-4 mb-4  border-2 border-indigo-200">
                    <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-300">
                    Transactions
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400">
                    Create, view, and manage accounting transactions. Record
                    sales, purchases, receipts, and payments.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/reports">
              <div className=" rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition cursor-pointer border-2 border-purple-100 hover:border-purple-300 h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full p-4 mb-4  border-2 border-purple-200">
                    <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-300">
                    Reports
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400">
                    Generate financial reports including Journal, Balance Sheet,
                    and Income Statement.
                  </p>
                </div>
              </div>
            </Link>
          </div>
          {/* set up guidelines  */}
          <div className=" rounded-xl shadow-lg p-6 sm:p-8 border-2 border-gray-100">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-300 text-center">
              Quick Start Guide
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 border-2 border-cyan-300 text-cyan-700 font-bold text-lg">
                  1
                </div>
                <h4 className="font-bold text-gray-300 mb-2">
                  Set Up Accounts
                </h4>
                <p className="text-sm text-gray-400">
                  Create your chart of accounts with assets, liabilities,
                  equity, revenue, and expense accounts.
                </p>
              </div>

              <div className="text-center">
                <div className="rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3  border-2 border-indigo-300 text-indigo-700 font-bold text-lg">
                  2
                </div>
                <h4 className="font-bold text-gray-300 mb-2">
                  Record Transactions
                </h4>
                <p className="text-sm text-gray-400">
                  Add transactions with balanced debits and credits. Every entry
                  must follow double-entry rules.
                </p>
              </div>

              <div className="text-center">
                <div className="rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 border-2 border-purple-300 text-purple-700 font-bold text-lg">
                  3
                </div>
                <h4 className="font-bold text-gray-300 mb-2">
                  Generate Reports
                </h4>
                <p className="text-sm text-gray-400">
                  View financial statements including journal entries, balance
                  sheet, and income statement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
