'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, User, Mail, ShieldCheck, ArrowRight, Cog, HardDrive } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

export default function ProfilePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    setLoading(true)
    fetch('/api/perfil')
      .then((res) => res.json())
      .then(json => {
         setData(json.user)
         setForm(f => ({ ...f, name: json.user.name, email: json.user.email }))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
     e.preventDefault()
     setSaving(true)
     setMessage({ type: '', text: '' })
     
     try {
        const res = await fetch('/api/perfil', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(form)
        })
        const json = await res.json()
        
        if (!res.ok) throw new Error(json.error || 'Error actualizando perfil')
        
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
        setForm(f => ({ ...f, currentPassword: '', newPassword: '' }))
     } catch (err: any) {
        setMessage({ type: 'error', text: err.message })
     } finally {
        setSaving(false)
     }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración y Perfil</h1>
        <p className="text-sm text-zinc-500">
          Ajustes de la cuenta de administrador, seguridad de acceso y encriptación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Sidebar Stats */}
         <div className="space-y-6">
            <Card className="bg-[#141414] border-[#262626]">
               <CardContent className="p-6 text-center">
                  {loading ? (
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#1a1a1a] animate-pulse mb-4" />
                  ) : (
                    <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center text-3xl text-orange-400 font-bold mb-4 shadow-lg border border-orange-500/30">
                       {data?.name?.charAt(0)}
                    </div>
                  )}
                  
                  <h2 className="text-xl font-bold text-white mb-2">{loading ? 'Cargando...' : data?.name}</h2>
                  <Badge className="badge-info mb-4">Administrador Principal</Badge>
                  
                  <div className="text-xs text-zinc-500 space-y-2 pt-4 border-t border-[#1e1e1e]">
                     <p className="flex justify-between"><span>Registrado:</span> <span className="text-white">{data?.createdAt ? dayjs(data.createdAt).format('DD MMM YYYY') : '-'}</span></p>
                     <p className="flex justify-between"><span>Último Acceso:</span> <span className="text-green-400">Ahora activo</span></p>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-[#141414] border-[#262626]">
               <CardHeader className="pb-3 border-b border-[#1e1e1e]">
                  <CardTitle className="text-sm text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Seguridad Activa</CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-4">
                  <div className="flex gap-3 items-start">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div>
                        <p className="text-sm text-zinc-300 font-medium">Cifrado AES-256-GCM</p>
                        <p className="text-xs text-zinc-500 mt-0.5">La BD anonimiza campos críticos automáticamente.</p>
                     </div>
                  </div>
                  <div className="flex gap-3 items-start">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <HardDrive className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div>
                        <p className="text-sm text-zinc-300 font-medium">Bcrypt Hashes (v12)</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Contraseñas fuertemente encriptadas en reposo.</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Settings Form */}
         <div className="md:col-span-2">
            <Card className="bg-[#141414] border-[#262626]">
               <CardHeader className="border-b border-[#1e1e1e]">
                  <CardTitle className="text-white flex items-center gap-2">
                     <Cog className="w-5 h-5 text-zinc-400" />
                     Actualizar Datos
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <form onSubmit={handleSave} className="space-y-6">
                     {message.text && (
                        <div className={`p-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                           {message.text}
                        </div>
                     )}

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400 flex items-center gap-2"><User className="w-4 h-4 text-zinc-500" /> Nombre Completo</label>
                           <Input 
                              value={form.name} 
                              onChange={e => setForm(f => ({...f, name: e.target.value}))}
                              className="bg-[#0a0a0a] border-[#262626] text-white" 
                              required
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm text-zinc-400 flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-500" /> Correo Electrónico</label>
                           <Input 
                              type="email"
                              value={form.email} 
                              onChange={e => setForm(f => ({...f, email: e.target.value}))}
                              className="bg-[#0a0a0a] border-[#262626] text-white" 
                              required
                           />
                        </div>
                     </div>

                     <div className="pt-6 border-t border-[#1e1e1e]">
                        <h3 className="text-sm font-medium text-white mb-4">Cambio de Contraseña</h3>
                        <div className="grid grid-cols-1 gap-4">
                           <div className="space-y-2">
                              <label className="text-sm text-zinc-400">Contraseña Actual</label>
                              <Input 
                                 type="password"
                                 value={form.currentPassword} 
                                 onChange={e => setForm(f => ({...f, currentPassword: e.target.value}))}
                                 className="bg-[#0a0a0a] border-[#262626] text-white" 
                                 placeholder="Requerido solo si deseas cambiarla"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm text-zinc-400">Nueva Contraseña</label>
                              <Input 
                                 type="password"
                                 value={form.newPassword} 
                                 onChange={e => setForm(f => ({...f, newPassword: e.target.value}))}
                                 className="bg-[#0a0a0a] border-[#262626] text-white" 
                                 placeholder="Mínimo 8 caracteres"
                                 minLength={8}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={saving || loading} className="bg-orange-500 hover:bg-orange-600 text-white min-w-[140px]">
                           {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Guardar Cambios'}
                        </Button>
                     </div>
                  </form>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
