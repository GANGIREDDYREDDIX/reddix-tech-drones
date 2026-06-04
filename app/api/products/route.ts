import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

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
    return NextResponse.json(db.products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    const db = readDb();
    
    // Ensure basic required fields exist
    if (!newProduct.id || !newProduct.name || !newProduct.price) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if ID already exists
    if (db.products.some((p: any) => p.id === newProduct.id)) {
      return NextResponse.json({ error: 'Product ID already exists' }, { status: 409 });
    }

    db.products.push(newProduct);
    writeDb(db);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
