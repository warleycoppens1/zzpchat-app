'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  period: {
    start: string
    end: string
  }
  revenue: {
    total: number
    growth: number
    trend: string
  }
  invoices: {
    byStatus: Record<string, { count: number; total: number }>
    total: number
  }
  clients: {
    total: number
    top: Array<{
      id: string
      name: string
      company?: string
      totalRevenue: number
      totalInvoices: number
    }>
  }
  timeTracking: {
    totalHours: number
    billableHours: number
    billablePercentage: number
  }
}

interface Widget {
  id: string
  type: 'metric' | 'chart'
  title: string
  enabled: boolean
  order: number
  chartType?: 'line' | 'area' | 'bar' | 'pie'
}

const GRADIENT_COLORS = [
  { from: '#6366f1', to: '#8b5cf6' }, // Indigo to Purple
  { from: '#ec4899', to: '#f43f5e' }, // Pink to Rose
  { from: '#f59e0b', to: '#f97316' }, // Amber to Orange
  { from: '#10b981', to: '#14b8a6' }, // Green to Teal
  { from: '#3b82f6', to: '#06b6d4' }, // Blue to Cyan
]

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#14b8a6']

// Default widgets
const DEFAULT_WIDGETS: Widget[] = [
  { id: 'revenue', type: 'metric', title: 'Revenue', enabled: true, order: 1 },
  { id: 'invoices', type: 'metric', title: 'Facturen', enabled: true, order: 2 },
  { id: 'clients', type: 'metric', title: 'Klanten', enabled: true, order: 3 },
  { id: 'hours', type: 'metric', title: 'Uren', enabled: true, order: 4 },
  { id: 'revenue-trend', type: 'chart', title: 'Revenue Trend', enabled: true, order: 5, chartType: 'line' },
  { id: 'invoice-status', type: 'chart', title: 'Factuur Status', enabled: true, order: 6, chartType: 'pie' },
  { id: 'top-clients', type: 'chart', title: 'Top Klanten', enabled: true, order: 7, chartType: 'bar' },
]

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [invoiceData, setInvoiceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS)
  const [isCustomizing, setIsCustomizing] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadWidgetPreferences()
      fetchAnalytics()
      fetchRevenueData()
      fetchInvoiceData()
    }
  }, [session, period])

  const loadWidgetPreferences = () => {
    const saved = localStorage.getItem('analytics-widgets')
    if (saved) {
      try {
        setWidgets(JSON.parse(saved))
      } catch (e) {
        // Use defaults
      }
    }
  }

  const saveWidgetPreferences = (newWidgets: Widget[]) => {
    setWidgets(newWidgets)
    localStorage.setItem('analytics-widgets', JSON.stringify(newWidgets))
  }

  const toggleWidget = (widgetId: string) => {
    const updated = widgets.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    )
    saveWidgetPreferences(updated)
  }

  const updateChartType = (widgetId: string, chartType: 'line' | 'area' | 'bar' | 'pie') => {
    const updated = widgets.map(w => 
      w.id === widgetId ? { ...w, chartType } : w
    )
    saveWidgetPreferences(updated)
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/analytics/revenue?days=30')
      if (response.ok) {
        const result = await response.json()
        setRevenueData(result.trend || [])
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    }
  }

  const fetchInvoiceData = async () => {
    try {
      const response = await fetch('/api/analytics/invoices')
      if (response.ok) {
        const result = await response.json()
        const chartData = Object.entries(result.byStatus || {}).map(([status, data]: [string, any]) => ({
          name: status,
          value: data.count,
          amount: data.total
        }))
        setInvoiceData(chartData)
      }
    } catch (error) {
      console.error('Failed to fetch invoice data:', error)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const revenueGrowthColor = data.revenue.growth > 0 ? 'text-emerald-400' : data.revenue.growth < 0 ? 'text-red-400' : 'text-gray-400'
  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Glass Effect */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Analytics
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Inzicht in je bedrijfsprestaties
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="px-5 py-2.5 backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 border border-white/30 dark:border-gray-600/30 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isCustomizing ? '✅ Klaar' : '⚙️ Aanpassen'}
              </button>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-5 py-2.5 backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 border border-white/30 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-md"
              >
                <option value="month">Deze Maand</option>
                <option value="year">Dit Jaar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customization Mode */}
        {isCustomizing && (
          <div className="backdrop-blur-xl bg-blue-50/80 dark:bg-blue-900/30 rounded-2xl shadow-xl border border-blue-200/50 dark:border-blue-800/50 p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 text-lg">Widgets Aanpassen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {widgets.map((widget) => (
                <label key={widget.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={widget.enabled}
                    onChange={() => toggleWidget(widget.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{widget.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics - Glass Cards */}
        {enabledWidgets.filter(w => w.type === 'metric').length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {enabledWidgets.filter(w => w.id === 'revenue' && w.type === 'metric').length > 0 && (
              <MetricCard
                title="Revenue"
                value={`€${data.revenue.total.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                change={`${data.revenue.growth > 0 ? '+' : ''}${data.revenue.growth.toFixed(1)}%`}
                changeColor={revenueGrowthColor}
                gradient="from-indigo-500 to-purple-600"
                icon="💰"
              />
            )}
            {enabledWidgets.filter(w => w.id === 'invoices' && w.type === 'metric').length > 0 && (
              <MetricCard
                title="Facturen"
                value={data.invoices.total.toString()}
                subtitle={`${data.invoices.byStatus.PAID?.count || 0} betaald`}
                gradient="from-pink-500 to-rose-600"
                icon="📄"
              />
            )}
            {enabledWidgets.filter(w => w.id === 'clients' && w.type === 'metric').length > 0 && (
              <MetricCard
                title="Klanten"
                value={data.clients.total.toString()}
                gradient="from-amber-500 to-orange-600"
                icon="👥"
              />
            )}
            {enabledWidgets.filter(w => w.id === 'hours' && w.type === 'metric').length > 0 && (
              <MetricCard
                title="Uren"
                value={data.timeTracking.totalHours.toFixed(1)}
                subtitle={`${data.timeTracking.billablePercentage.toFixed(0)}% factureerbaar`}
                gradient="from-emerald-500 to-teal-600"
                icon="⏰"
              />
            )}
          </div>
        )}

        {/* Charts - Glass Cards with Chart Type Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enabledWidgets.filter(w => w.id === 'revenue-trend' && w.type === 'chart').length > 0 && (
            <ChartCard
              title="Revenue Trend"
              data={revenueData}
              widgetId="revenue-trend"
              chartType={widgets.find(w => w.id === 'revenue-trend')?.chartType || 'line'}
              onChartTypeChange={updateChartType}
              dataKey="amount"
              xAxisKey="date"
              gradient={GRADIENT_COLORS[0]}
            />
          )}

          {enabledWidgets.filter(w => w.id === 'invoice-status' && w.type === 'chart').length > 0 && (
            <PieChartCard
              title="Factuur Status"
              data={invoiceData}
              widgetId="invoice-status"
              chartType={widgets.find(w => w.id === 'invoice-status')?.chartType || 'pie'}
              onChartTypeChange={updateChartType}
            />
          )}
        </div>

        {/* Top Clients - Full Width */}
        {enabledWidgets.filter(w => w.id === 'top-clients' && w.type === 'chart').length > 0 && data.clients.top.length > 0 && (
          <ChartCard
            title="Top Klanten"
            data={data.clients.top.slice(0, 10)}
            widgetId="top-clients"
            chartType={widgets.find(w => w.id === 'top-clients')?.chartType || 'bar'}
            onChartTypeChange={updateChartType}
            dataKey="totalRevenue"
            xAxisKey="name"
            gradient={GRADIENT_COLORS[3]}
            fullWidth
          />
        )}
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeColor,
  gradient,
  icon
}: {
  title: string
  value: string
  subtitle?: string
  change?: string
  changeColor?: string
  gradient: string
  icon?: string
}) {
  return (
    <div className="group relative backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
        {change && (
          <p className={`text-sm font-medium mt-2 ${changeColor || 'text-gray-600'}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  )
}

function ChartCard({
  title,
  data,
  widgetId,
  chartType,
  onChartTypeChange,
  dataKey,
  xAxisKey,
  gradient,
  fullWidth = false
}: {
  title: string
  data: any[]
  widgetId: string
  chartType: 'line' | 'area' | 'bar' | 'pie'
  onChartTypeChange: (widgetId: string, chartType: 'line' | 'area' | 'bar' | 'pie') => void
  dataKey: string
  xAxisKey: string
  gradient: { from: string; to: string }
  fullWidth?: boolean
}) {
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <defs>
              <linearGradient id={`gradient-${widgetId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradient.from} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={gradient.to} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" opacity={0.3} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="rgba(148, 163, 184, 0.8)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(148, 163, 184, 0.8)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={gradient.from}
              strokeWidth={3}
              dot={{ fill: gradient.from, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${widgetId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradient.from} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={gradient.to} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" opacity={0.3} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="rgba(148, 163, 184, 0.8)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(148, 163, 184, 0.8)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={gradient.from}
              fill={`url(#gradient-${widgetId})`}
              strokeWidth={3}
            />
          </AreaChart>
        )
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" opacity={0.3} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="rgba(148, 163, 184, 0.8)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="rgba(148, 163, 184, 0.8)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey={dataKey} 
              fill={`url(#gradient-${widgetId})`}
              radius={[8, 8, 0, 0]}
            >
              <defs>
                <linearGradient id={`gradient-${widgetId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradient.from} stopOpacity={1}/>
                  <stop offset="95%" stopColor={gradient.to} stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        )
      default:
        return null
    }
  }

  return (
    <div className={`backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <select
          value={chartType}
          onChange={(e) => onChartTypeChange(widgetId, e.target.value as 'line' | 'area' | 'bar' | 'pie')}
          className="px-3 py-1.5 backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 border border-white/30 dark:border-gray-600/30 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        >
          <option value="line">📈 Lijn</option>
          <option value="area">📊 Vlak</option>
          <option value="bar">📊 Staaf</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

function PieChartCard({
  title,
  data,
  widgetId,
  chartType,
  onChartTypeChange
}: {
  title: string
  data: any[]
  widgetId: string
  chartType: 'line' | 'area' | 'bar' | 'pie'
  onChartTypeChange: (widgetId: string, chartType: 'line' | 'area' | 'bar' | 'pie') => void
}) {
  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
          </PieChart>
        )
      case 'bar':
        return (
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" opacity={0.3} />
            <XAxis type="number" stroke="rgba(148, 163, 184, 0.8)" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="rgba(148, 163, 184, 0.8)" fontSize={12} width={100} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )
      default:
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )
    }
  }

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <select
          value={chartType}
          onChange={(e) => onChartTypeChange(widgetId, e.target.value as 'line' | 'area' | 'bar' | 'pie')}
          className="px-3 py-1.5 backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 border border-white/30 dark:border-gray-600/30 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        >
          <option value="pie">🥧 Cirkel</option>
          <option value="bar">📊 Staaf</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}
