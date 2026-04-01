'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building, UserCircle, Users, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchResult {
  type: 'property' | 'client' | 'agent'
  id: string
  title: string
  subtitle: string
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
          setIsOpen(true)
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    switch (result.type) {
      case 'property':
        router.push(`/propiedades/${result.id}`)
        break
      case 'client':
        router.push(`/clientes/${result.id}`)
        break
      case 'agent':
        router.push(`/agentes/${result.id}`)
        break
    }
  }

  const iconMap = {
    property: Building,
    client: UserCircle,
    agent: Users,
  }

  const labelMap = {
    property: 'Propiedades',
    client: 'Clientes',
    agent: 'Agentes',
  }

  const grouped = results.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = []
      acc[r.type].push(r)
      return acc
    },
    {} as Record<string, SearchResult[]>
  )

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Buscar propiedades, clientes, agentes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-8 bg-[#141414] border-[#262626] text-white placeholder:text-zinc-600 focus:border-orange-500/50 h-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in">
          {loading ? (
            <div className="p-4 text-center text-sm text-zinc-500">
              Buscando...
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500">
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => {
              const Icon = iconMap[type as keyof typeof iconMap]
              const label = labelMap[type as keyof typeof labelMap]
              return (
                <div key={type}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 bg-[#141414]">
                    {label}
                  </div>
                  {items.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
