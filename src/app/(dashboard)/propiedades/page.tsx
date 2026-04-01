'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LayoutList, Trello, Search, Plus, MapPin, Bed, Bath, Expand } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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

const typeLabels: Record<string, string> = {
  APARTMENT: 'Piso',
  HOUSE: 'Casa',
  VILLA: 'Chalet',
  STUDIO: 'Estudio',
  PENTHOUSE: 'Ático',
  COMMERCIAL: 'Local',
  OFFICE: 'Oficina',
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function PropertiesPage() {
  const [mode, setMode] = useState<'SALE' | 'RENT'>('SALE')
  const [data, setData] = useState<{ properties: any[]; pagination: any } | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [q, setQ] = useState('')
  const [phase, setPhase] = useState('ALL')
  const [agentId, setAgentId] = useState('ALL')
  const [type, setType] = useState('ALL')
  const [page, setPage] = useState(1)

  const [agents, setAgents] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    // Fetch agents for the filter dropdown
    fetch('/api/search?q=a').then(res => res.json()).then(data => {
       const agents = data.results?.filter((r: any) => r.type === 'agent') || []
       setAgents(agents)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('mode', mode)
    params.set('page', page.toString())
    if (q) params.set('q', q)
    if (phase !== 'ALL') params.set('phase', phase)
    if (agentId !== 'ALL') params.set('agentId', agentId)
    if (type !== 'ALL') params.set('type', type)

    fetch(`/api/propiedades?${params.toString()}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [mode, q, phase, agentId, type, page])

  const salePhases = ['ALL', 'CAPTACION', 'DOCUMENTACION', 'PUBLICACION', 'VISITAS', 'NEGOCIACION', 'RESERVA', 'FIRMA', 'ESCRITURACION']
  const rentPhases = ['ALL', 'CAPTACION', 'DOCUMENTACION', 'PUBLICACION', 'VISITAS', 'NEGOCIACION', 'RESERVA', 'CONTRATO']
  const currentPhases = mode === 'SALE' ? salePhases : rentPhases

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Propiedades</h1>
          <p className="text-sm text-zinc-500">
            Gestiona tu cartera de inmuebles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#141414] rounded-lg p-1 border border-[#262626]">
            <button
              onClick={() => { setMode('SALE'); setPhase('ALL'); setPage(1); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === 'SALE' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Venta
            </button>
            <button
              onClick={() => { setMode('RENT'); setPhase('ALL'); setPage(1); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === 'RENT' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Alquiler
            </button>
          </div>
          <Link href="/propiedades/kanban">
            <Button variant="outline" className="bg-[#141414] border-[#262626] text-zinc-300 hover:text-white">
              <Trello className="w-4 h-4 mr-2" />
              Kanban
            </Button>
          </Link>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Inmueble
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#141414] border-[#262626]">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por dirección o ciudad..."
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  className="pl-9 bg-[#0a0a0a] border-[#262626] text-white"
                />
             </div>
          </div>
          <Select value={phase} onValueChange={(v) => { setPhase(v); setPage(1); }}>
            <SelectTrigger className="w-[180px] bg-[#0a0a0a] border-[#262626] text-white">
              <SelectValue placeholder="Fase" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
              {currentPhases.map(p => (
                <SelectItem key={p} value={p}>{p === 'ALL' ? 'Todas las fases' : phaseLabels[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] bg-[#0a0a0a] border-[#262626] text-white">
              <SelectValue placeholder="Tipo" />
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

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full py-20 flex justify-center">
             <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
           </div>
        ) : data?.properties.length === 0 ? (
           <div className="col-span-full py-20 text-center text-zinc-500 bg-[#141414] rounded-xl border border-[#262626]">
             No se encontraron propiedades con estos filtros.
           </div>
        ) : (
          data?.properties.map((property) => (
            <Link key={property.id} href={`/propiedades/${property.id}`}>
              <Card className="bg-[#141414] border-[#262626] hover:border-orange-500/50 transition-all overflow-hidden group cursor-pointer h-full flex flex-col">
                <div className="relative h-48 w-full bg-[#1a1a1a] overflow-hidden">
                   {property.photos[0] ? (
                     <Image
                       src={property.photos[0].url}
                       alt={property.address}
                       fill
                       className="object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                       <Building className="w-8 h-8 opacity-50" />
                     </div>
                   )}
                   <div className="absolute top-3 left-3">
                     <Badge className={mode === 'SALE' ? 'badge-venta' : 'badge-alquiler'}>
                       {mode === 'SALE' ? 'Venta' : 'Alquiler'}
                     </Badge>
                   </div>
                   <div className="absolute top-3 right-3">
                     <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 hover:bg-black/80">
                       {phaseLabels[property.currentPhase]}
                     </Badge>
                   </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white leading-tight flex-1">
                      {formatCurrency(property.price)}
                      {mode === 'RENT' && <span className="text-sm font-normal text-zinc-500">/mes</span>}
                    </h3>
                    <Badge variant="outline" className="text-xs text-zinc-400 border-[#333] shrink-0 ml-2">
                      {typeLabels[property.type]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-start text-zinc-400 text-sm mb-4 mt-1">
                    <MapPin className="w-4 h-4 mr-1.5 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{property.address}, {property.city}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#1e1e1e] mt-auto">
                    <div className="flex items-center justify-center gap-1.5 text-zinc-300 text-sm font-medium">
                      <Bed className="w-4 h-4 text-zinc-500" /> {property.rooms}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-zinc-300 text-sm font-medium border-x border-[#1e1e1e]">
                      <Bath className="w-4 h-4 text-zinc-500" /> {property.baths}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-zinc-300 text-sm font-medium">
                      <Expand className="w-4 h-4 text-zinc-500" /> {property.m2}m²
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                          {property.agent?.name?.charAt(0) || '?'}
                       </div>
                       <span>{property.agent?.name || 'Sin asignar'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

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
