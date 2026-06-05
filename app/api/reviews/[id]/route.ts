import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const reviewsDbPath = path.join(process.cwd(), 'data', 'reviews.json');

function readReviewsDb() {
  const fileData = fs.readFileSync(reviewsDbPath, 'utf8');
  return JSON.parse(fileData);
}

function writeReviewsDb(data: any) {
  fs.writeFileSync(reviewsDbPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    if (!body.status) {
       return NextResponse.json({ error: 'Missing status field' }, { status: 400 });
    }

    const db = readReviewsDb();
    const reviewIndex = db.reviews.findIndex((r: any) => r.id === id);
    
    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    db.reviews[reviewIndex].status = body.status;
    writeReviewsDb(db);
    
    return NextResponse.json(db.reviews[reviewIndex], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
