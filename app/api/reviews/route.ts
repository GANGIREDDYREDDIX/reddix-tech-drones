import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const reviewsDbPath = path.join(process.cwd(), 'data', 'reviews.json');
const productsDbPath = path.join(process.cwd(), 'data', 'db.json');

function readReviewsDb() {
  if (!fs.existsSync(reviewsDbPath)) {
    return { reviews: [] };
  }
  const fileData = fs.readFileSync(reviewsDbPath, 'utf8');
  return JSON.parse(fileData);
}

function writeReviewsDb(data: any) {
  fs.writeFileSync(reviewsDbPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const db = readReviewsDb();
    return NextResponse.json(db.reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newReview = await request.json();
    const db = readReviewsDb();
    
    if (!newReview.productId || !newReview.customerName || !newReview.rating || !newReview.text) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate ID
    const newId = `REV-${Date.now().toString().slice(-6)}`;
    
    // Get product name from products DB
    let productName = newReview.productId;
    if (fs.existsSync(productsDbPath)) {
      const productsData = JSON.parse(fs.readFileSync(productsDbPath, 'utf8'));
      const product = productsData.products.find((p: any) => p.id === newReview.productId);
      if (product) productName = product.name;
    }

    const reviewToSave = {
      id: newId,
      productId: newReview.productId,
      productName: productName,
      customerName: newReview.customerName,
      rating: newReview.rating,
      text: newReview.text,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      status: "Pending"
    };

    db.reviews.unshift(reviewToSave);
    writeReviewsDb(db);
    
    return NextResponse.json(reviewToSave, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
