'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Ban, Mail, Phone, Calendar, Star, Building, Coins, Receipt } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

dayjs.locale('es')

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function AgentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agentes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(setData)
      .catch(() => router.push('/agentes'))
      .finally(() => setLoading(false))
  }, [id, router])

  const toggleStatus = async () => {
     if (!confirm(`¿Estás seguro de que deseas ${data.agent.isActive ? 'desactivar' : 'activar'} a este agente?`)) return
     
     const res = await fetch(`/api/agentes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !data.agent.isActive })
     })
     if (res.ok) {
        setData({ ...data, agent: { ...data.agent, isActive: !data.agent.isActive }})
     }
  }

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
       </div>
     )
  }

  if (!data) return null
  const { agent, chartData } = data

  const totalCommissions = agent.commissions.reduce((s: number, c: any) => s + c.totalAmount, 0)
  const earnedCommissions = agent.commissions.reduce((s: number, c: any) => s + c.agentAmount, 0)

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
         <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => router.back()}>
           <ArrowLeft className="w-4 h-4 mr-2" /> Volver
         </Button>
         <div className="flex items-center gap-2">
           <Button variant="outline" className="bg-[#141414] border-[#262626] text-zinc-300">
              <Edit className="w-4 h-4 mr-2" /> Editar
           </Button>
           <Button variant="destructive" onClick={toggleStatus} className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
              <Ban className="w-4 h-4 mr-2" /> {agent.isActive ? 'Desactivar' : 'Activar'}
           </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Profile Card */}
         <Card className="bg-[#141414] border-[#262626] lg:col-span-1">
            <CardContent className="p-6 text-center">
               <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg shadow-orange-500/20 mb-4">
                  {agent.name.charAt(0)}
               </div>
               <h2 className="text-xl font-bold text-white mb-1">{agent.name}</h2>
               <Badge className={`mb-4 ${agent.isActive ? 'badge-alquiler' : 'badge-venta'}`}>
                  {agent.isActive ? 'Activo' : 'Inactivo'}
               </Badge>
               
               <div className="space-y-3 text-sm text-left mt-6 pt-6 border-t border-[#1e1e1e]">
                 <p className="text-zinc-400 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-zinc-500" /> {agent.email}
                 </p>
                 <p className="text-zinc-400 flex items-center gap-3">
                    <Phone className="w-4 h-4 text-zinc-500" /> {agent.phone}
                 </p>
                 <p className="text-zinc-400 flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-zinc-500" /> Alta: {dayjs(agent.joinDate).format('DD MMM YYYY')}
                 </p>
                 <p className="text-zinc-400 flex items-center gap-3">
                    <Star className="w-4 h-4 text-orange-400" /> Comisión: {(agent.commissionPct * 100).toFixed(0)}%
                 </p>
               </div>
            </CardContent>
         </Card>

         {/* Metrics & Chart */}
         <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <Card className="bg-[#141414] border-[#262626]">
                  <CardContent className="p-4 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-orange-500" />
                     </div>
                     <div>
                        <p className="text-xs text-zinc-500 uppercase">Facturación (Agencia)</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(totalCommissions)}</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="bg-[#141414] border-[#262626]">
                  <CardContent className="p-4 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-green-500" />
                     </div>
                     <div>
                        <p className="text-xs text-zinc-500 uppercase">Cierres Totales</p>
                        <p className="text-xl font-bold text-white">{agent.transactions.length}</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="bg-[#141414] border-[#262626]">
                  <CardContent className="p-4 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-500" />
                     </div>
                     <div>
                        <p className="text-xs text-zinc-500 uppercase">Cartera Activa</p>
                        <p className="text-xl font-bold text-white">
                           {agent.properties.filter((p: any) => p.currentPhase !== 'ESCRITURACION' && p.currentPhase !== 'CONTRATO').length}
                        </p>
                     </div>
                  </CardContent>
               </Card>
            </div>

            <Card className="bg-[#141414] border-[#262626]">
               <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base">Actividad últimos 6 meses</CardTitle>
               </CardHeader>
               <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                     <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#262626' }} />
                        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#262626' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="ventas" name="Ventas" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="alquileres" name="Alquileres" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="visitas" name="Visitas" fill="#f97316" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
