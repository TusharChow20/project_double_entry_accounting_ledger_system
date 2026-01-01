import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - Fetch all accounts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    let sql = `
      SELECT 
        id,
        account_name,
        account_type,
        description,
        created_at
      FROM accounts
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (account_name ILIKE $${
        params.length + 1
      } OR description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (type) {
      sql += ` AND account_type = $${params.length + 1}`;
      params.push(type);
    }

    sql += ` ORDER BY account_type, account_name`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      accounts: result.rows,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST - Create a new account
export async function POST(request) {
  try {
    const body = await request.json();
    const { account_name, account_type, description } = body;

    // Validate required fields
    if (!account_name || !account_type) {
      return NextResponse.json(
        { success: false, error: "Account name and type are required" },
        { status: 400 }
      );
    }

    // Validate account type
    const validTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
    if (!validTypes.includes(account_type)) {
      return NextResponse.json(
        { success: false, error: "Invalid account type" },
        { status: 400 }
      );
    }

    // Check if account name already exists
    const existing = await query(
      "SELECT id FROM accounts WHERE account_name = $1",
      [account_name]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Account name already exists" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO accounts (account_name, account_type, description) 
       VALUES ($1, $2, $3) 
       RETURNING id, account_name, account_type, description, created_at`,
      [account_name, account_type, description || null]
    );

    return NextResponse.json({
      success: true,
      account: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}

// PUT - Update an account
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, account_name, account_type, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Check if account name already exists (excluding current account)
    const existing = await query(
      "SELECT id FROM accounts WHERE account_name = $1 AND id != $2",
      [account_name, id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Account name already exists" },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE accounts 
       SET account_name = $1, account_type = $2, description = $3
       WHERE id = $4
       RETURNING id, account_name, account_type, description, created_at`,
      [account_name, account_type, description || null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      account: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update account" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an account
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Check if account has transactions
    const hasTransactions = await query(
      "SELECT COUNT(*) as count FROM transaction_lines WHERE account_id = $1",
      [id]
    );

    if (parseInt(hasTransactions.rows[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete account with existing transactions",
        },
        { status: 400 }
      );
    }

    await query("DELETE FROM accounts WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
