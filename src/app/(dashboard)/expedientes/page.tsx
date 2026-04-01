'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FolderOpen, MapPin, Building, ArrowRight, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

const phaseLabels: Record<string, string> = {
  CAPTACION: 'Captación', DOCUMENTACION: 'Documentación', PUBLICACION: 'Publicación',
  VISITAS: 'Visitas', NEGOCIACION: 'Negociación', RESERVA: 'Reserva', FIRMA: 'Firma',
  ESCRITURACION: 'Escrituración', CONTRATO: 'Contrato',
}

export default function ExpedientesPage() {
  const [data, setData] = useState<{ expedientes: any[]; pagination: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusField, setStatusField] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/expedientes?page=${page}&status=${statusField}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, statusField])

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Expedientes y Documentación</h1>
          <p className="text-sm text-zinc-500">
            Control documental por inmueble en todas sus fases operativas
          </p>
        </div>
        <Select value={statusField} onValueChange={(v) => { setStatusField(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] bg-[#141414] border-[#262626] text-white">
            <SelectValue placeholder="Estado de Expediente" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
            <SelectItem value="ALL">Todos los expedientes</SelectItem>
            <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
            <SelectItem value="PENDIENTE_FIRMAS">Pendiente de Firmas</SelectItem>
            <SelectItem value="COMPLETADO">Completados</SelectItem>
            <SelectItem value="ARCHIVADO">Archivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-[#141414] border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] text-zinc-400 font-medium border-b border-[#262626]">
              <tr>
                <th className="px-4 py-3">Inmueble / Fase Actual</th>
                <th className="px-4 py-3">Roles (Propietario / Cliente / Agente)</th>
                <th className="px-4 py-3 text-center">Docs</th>
                <th className="px-4 py-3">Estado Legal</th>
                <th className="px-4 py-3">Última Modif.</th>
                <th className="px-4 py-3 text-center">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {loading ? (
                <tr>
                   <td colSpan={6} className="py-20 text-center">
                     <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                   </td>
                </tr>
              ) : data?.expedientes.length === 0 ? (
                <tr>
                   <td colSpan={6} className="py-16 text-center text-zinc-500 flex flex-col items-center mx-auto">
                      <FolderOpen className="w-10 h-10 opacity-20 mb-2 mt-10" />
                      No se encontraron expedientes.
                   </td>
                </tr>
              ) : (
                data?.expedientes.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#1a1a1a] transition-colors group">
                    <td className="px-4 py-4">
                       <div className="flex flex-col gap-1.5 items-start">
                          <Link href={`/propiedades/${exp.property.id}`} className="text-white font-medium hover:text-orange-400 flex items-center gap-1">
                             <Building className="w-3 h-3 text-zinc-500" /> {exp.property.address}
                          </Link>
                          <div className="flex items-center gap-2">
                             <Badge className={exp.property.mode === 'SALE' ? 'badge-venta text-[10px]' : 'badge-alquiler text-[10px]'}>
                                {phaseLabels[exp.property.currentPhase]}
                             </Badge>
                             <span className="text-xs text-zinc-500 flex items-center gap-1">
                               <MapPin className="w-3 h-3" /> {exp.property.city}
                             </span>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-4 w-64">
                       {exp.transaction ? (
                           <div className="flex flex-col gap-1 text-xs">
                              <div className="flex items-center gap-1.5 text-zinc-300">
                                 <span className="text-zinc-600 w-5">Pr:</span>
                                 <span className="truncate max-w-[120px]">{exp.transaction.seller.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-zinc-300">
                                 <span className="text-zinc-600 w-5">Co:</span>
                                 <span className="truncate max-w-[120px]">{exp.transaction.buyer.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-zinc-300">
                                 <span className="text-zinc-600 w-5">Ag:</span>
                                 <span className="truncate max-w-[120px] text-orange-400">{exp.transaction.agent.name}</span>
                              </div>
                           </div>
                       ) : (
                          <span className="text-xs text-zinc-600 italic">Pre-transaccional (Solo Vendedor/Agente)</span>
                       )}
                    </td>
                    <td className="px-4 py-4 text-center">
                       <Badge variant="outline" className="bg-[#0a0a0a] text-zinc-300 border-[#333] font-medium px-2 py-0.5 text-xs">
                          {exp._count.documents}
                       </Badge>
                    </td>
                    <td className="px-4 py-4">
                       {exp.status === 'EN_PROCESO' && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20"><Clock className="w-3 h-3 mr-1" /> En Proceso</Badge>}
                       {exp.status === 'PENDIENTE_FIRMAS' && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Pdte. Firmas</Badge>}
                       {exp.status === 'COMPLETADO' && <Badge className="badge-alquiler"><CheckCircle2 className="w-3 h-3 mr-1" /> Completado</Badge>}
                       {exp.status === 'ARCHIVADO' && <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">Archivado</Badge>}
                    </td>
                    <td className="px-4 py-4 text-zinc-400 text-xs">
                       {dayjs(exp.updatedAt).fromNow()}
                    </td>
                    <td className="px-4 py-4 text-center">
                        <Link href={`/expedientes/${exp.id}`}>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
