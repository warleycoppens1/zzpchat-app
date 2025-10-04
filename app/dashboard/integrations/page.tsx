'use client'

import { useState } from 'react'

interface Integration {
  id: string
  name: string
  description: string
  logo: string
  category: 'email' | 'calendar' | 'storage' | 'communication' | 'social'
  status: 'connected' | 'disconnected' | 'expired'
  connectedAt?: Date
  expiresAt?: Date
  settings?: IntegrationSettings
}

interface IntegrationSettings {
  gmail?: {
    connectInbox: boolean
    connectCalendar: boolean
  }
  slack?: {
    defaultChannel: string
    channels: string[]
  }
  drive?: {
    defaultFolder: string
    folders: string[]
  }
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Koppel je Gmail inbox voor slimme e-mail samenvattingen en automatische verwerking',
      logo: '📧',
      category: 'email',
      status: 'disconnected'
    },
    {
      id: 'google-calendar',
      name: 'Google Agenda',
      description: 'Afspraken inlezen en AI-powered reminders voor je planning',
      logo: '📅',
      category: 'calendar',
      status: 'disconnected'
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'E-mail en agenda koppeling voor Microsoft gebruikers',
      logo: '📨',
      category: 'email',
      status: 'disconnected'
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Documenten koppelen voor facturen, offertes en project bestanden',
      logo: '☁️',
      category: 'storage',
      status: 'disconnected'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Koppel Slack kanalen voor klantcommunicatie en project updates',
      logo: '💬',
      category: 'communication',
      status: 'disconnected'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Alternatieve cloud storage voor documenten en bestanden',
      logo: '📦',
      category: 'storage',
      status: 'disconnected'
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive',
      description: 'Zakelijke cloud storage voor Microsoft 365 gebruikers',
      logo: '🗂️',
      category: 'storage',
      status: 'disconnected'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Zakelijke connecties en berichten voor lead generation',
      logo: '💼',
      category: 'social',
      status: 'disconnected'
    }
  ])

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'expired': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'disconnected': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '✅ Verbonden'
      case 'expired': return '⚠️ Verlopen'
      case 'disconnected': return '❌ Niet verbonden'
      default: return '❌ Niet verbonden'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      case 'calendar': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'storage': return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
      case 'communication': return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      case 'social': return 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(integrationId)
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            status: 'connected', 
            connectedAt: new Date(),
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
          }
        : integration
    ))
    
    setIsConnecting(null)
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'disconnected', connectedAt: undefined, expiresAt: undefined }
        : integration
    ))
  }

  const handleSettings = (integration: Integration) => {
    setSelectedIntegration(integration)
    setShowSettingsModal(true)
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const expiredCount = integrations.filter(i => i.status === 'expired').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integraties</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Koppel externe services om je workflow te automatiseren en te verbeteren
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {expiredCount > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {expiredCount} integratie{expiredCount > 1 ? 's' : ''} verlopen
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Totaal Integraties</p>
              <p className="text-3xl font-bold">{integrations.length}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Verbonden</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{connectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Beschikbaar</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{integrations.length - connectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Integraties */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Beschikbare Integraties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${getCategoryColor(integration.category)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{integration.logo}</div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                  {getStatusText(integration.status)}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {integration.name}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {integration.description}
              </p>

              {integration.status === 'connected' && integration.connectedAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Verbonden sinds {integration.connectedAt.toLocaleDateString('nl-NL')}
                  {integration.expiresAt && (
                    <div className="mt-1">
                      Verloopt op {integration.expiresAt.toLocaleDateString('nl-NL')}
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                {integration.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => handleSettings(integration)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Instellingen
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="flex-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      Verbreken
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    disabled={isConnecting === integration.id}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isConnecting === integration.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verbinden...
                      </>
                    ) : (
                      'Verbinden'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedIntegration.name} Instellingen
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {selectedIntegration.id === 'gmail' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Inbox koppelen
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        E-mails automatisch verwerken en samenvatten
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Agenda koppelen
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Afspraken inlezen voor planning
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              {selectedIntegration.id === 'slack' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Standaard kanaal
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Selecteer kanaal</option>
                    <option value="general">#general</option>
                    <option value="project-updates">#project-updates</option>
                    <option value="client-communication">#client-communication</option>
                  </select>
                </div>
              )}

              {selectedIntegration.id === 'google-drive' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Standaard map
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Selecteer map</option>
                    <option value="facturen">📄 Facturen</option>
                    <option value="offertes">📋 Offertes</option>
                    <option value="projecten">📁 Projecten</option>
                    <option value="documenten">📚 Documenten</option>
                  </select>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
