import { NextRequest } from 'next/server'
import { aiAgentService } from '@/lib/ai-agent'

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory = [] } = await request.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Quick intent analysis (cached/simplified)
    const intentAnalysis = await aiAgentService.analyzeIntent(message)
    
    // Build optimized conversation context
    const conversationContext = conversationHistory
      .slice(-3) // Only last 3 messages for streaming
      .map((msg: any) => `${msg.role === 'user' ? 'U' : 'A'}: ${msg.content.slice(0, 50)}`)
      .join('\n')

    const systemPrompt = `Je bent een snelle AI assistent voor ZZP'ers. Geef korte, directe antwoorden.

BELANGRIJKE REGELS:
1. Korte antwoorden (max 2 zinnen)
2. Stel één vraag per keer
3. Wees vriendelijk maar direct

Context: ${conversationContext}
Intent: ${intentAnalysis.intent}

Gebruiker: ${message}`

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
              ],
              temperature: 0.7,
              max_tokens: 150,
              stream: true
            }),
          })

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body')
          }

          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.close()
                  return
                }
                
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Send final metadata
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ 
            intent: intentAnalysis.intent,
            confidence: intentAnalysis.confidence,
            done: true 
          })}\n\n`))
          controller.close()

        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ 
            error: 'Streaming failed',
            content: 'Sorry, er is een fout opgetreden.' 
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Streaming chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process streaming request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}


