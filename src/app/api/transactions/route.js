import { query, getClient } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - Fetch all transactions with pagination and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let sql = `
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
    `;

    const params = [];

    if (search) {
      sql += ` WHERE t.description ILIKE $1`;
      params.push(`%${search}%`);
    }

    sql += `
      GROUP BY t.id, t.transaction_date, t.description
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = "SELECT COUNT(*) as total FROM transactions";
    const countParams = [];

    if (search) {
      countSql += " WHERE description ILIKE $1";
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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

    await client.query("BEGIN");

    const transactionResult = await client.query(
      "INSERT INTO transactions (transaction_date, description) VALUES ($1, $2) RETURNING id",
      [date, description]
    );

    const transactionId = transactionResult.rows[0].id;

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

// PUT - Update an existing transaction
export async function PUT(request) {
  const client = await getClient();

  try {
    const body = await request.json();
    const { id, date, description, lines } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

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

    await client.query("BEGIN");

    // Update transaction header
    await client.query(
      "UPDATE transactions SET transaction_date = $1, description = $2 WHERE id = $3",
      [date, description, id]
    );

    // Delete existing lines
    await client.query(
      "DELETE FROM transaction_lines WHERE transaction_id = $1",
      [id]
    );

    // Insert new lines
    for (const line of lines) {
      await client.query(
        `INSERT INTO transaction_lines (transaction_id, account_id, debit_amount, credit_amount) 
         VALUES ($1, $2, $3, $4)`,
        [id, line.account_id, line.debit_amount || 0, line.credit_amount || 0]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      transactionId: id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update transaction" },
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
