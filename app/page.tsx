'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DarkModeToggle } from '../components/dark-mode-toggle'
import { InteractiveGridPattern } from '../components/ui/interactive-grid-pattern'
import { 
  Zap, FileText, Timer, MessageSquare, Bot, Sparkles, BarChart,
  Star, ArrowRight, Check, Phone, Users, Mail, Calendar, TrendingUp, Globe
} from 'lucide-react'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      {/* Floating Navigation */}
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-black/80 dark:border-purple-900/30 backdrop-blur-md border border-gray-200 dark:border-slate-800/50 rounded-2xl shadow-lg dark:shadow-purple-900/20 px-6 py-3' 
          : 'bg-transparent px-6 py-4'
      }`}>
        <div className="flex items-center w-full max-w-4xl">
          <button 
            onClick={scrollToTop}
            className="flex items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
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
              isScrolled ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
            }`}>ZzpChat</h1>
          </button>
          
          <div className="hidden md:flex items-center space-x-8 ml-12">
            <a href="/pricing" className={`font-medium transition-colors duration-300 hover:opacity-80 ${
              isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-700 dark:text-white'
            }`}>
              Prijzen
            </a>
            <DarkModeToggle />
            <a href="/login" className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
              isScrolled 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-indigo-600 dark:hover:bg-gray-50'
            }`}>
              Inloggen
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-indigo-50/20 dark:from-black dark:via-slate-950 dark:to-black">
        {/* Dark mode background with glow effects */}
        <div className="absolute inset-0 hidden dark:block">
          {/* Deep black background */}
          <div className="absolute inset-0 bg-black"></div>
          
          {/* Purple glow gradients for lighting effects */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/30 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/30 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-950/20 rounded-full blur-[140px]"></div>
          </div>
          
          {/* Interactive Grid Pattern */}
          <InteractiveGridPattern
            className="opacity-40"
            squares={[20, 20]}
            width={60}
            height={60}
            squaresClassName="stroke-purple-900/30 hover:stroke-purple-700/60 hover:fill-purple-900/20 transition-all duration-300"
          />
        </div>
        
        {/* Light mode with interactive grid and soft gradient */}
        <div className="absolute inset-0 dark:hidden">
          {/* Soft gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-indigo-50/40"></div>
          
          {/* Interactive Grid Pattern for light mode */}
          <InteractiveGridPattern
            className="opacity-30"
            squares={[20, 20]}
            width={60}
            height={60}
            squaresClassName="stroke-indigo-200/40 hover:stroke-indigo-300/60 hover:fill-indigo-100/30 transition-all duration-300"
          />
          
          {/* Subtle floating gradients */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Je slimme AI-assistent voor
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  facturen, offertes en uren
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Beheer je administratie direct via WhatsApp — facturen maken, offertes versturen, uren registreren. Alles in één gesprek.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <motion.a
                  href="/login"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-indigo-500/50 dark:hover:shadow-indigo-500/30 transition-all shadow-lg dark:shadow-indigo-900/20"
                >
                  Probeer gratis
                </motion.a>
                <motion.a
                  href="#features"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-indigo-600 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all"
                >
                  Bekijk demo
                </motion.a>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-gray-600 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">10k+</div>
                  <div className="text-sm">ZZP'ers wereldwijd</div>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-slate-700"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</div>
                  <div className="text-sm">Uptime</div>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-slate-700"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">90%</div>
                  <div className="text-sm">Tijd besparen</div>
                </div>
              </div>
            </motion.div>

            {/* Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="flex justify-center"
            >
              <div className="relative w-64 h-[500px]">
                {/* Phone frame */}
                <div className="absolute inset-0 bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Phone header notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
                    
                    {/* WhatsApp chat interface */}
                    <div className="pt-8 px-4 h-full flex flex-col bg-gray-50">
                      {/* Chat header */}
                      <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">ZzpChat AI</div>
                          <div className="text-xs text-green-600 flex items-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                            Online
                          </div>
                        </div>
                      </div>
                      
                      {/* Messages */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-start">
                          <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 max-w-[80%] shadow-sm">
                            <p className="text-sm text-gray-900">Maak een factuur van €850 voor Jan Jansen</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-indigo-600 rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                            <p className="text-sm text-white">✅ Factuur aangemaakt!</p>
                            <p className="text-xs text-indigo-100 mt-1">Versturen naar Jan?</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 max-w-[80%] shadow-sm">
                            <p className="text-sm text-gray-900">Ja, verstuur maar</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-green-500 rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                            <p className="text-sm text-white">✅ Verstuurd via WhatsApp!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-indigo-600 dark:border-purple-500 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-indigo-600 dark:bg-purple-400 rounded-full mt-2"></div>
          </motion.div>
        </div>
      </section>

      {/* Why ZzpChat - Feature Highlights */}
      <section id="features" className="py-24 bg-gradient-to-b from-indigo-50/20 via-white to-white dark:from-slate-950 dark:via-black dark:to-slate-950 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Waarom ZzpChat?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Een AI-assistent die écht begrijpt hoe ZZP'ers werken
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Slimmer werken, niet harder
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatiseer repetitieve taken en focus op waar je écht goed in bent. Laat de AI de administratie afhandelen.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Facturen & offertes in minuten
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Van WhatsApp bericht naar professionele factuur in seconden. Geen complexe software nodig.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Timer className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Uren en klantenbeheer zonder rompslomp
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Registreer uren terwijl je praat, beheer klanten en volg alles automatisch bij.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - 4-Step Visual Flow */}
      <section className="py-24 bg-gradient-to-b from-white via-indigo-50/10 to-indigo-50/20 dark:from-black dark:via-slate-950 dark:to-black transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Hoe het werkt
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Simpel, snel en effectief. In 4 stappen op weg
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: MessageSquare, title: 'Verbind je WhatsApp', desc: 'Koppel je WhatsApp in één klik' },
              { step: 2, icon: Bot, title: 'Praat met de AI', desc: 'Start een natuurlijk gesprek' },
              { step: 3, icon: Sparkles, title: 'ZzpChat doet de rest', desc: 'Automatische verwerking en uitvoering' },
              { step: 4, icon: BarChart, title: 'Bekijk je dashboard', desc: 'Overzicht van alle acties' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transform translate-y-[-50%]">
                      <div className="absolute right-0 top-[-6px] w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12"
          >
            <motion.a
              href="#demo"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Bekijk demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Key Features - Storytelling with alternating layout */}
      <section className="py-24 bg-gradient-to-b from-indigo-50/20 via-white to-white dark:from-slate-950 dark:via-black dark:to-slate-950 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Krachtige features voor slimme ZZP'ers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Alles wat je nodig hebt in één platform
            </p>
          </motion.div>

          {/* Feature 1: AI Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
          >
            <div className="order-2 lg:order-1">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">AI Chat Integration</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Chat met je AI-assistent via WhatsApp zoals je zou praten met een collega. Geen ingewikkelde commands of menus.
              </p>
              <ul className="space-y-3">
                {['Natuurlijke gesprekken', 'Contextueel begrip', '24/7 beschikbaarheid'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-3xl p-8 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl shadow-xl p-6">
                  <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900 dark:text-white">ZzpChat AI</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                        Online
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
                      <p className="text-sm text-gray-900 dark:text-white">Maak offerte €2000 voor MarketingExpert</p>
                    </div>
                    <div className="bg-indigo-600 rounded-lg px-4 py-2">
                      <p className="text-sm text-white">✅ Offerte #2025-001 aangemaakt!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Facturen & Offertes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
          >
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-3xl p-8 flex items-center justify-center">
              <div className="w-full max-w-sm bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Factuur #2025-042</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">15 Jan 2025</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">€1.850</div>
                    <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Betaald</div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Web development</span>
                    <span className="font-semibold text-gray-900 dark:text-white">€1.500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Consultancy</span>
                    <span className="font-semibold text-gray-900 dark:text-white">€350</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Facturen & Offertes</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Professionele facturen en offertes gegenereerd in seconden, verstuurd via WhatsApp of email.
              </p>
              <ul className="space-y-3">
                {['Automatische nummering', 'Mollie integratie', 'PDF export'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Feature 3: Urenregistratie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
          >
            <div>
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Timer className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Urenregistratie</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Registreer uren via voice of text. AI linkt automatisch aan projecten en klanten.
              </p>
              <ul className="space-y-3">
                {['Voice memo support', 'Project tracking', 'Automatische berekening'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-3xl p-8 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl shadow-xl p-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">Vandaag</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Website Project</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">09:00 - 12:30</div>
                      </div>
                      <div className="text-lg font-bold text-indigo-600">3.5u</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Consultancy</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">14:00 - 17:00</div>
                      </div>
                      <div className="text-lg font-bold text-purple-600">3.0u</div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-900 dark:text-white">Totaal</span>
                      <span className="text-2xl font-bold text-indigo-600">6.5u</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 4: Klantenbeheer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
          >
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-3xl p-8 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl shadow-xl p-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">Mijn Klanten</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Jan Jansen', company: 'TechStart', status: '€5.200' },
                      { name: 'Marieke Bakker', company: 'DesignCo', status: '€3.100' },
                      { name: 'Thomas de Vries', company: 'WebExpert', status: '€2.400' }
                    ].map((client, i) => (
                      <div key={i} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold">{client.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">{client.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{client.company}</div>
                        </div>
                        <div className="text-sm font-bold text-indigo-600">{client.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Klantenbeheer</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Centraal overzicht van alle klanten met automatische statistieken en inzichten.
              </p>
              <ul className="space-y-3">
                {['Contact beheer', 'Omzet tracking', 'Geschiedenis overzicht'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Feature 5: Automatiseringen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
          >
            <div>
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Automatiseringen</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Stel slimme workflows in die automatisch draaien. Van reminders tot rapporten.
              </p>
              <ul className="space-y-3">
                {['Scheduled tasks', 'Email automatisch', 'Smart reminders'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-3xl p-8 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl shadow-xl p-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">Actieve Automatiseringen</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Weekrapportage', schedule: 'Elke maandag', icon: '📊' },
                      { name: 'Factuur Reminder', schedule: 'Bij 30 dagen', icon: '📧' },
                      { name: 'Sprint Samenvatting', schedule: 'Elke vrijdag', icon: '📅' }
                    ].map((auto, i) => (
                      <div key={i} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl mr-3">{auto.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">{auto.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{auto.schedule}</div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 6: Integraties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-3xl p-8 flex items-center justify-center">
              <div className="w-full">
                <div className="grid grid-cols-3 gap-4">
                  {['Google', 'Outlook', 'Mollie', 'Calendar', 'Drive', 'Slack'].map((service, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-xl p-4 shadow-md flex flex-col items-center hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-white font-bold text-sm">{service.charAt(0)}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Integraties</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Koppel met de tools die je al gebruikt. Google, Outlook, Mollie en meer.
              </p>
              <ul className="space-y-3">
                {['OAuth authenticatie', 'API connecties', 'Data synchronisatie'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-white via-indigo-50/10 to-indigo-100/40 dark:from-slate-950 dark:via-black dark:to-slate-950 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Wat ZZP'ers zeggen over ZzpChat
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Echte feedback van echte gebruikers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Sinds ik ZzpChat gebruik, maak ik facturen in minder dan 2 minuten. Ik heb zoveel tijd bespaard!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">MJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Marieke van Dijk</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Freelance Coach</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "De WhatsApp integratie is briljant. Ik kan alles regelen onderweg naar klanten. Echt een game changer!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">TV</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Thomas de Vries</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Web Developer</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Eindelijk een tool die écht begrijpt hoe ZZP'ers werken. De AI is slim en snapt precies wat ik bedoel."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">SB</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Sophie Bakker</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Grafisch Ontwerper</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Klaar om je administratie slimmer te maken?
            </h2>
            <p className="text-xl text-indigo-100 mb-12 max-w-3xl mx-auto">
              Start vandaag nog met ZzpChat en laat de AI het werk doen. Geen creditcard nodig.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 255, 255, 0.3)',
                    '0 0 40px rgba(255, 255, 255, 0.6)',
                    '0 0 20px rgba(255, 255, 255, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all inline-block"
              >
                Start gratis
              </motion.a>
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all inline-block"
              >
                Bekijk demo
              </motion.a>
            </div>
          </motion.div>
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

