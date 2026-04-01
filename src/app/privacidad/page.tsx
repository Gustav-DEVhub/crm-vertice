import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
         <div className="flex items-center gap-4 border-b border-[#262626] pb-6">
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </Link>
            <ShieldCheck className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-white">Política de Privacidad y Protección de Datos (RGPD)</h1>
         </div>

         <div className="prose prose-invert prose-orange max-w-none text-sm font-light leading-relaxed">
            <p className="text-zinc-400 font-medium">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>

            <h2 className="text-white text-lg font-semibold mt-8 mb-4">1. Identidad del responsable del tratamiento</h2>
            <p>
               INMOBILIARIA VÉRTICE (en adelante, &quot;la Agencia&quot;), con NIF ficticio B-00000000, 
               es el Responsable del tratamiento de los datos personales del usuario suministrados a través de este CRM y portal.
            </p>

            <h2 className="text-white text-lg font-semibold mt-8 mb-4">2. Finalidad del tratamiento de los datos</h2>
            <p>Sus datos personales se tratan con la finalidad de:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
               <li>Gestionar la intermediación inmobiliaria (compra, venta y alquiler de inmuebles).</li>
               <li>Concertar y registrar visitas a los inmuebles en cartera.</li>
               <li>Tramitar documentación legal, contratos, reservas y arras necesarios para llevar a cabo operaciones transaccionales.</li>
               <li>Cumplimiento de obligaciones legales, fiscales y contables requeridas por la legislación vigente aplicable al sector inmobiliario.</li>
            </ul>

            <h2 className="text-white text-lg font-semibold mt-8 mb-4">3. Cuánto tiempo conservamos los datos</h2>
            <p>
               Los datos se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales (generalmente 5 años para prevención de blanqueo de capitales, o 6 años a efectos contables fiscales, Ley 58/2003, de 17 de diciembre, General Tributaria, u otras similares). Tras ello, se eliminarán o anonimizarán.
            </p>

            <h2 className="text-white text-lg font-semibold mt-8 mb-4">4. Derecho al olvido y eliminación (RGPD)</h2>
            <p>
               Cualquier cliente (comprador, inquilino o propietario) tiene derecho a solicitar la eliminación de su ficha enviando un correo a <a href="mailto:privacidad@verticecrm.fake" className="text-orange-400 hover:underline">privacidad@verticecrm.fake</a>.
               El CRM Vértice implementa reglas sistemáticas para el derecho al olvido: si no constan transacciones contables o de facturación vinculadas al sujeto, se procede a su eliminación total irreplicable de nuestras bases de datos en menos de 72 horas operativas.
            </p>

            <h2 className="text-white text-lg font-semibold mt-8 mb-4">5. Seguridad de los datos</h2>
            <p>
               El CRM Vértice implementa cifrado AES-256-GCM para campos críticos a nivel estructural y hashes bcrypt para contraseñas de acceso. Toda la transmisión de datos se realiza bajo HTTPS con políticas rígidas de CORS, HSTS y encabezados estrictos CSP.
            </p>

            <div className="mt-12 bg-[#141414] border border-[#262626] p-6 rounded-xl flex items-start gap-4">
               <Mail className="w-6 h-6 text-zinc-500 shrink-0 mt-1" />
               <div>
                  <h3 className="text-white font-medium mb-1">Contacto del DPO (Data Protection Officer)</h3>
                  <p className="text-zinc-400">Si tiene dudas sobre el tratamiento de sus datos o desea ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación, Oposición), contáctenos en <a href="mailto:privacidad@verticecrm.fake" className="text-orange-500 hover:underline">privacidad@verticecrm.fake</a>.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
