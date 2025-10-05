'use client'

import { useState, useEffect } from 'react'
import { DarkModeToggle } from 'components/dark-mode-toggle'
import { QRCode } from 'components/qr-code'
import { InteractiveGridPattern } from 'components/ui/interactive-grid-pattern'
import { cn } from 'lib/utils'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Floating Navigation */}
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg px-6 py-3' 
          : 'bg-transparent px-6 py-4'
      }`}>
        <div className="flex items-center w-full max-w-4xl">
          <div className="flex items-center flex-shrink-0">
            <div className="relative w-8 h-8">
              {/* Outer circle with gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              {/* White ring */}
              <div className="absolute inset-0.5 bg-white rounded-full"></div>
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
            <h1 className={`ml-3 text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
            }`}>ZzpChat</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 ml-12">
            <a href="/pricing" className={`font-medium transition-colors duration-300 hover:opacity-80 ${
              isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white'
            }`}>
              Prijzen
            </a>
            <DarkModeToggle />
            <a href="/login" className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
              isScrolled 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-white text-indigo-600 hover:bg-gray-50'
            }`}>
              Inloggen
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient - Verbeterd */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        {/* Interactive Grid Pattern */}
        <InteractiveGridPattern
          className={cn(
            "absolute inset-0 h-full w-full",
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
            "opacity-40"
          )}
          squares={[35, 35]}
          width={35}
          height={35}
        />
        
        {/* Floating Elements - Subtieler */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Main Content */}
            <div className="lg:col-span-8 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Revolutioneer Je Bedrijf
                <br />
                <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Met Slimme Tools
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Ontdek hoe onze alles-in-één platform je helpt met AI-assistentie, 
                facturatie, offertes en meer – allemaal op één plek.
              </p>

              <p className="text-lg text-white/80 mb-12 leading-relaxed">
                Welkom bij ZzpChat, waar innovatie en efficiëntie samenkomen. Bespaar tijd en groei je business 
                met geavanceerde functies zoals AI-gedreven inzichten, naadloze WhatsApp-integratie en automatische urenregistratie.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <a
                  href="/login"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  Probeer Gratis Uit – Geen Creditcard Nodig!
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-white/70">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10k+</div>
                  <div className="text-sm">ZZP'ers wereldwijd</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-sm">Uptime</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">90%</div>
                  <div className="text-sm">Tijd besparen</div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="relative">
                <QRCode 
                  size="lg" 
                  variant="hero" 
                  className="transform hover:scale-105 transition-transform duration-300 hidden sm:block" 
                />
                <QRCode 
                  size="md" 
                  variant="hero" 
                  className="transform hover:scale-105 transition-transform duration-300 sm:hidden" 
                />
                
                {/* Scan me indicator */}
                <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 hidden xl:block">
                  <div className="flex items-center">
                    <svg 
                      className="w-12 h-8 text-white/60 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ transform: 'scaleX(-1)' }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 8l4 4m0 0l-4 4m4-4H3" 
                      />
                    </svg>
                    <span className="text-white/70 font-handwriting text-lg">
                      scan me
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Start Vandaag Nog En Ervaar Het Verschil!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Met onze moderne AI-technologie en naadloze WhatsApp-integratie, 
              hebben we een platform gemaakt dat aanvoelt als magie en schaalt zo snel als je bedrijf groeit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                AI-Assistentie In Een Oogwenk
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Start een productie-klare AI-assistent via WhatsApp in seconden. Krijg altijd-aan prestaties, 
                zelfs tijdens piekmomenten.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Bliksemsnel vanaf de eerste bericht, helemaal tot duizenden per dag—automatisering gedaan goed.
              </p>
              
              <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm text-green-400">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <code>
                  <span className="text-blue-400">WhatsApp:</span> <span className="text-green-400">"Maak factuur van €500 voor Jan Jansen"</span>
                  <br />
                  <br />
                  <span className="text-purple-400">ZzpChat AI:</span> <span className="text-green-400">"Factuur aangemaakt! Verstuur ik deze naar Jan?"</span>
                  <br />
                  <br />
                  <span className="text-blue-400">WhatsApp:</span> <span className="text-green-400">"Ja, verstuur maar"</span>
                  <br />
                  <br />
                  <span className="text-purple-400">ZzpChat AI:</span> <span className="text-green-400">"✅ Factuur verstuurd via WhatsApp!"</span>
                </code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transition-colors duration-200">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">WhatsApp AI</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Intelligente berichten via WhatsApp</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transition-colors duration-200">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Automatische Facturen</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Van bericht naar factuur in seconden</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transition-colors duration-200">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Urenregistratie</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Automatische tijd tracking</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transition-colors duration-200">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Slimme Offertes</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">AI-gestuurde offerte generatie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Herdefinieer hoe je administratie werkt
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Voeg slimme automatiseringsregels toe met één WhatsApp bericht om je workflow 
                te versnellen met ons wereldwijde AI netwerk.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                AI-powered microservices, draaiend op moderne servers, maximaliseren je productiviteit.
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm text-green-400">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <code>
                <span className="text-blue-400">WhatsApp:</span> <span className="text-green-400">"Toon mijn facturen van deze maand"</span>
                <br />
                <br />
                <span className="text-purple-400">ZzpChat AI:</span> <span className="text-green-400">"📊 Facturen December 2024:"</span>
                <br />
                <span className="text-gray-400">• Factuur #2024-001 - €1.250 (Betaald)</span>
                <br />
                <span className="text-gray-400">• Factuur #2024-002 - €850 (Open)</span>
                <br />
                <span className="text-gray-400">• Factuur #2024-003 - €2.100 (Betaald)</span>
                <br />
                <br />
                <span className="text-yellow-400">💰 Totaal: €4.200 (€3.350 betaald, €850 open)</span>
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Een collaboratieve dashboard ervaring voor je bedrijf
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Krijg AI powered aanbevelingen om je workflow te optimaliseren, of verken en beheer 
              je administratie met onze ingebouwde visuele interface. Gebouwd om je hele team samen te laten werken.
            </p>
          </div>

          <div className="bg-gray-800 rounded-3xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-gray-700 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-300">dashboard.tsx</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-blue-400">import</div>
                  <div className="text-blue-400">const</div>
                  <div className="text-yellow-400">Dashboard</div>
                  <div className="text-blue-400">=</div>
                  <div className="text-purple-400">()</div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-300">invoices.json</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-green-400">{"{"}</div>
                  <div className="text-blue-400">&nbsp;&nbsp;"id": "001"</div>
                  <div className="text-blue-400">&nbsp;&nbsp;"amount": 1250</div>
                  <div className="text-blue-400">&nbsp;&nbsp;"status": "paid"</div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-300">whatsapp.ai</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-blue-400">AI_ASSISTANT</div>
                  <div className="text-blue-400">PROCESS_MESSAGE</div>
                  <div className="text-yellow-400">"create invoice"</div>
                  <div className="text-blue-400">RESPONSE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Powerful Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Krachtige Features In Één Simpele Weergave
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Alles wat je nodig hebt voor efficiënte administratie, overzichtelijk gepresenteerd
            </p>
          </div>

          <div className="relative">
            {/* Central Circle */}
            <div className="flex justify-center mb-16">
              <div className="relative w-64 h-64 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Automatische Facturatie</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Van WhatsApp bericht naar professionele factuur in seconden. 
                  AI verwerkt je verzoeken en maakt automatisch facturen aan.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Geïntegreerde Agenda</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Synchroniseer je agenda en ontvang automatische herinneringen. 
                  Plan afspraken en volg je tijd efficiënt.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Eenvoudige Samenwerking</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Werk samen met je team via WhatsApp. Deel updates, 
                  stel vragen en krijg direct antwoorden van je AI-assistent.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Rapportage</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Bekijk real-time inzichten over je bedrijf. Omzet, 
                  openstaande facturen en productiviteit in één overzicht.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Alles Wat Je Team Nodig Heeft
              </h2>
              <div className="mb-8">
                <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">90%</div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Tijd besparen voor je team</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">Schoon Dashboard</h3>
                <p className="text-white/80 text-sm">Overzichtelijke interface zonder afleiding</p>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">Snelle Setup</h3>
                <p className="text-white/80 text-sm">In 5 minuten aan de slag</p>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">Schaalt Met Je</h3>
                <p className="text-white/80 text-sm">Groeit mee met je bedrijf</p>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">Tijd Synchronisatie</h3>
                <p className="text-white/80 text-sm">Alles perfect op tijd</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Voordat Je Ons Platform Gebruikt
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Herken je deze problemen? ZzpChat lost ze allemaal op
            </p>
          </div>

          <div className="relative">
            {/* Central Phone */}
            <div className="flex justify-center mb-16">
              <div className="relative">
                <div className="w-48 h-96 bg-gray-900 rounded-3xl p-2">
                  <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm">ZzpChat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">Te Veel Tools</h3>
                <p className="text-white/80 text-sm">Verschillende apps voor verschillende taken</p>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">Te Veel Tabbladen</h3>
                <p className="text-white/80 text-sm">Verlies je overzicht in de chaos</p>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">Gebrek Aan Overzicht</h3>
                <p className="text-white/80 text-sm">Weet niet waar je staat met je business</p>
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">Overinformatie</h3>
                <p className="text-white/80 text-sm">Verdrink in te veel data en documenten</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-white mb-6">
                Klaar om ZzpChat te proberen?
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Start je WhatsApp AI-assistent in een oogwenk om de kracht van ZzpChat te ervaren. 
                Probeer gratis uit – geen creditcard nodig.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="/login"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl inline-block"
                >
                  Probeer Gratis Uit – Geen Creditcard Nodig!
                </a>
                <a
                  href="/dashboard/whatsapp-setup"
                  className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all transform hover:scale-105 inline-block"
                >
                  WhatsApp Setup
                </a>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <QRCode 
                  size="lg" 
                  variant="cta" 
                  className="transform hover:scale-105 transition-transform duration-300 hidden sm:block" 
                />
                <QRCode 
                  size="md" 
                  variant="cta" 
                  className="transform hover:scale-105 transition-transform duration-300 sm:hidden" 
                />
                
                {/* Floating elements around QR */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-white/30 rounded-full animate-pulse delay-500"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-white/25 rounded-full animate-pulse delay-1000"></div>
              </div>
              
              {/* Alternative text for mobile */}
              <div className="mt-4 lg:hidden">
                <p className="text-white/70 text-center text-sm">
                  Scan de QR-code met je telefoon camera of WhatsApp om direct te beginnen
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-bold">ZzpChat</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Een AI-platform gemaakt voor ZZP'ers. Automatiseer je administratie, 
                en schaal je bedrijf moeiteloos met WhatsApp AI-assistentie.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="/dashboard/ai" className="hover:text-white transition-colors">AI Assistent</a></li>
                <li><a href="/dashboard/invoices" className="hover:text-white transition-colors">Facturen</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Prijzen</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentatie</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraties</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Klantverhalen</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 ZzpChat. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
