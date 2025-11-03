'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Automation {
  id: string
  name: string
  description?: string
  category: string
  enabled: boolean
  isDefault: boolean
  lastRunAt?: string
  nextRunAt?: string
  runCount: number
  successCount: number
  errorCount: number
  runs?: Array<{
    status: string
    startedAt: string
    itemsProcessed: number
    itemsSucceeded: number
  }>
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  icon?: string
}

export default function AutomationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'templates'>('active')

  useEffect(() => {
    if (session?.user?.id) {
      fetchAutomations()
      fetchTemplates()
    }
  }, [session])

  const fetchAutomations = async () => {
    try {
      const response = await fetch('/api/automations')
      if (response.ok) {
        const data = await response.json()
        setAutomations(data.automations)
      }
    } catch (error) {
      console.error('Failed to fetch automations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/automations/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const toggleAutomation = async (id: string) => {
    try {
      const response = await fetch(`/api/automations/${id}/toggle`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchAutomations()
      }
    } catch (error) {
      console.error('Failed to toggle automation:', error)
    }
  }

  const deleteAutomation = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze automatisering wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/automations/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchAutomations()
      }
    } catch (error) {
      console.error('Failed to delete automation:', error)
    }
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

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      invoice: 'Facturen',
      quote: 'Offertes',
      time: 'Uren',
      email: 'E-mail',
      calendar: 'Agenda',
      kilometer: 'Kilometers'
    }
    return names[category] || category
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const defaultAutomations = automations.filter(a => a.isDefault)
  const customAutomations = automations.filter(a => !a.isDefault)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Automatiseringen</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Automatiseer je werkzaamheden en bespaar tijd
          </p>
        </div>
        <Link
          href="/dashboard/automations/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nieuwe Automatisering
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Actieve ({automations.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Templates ({templates.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'active' ? (
        <div className="space-y-6">
          {/* Default Automations */}
          {defaultAutomations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Standaard Automatiseringen
              </h2>
              <div className="grid gap-4">
                {defaultAutomations.map((automation) => (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    onToggle={toggleAutomation}
                    onDelete={deleteAutomation}
                    getCategoryIcon={getCategoryIcon}
                    getCategoryName={getCategoryName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Automations */}
          {customAutomations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Mijn Automatiseringen
              </h2>
              <div className="grid gap-4">
                {customAutomations.map((automation) => (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    onToggle={toggleAutomation}
                    onDelete={deleteAutomation}
                    getCategoryIcon={getCategoryIcon}
                    getCategoryName={getCategoryName}
                  />
                ))}
              </div>
            </div>
          )}

          {automations.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Je hebt nog geen automatiseringen aangemaakt
              </p>
              <Link
                href="/dashboard/automations/new"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Maak je eerste automatisering aan
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Populaire Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
          {templates.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Geen templates beschikbaar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AutomationCard({
  automation,
  onToggle,
  onDelete,
  getCategoryIcon,
  getCategoryName
}: {
  automation: Automation
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  getCategoryIcon: (cat: string) => string
  getCategoryName: (cat: string) => string
}) {
  const lastRun = automation.runs?.[0]
  const status = automation.enabled ? 'active' : 'paused'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getCategoryIcon(automation.category)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {automation.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getCategoryName(automation.category)}
              </p>
            </div>
          </div>

          {automation.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{automation.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className={`px-2 py-1 rounded ${status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
              {status === 'active' ? 'Actief' : 'Gepauzeerd'}
            </span>
            <span>{automation.runCount} runs</span>
            {lastRun && (
              <span>
                Laatste run: {new Date(lastRun.startedAt).toLocaleDateString('nl-NL')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(automation.id)}
            className={`px-3 py-1 rounded text-sm ${
              automation.enabled
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
            }`}
          >
            {automation.enabled ? 'Pauzeren' : 'Activeren'}
          </button>
          {!automation.isDefault && (
            <button
              onClick={() => onDelete(automation.id)}
              className="px-3 py-1 rounded text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            >
              Verwijderen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TemplateCard({
  template,
  getCategoryIcon
}: {
  template: Template
  getCategoryIcon: (cat: string) => string
}) {
  const router = useRouter()

  const handleUseTemplate = () => {
    router.push(`/dashboard/automations/new?template=${template.id}`)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{template.icon || getCategoryIcon(template.category)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {template.description}
          </p>
        </div>
      </div>
      <button
        onClick={handleUseTemplate}
        className="block w-full mt-4 px-4 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Gebruiken
      </button>
    </div>
  )
}

