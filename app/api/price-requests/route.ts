import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local file fallback path
const dataFilePath = path.join(process.cwd(), 'data', 'price_requests.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(dataFilePath))) {
  fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
}

// Ensure file exists
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

export async function GET() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const requests = JSON.parse(data);
    
    // Sort by date descending
    requests.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Failed to read price requests:', error);
    return NextResponse.json({ error: 'Failed to read price requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Extract customer_email from payload or just default to something
    const newRequest = {
      id: `REQ-${Math.floor(Math.random() * 100000)}`,
      customer_email: payload.customer_email || 'guest@example.com',
      product_id: payload.product_id,
      quantity: payload.quantity || 1,
      requested_price: payload.requested_price,
      notes: payload.notes || '',
      status: 'Pending',
      date: new Date().toISOString()
    };

    const data = fs.readFileSync(dataFilePath, 'utf8');
    const requests = JSON.parse(data);
    
    requests.push(newRequest);
    
    fs.writeFileSync(dataFilePath, JSON.stringify(requests, null, 2));

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Failed to create price request:', error);
    return NextResponse.json({ error: 'Failed to create price request' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const { id, status, admin_remark } = payload;
    
    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const data = fs.readFileSync(dataFilePath, 'utf8');
    const requests = JSON.parse(data);
    
    const index = requests.findIndex((req: any) => req.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Price request not found' }, { status: 404 });
    }
    
    // Update fields
    if (status) requests[index].status = status;
    if (admin_remark !== undefined) requests[index].admin_remark = admin_remark;
    
    fs.writeFileSync(dataFilePath, JSON.stringify(requests, null, 2));

    return NextResponse.json(requests[index]);
  } catch (error) {
    console.error('Failed to update price request:', error);
    return NextResponse.json({ error: 'Failed to update price request' }, { status: 500 });
  }
}
