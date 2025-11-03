'use client'

import { useState, useEffect } from 'react'

interface IntegrationStatusProps {
  integrations?: string[]
}

export function IntegrationStatus({ integrations = [] }: IntegrationStatusProps) {
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([])

  useEffect(() => {
    if (integrations && integrations.length > 0) {
      setAvailableIntegrations(integrations)
    } else {
      // Fetch from API if not provided
      fetch('/api/integrations/status')
        .then(res => res.json())
        .then(data => {
          if (data.integrations) {
            setAvailableIntegrations(data.integrations)
          }
        })
        .catch(() => {
          // Silently fail
        })
    }
  }, [integrations])

  if (availableIntegrations.length === 0) {
    return null
  }

  const integrationLabels: Record<string, { name: string; icon: string }> = {
    'gmail': { name: 'Gmail', icon: '📧' },
    'drive': { name: 'Google Drive', icon: '☁️' },
    'calendar': { name: 'Google Calendar', icon: '📅' },
    'outlook': { name: 'Outlook', icon: '📨' },
    'outlook-calendar': { name: 'Outlook Calendar', icon: '📅' }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <span className="text-xs text-gray-500 dark:text-gray-400">Beschikbare integraties:</span>
      {availableIntegrations.map(integration => {
        const label = integrationLabels[integration] || { name: integration, icon: '🔗' }
        return (
          <div
            key={integration}
            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs"
          >
            <span>{label.icon}</span>
            <span>{label.name}</span>
          </div>
        )
      })}
    </div>
  )
}

