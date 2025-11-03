import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'WhatsApp access token not configured' },
        { status: 500 }
      );
    }

    // Fetch audio metadata from WhatsApp Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch audio metadata', details: errorData },
        { status: response.status }
      );
    }

    const audioData = await response.json();

    return NextResponse.json(audioData);
  } catch (error) {
    console.error('Error fetching WhatsApp audio metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audio metadata' },
      { status: 500 }
    );
  }
}


