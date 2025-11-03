'use client'

import { useState, useRef } from 'react'
import { formatBytes, getSubscriptionLimits, SubscriptionTier } from '@/lib/subscription-limits'

interface FileUploadProps {
  onFileUploaded: (file: any) => void
  userTier: SubscriptionTier
  currentStorage: number
  className?: string
}

interface UploadedFile {
  id: string
  originalName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
}

export function FileUpload({ onFileUploaded, userTier, currentStorage, className = '' }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const limits = getSubscriptionLimits(userTier)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Show success message
      onFileUploaded(data.file)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Clear any errors
      setError(null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const storagePercentage = (currentStorage / limits.storageLimit) * 100

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv,.json,.jpg,.jpeg,.png,.xls,.xlsx"
      />
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Max file size: {formatBytes(limits.fileSizeLimit)}
            </p>
          </div>
        )}
      </div>

      {/* Storage Usage Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Storage Used</span>
          <span>{formatBytes(currentStorage)} / {formatBytes(limits.storageLimit)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              storagePercentage > 90 ? 'bg-red-500' : 
              storagePercentage > 75 ? 'bg-yellow-500' : 
              'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          ></div>
        </div>
        {storagePercentage > 90 && (
          <p className="text-xs text-red-500 mt-1">Storage almost full!</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Supported File Types */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <p>Supported: PDF* (tekst extractie), DOC, DOCX, TXT, CSV, JSON, JPG, PNG, XLS, XLSX</p>
        <p className="text-yellow-600 dark:text-yellow-400 mt-1">* PDF tekst extractie is tijdelijk niet beschikbaar</p>
      </div>
    </div>
  )
}
