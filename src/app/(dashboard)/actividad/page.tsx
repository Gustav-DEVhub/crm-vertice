'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Eye, Handshake, MapPin, Search, User, Phone, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', maximumFractionDigits: 0 }).format(n)
}

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState('visits')
  const [data, setData] = useState<{ type: string; data: any[]; pagination: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/actividad?type=${activeTab}&page=${page}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeTab, page])

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Actividad y Seguimiento</h1>
        <p className="text-sm text-zinc-500">
          Registro de visitas, negociaciones abiertas y reservas
        </p>
      </div>

      <Tabs defaultValue="visits" value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full">
         <TabsList className="bg-[#141414] border border-[#262626] p-1 w-full sm:w-auto h-12 rounded-lg">
            <TabsTrigger value="visits" className="data-[state=active]:bg-[#262626] data-[state=active]:text-white text-zinc-400">
              <Eye className="w-4 h-4 mr-2" /> Visitas
            </TabsTrigger>
            <TabsTrigger value="negotiations" className="data-[state=active]:bg-[#262626] data-[state=active]:text-white text-zinc-400">
              <Handshake className="w-4 h-4 mr-2" /> Negociaciones / Reservas
            </TabsTrigger>
         </TabsList>

         <TabsContent value="visits" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {loading ? (
                  <div className="col-span-full py-20 flex justify-center">
                    <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  </div>
               ) : data?.data.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-zinc-500 bg-[#141414] rounded-xl border border-[#262626]">
                    No hay visitas registradas
                  </div>
               ) : (
                  data?.data.map((visit) => (
                    <Card key={visit.id} className="bg-[#141414] border-[#262626] hover:border-orange-500/30 transition-colors flex flex-col h-full">
                       <CardContent className="p-4 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-2">
                               <Badge className={visit.property.mode === 'SALE' ? 'badge-venta text-[10px]' : 'badge-alquiler text-[10px]'}>
                                  {visit.property.mode === 'SALE' ? 'Venta' : 'Alquiler'}
                               </Badge>
                               <span className="text-xs text-zinc-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {dayjs(visit.date).format('DD/MM HH:mm')}
                               </span>
                             </div>
                             <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700 bg-zinc-800/50">
                                {visit.result}
                             </Badge>
                          </div>
                          
                          <Link href={`/propiedades/${visit.property.id}`} className="text-white font-medium hover:text-orange-400 truncate mb-1 line-clamp-2 leading-snug">
                             {visit.property.address}
                          </Link>
                          
                          <div className="mt-3 pt-3 border-t border-[#1e1e1e] space-y-2 text-sm text-zinc-400 flex-1">
                             <div className="flex items-center gap-2">
                                <User className="w-4 h-4 shrink-0 text-zinc-500" />
                                <Link href={`/clientes/${visit.client.id}`} className="hover:text-white truncate">
                                   {visit.client.name}
                                </Link>
                             </div>
                             {visit.client.phone && (
                                <div className="flex items-center gap-2">
                                   <Phone className="w-4 h-4 shrink-0 text-zinc-500" />
                                   <span>{visit.client.phone}</span>
                                </div>
                             )}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-[#1e1e1e] flex justify-between items-center text-xs">
                             <span className="text-zinc-500 text-[10px]">Agente: <span className="text-white ml-1">{visit.agent.name.split(' ')[0]}</span></span>
                          </div>
                       </CardContent>
                    </Card>
                  ))
               )}
            </div>
         </TabsContent>

         <TabsContent value="negotiations" className="mt-6">
            <Card className="bg-[#141414] border-[#262626]">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-[#1a1a1a] text-zinc-400 font-medium border-b border-[#262626]">
                     <tr>
                       <th className="px-4 py-3">Propiedad</th>
                       <th className="px-4 py-3">Precio Target</th>
                       <th className="px-4 py-3">Estado</th>
                       <th className="px-4 py-3">Tiempo en fase</th>
                       <th className="px-4 py-3">Agente</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#1e1e1e]">
                     {loading ? (
                        <tr>
                           <td colSpan={5} className="py-20 text-center">
                             <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                           </td>
                        </tr>
                     ) : data?.data.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="py-10 text-center text-zinc-500">No hay negociaciones ni reservas activas</td>
                        </tr>
                     ) : (
                        data?.data.map((prop) => (
                          <tr key={prop.id} className="hover:bg-[#1a1a1a] transition-colors group">
                             <td className="px-4 py-4">
                               <div className="flex flex-col gap-1">
                                  <Link href={`/propiedades/${prop.id}`} className="text-white font-medium hover:text-orange-400">
                                     {prop.address}
                                  </Link>
                                  <span className="text-xs text-zinc-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {prop.city}</span>
                               </div>
                             </td>
                             <td className="px-4 py-4">
                                <span className="text-zinc-300 font-medium">{formatCurrency(prop.price)}</span>
                                {prop.mode === 'RENT' && <span className="text-xs text-zinc-500 ml-1">/mes</span>}
                             </td>
                             <td className="px-4 py-4">
                                <Badge className={prop.currentPhase === 'RESERVA' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}>
                                   {prop.currentPhase === 'RESERVA' ? 'Reserva Activa' : 'En Negociación'}
                                </Badge>
                             </td>
                             <td className="px-4 py-4 text-zinc-400 text-xs">
                                <span className={dayjs().diff(dayjs(prop.lastPhaseUpdate), 'day') > 15 ? 'text-red-400 font-bold' : ''}>
                                  {dayjs().diff(dayjs(prop.lastPhaseUpdate), 'day')} días
                                </span>
                             </td>
                             <td className="px-4 py-4 text-zinc-300">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                                     {prop.agent?.name?.charAt(0) || '?'}
                                  </div>
                                  <span className="text-xs">{prop.agent?.name}</span>
                                </div>
                             </td>
                          </tr>
                        ))
                     )}
                   </tbody>
                 </table>
               </div>
            </Card>
         </TabsContent>
      </Tabs>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-[#141414] border-[#262626] text-white hover:bg-[#1a1a1a]"
          >
             Anterior
          </Button>
          <div className="flex items-center px-4 text-sm text-zinc-400">
            Página {page} de {data.pagination.totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages}
            className="bg-[#141414] border-[#262626] text-white hover:bg-[#1a1a1a]"
          >
             Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
