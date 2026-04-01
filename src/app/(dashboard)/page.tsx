'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building,
  TrendingUp,
  TrendingDown,
  Eye,
  Handshake,
  BookmarkCheck,
  DollarSign,
  Coins,
  AlertTriangle,
  Clock,
  FileWarning,
  ArrowRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import dayjs from 'dayjs'
import Link from 'next/link'

interface DashboardData {
  kpis: {
    activePropertiesSale: number
    activePropertiesRent: number
    visitsThisWeek: number
    negotiationsOpen: number
    reservasActive: number
    revenueMonth: number
    commissionsMonth: number
    commissionChange: number
    pendingCommissions: number
  }
  pipeline: {
    sale: { phase: string; count: number }[]
    rent: { phase: string; count: number }[]
  }
  ranking: {
    id: string
    name: string
    avatarUrl: string | null
    transactions: number
    visits: number
    totalCommissions: number
  }[]
  recentActivity: {
    id: string
    property: string
    phase: string
    changedAt: string
    agent: string
    mode: string
  }[]
  alerts: {
    type: string
    message: string
    propertyId: string | null
    mode: string | null
  }[]
  auditLog: {
    id: string
    action: string
    entity: string
    entityId: string
    user: string
    createdAt: string
  }[]
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

const phaseLabels: Record<string, string> = {
  CAPTACION: 'Captación',
  DOCUMENTACION: 'Documentación',
  PUBLICACION: 'Publicación',
  VISITAS: 'Visitas',
  NEGOCIACION: 'Negociación',
  RESERVA: 'Reserva',
  FIRMA: 'Firma',
  ESCRITURACION: 'Escrituración',
  CONTRATO: 'Contrato',
}

const actionLabels: Record<string, string> = {
  CREATE: 'Creó',
  UPDATE: 'Actualizó',
  DELETE: 'Eliminó',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pipelineTab, setPipelineTab] = useState<'sale' | 'rent'>('sale')

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-zinc-500">
        Error cargando el dashboard
      </div>
    )
  }

  const kpis = [
    {
      label: 'Inmuebles Venta',
      value: data.kpis.activePropertiesSale,
      icon: Building,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      label: 'Inmuebles Alquiler',
      value: data.kpis.activePropertiesRent,
      icon: Building,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Visitas Semana',
      value: data.kpis.visitsThisWeek,
      icon: Eye,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Negociaciones',
      value: data.kpis.negotiationsOpen,
      icon: Handshake,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Reservas Activas',
      value: data.kpis.reservasActive,
      icon: BookmarkCheck,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label: 'Facturación Mes',
      value: formatCurrency(data.kpis.revenueMonth),
      icon: DollarSign,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
    {
      label: 'Comisiones Mes',
      value: formatCurrency(data.kpis.commissionsMonth),
      icon: Coins,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      change: data.kpis.commissionChange,
    },
    {
      label: 'Comisiones Pend.',
      value: formatCurrency(data.kpis.pendingCommissions),
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ]

  const pipelineData = pipelineTab === 'sale' ? data.pipeline.sale : data.pipeline.rent
  const barColors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fef3c7', '#fde68a', '#fcd34d', '#f59e0b']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {dayjs().format('dddd, D [de] MMMM [de] YYYY')}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card
              key={kpi.label}
              className={`kpi-card bg-[#141414] border-[#262626] hover:${kpi.border}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  {'change' in kpi && kpi.change !== undefined && (
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        kpi.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {kpi.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(kpi.change)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <Card className="lg:col-span-2 bg-[#141414] border-[#262626]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">
                Pipeline de Propiedades
              </CardTitle>
              <div className="flex gap-1 bg-[#0a0a0a] rounded-lg p-1">
                <button
                  onClick={() => setPipelineTab('sale')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    pipelineTab === 'sale'
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Venta
                </button>
                <button
                  onClick={() => setPipelineTab('rent')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    pipelineTab === 'rent'
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Alquiler
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="phase"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={(v) => phaseLabels[v] || v}
                  axisLine={{ stroke: '#262626' }}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={{ stroke: '#262626' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelFormatter={(v) => phaseLabels[v] || v}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Propiedades">
                  {pipelineData.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Ranking */}
        <Card className="bg-[#141414] border-[#262626]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">
              Ranking de Agentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.ranking.slice(0, 6).map((agent, i) => {
              const maxCommission = data.ranking[0]?.totalCommissions || 1
              const pct = (agent.totalCommissions / maxCommission) * 100
              return (
                <Link
                  href={`/agentes/${agent.id}`}
                  key={agent.id}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-xs text-zinc-600 w-4 text-right">
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 group-hover:text-white truncate transition-colors">
                      {agent.name}
                    </p>
                    <div className="mt-1 h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 shrink-0">
                    {formatCurrency(agent.totalCommissions)}
                  </span>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-[#141414] border-[#262626]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">
                Actividad Reciente
              </CardTitle>
              <Link
                href="/actividad"
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                Ver todo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentActivity.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 py-2 border-b border-[#1e1e1e] last:border-0"
                >
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${
                      activity.mode === 'SALE'
                        ? 'badge-venta'
                        : 'badge-alquiler'
                    }`}
                  >
                    {activity.mode === 'SALE' ? 'Venta' : 'Alquiler'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">
                      {activity.property}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {activity.agent} · {phaseLabels[activity.phase] || activity.phase}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-600 shrink-0">
                    {dayjs(activity.changedAt).format('DD/MM HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card className="bg-[#141414] border-[#262626]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.alerts.length === 0 ? (
              <p className="text-sm text-zinc-600 py-4 text-center">
                Sin alertas activas ✓
              </p>
            ) : (
              data.alerts.slice(0, 8).map((alert, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10"
                >
                  {alert.type === 'stalled' && (
                    <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  )}
                  {alert.type === 'docs' && (
                    <FileWarning className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  )}
                  {alert.type === 'commission' && (
                    <Coins className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  )}
                  <p className="text-xs text-amber-300/80">{alert.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card className="bg-[#141414] border-[#262626]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base">
              Últimos Eventos de Auditoría
            </CardTitle>
            <Link
              href="/auditoria"
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              Ver todo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs border-b border-[#1e1e1e]">
                  <th className="text-left py-2 font-medium">Acción</th>
                  <th className="text-left py-2 font-medium">Entidad</th>
                  <th className="text-left py-2 font-medium">Usuario</th>
                  <th className="text-left py-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.auditLog.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[#1e1e1e] last:border-0"
                  >
                    <td className="py-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          log.action === 'CREATE'
                            ? 'badge-alquiler'
                            : log.action === 'DELETE'
                            ? 'badge-venta'
                            : 'badge-info'
                        }`}
                      >
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </td>
                    <td className="py-2 text-zinc-300">{log.entity}</td>
                    <td className="py-2 text-zinc-400">{log.user}</td>
                    <td className="py-2 text-zinc-500 text-xs">
                      {dayjs(log.createdAt).format('DD/MM/YY HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
