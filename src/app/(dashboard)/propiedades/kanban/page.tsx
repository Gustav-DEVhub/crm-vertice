'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LayoutList, MapPin } from 'lucide-react'
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

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function KanbanPage() {
  const [mode, setMode] = useState<'SALE' | 'RENT'>('SALE')
  const [data, setData] = useState<{ properties: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/propiedades?mode=${mode}&take=100`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [mode])

  const salePhases = ['CAPTACION', 'DOCUMENTACION', 'PUBLICACION', 'VISITAS', 'NEGOCIACION', 'RESERVA', 'FIRMA', 'ESCRITURACION']
  const rentPhases = ['CAPTACION', 'DOCUMENTACION', 'PUBLICACION', 'VISITAS', 'NEGOCIACION', 'RESERVA', 'CONTRATO']
  const currentPhases = mode === 'SALE' ? salePhases : rentPhases

  // Group properties
  const grouped = currentPhases.reduce((acc, phase) => {
    acc[phase] = data?.properties?.filter(p => p.currentPhase === phase) || []
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline Kanban</h1>
          <p className="text-sm text-zinc-500">
            Vista visual del progreso de captaciones y ventas (solo lectura)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#141414] rounded-lg p-1 border border-[#262626]">
            <button
              onClick={() => setMode('SALE')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === 'SALE' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Venta
            </button>
            <button
              onClick={() => setMode('RENT')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === 'RENT' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Alquiler
            </button>
          </div>
          <Link href="/propiedades">
            <Button variant="outline" className="bg-[#141414] border-[#262626] text-zinc-300 hover:text-white">
              <LayoutList className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {currentPhases.map((phase) => (
            <div key={phase} className="min-w-[300px] w-[300px] flex flex-col bg-[#141414] rounded-xl border border-[#262626] h-full shrink-0">
               <div className="p-3 border-b border-[#1e1e1e] flex justify-between items-center sticky top-0 bg-[#141414] z-10 rounded-t-xl">
                 <h3 className="font-semibold text-white tracking-wide">{phaseLabels[phase]}</h3>
                 <Badge variant="outline" className="bg-[#262626] text-zinc-400 border-none">
                    {grouped[phase]?.length || 0}
                 </Badge>
               </div>
               
               <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {grouped[phase]?.map((p: any) => (
                    <Link key={p.id} href={`/propiedades/${p.id}`}>
                      <Card className="bg-[#1a1a1a] border-[#333] hover:border-orange-500/50 transition-colors cursor-pointer group">
                        <CardContent className="p-3">
                           {p.photos && p.photos.length > 0 && (
                             <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
                                <Image src={p.photos[0].url} alt="Propiedad" fill className="object-cover" />
                             </div>
                           )}
                           <div className="flex justify-between items-start mb-1">
                              <p className="text-white font-bold text-base truncate">{formatCurrency(p.price)}</p>
                              <Badge className="text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                                 {p.type}
                              </Badge>
                           </div>
                           <p className="text-xs text-zinc-400 flex items-start line-clamp-2 mt-1">
                             <MapPin className="w-3 h-3 mr-1 mt-0.5 shrink-0" /> {p.address}
                           </p>
                           <div className="mt-3 pt-3 border-t border-[#333] flex justify-between items-center">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                                   {p.agent?.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-[10px] text-zinc-500">{p.agent?.name?.split(' ')[0] || 'Sin asignar'}</span>
                              </div>
                           </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
