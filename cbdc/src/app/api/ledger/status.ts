// SECURITY: This endpoint simulates checking transaction status. In production, use a secure database and implement authentication/authorization.
import { NextRequest, NextResponse } from 'next/server';

// Use the same in-memory ledger as submit.ts
const ledger: Record<string, { status: string; tx: any; block: number; timestamp: number }> = {};

export async function GET(req: NextRequest) {
  // SECURITY: Validate txHash input strictly to prevent abuse.
  const { searchParams } = new URL(req.url);
  const txHash = searchParams.get('txHash');
  if (!txHash || !ledger[txHash]) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }
  return NextResponse.json({
    txHash,
    status: ledger[txHash].status,
    block: ledger[txHash].block,
    timestamp: ledger[txHash].timestamp,
    tx: ledger[txHash].tx,
  });
} 