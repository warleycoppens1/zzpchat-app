'use client'

import { useState, useRef } from 'react'

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface QuoteData {
  quoteNumber: string
  date: string
  validUntil: string
  billTo: {
    name: string
    company: string
    address: string
    email: string
  }
  billFrom: {
    name: string
    company: string
    address: string
    email: string
    phone: string
  }
  lineItems: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  shipping: number
  total: number
  notes: string
  terms: string
  logo?: string
  currency: string
}

export default function QuotesPage() {
  const [quoteData, setQuoteData] = useState<QuoteData>({
    quoteNumber: `OFF-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billTo: {
      name: '',
      company: '',
      address: '',
      email: ''
    },
    billFrom: {
      name: 'Jan Jansen',
      company: 'Jansen ZZP',
      address: 'Straatnaam 123, 1234 AB Amsterdam',
      email: 'jan@jansenzzp.nl',
      phone: '+31 6 12345678'
    },
    lineItems: [
      {
        id: '1',
        description: 'Website ontwikkeling',
        quantity: 40,
        rate: 75,
        amount: 3000
      }
    ],
    subtotal: 3000,
    taxRate: 21,
    taxAmount: 630,
    discountRate: 0,
    discountAmount: 0,
    shipping: 0,
    total: 3630,
    notes: '',
    terms: 'Deze offerte is 30 dagen geldig. Betaling binnen 14 dagen na akkoord.',
    currency: 'EUR'
  })

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = quoteData.lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate
        }
        return updatedItem
      }
      return item
    })
    
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (quoteData.taxRate / 100)
    const discountAmount = subtotal * (quoteData.discountRate / 100)
    const total = subtotal + taxAmount + discountAmount + quoteData.shipping

    setQuoteData(prev => ({
      ...prev,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      discountAmount,
      total
    }))
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }
    setQuoteData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }))
  }

  const removeLineItem = (id: string) => {
    setQuoteData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setQuoteData(prev => ({
          ...prev,
          logo: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false)
      // Here you would implement actual PDF generation
      console.log('PDF generated for quote:', quoteData.quoteNumber)
    }, 2000)
  }

  const saveTemplate = () => {
    if (templateName.trim()) {
      // Here you would save to database
      console.log('Template saved:', templateName)
      setShowTemplateModal(false)
      setTemplateName('')
    }
  }

  const sendWithAssistant = () => {
    // This would open the AI assistant with pre-filled context
    window.open('/dashboard/ai?context=quote&quoteNumber=' + quoteData.quoteNumber, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offerte Generator</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Maak professionele offertes en exporteer ze naar PDF
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Opslaan als Template
          </button>
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isGeneratingPDF ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Genereren...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={sendWithAssistant}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Verstuur met AI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Quote Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Offerte Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Offertenummer
                </label>
                <input
                  type="text"
                  value={quoteData.quoteNumber}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, quoteNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valuta
                </label>
                <select
                  value={quoteData.currency}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  value={quoteData.date}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Geldig tot
                </label>
                <input
                  type="date"
                  value={quoteData.validUntil}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logo</h3>
            <div className="flex items-center space-x-4">
              {quoteData.logo && (
                <img src={quoteData.logo} alt="Logo" className="w-16 h-16 object-contain border border-gray-200 dark:border-gray-700 rounded-lg" />
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {quoteData.logo ? 'Logo Wijzigen' : 'Logo Toevoegen'}
                </button>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Offerte voor</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Naam
                  </label>
                  <input
                    type="text"
                    value={quoteData.billTo.name}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, billTo: { ...prev.billTo, name: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Klant naam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bedrijf
                  </label>
                  <input
                    type="text"
                    value={quoteData.billTo.company}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, billTo: { ...prev.billTo, company: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Bedrijfsnaam"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adres
                </label>
                <textarea
                  value={quoteData.billTo.address}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, billTo: { ...prev.billTo, address: e.target.value } }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Straatnaam 123&#10;1234 AB Stad&#10;Nederland"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={quoteData.billTo.email}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, billTo: { ...prev.billTo, email: e.target.value } }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="klant@bedrijf.nl"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
              <button
                onClick={addLineItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Item Toevoegen
              </button>
            </div>
            
            <div className="space-y-4">
              {quoteData.lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Beschrijving
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Service/product beschrijving"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Aantal
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tarief
                    </label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bedrag
                    </label>
                    <input
                      type="number"
                      value={item.amount}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Totaal</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotaal:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                  {quoteData.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">BTW ({quoteData.taxRate}%):</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                  {quoteData.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Korting:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  -{quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                  {quoteData.discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Verzending:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                  {quoteData.shipping.toFixed(2)}
                </span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Totaal:</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                  {quoteData.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Opmerkingen</h3>
            <textarea
              value={quoteData.notes}
              onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Extra informatie over de offerte..."
            />
          </div>

          {/* Terms */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voorwaarden</h3>
            <textarea
              value={quoteData.terms}
              onChange={(e) => setQuoteData(prev => ({ ...prev, terms: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Algemene voorwaarden, betalingsvoorwaarden, etc."
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Preview</h2>
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <div className="max-w-md mx-auto">
              {/* Quote Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  {quoteData.logo && (
                    <img src={quoteData.logo} alt="Logo" className="h-12 mb-2" />
                  )}
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">OFFERTE</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">#{quoteData.quoteNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Datum: {new Date(quoteData.date).toLocaleDateString('nl-NL')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Geldig tot: {new Date(quoteData.validUntil).toLocaleDateString('nl-NL')}</p>
                </div>
              </div>

              {/* Bill From */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Van:</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{quoteData.billFrom.name}</p>
                  <p>{quoteData.billFrom.company}</p>
                  <p>{quoteData.billFrom.address}</p>
                  <p>{quoteData.billFrom.email}</p>
                  <p>{quoteData.billFrom.phone}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Voor:</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{quoteData.billTo.name || 'Klant naam'}</p>
                  <p>{quoteData.billTo.company || 'Bedrijfsnaam'}</p>
                  <p>{quoteData.billTo.address || 'Adres'}</p>
                  <p>{quoteData.billTo.email || 'email@bedrijf.nl'}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 font-medium text-gray-900 dark:text-white">Beschrijving</th>
                      <th className="text-center py-2 font-medium text-gray-900 dark:text-white">Aantal</th>
                      <th className="text-right py-2 font-medium text-gray-900 dark:text-white">Tarief</th>
                      <th className="text-right py-2 font-medium text-gray-900 dark:text-white">Bedrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteData.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-900 dark:text-white">{item.description || 'Item beschrijving'}</td>
                        <td className="py-2 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                          {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                          {item.rate.toFixed(2)}
                        </td>
                        <td className="py-2 text-right text-gray-900 dark:text-white font-medium">
                          {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                          {item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="text-right text-sm mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Subtotaal:</span>
                  <span className="text-gray-900 dark:text-white">
                    {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                    {quoteData.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 dark:text-gray-400">BTW ({quoteData.taxRate}%):</span>
                  <span className="text-gray-900 dark:text-white">
                    {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                    {quoteData.taxAmount.toFixed(2)}
                  </span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700 my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900 dark:text-white">Totaal:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {quoteData.currency === 'EUR' ? '€' : quoteData.currency === 'USD' ? '$' : '£'}
                    {quoteData.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {quoteData.notes && (
                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Opmerkingen:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{quoteData.notes}</p>
                </div>
              )}

              {quoteData.terms && (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Voorwaarden:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{quoteData.terms}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Template Opslaan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Naam
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Bijv. Standaard Offerte"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={saveTemplate}
                  disabled={!templateName.trim()}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
