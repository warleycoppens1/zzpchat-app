'use client'

import { useState, useEffect } from 'react'

interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number // in minutes
  client?: string
  project?: string
  task?: string
  description: string
  hourlyRate: number
  totalAmount: number
  status: 'draft' | 'billable' | 'billed'
  breakTime: number // in minutes
  createdAt: Date
  updatedAt: Date
}

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  client?: string
  description?: string
  hourlyRate: number
}

interface Task {
  id: string
  name: string
  project?: string
  description?: string
  hourlyRate: number
}

export default function TimeEntriesPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'StartupXYZ' },
    { id: '3', name: 'Freelance Work' }
  ])

  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Website Redesign', client: '1', description: 'Complete redesign of company website', hourlyRate: 85 },
    { id: '2', name: 'Mobile App', client: '1', description: 'iOS and Android app development', hourlyRate: 95 },
    { id: '3', name: 'E-commerce Platform', client: '2', description: 'Online store development', hourlyRate: 75 },
    { id: '4', name: 'Marketing Campaign', client: '2', description: 'Digital marketing strategy', hourlyRate: 65 }
  ])

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Design', project: '1', description: 'UI/UX design work', hourlyRate: 85 },
    { id: '2', name: 'Development', project: '1', description: 'Frontend and backend development', hourlyRate: 85 },
    { id: '3', name: 'Testing', project: '1', description: 'Quality assurance and testing', hourlyRate: 75 },
    { id: '4', name: 'iOS Development', project: '2', description: 'iOS app development', hourlyRate: 95 },
    { id: '5', name: 'Android Development', project: '2', description: 'Android app development', hourlyRate: 95 },
    { id: '6', name: 'Backend API', project: '2', description: 'API development and integration', hourlyRate: 90 },
    { id: '7', name: 'Frontend Development', project: '3', description: 'React frontend development', hourlyRate: 75 },
    { id: '8', name: 'Payment Integration', project: '3', description: 'Stripe payment integration', hourlyRate: 80 },
    { id: '9', name: 'SEO Optimization', project: '3', description: 'Search engine optimization', hourlyRate: 70 },
    { id: '10', name: 'Content Creation', project: '4', description: 'Marketing content creation', hourlyRate: 65 },
    { id: '11', name: 'Social Media Management', project: '4', description: 'Social media strategy and management', hourlyRate: 60 },
    { id: '12', name: 'General Administration', description: 'General administrative tasks', hourlyRate: 50 }
  ])

  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterClient, setFilterClient] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [newEntry, setNewEntry] = useState<Partial<TimeEntry>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    client: '',
    project: '',
    task: '',
    description: '',
    hourlyRate: 75,
    breakTime: 0,
    status: 'draft'
  })

  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    client: '',
    description: '',
    hourlyRate: 75
  })

  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    project: '',
    description: '',
    hourlyRate: 75
  })

  // Calculate totals
  const totalHoursThisWeek = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo && entry.status !== 'draft'
    })
    .reduce((sum, entry) => sum + entry.duration, 0) / 60

  const totalHoursThisMonth = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return entryDate >= monthAgo && entry.status !== 'draft'
    })
    .reduce((sum, entry) => sum + entry.duration, 0) / 60

  const billableAmount = timeEntries
    .filter(entry => entry.status === 'billable')
    .reduce((sum, entry) => sum + entry.totalAmount, 0)

  // Get available tasks based on selected project
  const getAvailableTasks = (selectedProject?: string) => {
    if (!selectedProject) {
      // Show all tasks (both project-specific and standalone)
      return tasks
    }
    // Show tasks for selected project + standalone tasks
    return tasks.filter(task => !task.project || task.project === selectedProject)
  }

  // Get client name for display
  const getClientName = (clientId?: string) => {
    if (!clientId) return ''
    return clients.find(c => c.id === clientId)?.name || ''
  }

  // Get project name for display
  const getProjectName = (projectId?: string) => {
    if (!projectId) return ''
    return projects.find(p => p.id === projectId)?.name || ''
  }

  // Get task name for display
  const getTaskName = (taskId?: string) => {
    if (!taskId) return ''
    return tasks.find(t => t.id === taskId)?.name || ''
  }

  // Filter entries based on current filters
  const filteredEntries = timeEntries.filter(entry => {
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus
    const matchesClient = filterClient === 'all' || entry.client === filterClient
    const matchesDateFrom = !filterDateFrom || entry.date >= filterDateFrom
    const matchesDateTo = !filterDateTo || entry.date <= filterDateTo
    const matchesSearch = !searchTerm || 
      (entry.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(entry.client).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProjectName(entry.project).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTaskName(entry.task).toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesClient && matchesDateFrom && matchesDateTo && matchesSearch
  })

  // Calculate duration from start and end time
  const calculateDuration = (startTime: string, endTime: string, breakTime: number = 0) => {
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffMinutes = Math.max(0, diffMs / (1000 * 60) - breakTime)
    return Math.round(diffMinutes)
  }

  // Update duration when times change
  useEffect(() => {
    if (newEntry.startTime && newEntry.endTime) {
      const duration = calculateDuration(newEntry.startTime, newEntry.endTime, newEntry.breakTime || 0)
      const hourlyRate = newEntry.hourlyRate || 0
      const totalAmount = (duration / 60) * hourlyRate

      setNewEntry(prev => ({
        ...prev,
        duration,
        totalAmount
      }))
    }
  }, [newEntry.startTime, newEntry.endTime, newEntry.breakTime, newEntry.hourlyRate])

  // Update hourly rate when project or task changes
  useEffect(() => {
    let hourlyRate = 75 // default rate

    if (newEntry.task) {
      const task = tasks.find(t => t.id === newEntry.task)
      if (task) {
        hourlyRate = task.hourlyRate
      }
    } else if (newEntry.project) {
      const project = projects.find(p => p.id === newEntry.project)
      if (project) {
        hourlyRate = project.hourlyRate
      }
    }

    setNewEntry(prev => ({
      ...prev,
      hourlyRate
    }))
  }, [newEntry.project, newEntry.task, projects, tasks])

  const handleAddEntry = () => {
    if (newEntry.date && newEntry.startTime && newEntry.endTime) {
      const entry: TimeEntry = {
        id: Date.now().toString(),
        date: newEntry.date,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        duration: newEntry.duration || 0,
        client: newEntry.client,
        project: newEntry.project,
        task: newEntry.task,
        description: newEntry.description || '',
        hourlyRate: newEntry.hourlyRate || 0,
        totalAmount: newEntry.totalAmount || 0,
        status: newEntry.status || 'draft',
        breakTime: newEntry.breakTime || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setTimeEntries(prev => [entry, ...prev])
      setShowAddModal(false)
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        client: '',
        project: '',
        task: '',
        description: '',
        hourlyRate: 75,
        breakTime: 0,
        status: 'draft'
      })
    }
  }

  const handleAddProject = () => {
    if (newProject.name) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        client: newProject.client || undefined,
        description: newProject.description || undefined,
        hourlyRate: newProject.hourlyRate || 75
      }

      setProjects(prev => [...prev, project])
      setShowProjectModal(false)
      setNewProject({
        name: '',
        client: '',
        description: '',
        hourlyRate: 75
      })
    }
  }

  const handleAddTask = () => {
    if (newTask.name) {
      const task: Task = {
        id: Date.now().toString(),
        name: newTask.name,
        project: newTask.project || undefined,
        description: newTask.description || undefined,
        hourlyRate: newTask.hourlyRate || 75
      }

      setTasks(prev => [...prev, task])
      setShowTaskModal(false)
      setNewTask({
        name: '',
        project: '',
        description: '',
        hourlyRate: 75
      })
    }
  }

  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry)
    setShowEditModal(true)
  }

  const handleDeleteEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleBulkAction = (action: string) => {
    if (action === 'mark-billable') {
      setTimeEntries(prev => prev.map(entry => 
        selectedEntries.includes(entry.id) ? { ...entry, status: 'billable' } : entry
      ))
    } else if (action === 'mark-billed') {
      setTimeEntries(prev => prev.map(entry => 
        selectedEntries.includes(entry.id) ? { ...entry, status: 'billed' } : entry
      ))
    } else if (action === 'delete') {
      setTimeEntries(prev => prev.filter(entry => !selectedEntries.includes(entry.id)))
    }
    setSelectedEntries([])
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Datum', 'Klant', 'Project', 'Taak', 'Start', 'Eind', 'Duur (uur)', 'Pauze (min)', 'Omschrijving', 'Uurtarief', 'Totaal', 'Status'].join(','),
      ...filteredEntries.map(entry => [
        entry.date,
        getClientName(entry.client),
        getProjectName(entry.project),
        getTaskName(entry.task),
        entry.startTime,
        entry.endTime,
        (entry.duration / 60).toFixed(2),
        entry.breakTime,
        `"${entry.description || ''}"`,
        entry.hourlyRate.toFixed(2),
        entry.totalAmount.toFixed(2),
        entry.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `urenregistratie-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}u ${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'billable': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'billed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Concept'
      case 'billable': return 'Factureerbaar'
      case 'billed': return 'Gefactureerd'
      default: return 'Onbekend'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Urenregistratie</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Registreer en beheer je gewerkte uren per project en klant
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nieuwe Registratie
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Deze Week</p>
              <p className="text-3xl font-bold">{totalHoursThisWeek.toFixed(1)}u</p>
              <p className="text-indigo-100 text-sm mt-1">Geregistreerde uren</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Deze Maand</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalHoursThisMonth.toFixed(1)}u</p>
              <p className="text-gray-500 text-sm mt-1">Totaal uren</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Factureerbaar</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">€{billableAmount.toFixed(2)}</p>
              <p className="text-gray-500 text-sm mt-1">Te factureren bedrag</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Actieve Projecten</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
              <p className="text-gray-500 text-sm mt-1">Projecten</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zoeken</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Zoek in omschrijving, klant, project..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Alle statussen</option>
              <option value="draft">Concept</option>
              <option value="billable">Factureerbaar</option>
              <option value="billed">Gefactureerd</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Klant</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Alle klanten</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Van datum</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tot datum</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEntries.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              {selectedEntries.length} items geselecteerd
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('mark-billable')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Markeer als factureerbaar
              </button>
              <button
                onClick={() => handleBulkAction('mark-billed')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Markeer als gefactureerd
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEntries(filteredEntries.map(entry => entry.id))
                      } else {
                        setSelectedEntries([])
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Klant / Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Taak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Omschrijving
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">Geen uren gevonden</p>
                      <p className="mb-4">Begin met het registreren van je eerste uren</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Nieuwe Registratie Toevoegen
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEntries(prev => [...prev, entry.id])
                          } else {
                            setSelectedEntries(prev => prev.filter(id => id !== entry.id))
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(entry.date).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {getClientName(entry.client)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getProjectName(entry.project)}
                      </div>
                      {!entry.client && !entry.project && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                          Losse urenregistratie
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getTaskName(entry.task)}
                      </div>
                      {!entry.task && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                          Geen taak
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDuration(entry.duration)}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.startTime} - {entry.endTime}
                      </div>
                      {entry.breakTime > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Pauze: {entry.breakTime}min
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {entry.description || '-'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        €{entry.hourlyRate}/uur • €{entry.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                        {getStatusText(entry.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        >
                          Bewerken
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Verwijderen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nieuwe Urenregistratie</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={newEntry.status}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="draft">Concept</option>
                    <option value="billable">Factureerbaar</option>
                    <option value="billed">Gefactureerd</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Starttijd
                  </label>
                  <input
                    type="time"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Eindtijd
                  </label>
                  <input
                    type="time"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pauze (minuten)
                  </label>
                  <input
                    type="number"
                    value={newEntry.breakTime}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, breakTime: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Klant
                  </label>
                  <select
                    value={newEntry.client}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Geen klant</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={newEntry.project}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, project: e.target.value, task: '' }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Geen project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} {project.client ? `(${getClientName(project.client)})` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowProjectModal(true)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taak
                </label>
                <div className="flex space-x-2">
                  <select
                    value={newEntry.task}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, task: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Geen taak</option>
                    {getAvailableTasks(newEntry.project).map(task => (
                      <option key={task.id} value={task.id}>
                        {task.name} {task.project ? `(${getProjectName(task.project)})` : '(Losse taak)'}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(true)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uurtarief
                  </label>
                  <input
                    type="number"
                    value={newEntry.hourlyRate}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Totaal bedrag
                  </label>
                  <input
                    type="text"
                    value={`€${(newEntry.totalAmount || 0).toFixed(2)}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Omschrijving
                </label>
                <textarea
                  value={newEntry.description}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Beschrijf de uitgevoerde werkzaamheden..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleAddEntry}
                  disabled={!newEntry.date || !newEntry.startTime || !newEntry.endTime || !newEntry.client || !newEntry.project || !newEntry.task}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Toevoegen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nieuw Project Toevoegen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Naam
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Project naam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Klant (optioneel)
                </label>
                <select
                  value={newProject.client}
                  onChange={(e) => setNewProject(prev => ({ ...prev, client: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Geen klant</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beschrijving (optioneel)
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Project beschrijving"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Uurtarief
                </label>
                <input
                  type="number"
                  value={newProject.hourlyRate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 75 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleAddProject}
                  disabled={!newProject.name}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Toevoegen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nieuwe Taak Toevoegen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taak Naam
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Taak naam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project (optioneel)
                </label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Geen project (losse taak)</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} {project.client ? `(${getClientName(project.client)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beschrijving (optioneel)
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Taak beschrijving"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Uurtarief
                </label>
                <input
                  type="number"
                  value={newTask.hourlyRate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 75 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.name}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Toevoegen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
