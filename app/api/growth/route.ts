import { NextResponse } from "next/server";

/**
 * Growth goal shape
 */
export type GrowthGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  percent: number;
};

/**
 * GET /api/growth
 *
 * Currently returns a placeholder response indicating that
 * bank integration is not yet connected. The frontend uses
 * localStorage goals from usePreferences() directly.
 *
 * FUTURE: When Plaid is integrated, this route will:
 * 1. Accept a Plaid access_token (stored server-side)
 * 2. Call Plaid's /accounts/balance/get endpoint
 * 3. Map account balances to user-defined goals
 * 4. Return real-time balance data
 *
 * To integrate Plaid:
 * 1. npm install plaid
 * 2. Set env vars: PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV
 * 3. Create a /api/plaid/link-token route for Plaid Link
 * 4. Create a /api/plaid/exchange route to exchange public_token
 * 5. Store the access_token securely (encrypted in localStorage or a DB)
 * 6. Use this route to fetch balances on page load
 */
export async function GET() {
  return NextResponse.json({
    connected: false,
    provider: null,
    message: "No bank connected. Growth data is managed locally via preferences.",
    goals: [],
  });
}

/**
 * POST /api/growth
 * Body: { goals: GrowthGoal[] }
 *
 * Placeholder for future server-side goal persistence.
 * Currently the frontend manages goals in localStorage.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const goals: GrowthGoal[] = (body.goals ?? []).map((g: any) => ({
      id: g.id ?? "unknown",
      name: g.name ?? "Unnamed",
      targetAmount: g.targetAmount ?? 10000,
      currentAmount: g.currentAmount ?? 0,
      percent: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
    }));

    return NextResponse.json({
      connected: false,
      provider: "local",
      goals,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
