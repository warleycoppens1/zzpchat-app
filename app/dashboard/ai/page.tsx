'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ui/ai/reasoning'
import { FileUpload } from '@/components/ui/file-upload'
import { SubscriptionTier } from '@/lib/subscription-limits'
import { ActionCard } from '@/components/ui/action-card'
import { IntegrationStatus } from '@/components/ui/integration-status'
import { FilePreview } from '@/components/ui/file-preview'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  reasoning?: string
  isStreaming?: boolean
  action?: any
  toolCalls?: any[]
  integrations?: string[]
  attachments?: Array<{
    id: string
    name: string
    mimeType: string
    size?: number
    url?: string
  }>
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [chatHistory, setChatHistory] = useState<Array<{
    id: string
    title: string
    preview: string
    timestamp: Date
  }>>([])
  
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date())
  const [isSaved, setIsSaved] = useState<boolean>(true) // Track if current conversation is saved
  const [lastSavedHash, setLastSavedHash] = useState<string>('') // Track what was last saved to prevent duplicates
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Debounce timer for saving
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false) // Show delete confirmation dialog
  const [userFiles, setUserFiles] = useState<any[]>([]) // User's uploaded files
  const [userStorageInfo, setUserStorageInfo] = useState<any>(null) // User's storage info
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false) // Show file upload modal
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([]) // Available integrations
  const [isRecording, setIsRecording] = useState<boolean>(false) // Voice recording state
  const [recognition, setRecognition] = useState<any>(null) // Speech recognition instance

  // Load conversation history and user files on component mount
  useEffect(() => {
    loadConversationHistory()
    loadUserFiles()
    loadIntegrationStatus()
    
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'nl-NL'
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        const fullText = transcript.trim()
        setIsRecording(false)
        
        // Automatically send the voice message
        if (fullText) {
          // Set input value first to show user what was transcribed
          setInputValue(fullText)
          
          // Send after a short delay to show the transcript
          setTimeout(() => {
            // Use setMessages with a function to get the latest state
            setMessages(prevMessages => {
              const userMessage: Message = {
                id: Date.now().toString(),
                content: fullText,
                role: 'user',
                timestamp: new Date()
              }
              
              const updatedMessages = [...prevMessages, userMessage]
              
              // Send to AI with the updated conversation history
              setIsLoading(true)
              setIsSaved(false)
              updateActivityTime()
              
              fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: fullText,
                  userId: 'dashboard-user',
                  conversationHistory: prevMessages, // Use previous messages, not updatedMessages
                }),
              })
              .then(response => {
                if (!response.ok) throw new Error('AI API request failed')
                return response.json()
              })
              .then(data => {
                const streamingMessageId = (Date.now() + 1).toString()
                const streamingMessage: Message = {
                  id: streamingMessageId,
                  content: '',
                  role: 'assistant',
                  timestamp: new Date(),
                  isStreaming: true
                }
                
                setMessages(prev => [...prev, streamingMessage])
                
                // Simulate streaming
                let currentContent = ''
                const words = data.response.split(' ')
                
                const streamWords = async () => {
                  for (let i = 0; i < words.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 30))
                    currentContent += (i > 0 ? ' ' : '') + words[i]
                    
                    setMessages(prev => prev.map(msg => 
                      msg.id === streamingMessageId 
                        ? { ...msg, content: currentContent, isStreaming: i < words.length - 1 }
                        : msg
                    ))
                  }
                  
                  // Final message
                  const aiMessage: Message = {
                    id: streamingMessageId,
                    content: data.response,
                    role: 'assistant',
                    timestamp: new Date(),
                    reasoning: data.reasoning,
                    action: data.action,
                    toolCalls: data.toolCalls,
                    integrations: data.integrations,
                    isStreaming: false
                  }
                  
                  setMessages(prev => {
                    const updatedMessages = prev.map(msg => 
                      msg.id === streamingMessageId ? aiMessage : msg
                    )
                    // Debounced save - waits 3 seconds after stream completes
                    saveConversation(updatedMessages)
                    return updatedMessages
                  })
                  
                  if (data.action) {
                    handleAIAction(data.action)
                  }
                }
                
                streamWords()
              })
              .catch(error => {
                console.error('AI chat error:', error)
                const errorMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  content: 'Sorry, er is een fout opgetreden. Probeer het opnieuw.',
                  role: 'assistant',
                  timestamp: new Date()
                }
                setMessages(prev => [...prev, errorMessage])
              })
              .finally(() => {
                setIsLoading(false)
              })
              
              // Clear input
              setInputValue('')
              
              return updatedMessages
            })
          }, 500) // Show transcript briefly before sending
        } else {
          setInputValue('')
        }
      }
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
      
      recognitionInstance.onend = () => {
        setIsRecording(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [])

  // Load integration status
  const loadIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status')
      if (response.ok) {
        const data = await response.json()
        setAvailableIntegrations(data.integrations || [])
      }
    } catch (error) {
      console.error('Error loading integration status:', error)
    }
  }

  // Save conversation when component unmounts or before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length >= 2 && !isSaved) {
        // Use sendBeacon for reliable data sending on page unload
        const data = JSON.stringify({
          title: messages.find(m => m.role === 'user')?.content?.slice(0, 30) + '...' || 'Nieuw gesprek',
          userMessage: messages.find(m => m.role === 'user')?.content || '',
          aiResponse: messages.find(m => m.role === 'assistant')?.content || ''
        })
        
        navigator.sendBeacon('/api/conversations', data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Cleanup timeout on unmount
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      // Also save when component unmounts if not already saved (immediate save)
      if (messages.length >= 2 && !isSaved) {
        saveConversation(messages, true) // Immediate save on unmount
      }
    }
  }, [messages, isSaved])

  // Auto-save conversation after 5 minutes of inactivity (backup save only)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const timeSinceLastActivity = now.getTime() - lastActivityTime.getTime()
      
      // Auto-save after 5 minutes of inactivity if we have a conversation and it's not already saved
      if (timeSinceLastActivity > 300000 && messages.length >= 2 && !isSaved) {
        console.log('Backup auto-saving conversation after 5 minutes of inactivity...')
        saveConversation(messages, true) // Immediate save after 5 minutes of inactivity
        setLastActivityTime(now) // Reset timer
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [messages, lastActivityTime, isSaved])

  const updateActivityTime = () => {
    setLastActivityTime(new Date())
  }

  // Create a simple hash of the conversation content to detect duplicates
  const createConversationHash = (messages: Message[]) => {
    const userMessage = messages.find(m => m.role === 'user')?.content || ''
    const aiResponse = messages.find(m => m.role === 'assistant')?.content || ''
    return `${userMessage.slice(0, 50)}_${aiResponse.slice(0, 50)}`
  }

  const loadConversationHistory = async () => {
    try {
      console.log('Loading conversation history...')
      const response = await fetch('/api/conversations')
      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Full response data:', data)
      
      if (response.ok && data.conversations) {
        const history = data.conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.actionData?.title || conv.userMessage?.slice(0, 30) + '...' || 'Gesprek',
          preview: conv.aiResponse?.slice(0, 50) + '...' || 'Geen preview',
          timestamp: new Date(conv.createdAt)
        }))
        console.log('Mapped history:', history)
        setChatHistory(history)
      } else {
        console.error('Failed to load conversations:', data.error || response.statusText)
        setChatHistory([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error loading conversation history:', error)
      setChatHistory([]) // Set empty array on error
    }
  }

  // Debounced save function - only saves after user stops typing and AI finishes responding
  const saveConversation = async (messages: Message[], immediate: boolean = false) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    // If immediate save is requested (e.g., page unload), save right away
    if (immediate) {
      await performSave(messages)
      return
    }

    // Otherwise, debounce the save - wait 3 seconds after last change
    saveTimeoutRef.current = setTimeout(async () => {
      await performSave(messages)
      saveTimeoutRef.current = null
    }, 3000) // 3 second delay to ensure user is done typing
  }

  const performSave = async (messages: Message[]) => {
    if (messages.length < 2) {
      console.log('Not enough messages to save:', messages.length)
      return // Need at least user + assistant message
    }

    // Don't save if any message is currently streaming (incomplete)
    const isCurrentlyStreaming = messages.some(m => m.isStreaming === true)
    if (isCurrentlyStreaming) {
      console.log('Conversation is still streaming, waiting for completion...')
      return // Don't save incomplete conversations
    }

    // Check if user message is too short (likely incomplete)
    const userMessage = messages.find(m => m.role === 'user')?.content || ''
    if (userMessage.trim().length < 5) {
      console.log('User message too short, likely incomplete:', userMessage)
      return // Don't save incomplete user messages
    }

    // Check if this conversation was already saved
    const currentHash = createConversationHash(messages)
    if (currentHash === lastSavedHash) {
      console.log('Conversation already saved, skipping duplicate save')
      return
    }

    try {
      const aiResponse = messages.find(m => m.role === 'assistant')?.content || ''
      
      // Don't save if AI response is incomplete (too short or just "...")
      if (!aiResponse || aiResponse.trim().length < 10 || aiResponse.trim() === '...') {
        console.log('AI response incomplete, waiting for full response...')
        return
      }
      
      const title = userMessage.slice(0, 50) // Use more characters for better title
      
      console.log('Saving conversation:', { title, userMessage: userMessage.slice(0, 50) + '...', aiResponse: aiResponse.slice(0, 50) + '...' })
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          userMessage,
          aiResponse
        })
      })
      
      const responseData = await response.json()
      console.log('Save response status:', response.status, 'Data:', responseData)
      
      if (response.ok && responseData.success) {
        console.log('Conversation saved successfully')
        setIsSaved(true) // Mark as saved
        setLastSavedHash(currentHash) // Remember what we saved
        // Reload history to show new conversation
        setTimeout(() => loadConversationHistory(), 500) // Small delay to ensure DB is updated
      } else {
        console.error('Failed to save conversation:', responseData.error || response.statusText)
      }
    } catch (error) {
      console.error('Error saving conversation:', error)
    }
  }

  const quickActions = [
    { title: 'Factuur Generator', icon: '📄', description: 'Genereer een professionele factuur' },
    { title: 'Offerte Maker', icon: '💼', description: 'Maak een gedetailleerde offerte' },
    { title: 'Uren Calculator', icon: '⏰', description: 'Bereken uren en kosten' },
    { title: 'Klant Communicatie', icon: '💬', description: 'Draft professionele emails' },
    { title: 'Rapport Generator', icon: '📊', description: 'Maak project rapporten' },
    { title: 'Contract Helper', icon: '📋', description: 'Hulp bij contracten' },
  ]

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsLoading(true)
    setIsSaved(false) // Mark as unsaved when new message is added
    updateActivityTime() // Update activity time when user sends message

    try {
        // Check if user is asking about files (expanded keywords to include Word, doc, etc.)
        const fileKeywords = [
          'cv', 'bestand', 'document', 'file', 'upload', 'geüpload', 
          'wat staat er in', 'inhoud', 'content', 'brief', 'samenvatting', 
          'titel', 'database', 'zoek', 'vind', 'haal', 'geef me',
          'word', 'doc', 'docx', 'pdf', 'excel', 'opened', 'geopend',
          'bekijk', 'lees', 'analyseer', 'bedrijf', 'company', 'maak een samenvatting',
          'samenvatting van', 'letter', 'sollicitatie'
        ]
      const isFileQuestion = fileKeywords.some(keyword => 
        currentInput.toLowerCase().includes(keyword)
      )
      
      // Always include fileId if user has files and asks any question (be proactive)
      // Except for invoice/quote creation which don't need files
      const shouldIncludeFile = isFileQuestion || (
        userFiles.length > 0 && 
        !currentInput.toLowerCase().includes('factuur') && 
        !currentInput.toLowerCase().includes('offerte') &&
        !currentInput.toLowerCase().includes('uur') &&
        !currentInput.toLowerCase().includes('tijd')
      )
      
      // Use regular API (no streaming)
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          userId: 'dashboard-user',
          conversationHistory: messages,
          // Include file context if user has files (be proactive!)
          ...(shouldIncludeFile && userFiles.length > 0 && { fileId: userFiles[0].id })
        }),
      })

      if (!response.ok) {
        throw new Error('AI API request failed')
      }

      const data = await response.json()
      
      // Create streaming message first for better UX
      const streamingMessageId = (Date.now() + 1).toString()
      const streamingMessage: Message = {
        id: streamingMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true
      }
      
      setMessages(prev => [...prev, streamingMessage])
      
      // Simulate real-time update (could be replaced with actual streaming)
      let currentContent = ''
      const words = data.response.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30)) // 30ms per word
        currentContent += (i > 0 ? ' ' : '') + words[i]
        
        setMessages(prev => prev.map(msg => 
          msg.id === streamingMessageId 
            ? { ...msg, content: currentContent, isStreaming: i < words.length - 1 }
            : msg
        ))
      }
      
      // Final message with all data
      const aiMessage: Message = {
        id: streamingMessageId,
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        reasoning: data.reasoning,
        action: data.action,
        toolCalls: data.toolCalls,
        integrations: data.integrations,
        isStreaming: false
      }
      
      setMessages(prev => {
        const updatedMessages = prev.map(msg => 
          msg.id === streamingMessageId ? aiMessage : msg
        )
        // Save conversation ONLY after AI has fully responded (not streaming)
        console.log('AI response complete, scheduling save...')
        saveConversation(updatedMessages) // Debounced save with 3 second delay
        return updatedMessages
      })
      
      // Handle actions immediately
      if (data.action) {
        handleAIAction(data.action)
      }
      
      return // Exit early for API response

    } catch (error) {
      console.error('AI chat error:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, er is een fout opgetreden. Probeer het opnieuw.',
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewConversation = () => {
    // Save current conversation before starting new one (if we have messages and not already saved)
    if (messages.length >= 2 && !isSaved) {
      console.log('Saving current conversation before starting new one...')
      
      // Wait a moment for any ongoing streaming to complete, then save
      setTimeout(() => {
        saveConversation(messages, true) // Immediate save when starting new conversation
      }, 1000) // Give 1 second for streaming to complete
    }
    
    // Clear messages for new conversation
    setMessages([])
    setIsSaved(true) // New conversation starts as "saved" (empty)
    setLastSavedHash('') // Reset hash for new conversation
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        const conversation = data.conversation
        
        // Load messages from conversation data
        const loadedMessages: Message[] = []
        
        // Add user message
        if (conversation.userMessage) {
          loadedMessages.push({
            id: conversation.id + '_user',
            content: conversation.userMessage,
            role: 'user',
            timestamp: new Date(conversation.createdAt)
          })
        }
        
        // Add AI response
        if (conversation.aiResponse) {
          loadedMessages.push({
            id: conversation.id + '_ai',
            content: conversation.aiResponse,
            role: 'assistant',
            timestamp: new Date(conversation.updatedAt)
          })
        }
        
        setMessages(loadedMessages)
        setIsSaved(true) // Loaded conversation is already saved
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const handleDeleteAllConversations = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAllConversations = async () => {
    try {
      console.log('Deleting all conversations...')
      const response = await fetch('/api/conversations/delete-all', {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Clear current messages and history
        setMessages([])
        setChatHistory([])
        setIsSaved(true)
        setLastSavedHash('')
        setShowDeleteConfirm(false)
        
        console.log('All conversations deleted successfully')
      } else {
        alert(`❌ Fout bij verwijderen: ${data.error || 'Onbekende fout'}`)
      }
    } catch (error) {
      console.error('Error deleting conversations:', error)
      alert('❌ Er is een fout opgetreden bij het verwijderen van de gesprekken.')
    }
  }

  const cancelDeleteAllConversations = () => {
    setShowDeleteConfirm(false)
  }

  const loadUserFiles = async () => {
    try {
      console.log('Loading user files...')
      
      // Try test endpoint first
      const testResponse = await fetch('/api/files/test')
      console.log('Test response status:', testResponse.status)
      
      if (testResponse.ok) {
        const testData = await testResponse.json()
        console.log('Test data:', testData)
        setUserFiles(testData.testData.files || [])
        setUserStorageInfo(testData.testData.storageInfo)
        return
      }
      
      // Fallback to regular endpoint
      const response = await fetch('/api/files')
      console.log('Files response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Files data:', data)
        setUserFiles(data.files || [])
        setUserStorageInfo(data.storageInfo || {
          used: 0,
          tier: SubscriptionTier.FREE,
          limit: 10 * 1024 * 1024 // 10MB default
        })
      } else {
        console.error('Failed to load user files:', response.statusText)
        // Set default values if API fails
        setUserFiles([])
        setUserStorageInfo({
          used: 0,
          tier: SubscriptionTier.FREE,
          limit: 10 * 1024 * 1024
        })
      }
    } catch (error) {
      console.error('Error loading user files:', error)
      // Set default values on error
      setUserFiles([])
      setUserStorageInfo({
        used: 0,
        tier: SubscriptionTier.FREE,
        limit: 10 * 1024 * 1024
      })
    }
  }

  const handleFileUploaded = async (file: any) => {
    // Add the file to the list
    setUserFiles(prev => [file, ...prev])
    
    // Show success message in chat
    const uploadMessage: Message = {
      id: `upload-${Date.now()}`,
      content: `✅ Bestand succesvol geüpload: **${file.originalName}** (${file.fileSizeFormatted || (file.fileSize / (1024 * 1024)).toFixed(2) + ' MB'})\n\nHet bestand wordt nu verwerkt en is beschikbaar voor de AI. Je kunt nu vragen stellen over de inhoud van dit bestand.`,
      role: 'assistant',
      timestamp: new Date(),
      attachments: [{
        id: file.id,
        name: file.originalName,
        mimeType: file.mimeType || 'unknown',
        size: file.fileSize,
      }]
    }
    
    setMessages(prev => [...prev, uploadMessage])
    
    // Process the file in the background to extract content
    try {
      // Trigger file processing by making a test API call
      const processResponse = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'verwerk bestand',
          userId: 'dashboard-user',
          fileId: file.id,
          conversationHistory: []
        }),
      })
      
      // Update storage info
      loadUserFiles()
    } catch (error) {
      console.error('Error processing uploaded file:', error)
    }
    
    setShowFileUpload(false)
  }

  const handleAIAction = (action: any) => {
    if (action.type === 'INVOICE_CREATED') {
      // Show success message and redirect to invoices
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `🎉 ${action.message} Je kunt de factuur bekijken in het facturen overzicht.`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
      
      // Optionally redirect to invoices page after a delay
      setTimeout(() => {
        window.location.href = '/dashboard/invoices'
      }, 3000)
    } else if (action.type === 'QUOTE_CREATED') {
      // Show success message and redirect to quotes
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `🎉 ${action.message} Je kunt de offerte bekijken in het offertes overzicht.`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
      
      // Optionally redirect to quotes page after a delay
      setTimeout(() => {
        window.location.href = '/dashboard/quotes'
      }, 3000)
    }
  }

  const handleVoiceRecording = () => {
    if (!recognition) {
      alert('Spraakherkenning wordt niet ondersteund in deze browser')
      return
    }
    
    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      recognition.start()
      setIsRecording(true)
    }
  }

  const handleQuickAction = async (actionTitle: string) => {
    let message = ''
    
    switch (actionTitle) {
      case 'Factuur Generator':
        message = 'Ik wil een factuur maken'
        break
      case 'Offerte Maker':
        message = 'Ik wil een offerte maken'
        break
      case 'Uren Calculator':
        message = 'Ik wil uren registreren'
        break
      case 'Klant Communicatie':
        message = 'Ik wil een email naar een klant sturen'
        break
      case 'Rapport Generator':
        message = 'Ik wil een rapport maken'
        break
      case 'Contract Helper':
        message = 'Ik heb hulp nodig met een contract'
        break
      default:
        message = actionTitle
    }
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Call the real AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userId: 'dashboard-user',
          conversationHistory: messages // Pass conversation history for context
        }),
      })

      if (!response.ok) {
        throw new Error('AI API request failed')
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        reasoning: data.reasoning,
        action: data.action,
        toolCalls: data.toolCalls,
        integrations: data.integrations
      }
      
      setMessages(prev => {
        const updatedMessages = [...prev, aiMessage]
        // Save conversation after AI responds to quick action
        console.log('Quick action AI response complete, scheduling save...')
        saveConversation(updatedMessages) // Debounced save with 3 second delay
        return updatedMessages
      })

      // Handle actions (like creating invoices)
      if (data.action) {
        handleAIAction(data.action)
      }
    } catch (error) {
      console.error('AI chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, er is een fout opgetreden. Probeer het opnieuw.',
        role: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
      {/* Left Sidebar - Chat History */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col rounded-l-2xl">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Geschiedenis</h2>
            <button 
              onClick={handleDeleteAllConversations}
              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Verwijder alle gesprekken"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Zoek gesprekken..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Debug buttons - hidden in production */}
          <div className="mb-4 space-y-2 hidden">
            <button 
              onClick={loadConversationHistory}
              className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              🔄 Reload History
            </button>
            <button 
              onClick={async () => {
                console.log('Testing API...')
                const response = await fetch('/api/test-conversations')
                const data = await response.json()
                console.log('Test API response:', data)
              }}
              className="w-full px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              🧪 Test API
            </button>
            <button 
              onClick={async () => {
                console.log('Cleaning up duplicates...')
                const response = await fetch('/api/conversations/cleanup', { method: 'POST' })
                const data = await response.json()
                console.log('Cleanup response:', data)
                if (data.success) {
                  alert(`Opgeschoond! ${data.deletedCount} duplicates verwijderd.`)
                  loadConversationHistory() // Reload the list
                }
              }}
              className="w-full px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              🧹 Cleanup Duplicates
            </button>
          </div>
          
          <div className="space-y-1">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Geen gesprekken</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start een nieuw gesprek om te beginnen.</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
              <div
                key={chat.id}
                  onClick={() => loadConversation(chat.id)}
                className="p-3 rounded-2xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 cursor-pointer transition-all backdrop-blur-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {chat.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {chat.preview}
                </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {chat.timestamp.toLocaleDateString()}
                </p>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
            Upgrade naar Pro
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col rounded-r-2xl">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-tr-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistent</h1>
                {messages.length > 0 && (
                  <div className="flex items-center gap-1">
                    {isSaved ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        💾 Opgeslagen
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        ⏳ Niet opgeslagen
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Je persoonlijke AI helper voor ZZP administratie
              </p>
            </div>
            <button 
              onClick={handleNewConversation}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nieuw Gesprek
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welkom bij je AI Assistent
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                Ik help je met facturen, offertes, urenregistratie en alle andere ZZP administratie. Stel je vraag of kies een snelle actie.
              </p>

              {/* Integration Status */}
              {availableIntegrations.length > 0 && (
                <div className="mb-8">
                  <IntegrationStatus integrations={availableIntegrations} />
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.title)}
                    className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all text-left group"
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl px-5 py-4 rounded-3xl shadow-lg backdrop-blur-md ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-500/90 to-purple-600/90 text-white border border-white/20'
                          : 'bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white backdrop-blur-md'
                      }`}
                    >
                      {/* Integration status indicator */}
                      {message.role === 'assistant' && message.integrations && message.integrations.length > 0 && (
                        <div className="mb-2">
                          <IntegrationStatus integrations={message.integrations} />
                        </div>
                      )}
                      
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* File Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <FilePreview
                              key={attachment.id}
                              file={{
                                id: attachment.id,
                                originalName: attachment.name,
                                mimeType: attachment.mimeType,
                                fileSize: attachment.size,
                                webViewLink: attachment.url
                              }}
                              compact={true}
                            />
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('nl-NL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Show user files if mentioned */}
                  {message.role === 'user' && userFiles.length > 0 && (
                    <div className="max-w-3xl ml-auto">
                      {userFiles.slice(0, 3).map((file) => (
                        <div key={file.id} className="mb-2">
                          <FilePreview
                            file={file}
                            compact={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Action Card */}
                  {message.role === 'assistant' && message.action && (
                    <div className="max-w-3xl">
                      <ActionCard
                        type={message.action.type === 'INVOICE_CREATED' ? 'INVOICE_CREATED' : 
                              message.action.type === 'QUOTE_CREATED' ? 'QUOTE_CREATED' : 
                              'INTEGRATION_ACTION'}
                        title={message.action.message || 'Actie uitgevoerd'}
                        description={`Actie type: ${message.action.type}`}
                        data={message.action.data || message.action}
                        onView={() => {
                          if (message.action.type === 'INVOICE_CREATED') {
                            window.location.href = '/dashboard/invoices'
                          } else if (message.action.type === 'QUOTE_CREATED') {
                            window.location.href = '/dashboard/quotes'
                          }
                        }}
                        viewText={message.action.type === 'INVOICE_CREATED' ? 'Bekijk Factuur' : 
                                 message.action.type === 'QUOTE_CREATED' ? 'Bekijk Offerte' : 
                                 'Bekijken'}
                      />
                    </div>
                  )}

                  {/* Tool Calls */}
                  {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="max-w-3xl space-y-2">
                      {message.toolCalls.map((toolCall: any, index: number) => (
                        <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">⚙️</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {toolCall.name}
                            </span>
                            {toolCall.result?.success ? (
                              <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                            ) : (
                              <span className="text-xs text-red-600 dark:text-red-400">✗</span>
                            )}
                          </div>
                          {toolCall.result?.message && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {toolCall.result.message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show reasoning for assistant messages */}
                  {message.role === 'assistant' && message.reasoning && (
                    <div className="max-w-3xl">
                      <Reasoning defaultOpen={false}>
                        <ReasoningTrigger title="AI Denkproces" />
                        <ReasoningContent>{message.reasoning}</ReasoningContent>
                      </Reasoning>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 px-5 py-4 rounded-3xl shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">AI denkt na...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-br-2xl">
          <div className="flex items-end space-x-3">
            {/* Attachment Button */}
            <button 
              onClick={() => setShowFileUpload(true)}
              className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all backdrop-blur-sm"
              title="Upload bestand"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>


            {/* Message Input */}
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Stel je vraag aan de AI..."
                className="w-full px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl bg-white/70 dark:bg-gray-700/70 backdrop-blur-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none shadow-sm"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>

            {/* Voice Button */}
            <button 
              onClick={handleVoiceRecording}
              className={`p-2 rounded-xl transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={isRecording ? 'Stop opnemen' : 'Spraak opnemen'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Verwijder Alle Gesprekken
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Deze actie kan niet ongedaan worden gemaakt
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                Weet je zeker dat je alle chat geschiedenis wilt verwijderen? Alle gesprekken worden permanent verwijderd.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteAllConversations}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={confirmDeleteAllConversations}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Ja, Verwijder Alles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bestand Uploaden
              </h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {userStorageInfo ? (
              <FileUpload
                onFileUploaded={handleFileUploaded}
                userTier={userStorageInfo.tier as SubscriptionTier}
                currentStorage={userStorageInfo.used}
                className="mb-4"
              />
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            )}

            {/* Recent Files */}
            {userFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Recente Bestanden
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userFiles.slice(0, 5).map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-white truncate">
                          {file.originalName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {file.fileSizeFormatted}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
