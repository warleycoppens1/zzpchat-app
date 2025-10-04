'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface DashboardStats {
  overview: {
    totalClients: number
    totalInvoices: number
    totalQuotes: number
    totalTimeEntries: number
  }
  revenue: {
    currentMonth: number
    previousMonth: number
    growth: number
  }
  invoices: {
    currentMonth: number
    previousMonth: number
    growth: number
    byStatus: {
      draft: number
      sent: number
      paid: number
      overdue: number
      cancelled: number
    }
  }
  quotes: {
    byStatus: {
      draft: number
      sent: number
      accepted: number
      rejected: number
      expired: number
    }
  }
  recent: {
    invoices: any[]
    quotes: any[]
    timeEntries: any[]
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Goedemiddag, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Plan, prioriteer en voltooi je administratieve taken met gemak.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Omzet Deze Maand</p>
              <p className="text-3xl font-bold">€{stats?.revenue.currentMonth.toLocaleString('nl-NL') || '0'}</p>
              <p className="text-indigo-100 text-sm mt-1">
                <span className="inline-flex items-center">
                  <svg className={`w-4 h-4 mr-1 ${stats?.revenue.growth >= 0 ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  {stats?.revenue.growth >= 0 ? '+' : ''}{stats?.revenue.growth.toFixed(1)}% vs vorige maand
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Clients Card */}
        <div className="rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Totaal Klanten</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.overview.totalClients || 0}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Actieve klanten
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Invoices Card */}
        <div className="rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Totaal Facturen</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.overview.totalInvoices || 0}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                <span className="inline-flex items-center">
                  <svg className={`w-4 h-4 mr-1 ${stats?.invoices.growth >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  {stats?.invoices.growth >= 0 ? '+' : ''}{stats?.invoices.growth.toFixed(1)}% deze maand
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Time Entries Card */}
        <div className="rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Uren Geregistreerd</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.overview.totalTimeEntries || 0}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Totaal entries</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Snelle Acties</h2>
              <div className="flex space-x-2">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                  + Nieuw Project
                </button>
                <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Data Importeren
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/dashboard/invoices/new"
                className="group p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Nieuwe Factuur</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Maak een nieuwe factuur aan</p>
                  </div>
                </div>
              </a>

              <a
                href="/dashboard/quotes/new"
                className="group p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Nieuwe Offerte</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stel een offerte op</p>
                  </div>
                </div>
              </a>

              <a
                href="/dashboard/time-entries"
                className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Uren Registreren</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Voeg uren toe aan projecten</p>
                  </div>
                </div>
              </a>

              <a
                href="/dashboard/ai"
                className="group p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">AI Assistent</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start een AI gesprek</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Reminders Card */}
          <div className="rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Herinneringen</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h4 className="font-medium text-gray-900 dark:text-white">Meeting met Arc Company</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tijd: 14:00 - 16:00</p>
                <button className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Meeting
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recente Activiteit</h3>
            </div>
            <div className="space-y-3">
              {stats?.recent.invoices.slice(0, 2).map((invoice: any) => (
                <div key={invoice.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Factuur #{invoice.number} - {invoice.client.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      €{invoice.amount} - {new Date(invoice.createdAt).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                </div>
              ))}
              {stats?.recent.quotes.slice(0, 1).map((quote: any) => (
                <div key={quote.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Offerte {quote.number} - {quote.client.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      €{quote.amount} - {new Date(quote.createdAt).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recent.invoices.length && !stats?.recent.quotes.length) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Nog geen recente activiteit
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
