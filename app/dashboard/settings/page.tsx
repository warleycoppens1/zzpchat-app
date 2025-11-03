'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserProfile {
  name: string
  email: string
  profileImage?: string
  language: string
  region: string
}

interface AISettings {
  assistantName: string
  toneOfVoice: 'formal' | 'neutral' | 'friendly' | 'creative'
  outputPreference: 'short' | 'detailed' | 'bullets'
  specializations: string[]
  dataRetention: number
}

interface NotificationSettings {
  emailNotifications: boolean
  whatsappNotifications: boolean
  slackNotifications: boolean
}

interface ThemeSettings {
  darkMode: boolean
  accentColor: string
  layout: 'compact' | 'spacious'
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  twoFactorMethod: 'email' | 'app'
}

interface SubscriptionSettings {
  plan: 'monthly' | 'yearly'
  price: number
  nextBilling: string
  paymentMethod: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('profile')
  
  const [profile, setProfile] = useState<UserProfile>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    profileImage: session?.user?.image || '',
    language: 'nl',
    region: 'NL'
  })

  // Update profile when session changes
  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
        profileImage: session.user.image || prev.profileImage,
      }))
    }
  }, [session])

  const [aiSettings, setAISettings] = useState<AISettings>({
    assistantName: 'Lisa',
    toneOfVoice: 'friendly',
    outputPreference: 'detailed',
    specializations: ['facturatie', 'planning'],
    dataRetention: 30
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    whatsappNotifications: false,
    slackNotifications: true
  })

  const [theme, setTheme] = useState<ThemeSettings>({
    darkMode: false,
    accentColor: '#f59e0b', // amber-500
    layout: 'compact'
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    twoFactorMethod: 'email'
  })

  const [subscription, setSubscription] = useState<SubscriptionSettings>({
    plan: 'monthly',
    price: 9.95,
    nextBilling: '2024-02-15',
    paymentMethod: '**** 1234'
  })

  const [integrations, setIntegrations] = useState([
    { name: 'WhatsApp', status: 'disconnected', type: 'whatsapp' },
    { name: 'Gmail', status: 'connected', type: 'email' },
    { name: 'Google Drive', status: 'disconnected', type: 'storage' },
    { name: 'Slack', status: 'connected', type: 'messaging' },
    { name: 'Outlook', status: 'disconnected', type: 'email' }
  ])

  const accentColors = [
    { name: 'Amber', value: '#f59e0b', class: 'bg-amber-500' },
    { name: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' },
    { name: 'Emerald', value: '#10b981', class: 'bg-emerald-500' },
    { name: 'Rose', value: '#f43f5e', class: 'bg-rose-500' },
    { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
    { name: 'Cyan', value: '#06b6d4', class: 'bg-cyan-500' }
  ]

  const specializationOptions = [
    { id: 'facturatie', label: 'Facturatie' },
    { id: 'emails', label: 'E-mail samenvatting' },
    { id: 'planning', label: 'Planning' },
    { id: 'urenregistratie', label: 'Urenregistratie' },
    { id: 'offertes', label: 'Offertes' },
    { id: 'klantcommunicatie', label: 'Klantcommunicatie' }
  ]

  const tabs = [
    { id: 'profile', label: 'Profiel & Account', icon: '👤' },
    { id: 'ai', label: 'AI Assistent', icon: '🤖' },
    { id: 'integrations', label: 'Integraties', icon: '🔌' },
    { id: 'subscription', label: 'Abonnement', icon: '💳' },
    { id: 'theme', label: 'Thema & Voorkeuren', icon: '🎨' },
    { id: 'security', label: 'Beveiliging', icon: '🔒' }
  ]

  const handleSpecializationChange = (specializationId: string, checked: boolean) => {
    setAISettings(prev => ({
      ...prev,
      specializations: checked 
        ? [...prev.specializations, specializationId]
        : prev.specializations.filter(id => id !== specializationId)
    }))
  }

  const handleAccentColorChange = (color: string) => {
    setTheme(prev => ({ ...prev, accentColor: color }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && session?.user?.id) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string
        setProfile(prev => ({ ...prev, profileImage: imageDataUrl }))
        
        try {
          // Update user profile in database
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: imageDataUrl
            })
          })
          
          if (response.ok) {
            // Update session data
            const { update } = await import('next-auth/react')
            await update({
              user: {
                ...session.user,
                image: imageDataUrl
              }
            })
          }
        } catch (error) {
          console.error('Error updating profile image:', error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const getStatusIcon = (status: string) => {
    return status === 'connected' ? '✅' : '❌'
  }

  const getIntegrationIcon = (name: string) => {
    switch (name) {
      case 'WhatsApp': return '💬'
      case 'Gmail': return '📧'
      case 'Google Drive': return '☁️'
      case 'Slack': return '💬'
      case 'Outlook': return '📨'
      default: return '🔌'
    }
  }

  const handleWhatsAppSetup = () => {
    window.location.href = '/dashboard/whatsapp-setup'
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Instellingen</h2>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Profile & Account */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Persoonlijke Gegevens</h3>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-gray-500 dark:text-gray-400">👤</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{profile.name}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lid sinds januari 2024</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Volledige naam
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Wachtwoord & Toegang</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Wachtwoord wijzigen</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Laatst gewijzigd 3 maanden geleden</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Wijzigen
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Google Inloggen</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verbonden met jan@example.com</p>
                  </div>
                  <button className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                    Verbreken
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Taal & Regio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Taal
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="nl">Nederlands</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Regio
                  </label>
                  <select
                    value={profile.region}
                    onChange={(e) => setProfile(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="NL">Nederland</option>
                    <option value="BE">België</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Meldingen</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">E-mail notificaties</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ontvang updates via e-mail</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">WhatsApp meldingen</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ontvang belangrijke updates via WhatsApp</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.whatsappNotifications}
                    onChange={(e) => setNotifications(prev => ({ ...prev, whatsappNotifications: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Slack meldingen</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ontvang updates in je Slack kanalen</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.slackNotifications}
                    onChange={(e) => setNotifications(prev => ({ ...prev, slackNotifications: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Assistent */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">AI Assistent Configuratie</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Naam van je assistent
                  </label>
                  <input
                    type="text"
                    value={aiSettings.assistantName}
                    onChange={(e) => setAISettings(prev => ({ ...prev, assistantName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Bijv. Lisa, Mijn AI Coach"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tone of Voice
                  </label>
                  <select
                    value={aiSettings.toneOfVoice}
                    onChange={(e) => setAISettings(prev => ({ ...prev, toneOfVoice: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="formal">Formeel</option>
                    <option value="neutral">Neutraal</option>
                    <option value="friendly">Vriendelijk</option>
                    <option value="creative">Creatief</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voorkeursoutput
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'short', label: 'Korte samenvatting', desc: 'Beknopt en direct' },
                    { value: 'detailed', label: 'Uitgebreide uitleg', desc: 'Gedetailleerd en compleet' },
                    { value: 'bullets', label: 'Opsommingen', desc: 'Gestructureerd in punten' }
                  ].map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        type="radio"
                        name="outputPreference"
                        value={option.value}
                        checked={aiSettings.outputPreference === option.value}
                        onChange={(e) => setAISettings(prev => ({ ...prev, outputPreference: e.target.value as any }))}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        aiSettings.outputPreference === option.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
                        <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Specialisaties
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specializationOptions.map((option) => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={aiSettings.specializations.includes(option.id)}
                        onChange={(e) => handleSpecializationChange(option.id, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dataretentie & Privacy
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verwijder gesprekken na</span>
                  <select
                    value={aiSettings.dataRetention}
                    onChange={(e) => setAISettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="7">7 dagen</option>
                    <option value="30">30 dagen</option>
                    <option value="90">90 dagen</option>
                    <option value="365">1 jaar</option>
                    <option value={0}>Nooit</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Gesprekken worden automatisch verwijderd na de geselecteerde periode voor je privacy
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Integraties */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* WhatsApp Integration Highlight */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">WhatsApp AI Assistent</h3>
                    <p className="text-green-700 dark:text-green-300">Koppel je WhatsApp voor directe AI-ondersteuning</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-full">
                    Niet gekoppeld
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Scan een QR-code om je WhatsApp te koppelen aan je AI-assistent
                </p>
                <button
                  onClick={handleWhatsAppSetup}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  QR-code tonen
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Andere Integraties</h3>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Beheer integraties
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.filter(integration => integration.name !== 'WhatsApp').map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getIntegrationIcon(integration.name)}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {integration.status === 'connected' ? 'Verbonden' : 'Niet verbonden'}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg">{getStatusIcon(integration.status)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Abonnement & Betalingen */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Abonnement & Betalingen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg text-white">
                  <h4 className="font-semibold mb-2">Huidig Abonnement</h4>
                  <div className="text-2xl font-bold mb-1">€{subscription.price}/maand</div>
                  <div className="text-indigo-100 text-sm">
                    {subscription.plan === 'monthly' ? 'Maandelijks' : 'Jaarlijks'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Volgende Factuur</h4>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">€{subscription.price}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(subscription.nextBilling).toLocaleDateString('nl-NL')}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Betaalmethode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{subscription.paymentMethod}</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Wijzigen
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Facturen</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Download je facturen</p>
                  </div>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                    Downloaden
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Plan Wijzigen</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upgrade of downgrade je abonnement</p>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    Wijzigen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thema & Voorkeuren */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Thema & Voorkeuren</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Dark / Light Mode
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        checked={!theme.darkMode}
                        onChange={() => setTheme(prev => ({ ...prev, darkMode: false }))}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Light Mode</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        checked={theme.darkMode}
                        onChange={() => setTheme(prev => ({ ...prev, darkMode: true }))}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Accentkleur
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleAccentColorChange(color.value)}
                        className={`w-12 h-12 rounded-lg ${color.class} ${
                          theme.accentColor === color.value
                            ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white'
                            : 'hover:scale-110'
                        } transition-all duration-200`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Layout
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'compact', label: 'Compact', desc: 'Meer informatie per scherm' },
                      { value: 'spacious', label: 'Ruim', desc: 'Meer leesbaarheid en ruimte' }
                    ].map((option) => (
                      <label key={option.value} className="relative">
                        <input
                          type="radio"
                          name="layout"
                          value={option.value}
                          checked={theme.layout === option.value}
                          onChange={(e) => setTheme(prev => ({ ...prev, layout: e.target.value as any }))}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          theme.layout === option.value
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}>
                          <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beveiliging & Toegang */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Beveiliging & Toegang</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Twee-factor-authenticatie (2FA)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {security.twoFactorEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'} - Extra beveiliging voor je account
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="2fa-method"
                        checked={security.twoFactorMethod === 'email'}
                        onChange={() => setSecurity(prev => ({ ...prev, twoFactorMethod: 'email' }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">E-mail</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="2fa-method"
                        checked={security.twoFactorMethod === 'app'}
                        onChange={() => setSecurity(prev => ({ ...prev, twoFactorMethod: 'app' }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">App</span>
                    </label>
                    <button
                      onClick={() => setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        security.twoFactorEnabled
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {security.twoFactorEnabled ? 'Uitschakelen' : 'Inschakelen'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Beveiligingstip</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Schakel 2FA in voor extra beveiliging. Dit voorkomt onbevoegde toegang tot je account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actieve Sessies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">3 actieve sessies</p>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300">
                      Bekijk alle sessies
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Login Geschiedenis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Laatste login: vandaag</p>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300">
                      Bekijk geschiedenis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Instellingen Opslaan
          </button>
        </div>
      </div>
    </div>
  )
}
