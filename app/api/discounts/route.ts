import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'discounts.json');

function readDb() {
  const fileData = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(fileData);
}

function writeDb(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json(db.discounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read discounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newDiscount = await request.json();
    const db = readDb();
    
    // Add missing fields for a new discount
    const discount = {
      ...newDiscount,
      id: `DISC-${Date.now()}`,
      status: 'Active',
      usageCount: 0
    };

    db.discounts.push(discount);
    writeDb(db);

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}
