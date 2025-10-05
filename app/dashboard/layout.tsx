'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DarkModeToggle } from '../../components/dark-mode-toggle'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/login') // Not authenticated
  }, [session, status, router])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as Element
        if (!target.closest('.user-menu')) {
          setShowUserMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Top Navigation */}
      <nav className="shadow-sm border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Logo moved to far left */}
              <div className="flex-shrink-0 flex items-center">
                <div className="relative w-8 h-8">
                  {/* Outer circle with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                  {/* White ring */}
                  <div className="absolute inset-0.5 bg-white dark:bg-gray-800 rounded-full"></div>
                  {/* Inner circle with gradient */}
                  <div className="absolute inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    {/* Chat bubble icon */}
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.36L2 22l5.64-1.05C9.96 21.64 11.46 22 13 22h-1c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                      <circle cx="8" cy="12" r="1"/>
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="16" cy="12" r="1"/>
                    </svg>
                  </div>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">ZzpChat</h1>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Zoek facturen, klanten..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* User Menu */}
              <div className="relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                    </div>
                    <a
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Instellingen
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Uitloggen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`hidden md:flex md:flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:w-16' : 'md:w-64'
        }`}>
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {/* Hoofdmenu Titel met Hamburger Menu */}
                {!sidebarCollapsed && (
                  <div className="px-2 mb-4 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hoofdmenu</h3>
                    <button
                      onClick={toggleSidebar}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      aria-label="Toggle sidebar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                )}
                {/* Hamburger menu voor collapsed sidebar */}
                {sidebarCollapsed && (
                  <div className="px-2 mb-4 flex justify-center">
                    <button
                      onClick={toggleSidebar}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      aria-label="Toggle sidebar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="space-y-1">
                  <a
                    href="/dashboard"
                    className={`${
                      pathname === '/dashboard' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={sidebarCollapsed ? 'Dashboard' : ''}
                  >
                    <svg className={`h-5 w-5 ${
                      pathname === '/dashboard' 
                        ? 'text-indigo-500' 
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 group-hover:text-gray-400'
                    } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    {!sidebarCollapsed && 'Dashboard'}
                  </a>
                  <a
                    href="/dashboard/ai"
                    className={`${
                      pathname === '/dashboard/ai' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={sidebarCollapsed ? 'AI Assistent' : ''}
                  >
                    <svg className={`h-5 w-5 ${
                      pathname === '/dashboard/ai' 
                        ? 'text-indigo-500' 
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 group-hover:text-gray-400'
                    } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {!sidebarCollapsed && 'AI Assistent'}
                  </a>
                  <a
                    href="/dashboard/invoices"
                    className={`${
                      pathname === '/dashboard/invoices' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={sidebarCollapsed ? 'Facturen' : ''}
                  >
                    <svg className={`h-5 w-5 ${
                      pathname === '/dashboard/invoices' 
                        ? 'text-indigo-500' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {!sidebarCollapsed && 'Facturen'}
                  </a>
                  <a
                    href="/dashboard/quotes"
                    className={`${
                      pathname === '/dashboard/quotes' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={sidebarCollapsed ? 'Offertes' : ''}
                  >
                    <svg className={`h-5 w-5 ${
                      pathname === '/dashboard/quotes' 
                        ? 'text-indigo-500' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {!sidebarCollapsed && 'Offertes'}
                  </a>
                  <a
                    href="/dashboard/time-entries"
                    className={`${
                      pathname === '/dashboard/time-entries' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={sidebarCollapsed ? 'Urenregistratie' : ''}
                  >
                    <svg className={`h-5 w-5 ${
                      pathname === '/dashboard/time-entries' 
                        ? 'text-indigo-500' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {!sidebarCollapsed && 'Urenregistratie'}
                  </a>
                      <a
                        href="/dashboard/integrations"
                        className={`${
                          pathname === '/dashboard/integrations' 
                            ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                          sidebarCollapsed ? 'justify-center' : ''
                        }`}
                        title={sidebarCollapsed ? 'Integraties' : ''}
                      >
                        <svg className={`h-5 w-5 ${
                          pathname === '/dashboard/integrations' 
                            ? 'text-indigo-500' 
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                        } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {!sidebarCollapsed && 'Integraties'}
                      </a>
                      <a
                        href="/dashboard/contacts"
                        className={`${
                          pathname === '/dashboard/contacts' 
                            ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                          sidebarCollapsed ? 'justify-center' : ''
                        }`}
                        title={sidebarCollapsed ? 'Contacten' : ''}
                      >
                        <svg className={`h-5 w-5 ${
                          pathname === '/dashboard/contacts' 
                            ? 'text-indigo-500' 
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                        } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {!sidebarCollapsed && 'Contacten'}
                      </a>
                  <a
                    href="/dashboard/whatsapp-setup"
                    className={`${
                      pathname === '/dashboard/whatsapp-setup' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={sidebarCollapsed ? 'WhatsApp Setup' : ''}
                  >
                    <svg className={`h-5 w-5 ${
                      pathname === '/dashboard/whatsapp-setup' 
                        ? 'text-indigo-500' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    {!sidebarCollapsed && 'WhatsApp Setup'}
                  </a>
                  <a
                    href="/dashboard/settings"
                    className={`${
                      pathname === '/dashboard/settings' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 border-l-4' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={sidebarCollapsed ? 'Instellingen' : ''}
                  >
                    <svg className={`h-5 w-5 ${
                      pathname === '/dashboard/settings' 
                        ? 'text-indigo-500' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    } ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {!sidebarCollapsed && 'Instellingen'}
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
