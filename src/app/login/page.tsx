'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const expired = searchParams.get('expired')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos')
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Error al iniciar sesión. Intenta más tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/[0.03] via-transparent to-transparent" />
      </div>

      <Card className="w-full max-w-md mx-4 bg-[#141414] border-[#262626] shadow-2xl animate-fade-in relative z-10">
        <CardContent className="p-8">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-lg shadow-orange-500/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Inmobiliaria Vértice
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Panel de Administración
            </p>
          </div>

          {/* Session expired message */}
          {expired && (
            <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm text-center">
              Tu sesión ha expirado. Inicia sesión de nuevo.
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 text-sm">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@inmobiliaria-vertice.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#0a0a0a] border-[#262626] text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-orange-500/20 h-11"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 text-sm">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-[#0a0a0a] border-[#262626] text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-orange-500/20 h-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <a
              href="/privacidad"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Política de Privacidad
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
