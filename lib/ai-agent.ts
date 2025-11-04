import { handleApiError } from './errors'

export interface FeedbackAnalysis {
  action: 'CONFIRM' | 'CANCEL' | 'MODIFY'
  modifications?: string
  confidence: number
  reasoning?: string
}

export interface IntentAnalysis {
  intent: 'CREATE_INVOICE' | 'CREATE_QUOTE' | 'ADD_TIME' | 'SUMMARIZE_EMAILS' | 'MANAGE_CALENDAR' | 'FILE_ANALYSIS' | 'UNKNOWN'
  confidence: number
  entities: Record<string, any>
  complexity: 'SIMPLE' | 'COMPLEX'
}

export class AIAgentService {
  private openaiApiKey: string

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
  }

  private ensureApiKey() {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }
  }

  /**
   * Analyze user feedback on a draft (Block 8 from SimAI workflow)
   */
  async analyzeFeedback(userMessage: string, draftContent: string): Promise<FeedbackAnalysis> {
    this.ensureApiKey()
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
    this.ensureApiKey()
    const systemPrompt = `Je bent een AI assistent die de intentie van ZZP'ers analyseert in WhatsApp berichten.

Analyseer het bericht en bepaal:
- Intent: CREATE_INVOICE (factuur maken, factuur versturen, factuur opstellen), CREATE_QUOTE, ADD_TIME, SUMMARIZE_EMAILS, MANAGE_CALENDAR, FILE_ANALYSIS, of UNKNOWN
- Complexity: SIMPLE (directe vraag) of COMPLEX (meerdere stappen/context nodig)
- Entities: Extract relevante informatie (klant, bedrag, datum, etc.)

Belangrijke signalen voor CREATE_INVOICE:
- "factuur maken", "factuur versturen", "factuur opstellen"
- "klant", "bedrag", "euro", "€"
- Namen van personen/bedrijven
- Bedragen (500, 1000, etc.)
- Dienstbeschrijvingen

Belangrijke signalen voor FILE_ANALYSIS:
- "wat staat er in", "inhoud", "samenvatting", "brief", "document", "bestand"
- "cv", "pdf", "word", "excel", "document", "file"
- "geef me", "haal", "zoek", "vind", "database", "titel"
- "van ange", "brief van", "document van", "bestand van"
- Vragen over geüploade bestanden of specifieke documenten
- Alle vragen die beginnen met "geef me een samenvatting van"

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
          model: 'gpt-3.5-turbo', // Use faster model for intent analysis
          messages: [
            { role: 'system', content: systemPrompt },
            ...(context
              ? [{ role: 'assistant', content: `Bestaande context:
${context}` }]
              : []),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.1,
          max_tokens: 200 // Reduced token limit for faster processing
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
    this.ensureApiKey()
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
    this.ensureApiKey()
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

  /**
   * Process and extract text content from uploaded files
   */
  async processFile(fileId: string, userId: string): Promise<string> {
    this.ensureApiKey()
    try {
      const { prisma } = await import('@/lib/prisma')
      
      // Get file from database
      const file = await prisma.userFile.findFirst({
        where: {
          id: fileId,
          userId: userId
        }
      })

      if (!file) {
        throw new Error('File not found')
      }

      // If file is already processed and has valid content, return cached content
      // But if content is an error message, reprocess the file
      if (file.processed && file.content && !file.content.includes('[Word document:') && !file.content.includes('Er is een fout opgetreden')) {
        return file.content
      }

      // Read file from disk
      const fs = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'uploads', 'user-files', file.filename)
      
      let fileContent = ''
      
      try {
        const fileBuffer = await fs.readFile(filePath)
        
        // Check file extension as fallback for MIME type detection
        const fileExtension = file.originalName.toLowerCase().split('.').pop()
        
        // Process different file types
        // Handle MIME type or extension-based detection
        let detectedType = file.mimeType
        
        // Fallback to extension-based detection for Word documents if MIME type is generic
        if ((detectedType === 'application/octet-stream' || !detectedType) && fileExtension) {
          if (fileExtension === 'doc' || fileExtension === 'docx') {
            detectedType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
            detectedType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          } else if (fileExtension === 'pdf') {
            detectedType = 'application/pdf'
          }
        }
        
        switch (detectedType) {
          case 'text/plain':
          case 'text/csv':
          case 'application/json':
            fileContent = fileBuffer.toString('utf-8')
            break
            
          case 'application/pdf':
            // For now, provide a placeholder for PDF files since parsing is complex
            // In production, you could use a service like AWS Textract or Google Cloud Vision
            fileContent = `[PDF bestand: ${file.originalName}] - PDF tekst extractie is tijdelijk niet beschikbaar. Voor PDF bestanden kun je de tekst handmatig kopiëren en plakken in de chat.`
            break
            
          case 'application/msword':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            // Extract text from Word documents using mammoth
            try {
              const mammoth = await import('mammoth')
              
              // Check if file extension suggests Word document (fallback for MIME type detection issues)
              const fileExtension = file.originalName.toLowerCase().split('.').pop()
              const isWordFile = fileExtension === 'doc' || fileExtension === 'docx'
              
              if (!isWordFile && file.mimeType === 'application/octet-stream') {
                // Skip if MIME type is generic octet-stream and extension doesn't match
                fileContent = `[Bestand: ${file.originalName}] - Kan bestandstype niet bepalen. Zorg dat het een .doc of .docx bestand is.`
                break
              }
              
              console.log('Attempting to extract text from Word document:', {
                filename: file.originalName,
                fileSize: fileBuffer.length,
                mimeType: file.mimeType
              })
              
              const result = await mammoth.extractRawText({ buffer: fileBuffer })
              
              console.log('Mammoth extraction result:', {
                hasValue: !!result.value,
                valueLength: result.value?.length || 0,
                valuePreview: result.value?.substring(0, 200) || 'empty',
                messages: result.messages || []
              })
              
              if (result.value && result.value.trim().length > 0) {
                fileContent = result.value.trim()
                console.log('Successfully extracted text from Word document:', fileContent.substring(0, 200))
              } else {
                fileContent = `[Word document: ${file.originalName}] - Geen tekst gevonden in Word document. Het document is mogelijk leeg of bevat alleen afbeeldingen.`
                console.warn('No text found in Word document after extraction')
              }
            } catch (wordError: any) {
              console.error('Word parsing error:', wordError)
              console.error('Error details:', {
                message: wordError?.message,
                stack: wordError?.stack,
                filename: file.originalName,
                mimeType: file.mimeType,
                fileSize: file.fileSize
              })
              
              // More specific error messages
              if (wordError?.message?.includes('Invalid File')) {
                fileContent = `[Word document: ${file.originalName}] - Het bestand lijkt geen geldig Word document te zijn. Controleer of het een .doc of .docx bestand is.`
              } else if (wordError?.message?.includes('corrupt') || wordError?.message?.includes('corrupted')) {
                fileContent = `[Word document: ${file.originalName}] - Het Word document lijkt beschadigd te zijn. Probeer het opnieuw te openen en op te slaan in Word.`
              } else {
                fileContent = `[Word document: ${file.originalName}] - Er is een fout opgetreden bij het lezen van het Word document: ${wordError?.message || 'Onbekende fout'}. Controleer of het bestand een geldig Word document is.`
              }
            }
            break
            
          case 'application/vnd.ms-excel':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            // Extract text from Excel files using xlsx
            try {
              const XLSX = await import('xlsx')
              const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
              let excelContent = ''
              
              workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
                
                excelContent += `\n--- Sheet: ${sheetName} ---\n`
                jsonData.forEach((row: any) => {
                  if (Array.isArray(row) && row.length > 0) {
                    excelContent += row.join('\t') + '\n'
                  }
                })
              })
              
              fileContent = excelContent || `[Excel bestand: ${file.originalName}] - Geen data gevonden in Excel bestand.`
            } catch (excelError) {
              console.error('Excel parsing error:', excelError)
              fileContent = `[Excel bestand: ${file.originalName}] - Er is een fout opgetreden bij het lezen van het Excel bestand.`
            }
            break
            
          case 'image/jpeg':
          case 'image/jpg':
          case 'image/png':
            // For images, we'll use a placeholder since we can't extract text
            fileContent = `[Afbeelding: ${file.originalName}] - Dit is een afbeelding bestand (${file.mimeType}). Afbeelding content kan niet als tekst worden geëxtraheerd.`
            break
            
          default:
            fileContent = `[Bestand: ${file.originalName}] - Content extraction voor dit bestandstype (${file.mimeType}) is nog niet geïmplementeerd.`
        }
        
        // Update file with extracted content
        await prisma.userFile.update({
          where: { id: fileId },
          data: {
            content: fileContent,
            processed: true
          }
        })
        
        return fileContent
        
      } catch (fileError) {
        console.error('Error reading file:', fileError)
        return `[Bestand: ${file.originalName}] - Er is een fout opgetreden bij het lezen van het bestand.`
      }
      
    } catch (error) {
      console.error('File processing error:', error)
      return 'Er is een fout opgetreden bij het verwerken van het bestand.'
    }
  }

  /**
   * Get user's uploaded files for context
   */
  async getUserFiles(userId: string): Promise<any[]> {
    try {
      const { prisma } = await import('@/lib/prisma')
      
      const files = await prisma.userFile.findMany({
        where: { userId },
        orderBy: { uploadedAt: 'desc' },
        take: 10, // Limit to last 10 files
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          content: true,
          processed: true,
          uploadedAt: true
        }
      })
      
      return files
    } catch (error) {
      console.error('Error fetching user files:', error)
      return []
    }
  }

  /**
   * Search user's uploaded files by name or content
   */
  async searchUserFiles(userId: string, searchTerm: string): Promise<any[]> {
    try {
      const { prisma } = await import('@/lib/prisma')
      
      const files = await prisma.userFile.findMany({
        where: { 
          userId,
          OR: [
            { originalName: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        orderBy: { uploadedAt: 'desc' },
        take: 5, // Get top 5 matching files
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          content: true,
          processed: true,
          uploadedAt: true
        }
      })
      
      return files
    } catch (error) {
      console.error('Error searching user files:', error)
      return []
    }
  }

  /**
   * Generate a conversational response for WhatsApp style interactions.
   * Mirrors the behaviour of the `/api/ai/chat` route but in a simplified form
   * so external automation (n8n) can stay in sync with the in-app assistant.
   */
  async generateResponse(
    userMessage: string,
    userId?: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<{ response: string; reasoning: string; action?: any }> {
    this.ensureApiKey()

    const historySnippet = Array.isArray(conversationHistory)
      ? conversationHistory
          .slice(-5)
          .map((entry) => `${entry.role === 'assistant' ? 'AI' : 'Gebruiker'}: ${entry.content}`)
          .join('\n')
      : ''

    const systemPrompt = `Je bent ZzpChat, een Nederlandse AI-assistent voor ZZP'ers.

Context gebruiker:
- User ID: ${userId ?? 'onbekend'}
- Vorige berichten (laatste 5):
${historySnippet || 'Geen geschiedenis beschikbaar'}

Taak: geef een concreet, behulpzaam antwoord. Leg kort uit waarom je dit advies geeft
en geef vervolgstappen indien relevant.`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.4,
          max_tokens: 400
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content?.trim()

      return {
        response: content || 'Ik kon geen geldig antwoord genereren. Probeer het later opnieuw.',
        reasoning: 'Response gegenereerd via OpenAI chat completion'
      }
    } catch (error) {
      console.error('AI conversational response error:', error)
      return {
        response: 'Er ging iets mis bij het genereren van het antwoord. Probeer het later opnieuw.',
        reasoning: 'OpenAI request failed'
      }
    }
  }
}

// Export singleton instance
export const aiAgentService = new AIAgentService()
