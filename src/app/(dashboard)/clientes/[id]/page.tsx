'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, Euro, FileText, AlertTriangle, Building, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

dayjs.extend(relativeTime)
dayjs.locale('es')

const typeLabels: Record<string, string> = {
  BUYER: 'Comprador',
  OWNER: 'Propietario',
  TENANT: 'Inquilino',
}

const typeStyles: Record<string, string> = {
  BUYER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OWNER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  TENANT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function ClientDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetch(`/api/clientes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((json) => setData(json.client))
      .catch(() => router.push('/clientes'))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleDelete = async () => {
     setDeleteLoading(true)
     setDeleteError('')
     try {
       const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
       const json = await res.json()
       if (!res.ok) throw new Error(json.error || 'Error desconocido')
       
       router.push('/clientes')
     } catch(e: any) {
       setDeleteError(e.message)
     } finally {
       setDeleteLoading(false)
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

  const operations = [...data.boughtProperties, ...data.soldProperties].sort((a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime())

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
         <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => router.back()}>
           <ArrowLeft className="w-4 h-4 mr-2" /> Volver
         </Button>
         <div className="flex items-center gap-2">
           <Button variant="outline" className="bg-[#141414] border-[#262626] text-zinc-300">
              <Edit className="w-4 h-4 mr-2" /> Editar
           </Button>
           <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar (RGPD)
           </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Sidebar Data */}
         <div className="space-y-6">
            <Card className="bg-[#141414] border-[#262626]">
               <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-2xl text-white font-bold mb-4 shadow-lg">
                     {data.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">{data.name}</h2>
                  <div className="flex justify-center gap-2 mb-6">
                     <Badge className={`text-xs ${typeStyles[data.type]}`}>
                       {typeLabels[data.type]}
                     </Badge>
                     <Badge className={`text-xs ${data.status === 'ACTIVE' ? 'badge-info' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                       {data.status === 'ACTIVE' ? 'Activo' : 'Cerrado'}
                     </Badge>
                  </div>
                  
                  <div className="space-y-4 text-sm text-left pt-6 border-t border-[#1e1e1e]">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                           <Mail className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="text-xs text-zinc-500">Email</p>
                           <p className="text-zinc-300 font-medium truncate">{data.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                           <Phone className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="text-xs text-zinc-500">Teléfono</p>
                           <p className="text-zinc-300 font-medium truncate">{data.phone}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                           <Calendar className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="text-xs text-zinc-500">Fecha de Alta</p>
                           <p className="text-zinc-300 font-medium">{dayjs(data.createdAt).format('DD MMM YYYY')}</p>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {(data.budget || data.preferences) && (
              <Card className="bg-[#141414] border-[#262626]">
                 <CardHeader className="pb-2 border-b border-[#1e1e1e]">
                    <CardTitle className="text-white text-sm uppercase tracking-wide">Preferencias</CardTitle>
                 </CardHeader>
                 <CardContent className="p-4 space-y-4 text-sm">
                    {data.budget && (
                      <div>
                        <p className="text-xs text-zinc-500 uppercase mb-1">Presupuesto</p>
                        <p className="text-lg font-bold text-white flex items-center gap-2">
                           <Euro className="w-4 h-4 text-zinc-400" /> {formatCurrency(data.budget)}
                        </p>
                      </div>
                    )}
                    {data.preferences && (
                      <div>
                        <p className="text-xs text-zinc-500 uppercase mb-1">Criterios</p>
                        <p className="text-zinc-300 bg-[#0a0a0a] p-3 rounded-lg leading-relaxed">
                           {data.preferences}
                        </p>
                      </div>
                    )}
                 </CardContent>
              </Card>
            )}
         </div>

         {/* Main Content Tabs */}
         <div className="lg:col-span-2">
            <Tabs defaultValue="visits" className="w-full">
               <TabsList className="bg-[#141414] border border-[#262626] p-1 w-full justify-start rounded-lg h-12">
                  <TabsTrigger value="visits" className="data-[state=active]:bg-[#262626] data-[state=active]:text-white text-zinc-400">
                    Visitas ({data.visits?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="operations" className="data-[state=active]:bg-[#262626] data-[state=active]:text-white text-zinc-400">
                    Operaciones ({operations.length})
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="visits" className="mt-4">
                  <Card className="bg-[#141414] border-[#262626]">
                     <CardContent className="p-0 border-t-0">
                        {data.visits?.length > 0 ? (
                           <div className="divide-y divide-[#1e1e1e]">
                              {data.visits.map((visit: any) => (
                                <div key={visit.id} className="p-4 hover:bg-[#1a1a1a] transition-colors">
                                   <div className="flex justify-between items-start mb-2">
                                      <Link href={`/propiedades/${visit.property.id}`} className="text-orange-400 hover:text-orange-300 font-medium">
                                         {visit.property.address}
                                      </Link>
                                      <Badge variant="outline" className="text-xs text-zinc-400 border-[#333]">
                                         {visit.result}
                                      </Badge>
                                   </div>
                                   <div className="flex items-center justify-between text-xs text-zinc-500">
                                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dayjs(visit.date).format('DD/MM/YYYY HH:mm')}</span>
                                      <span>Agente: {visit.agent.name}</span>
                                   </div>
                                   {visit.notes && <p className="mt-3 text-sm text-zinc-400 bg-[#0a0a0a] p-3 rounded-lg">{visit.notes}</p>}
                                </div>
                              ))}
                           </div>
                        ) : (
                          <div className="p-10 text-center text-zinc-500 flex flex-col items-center">
                             <FileText className="w-10 h-10 mb-2 opacity-20" />
                             Sin visitas registradas
                          </div>
                        )}
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="operations" className="mt-4">
                  <Card className="bg-[#141414] border-[#262626]">
                     <CardContent className="p-0 border-t-0">
                        {operations.length > 0 ? (
                           <div className="divide-y divide-[#1e1e1e]">
                              {operations.map((op: any) => (
                                <div key={op.id} className="p-4">
                                   <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                         <CheckCircle2 className="w-4 h-4 text-green-500" />
                                         <Link href={`/propiedades/${op.property.id}`} className="text-zinc-200 font-medium hover:text-orange-400">
                                            {op.property.address}
                                         </Link>
                                      </div>
                                      <span className="font-bold text-white">{formatCurrency(op.finalPrice)}</span>
                                   </div>
                                   <div className="flex items-center gap-4 text-xs text-zinc-500 ml-6">
                                      <span>{dayjs(op.closeDate).format('DD/MM/YYYY')}</span>
                                      <span>{op.agent.name}</span>
                                   </div>
                                </div>
                              ))}
                           </div>
                        ) : (
                          <div className="p-10 text-center text-zinc-500 flex flex-col items-center">
                             <Building className="w-10 h-10 mb-2 opacity-20" />
                             Sin operaciones cerradas
                          </div>
                        )}
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>
         </div>
      </div>

      {/* GDPR Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
         <DialogContent className="bg-[#141414] border-[#262626] text-white">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" /> Eliminar Cliente (RGPD)
               </DialogTitle>
               <DialogDescription className="text-zinc-400 pt-2">
                 Estás a punto de eliminar a <strong>{data.name}</strong>.<br/><br/>
                 Por ley (RGPD / LOPD), The derecho al olvido permite borrar todos los datos personales si no existen operaciones registrales vinculadas.<br/>
                 <strong className="text-red-400">Esta acción no se puede deshacer.</strong>
               </DialogDescription>
            </DialogHeader>
            {deleteError && (
               <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex gap-2 items-start mt-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{deleteError}</p>
               </div>
            )}
            <DialogFooter className="mt-4 gap-2 sm:gap-0">
               <Button variant="ghost" onClick={() => setDeleteOpen(false)} className="text-zinc-400 hover:text-white">Cancelar</Button>
               <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading} className="bg-red-500 hover:bg-red-600">
                  {deleteLoading ? 'Eliminando...' : 'Confirmar Eliminación'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
