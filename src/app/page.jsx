import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Accounting Ledger System
            </h1>
            <p className="text-base sm:text-lg md:text-xl">
              Double-Entry Bookkeeping Made Simple
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* all transactioons  */}
            <Link href="/transactions">
              <div className="rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition cursor-pointer border">
                <div className="flex items-center mb-4">
                  <div className="rounded-full p-3 mr-4 border">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Transactions
                  </h2>
                </div>
                <p className="text-sm sm:text-base">
                  Create, view, and manage accounting transactions. Record
                  sales, purchases, receipts, and payments.
                </p>
              </div>
            </Link>

            {/* generate report  */}
            <Link href="/reports">
              <div className="rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition cursor-pointer border">
                <div className="flex items-center mb-4">
                  <div className="rounded-full p-3 mr-4 border">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">Reports</h2>
                </div>
                <p className="text-sm sm:text-base">
                  Generate financial reports including Journal, Balance Sheet,
                  and Income Statement.
                </p>
              </div>
            </Link>
          </div>
          {/* guidelines -------------- */}
          <div className="mt-10 sm:mt-12 rounded-lg shadow-lg p-6 sm:p-8 border">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Quick Guide</h3>

            <div className="space-y-4 text-sm sm:text-base">
              {[
                {
                  n: 1,
                  title: "Add Transactions",
                  text: "Every transaction must have equal debits and credits",
                },
                {
                  n: 2,
                  title: "View Journal",
                  text: "See all transactions in chronological order",
                },
                {
                  n: 3,
                  title: "Check Reports",
                  text: "Generate Balance Sheet and Income Statement",
                },
              ].map((item) => (
                <div key={item.n} className="flex items-start">
                  <span className="rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 shrink-0 border">
                    {item.n}
                  </span>
                  <p>
                    <strong>{item.title}:</strong> {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
