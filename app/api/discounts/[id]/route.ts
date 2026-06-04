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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = readDb();
    
    const index = db.discounts.findIndex((d: any) => d.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
    }

    db.discounts.splice(index, 1);
    writeDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 });
  }
}
