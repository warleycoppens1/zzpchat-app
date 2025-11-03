'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const CATEGORIES = ['invoice', 'quote', 'time', 'email', 'calendar', 'kilometer'] as const

interface Template {
  id: string
  name: string
  description: string
  category: string
  icon?: string
  triggerType: string
  defaultTriggerConfig: any
  defaultActions: any
  configSchema: any
}

export default function NewAutomationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    triggerConfig: {},
    actions: [],
    enabled: true
  })

  const templateId = searchParams.get('template')

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId)
    } else {
      setLoading(false)
    }
  }, [templateId])

  const fetchTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/automations/templates`)
      if (response.ok) {
        const data = await response.json()
        const found = data.templates.find((t: Template) => t.id === id)
        if (found) {
          setTemplate(found)
          setFormData({
            name: found.name,
            description: found.description,
            category: found.category,
            triggerType: found.triggerType,
            triggerConfig: found.defaultTriggerConfig,
            actions: found.defaultActions,
            enabled: true
          })
        } else {
          // Template not found, redirect back
          router.push('/dashboard/automations')
        }
      }
    } catch (error) {
      console.error('Failed to fetch template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name) {
      alert('Voer een naam in voor de automatisering')
      return
    }

    if (!formData.category || !CATEGORIES.includes(formData.category as any)) {
      alert('Selecteer een categorie')
      return
    }

    if (!formData.triggerType) {
      alert('Selecteer een trigger type')
      return
    }

    if (!formData.actions || formData.actions.length === 0) {
      alert('Voeg minimaal één actie toe')
      return
    }

    try {
      const response = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          triggerType: formData.triggerType,
          triggerConfig: formData.triggerConfig,
          conditions: formData.conditions || undefined,
          actions: formData.actions,
          templateId: template?.id,
          enabled: formData.enabled !== false
        })
      })

      if (response.ok) {
        router.push('/dashboard/automations')
      } else {
        const error = await response.json()
        alert(`Fout: ${error.error || 'Onbekende fout'}`)
      }
    } catch (error) {
      console.error('Failed to create automation:', error)
      alert('Er is een fout opgetreden bij het aanmaken van de automatisering')
    }
  }

  const handleTest = async () => {
    // TODO: Implement test functionality
    alert('Test functionaliteit komt binnenkort beschikbaar')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      invoice: '📄',
      quote: '📋',
      time: '⏰',
      email: '📧',
      calendar: '📅',
      kilometer: '🚗'
    }
    return icons[category] || '⚙️'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/dashboard/automations"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2 inline-block"
          >
            ← Terug naar Automatiseringen
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nieuwe Automatisering
          </h1>
          {template && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Template: {template.name}
            </p>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`flex-1 h-1 mx-2 ${
                step > s ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {step === 1 && (
          <Step1Name 
            formData={formData}
            setFormData={setFormData}
            template={template}
          />
        )}

        {step === 2 && (
          <Step2Trigger
            formData={formData}
            setFormData={setFormData}
            template={template}
          />
        )}

        {step === 3 && (
          <Step3Actions
            formData={formData}
            setFormData={setFormData}
            template={template}
          />
        )}

        {step === 4 && (
          <Step4Review
            formData={formData}
            onTest={handleTest}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Terug
        </button>

        <div className="flex gap-2">
          {step === 4 ? (
            <>
              <button
                onClick={handleTest}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                🧪 Test
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ✅ Activeren
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Volgende →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1Name({ formData, setFormData, template }: any) {
  const categoryLabels: Record<string, string> = {
    invoice: 'Facturen',
    quote: 'Offertes',
    time: 'Urenregistratie',
    email: 'E-mail',
    calendar: 'Agenda',
    kilometer: 'Kilometers'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Stap 1: Naam & Beschrijving
      </h2>

      {!template && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categorie *
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Selecteer categorie</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{categoryLabels[cat] || cat}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Naam van automatisering *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Bijv: Factuur Herinneringen"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Beschrijving (optioneel)
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Wat doet deze automatisering?"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

function Step2Trigger({ formData, setFormData, template }: any) {
  const isSchedule = formData.triggerType === 'schedule'
  const isEvent = formData.triggerType === 'event'

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Stap 2: Wanneer moet dit gebeuren?
      </h2>

      {isSchedule && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequentie
            </label>
            <select
              value={formData.triggerConfig?.schedule || 'daily'}
              onChange={(e) => setFormData({
                ...formData,
                triggerConfig: { ...formData.triggerConfig, schedule: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="daily">Elke dag</option>
              <option value="weekly">Elke week</option>
              <option value="monthly">Elke maand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tijd
            </label>
            <input
              type="time"
              value={formData.triggerConfig?.time || '09:00'}
              onChange={(e) => setFormData({
                ...formData,
                triggerConfig: { ...formData.triggerConfig, time: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {isEvent && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gebeurtenis
            </label>
            <select
              value={formData.triggerConfig?.event || ''}
              onChange={(e) => setFormData({
                ...formData,
                triggerConfig: { ...formData.triggerConfig, event: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecteer gebeurtenis</option>
              <option value="invoice.paid">Factuur betaald</option>
              <option value="invoice.sent">Factuur verzonden</option>
              <option value="quote.accepted">Offerte geaccepteerd</option>
              <option value="quote.expired">Offerte verlopen</option>
              <option value="calendar.event_created">Nieuwe agenda afspraak</option>
            </select>
          </div>
        </div>
      )}

      {!template && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type Trigger
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="triggerType"
                value="schedule"
                checked={formData.triggerType === 'schedule'}
                onChange={(e) => setFormData({
                  ...formData,
                  triggerType: e.target.value,
                  triggerConfig: { schedule: 'daily', time: '09:00' }
                })}
                className="text-indigo-600"
              />
              <span>Gepland (elke dag/week/maand)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="triggerType"
                value="event"
                checked={formData.triggerType === 'event'}
                onChange={(e) => setFormData({
                  ...formData,
                  triggerType: e.target.value,
                  triggerConfig: { event: '' }
                })}
                className="text-indigo-600"
              />
              <span>Wanneer er iets gebeurt (event)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

function Step3Actions({ formData, setFormData, template }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Stap 3: Wat moet er gebeuren?
      </h2>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {template ? (
            <>Deze automatisering voert automatisch de volgende acties uit:</>
          ) : (
            <>Selecteer welke acties moeten worden uitgevoerd:</>
          )}
        </p>

        {formData.actions && formData.actions.length > 0 && (
          <div className="space-y-2">
            {formData.actions.map((action: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getActionName(action.type)}
                    </p>
                    {action.config?.template && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Template: {action.config.template}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!formData.actions || formData.actions.length === 0) && !template && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Selecteer acties die moeten worden uitgevoerd wanneer de automatisering wordt getriggerd.
          </div>
        )}
      </div>
    </div>
  )
}

function Step4Review({ formData, onTest }: any) {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      invoice: '📄',
      quote: '📋',
      time: '⏰',
      email: '📧',
      calendar: '📅',
      kilometer: '🚗'
    }
    return icons[category] || '⚙️'
  }

  const getActionName = (type: string) => {
    const names: Record<string, string> = {
      send_email: 'E-mail verzenden',
      send_whatsapp: 'WhatsApp bericht versturen',
      create_invoice: 'Factuur aanmaken',
      create_quote: 'Offerte aanmaken',
      create_time_entry: 'Urenregistratie aanmaken',
      create_kilometer_entry: 'Kilometerregistratie aanmaken',
      send_notification: 'Notificatie versturen',
    }
    return names[type] || type
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Stap 4: Samenvatting & Activeren
      </h2>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Naam</h3>
          <p className="text-gray-600 dark:text-gray-400">{formData.name}</p>
        </div>

        {formData.description && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Beschrijving</h3>
            <p className="text-gray-600 dark:text-gray-400">{formData.description}</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trigger</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {formData.triggerType === 'schedule' ? (
              <>Elke dag om {formData.triggerConfig?.time || '09:00'}</>
            ) : formData.triggerType === 'event' ? (
              <>Wanneer: {formData.triggerConfig?.event || 'geen event geselecteerd'}</>
            ) : (
              'Geen trigger geconfigureerd'
            )}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Acties</h3>
          <div className="space-y-1">
            {formData.actions && formData.actions.length > 0 ? (
              formData.actions.map((action: any, index: number) => (
                <p key={index} className="text-gray-600 dark:text-gray-400">
                  • {getActionName(action.type)}
                </p>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-500">Geen acties geconfigureerd</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          💡 <strong>Tip:</strong> Test eerst de automatisering om te zien of alles correct werkt voordat je deze activeert.
        </p>
      </div>
    </div>
  )
}

function getActionName(type: string): string {
  const names: Record<string, string> = {
    send_email: 'E-mail verzenden',
    send_whatsapp: 'WhatsApp bericht versturen',
    create_invoice: 'Factuur aanmaken',
    create_quote: 'Offerte aanmaken',
    create_time_entry: 'Urenregistratie aanmaken',
    create_kilometer_entry: 'Kilometerregistratie aanmaken',
    send_notification: 'Notificatie versturen',
  }
  return names[type] || type
}

