import { handleApiError } from './errors'

export interface FeedbackAnalysis {
  action: 'CONFIRM' | 'CANCEL' | 'MODIFY'
  modifications?: string
  confidence: number
  reasoning?: string
}

export interface IntentAnalysis {
  intent: 'CREATE_INVOICE' | 'CREATE_QUOTE' | 'ADD_TIME' | 'SUMMARIZE_EMAILS' | 'MANAGE_CALENDAR' | 'UNKNOWN'
  confidence: number
  entities: Record<string, any>
  complexity: 'SIMPLE' | 'COMPLEX'
}

export class AIAgentService {
  private openaiApiKey: string

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY!
    
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }
  }

  /**
   * Analyze user feedback on a draft (Block 8 from SimAI workflow)
   */
  async analyzeFeedback(userMessage: string, draftContent: string): Promise<FeedbackAnalysis> {
    const systemPrompt = `Je bent een AI assistent die feedback analyseert op drafts voor facturen, offertes en emails.

Analyseer de gebruiker feedback en bepaal de actie:
- CONFIRM: Gebruiker bevestigt de draft (ja, goed, akkoord, verstuur, etc.)
- CANCEL: Gebruiker wil annuleren (nee, stop, annuleer, etc.)  
- MODIFY: Gebruiker wil wijzigingen (pas aan, verander, andere prijs, etc.)

Geef ook aan wat de specifieke wijzigingen zijn als het MODIFY is.

Draft content: ${draftContent}
Gebruiker feedback: ${userMessage}

Antwoord in JSON format: {"action": "CONFIRM|CANCEL|MODIFY", "modifications": "...", "confidence": 0.95, "reasoning": "..."}`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.1,
          max_tokens: 300
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      try {
        return JSON.parse(content)
      } catch {
        // Fallback als JSON parsing faalt
        return {
          action: 'CONFIRM' as const,
          confidence: 0.5,
          reasoning: 'Failed to parse AI response, defaulting to confirm'
        }
      }
    } catch (error) {
      console.error('AI feedback analysis error:', error)
      // Fallback response
      return {
        action: 'CONFIRM' as const,
        confidence: 0.3,
        reasoning: 'AI analysis failed, defaulting to confirm'
      }
    }
  }

  /**
   * Analyze user intent from message (for new messages)
   */
  async analyzeIntent(userMessage: string, context?: string): Promise<IntentAnalysis> {
    const systemPrompt = `Je bent een AI assistent die de intentie van ZZP'ers analyseert in WhatsApp berichten.

Analyseer het bericht en bepaal:
- Intent: CREATE_INVOICE, CREATE_QUOTE, ADD_TIME, SUMMARIZE_EMAILS, MANAGE_CALENDAR, of UNKNOWN
- Complexity: SIMPLE (directe vraag) of COMPLEX (meerdere stappen/context nodig)
- Entities: Extract relevante informatie (klant, bedrag, datum, etc.)

Gebruiker bericht: ${userMessage}
Context: ${context || 'Geen context beschikbaar'}

Antwoord in JSON format: {"intent": "CREATE_INVOICE", "confidence": 0.95, "entities": {"client": "John Doe", "amount": 500}, "complexity": "SIMPLE"}`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.1,
          max_tokens: 400
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      try {
        return JSON.parse(content)
      } catch {
        // Fallback als JSON parsing faalt
        return {
          intent: 'UNKNOWN' as const,
          confidence: 0.3,
          entities: {},
          complexity: 'SIMPLE' as const
        }
      }
    } catch (error) {
      console.error('AI intent analysis error:', error)
      // Fallback response
      return {
        intent: 'UNKNOWN' as const,
        confidence: 0.1,
        entities: {},
        complexity: 'SIMPLE' as const
      }
    }
  }

  /**
   * Generate draft content based on intent and entities
   */
  async generateDraft(intent: string, entities: Record<string, any>, userContext: string): Promise<string> {
    const systemPrompt = `Je bent een AI assistent die professionele drafts maakt voor ZZP'ers.

Maak een draft voor: ${intent}
Entities: ${JSON.stringify(entities)}
Context: ${userContext}

Genereer een professionele, complete draft die klaar is voor gebruik.`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Maak een draft voor ${intent} met de volgende informatie: ${JSON.stringify(entities)}` }
          ],
          temperature: 0.3,
          max_tokens: 1000
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || 'Draft generatie mislukt'
    } catch (error) {
      console.error('AI draft generation error:', error)
      return 'Er is een fout opgetreden bij het genereren van de draft.'
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  async transcribeAudio(audioBuffer: ArrayBuffer): Promise<string> {
    try {
      // Convert ArrayBuffer to File-like object
      const formData = new FormData()
      const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' })
      formData.append('file', audioBlob, 'audio.ogg')
      formData.append('model', 'whisper-1')
      formData.append('language', 'nl')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OpenAI Whisper API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.text || 'Transcriptie mislukt'
    } catch (error) {
      console.error('Audio transcription error:', error)
      return 'Er is een fout opgetreden bij het transcriberen van de audio.'
    }
  }
}

// Export singleton instance
export const aiAgentService = new AIAgentService()
