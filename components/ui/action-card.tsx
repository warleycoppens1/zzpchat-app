'use client'

import { useState } from 'react'

export interface ActionCardProps {
  type: 'INVOICE_CREATED' | 'QUOTE_CREATED' | 'TOOL_EXECUTED' | 'INTEGRATION_ACTION'
  title: string
  description?: string
  data?: any
  onConfirm?: () => void
  onCancel?: () => void
  onView?: () => void
  confirmText?: string
  cancelText?: string
  viewText?: string
}

export function ActionCard({
  type,
  title,
  description,
  data,
  onConfirm,
  onCancel,
  onView,
  confirmText = 'Bevestigen',
  cancelText = 'Annuleren',
  viewText = 'Bekijken'
}: ActionCardProps) {
  const [confirmed, setConfirmed] = useState(false)

  const getIcon = () => {
    switch (type) {
      case 'INVOICE_CREATED':
        return '📄'
      case 'QUOTE_CREATED':
        return '💼'
      case 'TOOL_EXECUTED':
        return '⚙️'
      case 'INTEGRATION_ACTION':
        return '🔗'
      default:
        return '✅'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'INVOICE_CREATED':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'QUOTE_CREATED':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'TOOL_EXECUTED':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'INTEGRATION_ACTION':
        return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const handleConfirm = () => {
    setConfirmed(true)
    if (onConfirm) {
      onConfirm()
    }
  }

  if (confirmed) {
    return (
      <div className={`${getColor()} border-2 rounded-xl p-4 mb-4`}>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{getIcon()}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Actie bevestigd
            </p>
          </div>
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className={`${getColor()} border-2 rounded-xl p-4 mb-4`}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{getIcon()}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
          )}
          
          {data && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 text-sm">
              {type === 'INVOICE_CREATED' && data.invoice && (
                <div className="space-y-1">
                  <p><span className="font-medium">Nummer:</span> {data.invoice.number}</p>
                  <p><span className="font-medium">Bedrag:</span> €{data.invoice.amount}</p>
                  <p><span className="font-medium">Klant:</span> {data.invoice.client?.name}</p>
                </div>
              )}
              {type === 'QUOTE_CREATED' && data.quote && (
                <div className="space-y-1">
                  <p><span className="font-medium">Nummer:</span> {data.quote.number}</p>
                  <p><span className="font-medium">Bedrag:</span> €{data.quote.amount}</p>
                  <p><span className="font-medium">Klant:</span> {data.quote.client?.name}</p>
                </div>
              )}
              {type === 'TOOL_EXECUTED' && data.result && (
                <div className="space-y-1">
                  <p><span className="font-medium">Tool:</span> {data.toolName}</p>
                  {data.result.success ? (
                    <p className="text-green-600 dark:text-green-400">✓ {data.result.message}</p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400">✗ {data.result.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {onView && (
              <button
                onClick={onView}
                className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                {viewText}
              </button>
            )}
            {onConfirm && (
              <button
                onClick={handleConfirm}
                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {confirmText}
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

