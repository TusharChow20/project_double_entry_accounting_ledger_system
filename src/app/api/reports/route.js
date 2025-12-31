// app/api/reports/route.js
// API endpoint for generating financial reports

import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("type");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    if (reportType === "journal") {
      // Journal Report - All transactions chronologically
      const result = await query(
        `
        SELECT 
          t.id,
          t.transaction_date,
          t.description,
          a.account_name,
          tl.debit_amount,
          tl.credit_amount
        FROM transactions t
        JOIN transaction_lines tl ON t.id = tl.transaction_id
        JOIN accounts a ON tl.account_id = a.account_id
        WHERE t.transaction_date BETWEEN $1 AND $2
        ORDER BY t.transaction_date, t.id, tl.id
      `,
        [startDate || "1970-01-01", endDate || "2099-12-31"]
      );

      return NextResponse.json({
        success: true,
        report: result.rows,
      });
    }

    if (reportType === "balance-sheet") {
      // Balance Sheet - Assets = Liabilities + Equity
      const result = await query(
        `
        SELECT 
          a.account_name,
          a.account_type,
          SUM(tl.debit_amount) - SUM(tl.credit_amount) as balance
        FROM accounts a
        LEFT JOIN transaction_lines tl ON a.id = tl.account_id
        LEFT JOIN transactions t ON tl.transaction_id = t.id
        WHERE a.account_type IN ('Asset', 'Liability', 'Equity')
          AND (t.transaction_date IS NULL OR t.transaction_date <= $1)
        GROUP BY a.id, a.account_name, a.account_type
        HAVING SUM(tl.debit_amount) - SUM(tl.credit_amount) != 0
        ORDER BY a.account_type, a.account_name
      `,
        [endDate || new Date().toISOString().split("T")[0]]
      );

      return NextResponse.json({
        success: true,
        report: result.rows,
      });
    }

    if (reportType === "income-statement") {
      // Income Statement - Revenue - Expenses = Net Income
      const result = await query(
        `
        SELECT 
          a.account_name,
          a.account_type,
          SUM(tl.credit_amount) - SUM(tl.debit_amount) as amount
        FROM accounts a
        LEFT JOIN transaction_lines tl ON a.id = tl.account_id
        LEFT JOIN transactions t ON tl.transaction_id = t.id
        WHERE a.account_type IN ('Revenue', 'Expense')
          AND t.transaction_date BETWEEN $1 AND $2
        GROUP BY a.id, a.account_name, a.account_type
        ORDER BY a.account_type DESC, a.account_name
      `,
        [
          startDate || "1970-01-01",
          endDate || new Date().toISOString().split("T")[0],
        ]
      );

      return NextResponse.json({
        success: true,
        report: result.rows,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid report type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
