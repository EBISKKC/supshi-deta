import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsClient } from '@/lib/google-sheets';

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

    await googleSheetsClient.appendSheetData(range, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to append data to Google Sheets' },
      { status: 500 }
    );
  }
}
