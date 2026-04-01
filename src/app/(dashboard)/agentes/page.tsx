'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Mail, Phone, Building, Eye, Receipt, Coins, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function AgentsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/agentes')
      .then((res) => res.json())
      .then((json) => setData(json.agents))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(a => 
    a.name.toLowerCase().includes(q.toLowerCase()) || 
    a.email.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Agentes</h1>
          <p className="text-sm text-zinc-500">
            Directorio del equipo comercial y rendimiento
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Agente
        </Button>
      </div>

      <Card className="bg-[#141414] border-[#262626]">
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <Input
               placeholder="Buscar por nombre o email..."
               value={q}
               onChange={(e) => setQ(e.target.value)}
               className="pl-9 bg-[#0a0a0a] border-[#262626] text-white"
             />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-6">
         {loading ? (
             <div className="col-span-full py-20 flex justify-center">
               <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
             </div>
         ) : filtered.length === 0 ? (
             <div className="col-span-full py-16 text-center text-zinc-500 bg-[#141414] rounded-xl border border-[#262626]">
               No se encontraron agentes.
             </div>
         ) : (
           filtered.map((agent) => (
             <Link key={agent.id} href={`/agentes/${agent.id}`}>
               <Card className="bg-[#141414] border-[#262626] hover:border-orange-500/50 transition-all cursor-pointer group flex flex-col h-full">
                 <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl text-white font-bold shadow-lg shadow-orange-500/20">
                          {agent.name.charAt(0)}
                       </div>
                       <Badge className={agent.isActive ? 'badge-alquiler' : 'badge-venta'}>
                          {agent.isActive ? 'Activo' : 'Inactivo'}
                       </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                      {agent.name}
                    </h3>
                    
                    <div className="space-y-2 mt-3 mb-6 flex-1">
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-zinc-500 shrink-0" /> <span className="truncate">{agent.email}</span>
                      </p>
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-zinc-500 shrink-0" /> {agent.phone}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1e1e1e]">
                       <div className="text-center p-2 rounded-lg bg-[#0a0a0a]">
                          <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1"><Building className="w-3 h-3" /> Propiedades</p>
                          <p className="text-lg font-bold text-white">{agent.activeProperties}</p>
                       </div>
                       <div className="text-center p-2 rounded-lg bg-[#0a0a0a]">
                          <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1"><Receipt className="w-3 h-3" /> Cierres</p>
                          <p className="text-lg font-bold text-white">{agent.totalTransactions}</p>
                       </div>
                       <div className="col-span-2 text-center p-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                          <p className="text-xs text-orange-500/80 mb-1 flex items-center justify-center gap-1"><Coins className="w-3 h-3" /> Facturación Generada</p>
                          <p className="text-lg font-bold text-orange-400">{formatCurrency(agent.generatedRevenue)}</p>
                       </div>
                    </div>
                 </CardContent>
               </Card>
             </Link>
           ))
         )}
      </div>
    </div>
  )
}
