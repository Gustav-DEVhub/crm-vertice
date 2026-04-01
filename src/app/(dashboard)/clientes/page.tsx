'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Mail, Phone, Eye, Building, Calendar } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'

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

export default function ClientsPage() {
  const [data, setData] = useState<{ clients: any[]; pagination: any } | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [q, setQ] = useState('')
  const [type, setType] = useState('ALL')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (q) params.set('q', q)
    if (type !== 'ALL') params.set('type', type)

    fetch(`/api/clientes?${params.toString()}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [q, type, page])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-zinc-500">
            Base de datos de compradores, inquilinos y propietarios
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="bg-[#141414] border-[#262626]">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  className="pl-9 bg-[#0a0a0a] border-[#262626] text-white"
                />
             </div>
          </div>
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-[180px] bg-[#0a0a0a] border-[#262626] text-white">
              <SelectValue placeholder="Tipo de cliente" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              {Object.entries(typeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-[#141414] border-[#262626]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] text-zinc-400 font-medium border-b border-[#262626]">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Interacciones</th>
                <th className="px-4 py-3">Fecha Alta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {loading ? (
                <tr>
                   <td colSpan={6} className="py-20 text-center">
                     <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                   </td>
                </tr>
              ) : data?.clients.length === 0 ? (
                <tr>
                   <td colSpan={6} className="py-10 text-center text-zinc-500">No se encontraron clientes</td>
                </tr>
              ) : (
                data?.clients.map((client) => {
                  const ops = client._count.boughtProperties + client._count.soldProperties
                  const cls = client.status === 'ACTIVE' ? 'badge-info' : 'bg-red-500/10 text-red-500 border-red-500/20'

                  return (
                    <tr key={client.id} className="hover:bg-[#1a1a1a] transition-colors group">
                      <td className="px-4 py-3">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                               {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <p className="text-white font-medium group-hover:text-orange-400 transition-colors">{client.name}</p>
                               <Badge className={`text-[10px] mt-1 ${cls}`}>
                                  {client.status === 'ACTIVE' ? 'Activo' : 'Cerrado'}
                               </Badge>
                            </div>
                         </div>
                      </td>
                      <td className="px-4 py-3 space-y-1">
                         <p className="text-zinc-400 flex items-center gap-1.5"><Mail className="w-3 h-3 text-zinc-500" /> {client.email}</p>
                         <p className="text-zinc-400 flex items-center gap-1.5"><Phone className="w-3 h-3 text-zinc-500" /> {client.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                         <Badge variant="outline" className={`text-xs ${typeStyles[client.type]}`}>
                            {typeLabels[client.type]}
                         </Badge>
                      </td>
                      <td className="px-4 py-3 space-y-1">
                         <p className="text-zinc-400 flex items-center gap-1.5"><Eye className="w-3 h-3" /> {client._count.visits} visitas</p>
                         <p className="text-zinc-400 flex items-center gap-1.5"><Building className="w-3 h-3" /> {ops} operaciones</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                         <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {dayjs(client.createdAt).format('DD/MM/YYYY')}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                         <Link href={`/clientes/${client.id}`}>
                           <Button variant="ghost" className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 px-3 py-1 h-auto text-xs">
                              Ver ficha
                           </Button>
                         </Link>
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
        <div className="flex justify-center gap-2 pt-2">
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
