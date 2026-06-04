import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'orders.json');

export async function GET() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(fileData);
    
    // Sort by newest first
    const sortedOrders = db.orders.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(sortedOrders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read orders database' }, { status: 500 });
  }
}
