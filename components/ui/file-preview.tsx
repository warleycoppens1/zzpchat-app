'use client'

interface FilePreviewProps {
  file: {
    id: string
    originalName: string
    mimeType?: string  // Made optional since it might not always be available
    fileSize?: number
    fileSizeFormatted?: string
    webViewLink?: string
  }
  onRemove?: () => void
  compact?: boolean
}

export function FilePreview({ file, onRemove, compact = false }: FilePreviewProps) {
  const getFileIcon = (mimeType?: string) => {
    // Handle undefined or empty mimeType
    if (!mimeType || typeof mimeType !== 'string') {
      // Try to determine from filename extension
      const fileName = file.originalName?.toLowerCase() || ''
      if (fileName.endsWith('.pdf')) return '📄'
      if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return '📝'
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return '📊'
      if (fileName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return '🖼️'
      if (fileName.endsWith('.txt')) return '📃'
      return '📎'
    }

    const mimeTypeLower = mimeType.toLowerCase()
    if (mimeTypeLower.includes('pdf')) return '📄'
    if (mimeTypeLower.includes('word') || mimeTypeLower.includes('document')) return '📝'
    if (mimeTypeLower.includes('excel') || mimeTypeLower.includes('spreadsheet')) return '📊'
    if (mimeTypeLower.includes('image')) return '🖼️'
    if (mimeTypeLower.includes('text')) return '📃'
    return '📎'
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
        <span>{getFileIcon(file.mimeType)}</span>
        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
          {file.originalName}
        </span>
        {file.fileSize && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {file.fileSizeFormatted || formatSize(file.fileSize)}
          </span>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Verwijder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-2xl">{getFileIcon(file.mimeType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.originalName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {file.mimeType || 'Onbekend type'}
          {file.fileSize && ` • ${file.fileSizeFormatted || formatSize(file.fileSize)}`}
        </p>
      </div>
      {file.webViewLink && (
        <a
          href={file.webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          Openen
        </a>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Verwijder"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

