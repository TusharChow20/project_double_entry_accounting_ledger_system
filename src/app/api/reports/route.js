import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const startDate = searchParams.get("startDate") || "1970-01-01";
  const endDate =
    searchParams.get("endDate") || new Date().toISOString().split("T")[0];

  try {
    let result;

    if (type === "journal") {
      result = await query(
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
        JOIN accounts a ON tl.account_id = a.id
        WHERE t.transaction_date BETWEEN $1 AND $2
        ORDER BY t.transaction_date DESC, t.id DESC
        `,
        [startDate, endDate]
      );
    } else if (type === "balance-sheet") {
      result = await query(
        `
        SELECT 
          a.account_name,
          a.account_type,
          COALESCE(SUM(tl.debit_amount), 0) - COALESCE(SUM(tl.credit_amount), 0) AS balance
        FROM accounts a
        LEFT JOIN transaction_lines tl ON a.id = tl.account_id
        LEFT JOIN transactions t ON tl.transaction_id = t.id
        WHERE a.account_type IN ('Asset', 'Liability', 'Equity')
          AND (t.transaction_date IS NULL OR t.transaction_date <= $1)
        GROUP BY a.id, a.account_name, a.account_type
        HAVING COALESCE(SUM(tl.debit_amount), 0) - COALESCE(SUM(tl.credit_amount), 0) != 0
        ORDER BY a.account_type, a.account_name
        `,
        [endDate]
      );
    } else if (type === "income-statement") {
      result = await query(
        `
        SELECT 
          a.account_name,
          a.account_type,
          COALESCE(SUM(tl.credit_amount), 0) - COALESCE(SUM(tl.debit_amount), 0) AS amount
        FROM accounts a
        LEFT JOIN transaction_lines tl ON a.id = tl.account_id
        LEFT JOIN transactions t ON tl.transaction_id = t.id
        WHERE a.account_type IN ('Revenue', 'Expense')
          AND t.transaction_date BETWEEN $1 AND $2
        GROUP BY a.id, a.account_name, a.account_type
        HAVING COALESCE(SUM(tl.credit_amount), 0) - COALESCE(SUM(tl.debit_amount), 0) != 0
        ORDER BY a.account_type, a.account_name
        `,
        [startDate, endDate]
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid report type" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, report: result.rows });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
