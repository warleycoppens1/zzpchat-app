import { NextRequest, NextResponse } from 'next/server';
import { aiAgentService } from '@/lib/ai-agent';

export async function POST(request: NextRequest) {
  try {
    const { audioUrl, userId } = await request.json();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'WhatsApp access token not configured' },
        { status: 500 }
      );
    }

    if (!audioUrl || !userId) {
      return NextResponse.json(
        { error: 'Audio URL and user ID are required' },
        { status: 400 }
      );
    }

    // First, download the audio file
    const audioResponse = await fetch(audioUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!audioResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download audio file' },
        { status: audioResponse.status }
      );
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    // Use OpenAI Whisper for transcription
    const transcription = await aiAgentService.transcribeAudio(audioBuffer);

    // Store the transcription in the database
    // This would typically go to a conversation or audio_transcription table
    console.log(`Transcription for user ${userId}:`, transcription);

    return NextResponse.json({
      success: true,
      transcription: transcription,
      audioUrl: audioUrl,
      userId: userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error transcribing WhatsApp audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

