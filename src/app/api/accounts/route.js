import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM accounts ORDER BY account_type, account_name"
    );

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
