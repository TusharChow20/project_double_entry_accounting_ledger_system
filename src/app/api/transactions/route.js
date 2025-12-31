// app/api/transactions/route.js
// API endpoints for creating and fetching transactions

import { query, getClient } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - Fetch all transactions with their lines
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        t.id,
        t.transaction_date,
        t.description,
        json_agg(
          json_build_object(
            'account_id', tl.account_id,
            'account_name', a.account_name,
            'debit_amount', tl.debit_amount,
            'credit_amount', tl.credit_amount
          )
        ) as lines
      FROM transactions t
      JOIN transaction_lines tl ON t.id = tl.transaction_id
      JOIN accounts a ON tl.account_id = a.id
      GROUP BY t.id, t.transaction_date, t.description
      ORDER BY t.transaction_date DESC, t.id DESC
    `);

    return NextResponse.json({
      success: true,
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST - Create a new transaction
export async function POST(request) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { date, description, lines } = body;

    // Validate that debits equal credits
    const totalDebits = lines.reduce(
      (sum, line) => sum + parseFloat(line.debit_amount || 0),
      0
    );
    const totalCredits = lines.reduce(
      (sum, line) => sum + parseFloat(line.credit_amount || 0),
      0
    );

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        { success: false, error: "Debits must equal credits" },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query("BEGIN");

    // Insert transaction header
    const transactionResult = await client.query(
      "INSERT INTO transactions (transaction_date, description) VALUES ($1, $2) RETURNING id",
      [date, description]
    );

    const transactionId = transactionResult.rows[0].id;

    // Insert transaction lines
    for (const line of lines) {
      await client.query(
        `INSERT INTO transaction_lines (transaction_id, account_id, debit_amount, credit_amount) 
         VALUES ($1, $2, $3, $4)`,
        [
          transactionId,
          line.account_id,
          line.debit_amount || 0,
          line.credit_amount || 0,
        ]
      );
    }

    // Commit transaction
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      transactionId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// DELETE - Delete a transaction
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    await query("DELETE FROM transactions WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
