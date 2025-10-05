'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check for saved theme preference on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])


  const toggleDarkMode = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
      } else {
        setError('Ongeldige email of wachtwoord. Probeer het opnieuw.')
      }
    } catch (error) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
      {/* Main Login Card - Full Screen with Rounded Edges */}
      <div className="h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Logo - Fixed position linksboven - Nu klikbaar */}
        <Link 
          href="/"
          className="absolute top-6 left-6 flex items-center z-20 hover:opacity-80 transition-opacity duration-200"
          aria-label="Ga naar homepage"
        >
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
          <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
            ZzpChat
          </h1>
        </Link>
        
        {/* Dark Mode Toggle - Separate from logo */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
              {isDark ? (
                // Sun icon for light mode
                <svg 
                  className="w-5 h-5 text-gray-600 dark:text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg 
                  className="w-5 h-5 text-gray-600 dark:text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                  />
                </svg>
              )}
            </button>
        </div>

        <div className="h-full flex">
          {/* Left Column - Login Form */}
          <div className="flex-1 flex flex-col justify-center py-12 px-8 sm:px-12 lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm lg:w-96">
              {/* Welcome - Logo is now at top */}
              <div className="mb-8 mt-16 ml-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welkom
          </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Voer je email en wachtwoord in om toegang te krijgen tot je account.
                </p>
              </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}


              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
            <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
              </label>
              <input
                    id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="je@email.nl"
              />
            </div>

                {/* Password Field */}
            <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
              />
            </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Onthoud mij
                    </label>
                  </div>
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Wachtwoord vergeten?
                  </a>
          </div>

                {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Inloggen...
                    </div>
                  ) : (
                    'Inloggen'
                  )}
            </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Of login met</span>
                  </div>
          </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Inloggen met Google
                  </button>
                </div>
              </form>

              {/* Register Link */}
              <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Nog geen account?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Registreer nu.
                </Link>
              </p>

              {/* Footer */}
              <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                Copyright © 2025 ZzpChat Enterprises LTD.{' '}
                <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Preview Card */}
          <div className="hidden lg:flex flex-1 items-center justify-center p-6">
            {/* Dashboard Preview Card - Extra large and centered */}
            <div className="w-full max-w-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-3xl shadow-2xl p-12 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-5 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 right-5 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-12">
                  <h2 className="text-4xl font-bold text-white mb-6">
                    Beheer moeiteloos je bedrijf
                  </h2>
                  <p className="text-indigo-100 text-xl">
                    Log in om toegang te krijgen tot je ZzpChat dashboard en beheer je AI-assistent.
                  </p>
                </div>

                {/* Dashboard Preview */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Total Revenue Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h3 className="text-white/80 text-base font-medium mb-3">Totale Omzet</h3>
                    <div className="text-4xl font-bold text-white mb-3">€12.847</div>
                    <div className="text-green-400 text-base">+12% van vorige maand</div>
                  </div>

                  {/* AI Performance Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h3 className="text-white/80 text-base font-medium mb-3">AI Prestaties</h3>
                    <div className="text-4xl font-bold text-white mb-3">98.5%</div>
                    <div className="text-blue-400 text-base">Tevredenheid score</div>
                  </div>

                  {/* WhatsApp Messages Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h3 className="text-white/80 text-base font-medium mb-3">WhatsApp Berichten</h3>
                    <div className="text-4xl font-bold text-white mb-3">1.247</div>
                    <div className="text-purple-400 text-base">Deze maand</div>
                  </div>

                  {/* Active Clients Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h3 className="text-white/80 text-base font-medium mb-3">Actieve Klanten</h3>
                    <div className="text-4xl font-bold text-white mb-3">89</div>
                    <div className="text-yellow-400 text-base">+5 deze week</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
