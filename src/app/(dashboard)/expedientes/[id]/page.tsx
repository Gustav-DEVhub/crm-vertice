'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, CheckCircle2, AlertCircle, Clock, FileText, Upload, MoreVertical, Building, User, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'

const phaseLabels: Record<string, string> = {
  CAPTACION: 'Captación', DOCUMENTACION: 'Documentación', PUBLICACION: 'Publicación',
  VISITAS: 'Visitas', NEGOCIACION: 'Negociación', RESERVA: 'Reserva', FIRMA: 'Firma',
  ESCRITURACION: 'Escrituración', CONTRATO: 'Contrato',
}

export default function ExpedienteDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    fetch(`/api/expedientes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((json) => setData(json.expediente))
      .catch(() => router.push('/expedientes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [id])

  const toggleDocStatus = async (docId: string, currentStatus: string) => {
     let nextStatus = 'PENDING'
     if (currentStatus === 'PENDING') nextStatus = 'DELIVERED'
     if (currentStatus === 'DELIVERED') nextStatus = 'VALIDATED'
     if (currentStatus === 'VALIDATED') nextStatus = 'PENDING'

     const res = await fetch(`/api/expedientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, status: nextStatus })
     })
     if (res.ok) loadData()
  }

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
       </div>
     )
  }

  if (!data) return null

  // Group documents by phase
  const docsByPhase = data.documents.reduce((acc: any, doc: any) => {
     acc[doc.phase] = acc[doc.phase] || []
     acc[doc.phase].push(doc)
     return acc
  }, {})

  const phasesWithDocs = Object.keys(docsByPhase)

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
         <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => router.back()}>
           <ArrowLeft className="w-4 h-4 mr-2" /> Volver
         </Button>
         <Badge className={`px-3 py-1 text-sm ${
           data.status === 'COMPLETADO' ? 'badge-alquiler' : 
           data.status === 'PENDIENTE_FIRMAS' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
           'badge-info'
         }`}>
           {data.status.replace('_', ' ')}
         </Badge>
      </div>

      <div>
         <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            Expediente: <Link href={`/propiedades/${data.property.id}`} className="text-orange-400 hover:underline">{data.property.address}</Link>
         </h1>
         <div className="flex items-center gap-3 text-zinc-400">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.property.city}</span>
            <span>•</span>
            <Badge className={data.property.mode === 'SALE' ? 'badge-venta text-xs' : 'badge-alquiler text-xs'}>
               {data.property.mode === 'SALE' ? 'Venta' : 'Alquiler'}
            </Badge>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Documents Area */}
         <div className="lg:col-span-2 space-y-6">
            {phasesWithDocs.map((phase) => (
               <Card key={phase} className="bg-[#141414] border-[#262626]">
                  <CardHeader className="pb-3 border-b border-[#1e1e1e] bg-[#1a1a1a]/50">
                     <CardTitle className="text-white text-base uppercase tracking-wide flex items-center gap-2">
                        {phaseLabels[phase] || phase}
                        <Badge variant="outline" className="bg-[#0a0a0a] border-[#333] text-zinc-400 text-[10px]">
                           {docsByPhase[phase].filter((d: any) => d.status === 'VALIDATED').length} / {docsByPhase[phase].length} Validados
                        </Badge>
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="divide-y divide-[#1e1e1e]">
                        {docsByPhase[phase].map((doc: any) => (
                           <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-[#1a1a1a] transition-colors group">
                              <div className="flex-1 min-w-0 flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                    doc.status === 'VALIDATED' ? 'bg-green-500/10 text-green-500' :
                                    doc.status === 'DELIVERED' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-zinc-800 text-zinc-500'
                                 }`}>
                                    <FileText className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                       Actualizado: {dayjs(doc.updatedAt).format('DD/MM/YY HH:mm')}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                 <Badge 
                                    className={`cursor-pointer transition-colors ${
                                       doc.status === 'VALIDATED' ? 'badge-alquiler' :
                                       doc.status === 'DELIVERED' ? 'badge-info' :
                                       'badge-pendiente'
                                    }`}
                                    onClick={() => toggleDocStatus(doc.id, doc.status)}
                                 >
                                    {doc.status === 'VALIDATED' ? 'Validado' : doc.status === 'DELIVERED' ? 'Entregado' : 'Pendiente'}
                                 </Badge>
                                 <Button variant="outline" size="icon" className="h-8 w-8 bg-[#0a0a0a] border-[#333] text-zinc-400 hover:text-white">
                                    <Upload className="w-3.5 h-3.5" />
                                 </Button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         {/* Sidebar Data */}
         <div className="space-y-6">
            <Card className="bg-[#141414] border-[#262626]">
               <CardHeader className="pb-3 border-b border-[#1e1e1e]">
                  <CardTitle className="text-white text-sm uppercase tracking-wide">Partes Involucradas</CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-5">
                  {data.transaction ? (
                     <>
                        <div>
                           <p className="text-xs text-zinc-500 uppercase mb-2">Propietario / Vendedor</p>
                           <Link href={`/clientes/${data.transaction.seller.id}`} className="flex items-center gap-3 group">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-semibold text-xs shrink-0 group-hover:text-orange-400">
                                 {data.transaction.seller.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate">{data.transaction.seller.name}</p>
                                 <p className="text-xs text-zinc-500 truncate">{data.transaction.seller.phone}</p>
                              </div>
                           </Link>
                        </div>
                        <div>
                           <p className="text-xs text-zinc-500 uppercase mb-2">Cliente / Comprador</p>
                           <Link href={`/clientes/${data.transaction.buyer.id}`} className="flex items-center gap-3 group">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-semibold text-xs shrink-0 group-hover:text-orange-400">
                                 {data.transaction.buyer.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate">{data.transaction.buyer.name}</p>
                                 <p className="text-xs text-zinc-500 truncate">{data.transaction.buyer.phone}</p>
                              </div>
                           </Link>
                        </div>
                        <div>
                           <p className="text-xs text-zinc-500 uppercase mb-2">Agente Responsable</p>
                           <Link href={`/agentes/${data.transaction.agent.id}`} className="flex items-center gap-3 group">
                              <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                                 {data.transaction.agent.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-medium text-orange-400 group-hover:text-orange-300 truncate">{data.transaction.agent.name}</p>
                                 <p className="text-xs text-zinc-500 truncate">{data.transaction.agent.phone}</p>
                              </div>
                           </Link>
                        </div>
                     </>
                  ) : (
                     <div className="text-sm text-zinc-500 italic py-4">
                        Sin transacción cerrada (Aún en captación)
                     </div>
                  )}
               </CardContent>
            </Card>

            <Card className="bg-[#141414] border-[#262626]">
               <CardHeader className="pb-3 border-b border-[#1e1e1e]">
                  <CardTitle className="text-white text-sm uppercase tracking-wide">Progreso del Expediente</CardTitle>
               </CardHeader>
               <CardContent className="p-4">
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">Documentos Validados</span>
                        <span className="text-green-400 font-bold">
                           {Math.round((data.documents.filter((d: any) => d.status === 'VALIDATED').length / (data.documents.length || 1)) * 100)}%
                        </span>
                     </div>
                     <div className="h-2 w-full bg-[#0a0a0a] rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-green-500 transition-all duration-500"
                           style={{ width: `${(data.documents.filter((d: any) => d.status === 'VALIDATED').length / (data.documents.length || 1)) * 100}%` }}
                        />
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
