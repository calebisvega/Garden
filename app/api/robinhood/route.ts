import { NextResponse } from "next/server";

/**
 * Robinhood holdings — future integration.
 *
 * Robinhood's MCP server (https://agent.robinhood.com/mcp/trading) is designed
 * for AI agents with per-user OAuth, not direct browser calls. A production
 * Garden flow would:
 * 1. Add Garden user accounts
 * 2. Run Robinhood OAuth per user (Agentic Trading account)
 * 3. Store tokens server-side and proxy get_equity_positions / get_equity_quotes
 *
 * Until then, seeds uses /api/stocks with tickers from preferences (Yahoo).
 */
export async function GET() {
  return NextResponse.json(
    {
      connected: false,
      positions: [],
      message:
        "Robinhood is not connected yet. Add tickers in preferences or connect Robinhood when account linking ships.",
    },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      connected: false,
      message: "Robinhood OAuth linking is not implemented yet.",
    },
    { status: 501 }
  );
}
