'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileSignature, Search, Plus, Mail, Phone, Briefcase, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'

const typeLabels: Record<string, string> = {
  PERITO: 'Perito Tasador',
  NOTARY: 'Notaría',
  GESTOR: 'Gestoría',
}

export default function ExternalProfessionalsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [type, setType] = useState('ALL')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (type !== 'ALL') params.set('type', type)

    fetch(`/api/profesionales?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => setData(json.professionals))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [q, type])

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Profesionales Externos</h1>
          <p className="text-sm text-zinc-500">
            Directorio de peritos, notarías y gestorías colaboradoras
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Colaborador
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
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9 bg-[#0a0a0a] border-[#262626] text-white"
                />
             </div>
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px] bg-[#0a0a0a] border-[#262626] text-white">
              <SelectValue placeholder="Especialidad" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
              <SelectItem value="ALL">Todas las especialidades</SelectItem>
              {Object.entries(typeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
             <div className="col-span-full py-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
             </div>
         ) : data.length === 0 ? (
             <div className="col-span-full py-16 text-center text-zinc-500 bg-[#141414] rounded-xl border border-[#262626]">
                <FileSignature className="w-10 h-10 opacity-20 mx-auto mb-2" />
                No se encontraron profesionales de esta categoría.
             </div>
         ) : (
            data.map((prof) => (
              <Card key={prof.id} className="bg-[#141414] border-[#262626] hover:border-orange-500/50 transition-colors flex flex-col group">
                 <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold text-lg">
                          {prof.name.charAt(0).toUpperCase()}
                       </div>
                       <Badge className={
                          prof.type === 'NOTARY' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          prof.type === 'PERITO' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                       }>
                          {typeLabels[prof.type]}
                       </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors leading-tight">
                       {prof.name}
                    </h3>

                    <div className="space-y-2 mb-6">
                       {prof.email && (
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                             <Mail className="w-4 h-4 text-zinc-500 shrink-0" /> <a href={`mailto:${prof.email}`} className="hover:text-orange-400 truncate">{prof.email}</a>
                          </div>
                       )}
                       {prof.phone && (
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                             <Phone className="w-4 h-4 text-zinc-500 shrink-0" /> <a href={`tel:${prof.phone}`} className="hover:text-orange-400">{prof.phone}</a>
                          </div>
                       )}
                    </div>

                    <div className="mt-auto border-t border-[#1e1e1e] pt-4">
                       <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-zinc-500 uppercase flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Operaciones</span>
                          <span className="text-sm font-bold text-white bg-[#0a0a0a] px-2 py-0.5 rounded">{prof._count.transactions}</span>
                       </div>
                       
                       {prof.transactions.length > 0 ? (
                         <div className="space-y-2">
                           {prof.transactions.slice(0, 3).map((t: any) => (
                              <div key={t.id} className="flex items-center justify-between text-xs bg-[#1a1a1a] p-2 rounded border border-[#262626]">
                                 <span className="text-zinc-300 truncate max-w-[150px]">{t.property.address}</span>
                                 <span className="text-zinc-500">{dayjs(t.closeDate).format('MM/YY')}</span>
                              </div>
                           ))}
                         </div>
                       ) : (
                         <div className="text-xs text-zinc-600 bg-[#0a0a0a] p-2 rounded text-center">
                           Sin operaciones asociadas
                         </div>
                       )}
                    </div>
                 </CardContent>
              </Card>
            ))
         )}
      </div>
    </div>
  )
}
