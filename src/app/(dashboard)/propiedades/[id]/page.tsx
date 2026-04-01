'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Home, Euro, Calendar, ArrowLeft, Edit, Trash2, Maximize, User, Users, FileText, Activity } from 'lucide-react'

dayjs.extend(relativeTime)
dayjs.locale('es')

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

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/propiedades/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((json) => setData(json.property))
      .catch((e) => {
         console.error(e)
         router.push('/propiedades')
      })
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
       </div>
     )
  }

  if (!data) return null

  const diasEnCartera = dayjs().diff(dayjs(data.captureDate), 'day')
  const isSale = data.mode === 'SALE'

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header operations */}
      <div className="flex items-center justify-between">
         <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5" onClick={() => router.back()}>
           <ArrowLeft className="w-4 h-4 mr-2" /> Volver
         </Button>
         <div className="flex items-center gap-2">
           <Button variant="outline" className="bg-[#141414] border-[#262626] text-zinc-300">
              <Edit className="w-4 h-4 mr-2" /> Editar
           </Button>
           <Button variant="destructive" className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
              <Trash2 className="w-4 h-4" />
           </Button>
         </div>
      </div>

      {/* Main Title & Badges */}
      <div>
         <div className="flex items-center gap-3 mb-2">
            <Badge className={isSale ? 'badge-venta text-sm' : 'badge-alquiler text-sm'}>
              {isSale ? 'Venta' : 'Alquiler'}
            </Badge>
            <Badge className="bg-[#1a1a1a] border-[#333] text-zinc-300 hover:bg-[#262626]">
              {phaseLabels[data.currentPhase]}
            </Badge>
            {diasEnCartera > 90 && (
               <Badge className="badge-pendiente border-amber-500 text-amber-500 bg-amber-500/10">
                 +90 días en cartera
               </Badge>
            )}
         </div>
         <h1 className="text-3xl font-bold text-white mb-2">{data.address}</h1>
         <div className="flex items-center text-zinc-400 gap-4">
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {data.city}</span>
            <span className="flex items-center"><Home className="w-4 h-4 mr-1" /> {data.type}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Photos and Details */}
        <div className="lg:col-span-2 space-y-6">
           {/* Gallery Preview */}
           <Card className="bg-[#141414] border-[#262626] overflow-hidden">
               {data.photos && data.photos.length > 0 ? (
                 <div className="relative h-[400px] w-full bg-[#0a0a0a]">
                    <Image src={data.photos[0].url} alt="Principal" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                       <p className="text-4xl font-bold drop-shadow-md">
                          {formatCurrency(data.price)}
                          {!isSale && <span className="text-lg text-zinc-300 font-normal">/mes</span>}
                       </p>
                    </div>
                 </div>
               ) : (
                 <div className="h-[400px] flex items-center justify-center bg-[#1a1a1a] text-zinc-500">
                    <span className="flex items-center"><Home className="w-12 h-12 mr-2 opacity-20" /> Sin fotos</span>
                 </div>
               )}
           </Card>

           {/* Tabs for Info */}
           <Tabs defaultValue="info" className="w-full">
              <TabsList className="bg-[#141414] border border-[#262626] p-1 w-full justify-start rounded-lg h-12">
                 <TabsTrigger value="info" className="data-[state=active]:bg-[#262626] data-[state=active]:text-white text-zinc-400">
                   Información
                 </TabsTrigger>
                 <TabsTrigger value="visits" className="data-[state=active]:bg-[#262626] data-[state=active]:text-white text-zinc-400">
                   Visitas ({data.visits?.length || 0})
                 </TabsTrigger>
                 <TabsTrigger value="docs" className="data-[state=active]:bg-[#262626] data-[state=active]:text-white text-zinc-400">
                   Documentos
                 </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 space-y-4">
                 <Card className="bg-[#141414] border-[#262626]">
                    <CardHeader className="pb-2 text-zinc-200 font-semibold border-b border-[#1e1e1e]">Características</CardHeader>
                    <CardContent className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                       <div>
                         <p className="text-xs text-zinc-500 uppercase">Superficie</p>
                         <p className="text-white font-medium text-lg">{data.m2} m²</p>
                       </div>
                       <div>
                         <p className="text-xs text-zinc-500 uppercase">Habitaciones</p>
                         <p className="text-white font-medium text-lg">{data.rooms}</p>
                       </div>
                       <div>
                         <p className="text-xs text-zinc-500 uppercase">Baños</p>
                         <p className="text-white font-medium text-lg">{data.baths}</p>
                       </div>
                       <div>
                         <p className="text-xs text-zinc-500 uppercase">Captación</p>
                         <p className="text-white font-medium text-lg">{dayjs(data.captureDate).format('DD MMM YYYY')}</p>
                       </div>
                    </CardContent>
                 </Card>
                 {data.description && (
                   <Card className="bg-[#141414] border-[#262626]">
                      <CardHeader className="pb-2 text-zinc-200 font-semibold border-b border-[#1e1e1e]">Descripción</CardHeader>
                      <CardContent className="p-4 text-zinc-300 leading-relaxed text-sm">
                         {data.description}
                      </CardContent>
                   </Card>
                 )}
              </TabsContent>

              <TabsContent value="visits" className="mt-4">
                 <Card className="bg-[#141414] border-[#262626]">
                    <CardContent className="p-0">
                       {data.visits?.length > 0 ? (
                          <div className="divide-y divide-[#1e1e1e]">
                             {data.visits.map((visit: any) => (
                               <div key={visit.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                  <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-white">{visit.client.name}</span>
                                        <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700 bg-zinc-800/50">{visit.result}</Badge>
                                     </div>
                                     <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {dayjs(visit.date).format('DD/MM/YYYY HH:mm')} 
                                        <span className="mx-1">•</span> 
                                        {visit.agent.name}
                                     </p>
                                     {visit.notes && <p className="text-xs text-zinc-400 mt-2 bg-[#0a0a0a] p-2 rounded-md">{visit.notes}</p>}
                                  </div>
                               </div>
                             ))}
                          </div>
                       ) : (
                         <div className="p-8 text-center text-zinc-500">No hay visitas registradas</div>
                       )}
                    </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="docs" className="mt-4">
                 <Card className="bg-[#141414] border-[#262626]">
                    <CardContent className="p-4 text-center text-zinc-500">
                       {data.expedientes && data.expedientes.length > 0 ? (
                          <div className="text-left">
                             {data.expedientes[0].documents.map((doc: any) => (
                               <div key={doc.id} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                                  <div className="flex items-center gap-2">
                                     <FileText className="w-4 h-4 text-zinc-400" />
                                     <span className="text-sm text-zinc-300">{doc.name}</span>
                                  </div>
                                  <Badge className={
                                     doc.status === 'VALIDATED' ? 'badge-alquiler' : 
                                     doc.status === 'DELIVERED' ? 'badge-info' : 'badge-pendiente'
                                  }>
                                     {doc.status}
                                  </Badge>
                               </div>
                             ))}
                          </div>
                       ) : 'No hay expedientes/documentos asociados'}
                    </CardContent>
                 </Card>
              </TabsContent>
           </Tabs>
        </div>

        {/* Right column: Sidebar info */}
        <div className="space-y-6">
           {/* Agent Info */}
           <Card className="bg-[#141414] border-[#262626]">
              <CardHeader className="pb-2 border-b border-[#1e1e1e]">
                 <CardTitle className="text-white text-sm uppercase tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-400" /> Agente Asignado
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 {data.agent ? (
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                         {data.agent.name.charAt(0)}
                      </div>
                      <div>
                         <p className="text-sm font-medium text-white">{data.agent.name}</p>
                         <p className="text-xs text-zinc-500">{data.agent.phone}</p>
                      </div>
                   </div>
                 ) : (
                   <div className="text-sm text-zinc-500 text-center py-2">Sin asignar</div>
                 )}
              </CardContent>
           </Card>

           {/* Metrics */}
           <Card className="bg-[#141414] border-[#262626]">
              <CardHeader className="pb-2 border-b border-[#1e1e1e]">
                 <CardTitle className="text-white text-sm uppercase tracking-wide flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400" /> Métricas
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                 <div>
                    <p className="text-xs text-zinc-500 uppercase mb-1">Días en cartera</p>
                    <p className={`text-xl font-bold ${diasEnCartera > 90 ? 'text-red-400' : 'text-white'}`}>
                       {diasEnCartera} días
                    </p>
                 </div>
                 <div>
                    <p className="text-xs text-zinc-500 uppercase mb-1">Comisión Esperada</p>
                    <p className="text-xl font-bold text-green-400">
                       {formatCurrency(data.price * data.commissionPct)}
                    </p>
                 </div>
              </CardContent>
           </Card>

           {/* Timeline */}
           <Card className="bg-[#141414] border-[#262626]">
              <CardHeader className="pb-2 border-b border-[#1e1e1e]">
                 <CardTitle className="text-white text-sm uppercase tracking-wide">
                    Historial de Fases
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="relative pl-3 border-l-2 border-[#262626] space-y-6">
                    {data.phaseHistory?.map((ph: any, i: number) => (
                       <div key={ph.id} className="relative">
                          <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-[#141414] ${i === 0 ? 'bg-orange-500' : 'bg-zinc-600'}`} />
                          <p className={`text-sm font-medium ${i === 0 ? 'text-orange-400' : 'text-zinc-300'}`}>
                             {phaseLabels[ph.phase]}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                             {dayjs(ph.changedAt).fromNow()}
                          </p>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
