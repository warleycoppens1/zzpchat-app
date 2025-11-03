'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Document {
  id: string
  name: string
  description?: string
  originalName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  folder?: {
    id: string
    name: string
  }
  client?: {
    id: string
    name: string
    company?: string
  }
  tags: string[]
}

interface Folder {
  id: string
  name: string
  description?: string
  color?: string
  _count: {
    documents: number
    children: number
  }
}

export default function DocumentsPage() {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (session?.user?.id) {
      fetchFolders()
      fetchDocuments()
    }
  }, [session, currentFolderId])

  const fetchDocuments = async () => {
    try {
      const url = new URL('/api/documents', window.location.origin)
      if (currentFolderId) {
        url.searchParams.append('folderId', currentFolderId)
      } else {
        url.searchParams.append('folderId', 'null')
      }
      if (searchQuery) {
        url.searchParams.append('search', searchQuery)
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const url = new URL('/api/folders', window.location.origin)
      if (currentFolderId) {
        url.searchParams.append('parentId', currentFolderId)
      } else {
        url.searchParams.append('parentId', 'null')
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || [])
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)
    if (currentFolderId) {
      formData.append('folderId', currentFolderId)
    }

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchDocuments()
        setShowUploadModal(false)
      } else {
        const error = await response.json()
        alert(`Upload fout: ${error.error || 'Onbekende fout'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Er is een fout opgetreden bij het uploaden')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit document wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchDocuments()
      } else {
        alert('Fout bij verwijderen')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Er is een fout opgetreden')
    }
  }

  const handleExport = async () => {
    if (selectedDocuments.length === 0) {
      alert('Selecteer eerst documenten om te exporteren')
      return
    }

    try {
      const response = await fetch('/api/documents/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedDocuments }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Download each document individually
        for (const doc of data.documents) {
          const downloadResponse = await fetch(doc.downloadUrl)
          if (downloadResponse.ok) {
            const blob = await downloadResponse.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = doc.originalName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            // Small delay between downloads to avoid browser blocking
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        }
        
        setSelectedDocuments([])
      } else {
        const error = await response.json()
        alert(`Export fout: ${error.error || 'Onbekende fout'}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Er is een fout opgetreden bij het exporteren')
    }
  }

  const handleCreateFolder = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          parentId: currentFolderId,
        }),
      })

      if (response.ok) {
        await fetchFolders()
        setShowFolderModal(false)
      } else {
        const error = await response.json()
        alert(`Fout: ${error.error || 'Onbekende fout'}`)
      }
    } catch (error) {
      console.error('Create folder error:', error)
      alert('Er is een fout opgetreden')
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('image')) return '🖼️'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {currentFolderId && (
              <button
                onClick={() => setCurrentFolderId(null)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Terug
              </button>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Documenten
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Beheer je documenten en bestanden
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {view === 'grid' ? '📋 Lijst' : '📁 Grid'}
          </button>
          <button
            onClick={() => setShowFolderModal(true)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            + Map
          </button>
          {selectedDocuments.length > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              📥 Export ({selectedDocuments.length})
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Upload
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Zoek documenten..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            // Debounce search
            setTimeout(() => fetchDocuments(), 300)
          }}
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Mappen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolderId(folder.id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📁</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {folder.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {folder._count.documents} documenten
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Documenten ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Geen documenten gevonden' : 'Nog geen documenten. Upload je eerste document!'}
            </p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                  selectedDocuments.includes(doc.id)
                    ? 'border-indigo-500 ring-2 ring-indigo-500'
                    : 'border-gray-200 dark:border-gray-700'
                } p-4 hover:shadow-md transition-all cursor-pointer`}
                onClick={() => {
                  if (selectedDocuments.includes(doc.id)) {
                    setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id))
                  } else {
                    setSelectedDocuments([...selectedDocuments, doc.id])
                  }
                }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-3xl">{getFileIcon(doc.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                </div>
                {doc.client && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    👤 {doc.client.name}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Download
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(doc.id)
                    }}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === documents.length && documents.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments(documents.map(d => d.id))
                        } else {
                          setSelectedDocuments([])
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Naam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Klant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Grootte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Uploaddatum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => {
                          if (selectedDocuments.includes(doc.id)) {
                            setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id))
                          } else {
                            setSelectedDocuments([...selectedDocuments, doc.id])
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getFileIcon(doc.mimeType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.name}
                          </div>
                          {doc.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {doc.client ? (
                        <Link href={`/dashboard/clients/${doc.client.id}`} className="hover:text-indigo-600">
                          {doc.client.name}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(doc.uploadedAt).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        download
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 mr-4"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900"
                      >
                        Verwijder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Document Uploaden
            </h2>
            <input
              type="file"
              onChange={(e) => handleUpload(e.target.files)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <FolderModal
          onClose={() => setShowFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}
    </div>
  )
}

function FolderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (name: string, description?: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Nieuwe Map
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Naam *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beschrijving (optioneel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Aanmaken
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

