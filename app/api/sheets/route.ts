import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsClient } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'Sheet1!A1:Z1000';

    const data = await googleSheetsClient.getSheetData(range);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Sheets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { range, values } = body;

    if (!range || !values) {
      return NextResponse.json(
        { error: 'Range and values are required' },
        { status: 400 }
      );
    }

    await googleSheetsClient.updateSheetData(range, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update data in Google Sheets' },
      { status: 500 }
    );
  }
}
