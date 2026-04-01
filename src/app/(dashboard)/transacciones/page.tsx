'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, MapPin, Building, ArrowRight, CalendarDays, Euro, UserSearch } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function TransactionsPage() {
  const [data, setData] = useState<{ transactions: any[]; pagination: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [yearField, setYearField] = useState('ALL')

  const currentYear = dayjs().year()
  const years = Array.from({ length: 5 }).map((_, i) => (currentYear - i).toString())

  useEffect(() => {
    setLoading(true)
    fetch(`/api/transacciones?page=${page}&year=${yearField}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, yearField])

  const handleExport = () => {
    window.open('/api/transacciones/export', '_blank')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transacciones y Cierres</h1>
          <p className="text-sm text-zinc-500">
            Historial histórico de todas las operaciones cerradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearField} onValueChange={(v) => { setYearField(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] bg-[#141414] border-[#262626] text-white">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
              <SelectItem value="ALL">Todos los años</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} className="bg-[#141414] border-[#262626] text-zinc-300 hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card className="bg-[#141414] border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] text-zinc-400 font-medium border-b border-[#262626]">
              <tr>
                <th className="px-4 py-3">Operación / Fecha</th>
                <th className="px-4 py-3">Inmueble</th>
                <th className="px-4 py-3">Partes Involucradas</th>
                <th className="px-4 py-3">Agente Responsable</th>
                <th className="px-4 py-3 text-right">Monto Final</th>
                <th className="px-4 py-3 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  </td>
                </tr>
              ) : data?.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    No se encontraron transacciones para estos filtros.
                  </td>
                </tr>
              ) : (
                data?.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#1a1a1a] transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <Badge className={tx.property.mode === 'SALE' ? 'badge-venta text-xs' : 'badge-alquiler text-xs'}>
                          {tx.property.mode === 'SALE' ? 'Venta' : 'Alquiler'}
                        </Badge>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                          <CalendarDays className="w-3 h-3 text-zinc-500" />
                          {dayjs(tx.closeDate).format('DD MMM YYYY')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <Link href={`/propiedades/${tx.property.id}`} className="text-white font-medium hover:text-orange-400 flex items-center gap-1">
                          <Building className="w-3 h-3 text-zinc-500" /> {tx.property.address}
                        </Link>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {tx.property.city}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <span className="text-zinc-600 w-5">Pr:</span>
                          <Link href={`/clientes/${tx.seller.id}`} className="hover:text-white truncate max-w-[120px]">{tx.seller.name}</Link>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <span className="text-zinc-600 w-5">Co:</span>
                          <Link href={`/clientes/${tx.buyer.id}`} className="hover:text-white truncate max-w-[120px]">{tx.buyer.name}</Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      <Link href={`/agentes/${tx.agent.id}`} className="flex items-center gap-2 hover:text-white transition-colors">
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                          {tx.agent.name.charAt(0)}
                        </div>
                        <span className="text-sm">{tx.agent.name.split(' ')[0]}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-base font-bold text-white flex justify-end items-center gap-1">
                        {formatCurrency(tx.finalPrice)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link href={`/propiedades/${tx.property.id}`}>
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
