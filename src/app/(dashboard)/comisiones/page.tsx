'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Coins, PiggyBank, Receipt, DollarSign, Calendar, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function CommissionsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<{id: string, name: string}[]>([])
  const [agentFilter, setAgentFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/search?q=a').then(res => res.json()).then(data => {
       const agents = data.results?.filter((r: any) => r.type === 'agent') || []
       setAgents(agents)
    })
  }, [])

  const loadData = () => {
    setLoading(true)
    fetch(`/api/comisiones?agentId=${agentFilter}&status=${statusFilter}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [agentFilter, statusFilter])

  const toggleStatus = async (id: string, currentStatus: string) => {
     const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID'
     if (!confirm(`¿Marcar comisión como ${newStatus === 'PAID' ? 'COBRADA' : 'PENDIENTE'}?`)) return
     
     try {
       await fetch('/api/comisiones', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id, status: newStatus })
       })
       loadData()
     } catch (e) {
       console.error(e)
     }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Honorarios y Comisiones</h1>
        <p className="text-sm text-zinc-500">
          Control de facturación, desgloses agencia/agente y estado de cobros
        </p>
      </div>

      {loading && !data ? (
         <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
         </div>
      ) : data?.summary && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#141414] border-[#262626]">
               <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                     <Coins className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-xs text-zinc-500 uppercase">Facturación (Mes)</p>
                     <p className="text-xl font-bold text-white">{formatCurrency(data.summary.totalPaidMonth)}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
               <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                     <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-xs text-zinc-500 uppercase">Pendiente de Cobro</p>
                     <p className="text-xl font-bold text-white">{formatCurrency(data.summary.totalPending)}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
               <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                     <PiggyBank className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-xs text-zinc-500 uppercase">Ingreso Agencia (Mes)</p>
                     <p className="text-xl font-bold text-white">{formatCurrency(data.summary.agencyRevenueMonth)}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
               <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                     <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-xs text-zinc-500 uppercase">Ingreso Agencia (Año)</p>
                     <p className="text-xl font-bold text-white">{formatCurrency(data.summary.agencyRevenueYear)}</p>
                  </div>
               </CardContent>
            </Card>
         </div>
      )}

      <Card className="bg-[#141414] border-[#262626]">
         <CardHeader className="pb-4 border-b border-[#1e1e1e] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
             <CardTitle className="text-white text-base">Desglose por Operación</CardTitle>
             <div className="flex gap-2">
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-[180px] bg-[#0a0a0a] border-[#262626] text-white">
                    <SelectValue placeholder="Agente" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                    <SelectItem value="ALL">Todos los agentes</SelectItem>
                    {agents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-[#0a0a0a] border-[#262626] text-white">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                    <SelectItem value="ALL">Cualquier estado</SelectItem>
                    <SelectItem value="PAID">Cobrado</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
             </div>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-[#1a1a1a] text-zinc-400 font-medium border-b border-[#262626]">
                   <tr>
                     <th className="px-4 py-3">Inmueble / Agente</th>
                     <th className="px-4 py-3 text-right">Honorarios Totales</th>
                     <th className="px-4 py-3 text-right">Agencia</th>
                     <th className="px-4 py-3 text-right">Agente</th>
                     <th className="px-4 py-3 text-center">Estado</th>
                     <th className="px-4 py-3"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#1e1e1e]">
                   {data?.commissions.length === 0 ? (
                      <tr>
                         <td colSpan={6} className="py-10 text-center text-zinc-500">No se encontraron registros de comisiones.</td>
                      </tr>
                   ) : (
                      data?.commissions.map((c: any) => (
                        <tr key={c.id} className="hover:bg-[#1a1a1a] transition-colors group">
                           <td className="px-4 py-4">
                              <Link href={`/propiedades/${c.transaction.property.id}`} className="text-white font-medium hover:text-orange-400 block mb-1">
                                 {c.transaction.property.address}
                              </Link>
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                 <span>{c.agent.name.split(' ')[0]}</span>
                                 <span>•</span>
                                 <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dayjs(c.createdAt).format('DD/MM/YYYY')}</span>
                              </div>
                           </td>
                           <td className="px-4 py-4 text-right">
                              <span className="font-bold text-white">{formatCurrency(c.totalAmount)}</span>
                           </td>
                           <td className="px-4 py-4 text-right">
                              <span className="text-zinc-300 bg-[#0a0a0a] px-2 py-1 rounded">{formatCurrency(c.agencyAmount)}</span>
                           </td>
                           <td className="px-4 py-4 text-right">
                              <span className="text-zinc-300 bg-[#0a0a0a] px-2 py-1 rounded">{formatCurrency(c.agentAmount)}</span>
                           </td>
                           <td className="px-4 py-4 text-center">
                              <Badge className={c.status === 'PAID' ? 'badge-alquiler' : 'badge-pendiente'}>
                                 {c.status === 'PAID' ? 'Cobrado' : 'Pendiente'}
                              </Badge>
                           </td>
                           <td className="px-4 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleStatus(c.id, c.status)}
                                className="text-zinc-400 hover:text-white hover:bg-[#262626] h-8 px-2"
                              >
                                 <RefreshCcw className="w-3 h-3 mr-1" /> Alternar
                              </Button>
                           </td>
                        </tr>
                      ))
                   )}
                 </tbody>
               </table>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}
