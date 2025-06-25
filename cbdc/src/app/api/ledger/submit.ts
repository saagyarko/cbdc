// SECURITY: This endpoint simulates submitting a transaction to a ledger. In production, use a secure database and implement authentication/authorization.
import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo (would be a DB in real app)
const ledger: Record<string, { status: string; tx: any; block: number; timestamp: number }> = {};

export async function POST(req: NextRequest) {
  // SECURITY: Validate transaction input strictly to prevent injection or abuse.
  const tx = await req.json();
  const txHash = '0x' + Math.random().toString(16).slice(2, 10) + Date.now().toString(16);
  const block = Math.floor(Math.random() * 10000) + 1000;
  const timestamp = Date.now();
  ledger[txHash] = { status: 'pending', tx, block, timestamp };
  // Simulate confirmation after 3 seconds
  setTimeout(() => { ledger[txHash].status = 'confirmed'; }, 3000);
  return NextResponse.json({ txHash, status: 'pending' });
} 