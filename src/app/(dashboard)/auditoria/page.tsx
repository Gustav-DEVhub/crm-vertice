'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, LayoutDashboard, Search, FileText, Database, Settings } from 'lucide-react'
import dayjs from 'dayjs'

const entityLabels: Record<string, string> = {
  Property: 'Propiedad',
  Agent: 'Agente',
  Client: 'Cliente',
  User: 'Usuario',
  Visit: 'Visita',
  Transaction: 'Transacción',
  Commission: 'Comisión',
  Expediente: 'Expediente',
  ExpDoc: 'Documento Expediente',
  ExternalProf: 'Prof. Externo'
}

const actionStyles: Record<string, string> = {
  CREATE: 'bg-green-500/10 text-green-500 border-green-500/20',
  UPDATE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
  LOGIN: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

const actionIcons: Record<string, any> = {
  CREATE: PlusIcon,
  UPDATE: EditIcon,
  DELETE: TrashIcon,
  LOGIN: LoginIcon,
}

function PlusIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> }
function EditIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg> }
function TrashIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg> }
function LoginIcon(props: any) { return <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg> }

export default function AuditPage() {
  const [data, setData] = useState<{ logs: any[]; pagination: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [actionField, setActionField] = useState('ALL')
  const [entityField, setEntityField] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/auditoria?page=${page}&action=${actionField}&entity=${entityField}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, actionField, entityField])

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Registro de Auditoría</h1>
          <p className="text-sm text-zinc-500">
            Traza inmutable de acciones críticas en el sistema (Cumplimiento de Seguridad)
          </p>
        </div>
        <div className="flex gap-2">
            <Select value={actionField} onValueChange={(v) => { setActionField(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] bg-[#141414] border-[#262626] text-white">
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="CREATE">Creación</SelectItem>
                <SelectItem value="UPDATE">Modificación</SelectItem>
                <SelectItem value="DELETE">Borrado</SelectItem>
                <SelectItem value="LOGIN">Acceso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={entityField} onValueChange={(v) => { setEntityField(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] bg-[#141414] border-[#262626] text-white">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333] text-white max-h-80">
                <SelectItem value="ALL">Todos los módulos</SelectItem>
                {Object.entries(entityLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </div>

      <Card className="bg-[#141414] border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] text-zinc-400 font-medium border-b border-[#262626]">
              <tr>
                <th className="px-4 py-3">Timestamp / IP</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3 text-center">Acción</th>
                <th className="px-4 py-3">Entidad Afectada</th>
                <th className="px-4 py-3">Detalle (Cambios)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {loading ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                     <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                   </td>
                </tr>
              ) : data?.logs.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-16 text-center text-zinc-500">
                      <Database className="w-10 h-10 opacity-20 mx-auto mb-2" />
                      No se encontraron registros bajo estos filtros.
                   </td>
                </tr>
              ) : (
                data?.logs.map((log) => {
                  const Icon = actionIcons[log.action] || Settings
                  return (
                    <tr key={log.id} className="hover:bg-[#1a1a1a] transition-colors group">
                      <td className="px-4 py-4">
                         <div className="flex flex-col gap-1 text-xs">
                            <span className="text-zinc-300 font-medium truncate">
                               {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                            </span>
                            <span className="text-zinc-600 font-mono tracking-tighter truncate max-w-[140px]">{log.ip}</span>
                         </div>
                      </td>
                      <td className="px-4 py-4">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0 font-bold text-[10px]">
                               {log.user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                               <span className="text-zinc-300 text-sm truncate">{log.user.name}</span>
                               <span className="text-zinc-500 text-[10px] truncate">{log.user.email}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                         <Badge className={`w-24 justify-center py-1 ${actionStyles[log.action] || 'bg-zinc-800 text-zinc-400'}`}>
                            <Icon className="w-3.5 h-3.5 mr-1" />
                            {log.action}
                         </Badge>
                      </td>
                      <td className="px-4 py-4">
                         <div className="flex flex-col gap-0.5">
                            <span className="text-white font-medium">{entityLabels[log.entity] || log.entity}</span>
                            <span className="text-[10px] text-zinc-600 font-mono">{log.entityId}</span>
                         </div>
                      </td>
                      <td className="px-4 py-4 w-64">
                         {log.newValue ? (
                            <div className="bg-[#0a0a0a] rounded border border-[#262626] p-2 text-[10px] font-mono whitespace-pre-wrap max-h-24 overflow-y-auto text-emerald-400/80 scrollbar-hide">
                               {JSON.stringify(log.newValue, null, 2)}
                            </div>
                         ) : (
                            <span className="text-xs text-zinc-600 italic">Datos encapsulados o evento de sistema</span>
                         )}
                      </td>
                    </tr>
                  )
                })
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
