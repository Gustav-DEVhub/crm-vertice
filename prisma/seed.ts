import { PrismaClient, PropertyMode, PropertyType, ClientType, ClientStatus, CommissionStatus, ExpDocStatus, ExternalProfType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dayjs from 'dayjs'

const prisma = new PrismaClient()

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack: number): Date {
  return dayjs().subtract(randomBetween(1, daysBack), 'day').toDate()
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // ─── Clean database ───
  await prisma.auditLog.deleteMany()
  await prisma.phaseHistory.deleteMany()
  await prisma.expDoc.deleteMany()
  await prisma.expediente.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.visit.deleteMany()
  await prisma.propertyPhoto.deleteMany()
  await prisma.property.deleteMany()
  await prisma.client.deleteMany()
  await prisma.agent.deleteMany()
  await prisma.externalProf.deleteMany()
  await prisma.user.deleteMany()

  // ─── 1. Admin User ───
  console.log('👤 Creando usuario admin...')
  const passwordHash = await bcrypt.hash('Admin2024!', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@inmobiliaria-vertice.com',
      passwordHash,
      name: 'Carlos Vértice',
    },
  })

  // ─── 2. Agents (8) ───
  console.log('🏢 Creando agentes...')
  const agentsData = [
    { name: 'Lucía Martínez', email: 'lucia@vertice.com', phone: '+34 612 345 001', commissionPct: 0.60, joinDate: dayjs().subtract(24, 'month').toDate() },
    { name: 'Miguel Ángel Torres', email: 'miguel@vertice.com', phone: '+34 612 345 002', commissionPct: 0.65, joinDate: dayjs().subtract(18, 'month').toDate() },
    { name: 'Ana García Ruiz', email: 'ana@vertice.com', phone: '+34 612 345 003', commissionPct: 0.60, joinDate: dayjs().subtract(30, 'month').toDate() },
    { name: 'Pablo Fernández', email: 'pablo@vertice.com', phone: '+34 612 345 004', commissionPct: 0.55, joinDate: dayjs().subtract(12, 'month').toDate() },
    { name: 'Carmen López', email: 'carmen@vertice.com', phone: '+34 612 345 005', commissionPct: 0.70, joinDate: dayjs().subtract(36, 'month').toDate() },
    { name: 'David Sánchez', email: 'david@vertice.com', phone: '+34 612 345 006', commissionPct: 0.60, joinDate: dayjs().subtract(8, 'month').toDate() },
    { name: 'Elena Romero', email: 'elena@vertice.com', phone: '+34 612 345 007', commissionPct: 0.65, joinDate: dayjs().subtract(20, 'month').toDate() },
    { name: 'Javier Moreno', email: 'javier@vertice.com', phone: '+34 612 345 008', commissionPct: 0.55, joinDate: dayjs().subtract(6, 'month').toDate() },
  ]

  const agents = await Promise.all(
    agentsData.map((a) =>
      prisma.agent.create({
        data: {
          ...a,
          avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&seed=${a.name}`,
          isActive: true,
        },
      })
    )
  )

  // ─── 3. External Professionals (9) ───
  console.log('🏛️ Creando profesionales externos...')
  const profsData = [
    { type: ExternalProfType.PERITO, name: 'Roberto Valenzuela', phone: '+34 911 001 001', email: 'peritajes.valenzuela@gmail.com' },
    { type: ExternalProfType.PERITO, name: 'Marta Jiménez', phone: '+34 911 001 002', email: 'mjimenez.perito@gmail.com' },
    { type: ExternalProfType.PERITO, name: 'Alberto Ruiz', phone: '+34 911 001 003', email: 'aruiz.peritaciones@gmail.com' },
    { type: ExternalProfType.NOTARY, name: 'Notaría García & Asociados', phone: '+34 911 002 001', email: 'notaria.garcia@notariado.es' },
    { type: ExternalProfType.NOTARY, name: 'Notaría Pérez Montero', phone: '+34 911 002 002', email: 'nperez.montero@notariado.es' },
    { type: ExternalProfType.NOTARY, name: 'Notaría Central Madrid', phone: '+34 911 002 003', email: 'central.madrid@notariado.es' },
    { type: ExternalProfType.NOTARY, name: 'Notaría López Herrera', phone: '+34 911 002 004', email: 'nlopez.herrera@notariado.es' },
    { type: ExternalProfType.GESTOR, name: 'Gestoría Administrativa Sur', phone: '+34 911 003 001', email: 'gestoria.sur@gmail.com' },
    { type: ExternalProfType.GESTOR, name: 'Gestoría Integral Norte', phone: '+34 911 003 002', email: 'gestoria.norte@gmail.com' },
  ]

  const profs = await Promise.all(
    profsData.map((p) => prisma.externalProf.create({ data: p }))
  )

  // ─── 4. Properties (45) ───
  console.log('🏠 Creando propiedades...')
  const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao', 'Zaragoza']
  const streets = [
    'Calle Gran Vía', 'Avenida de la Constitución', 'Paseo de la Castellana', 'Calle Mayor',
    'Calle Serrano', 'Avenida Diagonal', 'Calle de Alcalá', 'Paseo del Prado',
    'Calle de Velázquez', 'Avenida de América', 'Calle Príncipe de Vergara',
    'Calle Goya', 'Calle Fuencarral', 'Calle Hortaleza', 'Paseo de Gracia',
    'Calle Bravo Murillo', 'Avenida del Mediterráneo', 'Calle de Toledo',
    'Calle Atocha', 'Avenida de Andalucía', 'Calle del Carmen', 'Calle de la Luna',
    'Avenida del Parque', 'Calle Real', 'Calle Nueva', 'Paseo Marítimo',
    'Calle del Sol', 'Avenida de Europa', 'Calle San Fernando', 'Calle Victoria',
    'Calle de los Olivos', 'Avenida de los Reyes', 'Calle de la Paz',
    'Calle Libertad', 'Calle Cervantes', 'Avenida Primavera', 'Calle Jardines',
    'Paseo de los Álamos', 'Calle del Río', 'Calle Paloma', 'Calle del Norte',
    'Avenida del Puerto', 'Calle Rosalía', 'Calle del Bosque', 'Calle Amapola',
  ]

  const salePhases = ['CAPTACION', 'DOCUMENTACION', 'PUBLICACION', 'VISITAS', 'NEGOCIACION', 'RESERVA', 'FIRMA', 'ESCRITURACION']
  const rentPhases = ['CAPTACION', 'DOCUMENTACION', 'PUBLICACION', 'VISITAS', 'NEGOCIACION', 'RESERVA', 'CONTRATO']
  const types = [PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.VILLA, PropertyType.STUDIO, PropertyType.PENTHOUSE, PropertyType.COMMERCIAL, PropertyType.OFFICE]

  const photoIds = [
    '1560448204-e02f11c3d0e2', '1512917774080-9991f1c4c750', '1600596542815-ffad4c1539a9',
    '1600585154340-be6161a56a0c', '1613490493805-fb2f22152b6a', '1564013799919-ab600027ffc6',
    '1502672260266-1c1ef2d93688', '1600607687939-ce8a6c25118c', '1600566753086-00f18fb6b3ea',
    '1600573472592-401b489a3cdc',
  ]

  const properties = []

  // 28 Sale properties
  for (let i = 0; i < 28; i++) {
    const phase = salePhases[i % salePhases.length]
    const daysInPhase = phase === 'ESCRITURACION' ? randomBetween(1, 5) : randomBetween(1, 25)
    const property = await prisma.property.create({
      data: {
        type: randomItem(types),
        mode: PropertyMode.SALE,
        address: `${streets[i]}, ${randomBetween(1, 150)}`,
        city: randomItem(cities),
        price: randomBetween(80000, 1200000),
        m2: randomBetween(40, 350),
        rooms: randomBetween(1, 6),
        baths: randomBetween(1, 4),
        description: `Magnífica propiedad en excelente ubicación. Luminosa y con acabados de calidad. Zona residencial con todos los servicios.`,
        commissionPct: 0.03,
        agentId: randomItem(agents).id,
        captureDate: dayjs().subtract(randomBetween(10, 180), 'day').toDate(),
        currentPhase: phase,
        lastPhaseUpdate: dayjs().subtract(daysInPhase, 'day').toDate(),
        photos: {
          create: Array.from({ length: randomBetween(2, 5) }, (_, j) => ({
            url: `https://images.unsplash.com/photo-${randomItem(photoIds)}?w=800&h=600&fit=crop`,
            order: j,
          })),
        },
      },
    })
    properties.push(property)

    // Phase history
    const currentPhaseIndex = salePhases.indexOf(phase)
    for (let p = 0; p <= currentPhaseIndex; p++) {
      await prisma.phaseHistory.create({
        data: {
          propertyId: property.id,
          phase: salePhases[p],
          changedAt: dayjs().subtract(randomBetween((currentPhaseIndex - p) * 5, (currentPhaseIndex - p + 1) * 15), 'day').toDate(),
          changedBy: admin.id,
        },
      })
    }
  }

  // 17 Rent properties
  for (let i = 0; i < 17; i++) {
    const phase = rentPhases[i % rentPhases.length]
    const daysInPhase = phase === 'CONTRATO' ? randomBetween(1, 5) : randomBetween(1, 25)
    const property = await prisma.property.create({
      data: {
        type: randomItem(types),
        mode: PropertyMode.RENT,
        address: `${streets[28 + i]}, ${randomBetween(1, 150)}`,
        city: randomItem(cities),
        price: randomBetween(500, 3500),
        m2: randomBetween(30, 200),
        rooms: randomBetween(1, 4),
        baths: randomBetween(1, 3),
        description: `Piso en alquiler con excelentes comunicaciones. Amueblado y listo para entrar. Comunidad con ascensor y portero.`,
        commissionPct: 0.03,
        agentId: randomItem(agents).id,
        captureDate: dayjs().subtract(randomBetween(10, 120), 'day').toDate(),
        currentPhase: phase,
        lastPhaseUpdate: dayjs().subtract(daysInPhase, 'day').toDate(),
        photos: {
          create: Array.from({ length: randomBetween(2, 4) }, (_, j) => ({
            url: `https://images.unsplash.com/photo-${randomItem(photoIds)}?w=800&h=600&fit=crop`,
            order: j,
          })),
        },
      },
    })
    properties.push(property)

    const currentPhaseIndex = rentPhases.indexOf(phase)
    for (let p = 0; p <= currentPhaseIndex; p++) {
      await prisma.phaseHistory.create({
        data: {
          propertyId: property.id,
          phase: rentPhases[p],
          changedAt: dayjs().subtract(randomBetween((currentPhaseIndex - p) * 5, (currentPhaseIndex - p + 1) * 15), 'day').toDate(),
          changedBy: admin.id,
        },
      })
    }
  }

  // ─── 5. Clients (70) ───
  console.log('👥 Creando clientes...')
  const clientNames = [
    'María Rodríguez', 'José García', 'Ana Martínez', 'Juan López', 'Laura Sánchez',
    'Carlos Fernández', 'Elena González', 'Pedro Díaz', 'Isabel Moreno', 'Francisco Muñoz',
    'Pilar Álvarez', 'Antonio Romero', 'Rosa Navarro', 'Manuel Jiménez', 'Carmen Ruiz',
    'Javier Molina', 'Teresa Serrano', 'Luis Ortega', 'Marta Delgado', 'Rafael Castro',
    'Dolores Ortiz', 'Andrés Marín', 'Patricia Iglesias', 'Alberto Santos', 'Beatriz Medina',
    'Guillermo Castillo', 'Cristina Garrido', 'Alejandro Cortés', 'Silvia Herrera', 'Fernando Cano',
    'Raquel Vega', 'Diego Prieto', 'Nuria Domínguez', 'Oscar León', 'Amparo Gil',
    'Roberto Méndez', 'Susana Flores', 'Emilio Rubio', 'Victoria Guerrero', 'Iván Pascual',
    'Luisa Herrero', 'Marcos Peña', 'Irene Calvo', 'César Gallego', 'Rocío Campos',
    'Adrián Reyes', 'Paula Vidal', 'Hugo Cruz', 'Eva Molina', 'Tomás Aguilar',
    'Clara Suárez', 'Sergio Blanco', 'Natalia Pereira', 'Ángel Vargas', 'Inés Bravo',
    'Mario Caballero', 'Alicia Nieto', 'Pablo Ramos', 'Sara Vicente', 'Daniel Soto',
    'Verónica Ibáñez', 'Jorge Giménez', 'Lucía Fuentes', 'Héctor Montero', 'Esther Lorenzo',
    'Samuel Hidalgo', 'Sandra Ferrer', 'Ignacio Benítez', 'Mónica Arias', 'Felipe Duarte',
  ]

  const origins = ['Web', 'Referido', 'Idealista', 'Fotocasa', 'Walk-in', 'Llamada', 'Instagram', 'Colaborador']
  const clients = []

  // 30 buyers
  for (let i = 0; i < 30; i++) {
    const client = await prisma.client.create({
      data: {
        name: clientNames[i],
        phone: `+34 6${randomBetween(10, 99)} ${randomBetween(100, 999)} ${randomBetween(100, 999)}`,
        email: `${clientNames[i].toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@email.com`,
        type: ClientType.BUYER,
        origin: randomItem(origins),
        budget: randomBetween(100000, 800000),
        preferences: randomItem(['Centro ciudad, 2+ hab', '3 hab con garaje', 'Ático con terraza', 'Planta baja con jardín', 'Cerca del metro']),
        status: i < 25 ? ClientStatus.ACTIVE : ClientStatus.CLOSED,
      },
    })
    clients.push(client)
  }

  // 25 owners
  for (let i = 30; i < 55; i++) {
    const client = await prisma.client.create({
      data: {
        name: clientNames[i],
        phone: `+34 6${randomBetween(10, 99)} ${randomBetween(100, 999)} ${randomBetween(100, 999)}`,
        email: `${clientNames[i].toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@email.com`,
        type: ClientType.OWNER,
        origin: randomItem(origins),
        status: i < 50 ? ClientStatus.ACTIVE : ClientStatus.CLOSED,
      },
    })
    clients.push(client)
  }

  // 15 tenants
  for (let i = 55; i < 70; i++) {
    const client = await prisma.client.create({
      data: {
        name: clientNames[i],
        phone: `+34 6${randomBetween(10, 99)} ${randomBetween(100, 999)} ${randomBetween(100, 999)}`,
        email: `${clientNames[i].toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@email.com`,
        type: ClientType.TENANT,
        origin: randomItem(origins),
        budget: randomBetween(500, 2000),
        preferences: randomItem(['Céntrico', 'Amueblado', 'Con parking', 'Mascota friendly', 'Luminoso']),
        status: i < 65 ? ClientStatus.ACTIVE : ClientStatus.CLOSED,
      },
    })
    clients.push(client)
  }

  // ─── 6. Visits (180) ───
  console.log('📋 Creando visitas...')
  const visitResults = ['Interesado', 'Muy interesado', 'No interesado', 'Segunda visita', 'Oferta verbal', 'Descartado', 'Pendiente seguimiento']

  for (let i = 0; i < 180; i++) {
    const property = randomItem(properties)
    const client = randomItem(clients)
    await prisma.visit.create({
      data: {
        propertyId: property.id,
        clientId: client.id,
        agentId: randomItem(agents).id,
        date: randomDate(180),
        result: randomItem(visitResults),
        notes: randomItem([
          'El cliente mostró gran interés en la zona y las vistas.',
          'Precio fuera de su presupuesto, busca algo más económico.',
          'Le gustó la distribución pero pide reformar la cocina.',
          'Muy satisfecho con el estado. Posible oferta en breve.',
          'Comparando con otras opciones en la misma zona.',
          'Interesado pero necesita financiación.',
          null,
        ]),
      },
    })
  }

  // ─── 7. Transactions (25) ───
  console.log('💰 Creando transacciones y comisiones...')
  const buyers = clients.filter((c) => c.type === ClientType.BUYER || c.type === ClientType.TENANT)
  const owners = clients.filter((c) => c.type === ClientType.OWNER)

  // 15 sales
  for (let i = 0; i < 15; i++) {
    const property = properties[i] // First 15 sale properties
    const agent = randomItem(agents)
    const buyer = randomItem(buyers)
    const seller = randomItem(owners)
    const finalPrice = property.price * (1 + (randomBetween(-5, 5) / 100))
    const totalCommission = finalPrice * 0.03
    const agentPct = agent.commissionPct
    const agentAmount = totalCommission * agentPct
    const agencyAmount = totalCommission - agentAmount
    const isPaid = i < 12

    const tx = await prisma.transaction.create({
      data: {
        propertyId: property.id,
        buyerId: buyer.id,
        sellerId: seller.id,
        agentId: agent.id,
        externalProfId: randomItem(profs).id,
        closeDate: randomDate(120),
        finalPrice: Math.round(finalPrice),
        notarialDate: isPaid ? randomDate(90) : null,
      },
    })

    await prisma.commission.create({
      data: {
        transactionId: tx.id,
        agentId: agent.id,
        totalAmount: Math.round(totalCommission),
        agentAmount: Math.round(agentAmount),
        agencyAmount: Math.round(agencyAmount),
        status: isPaid ? CommissionStatus.PAID : CommissionStatus.PENDING,
        paidAt: isPaid ? randomDate(60) : null,
      },
    })

    // Create expediente
    const exp = await prisma.expediente.create({
      data: {
        propertyId: property.id,
        transactionId: tx.id,
        status: isPaid ? 'COMPLETADO' : 'EN_PROCESO',
      },
    })

    const docPhases = ['CAPTACION', 'DOCUMENTACION', 'FIRMA']
    const docNames: Record<string, string[]> = {
      CAPTACION: ['Nota simple', 'Certificado energético', 'IBI último año'],
      DOCUMENTACION: ['Contrato de arras', 'Informe de cargas', 'Valoración perito'],
      FIRMA: ['Escritura pública', 'Liquidación impuestos', 'Inscripción registro'],
    }

    for (const phase of docPhases) {
      for (const docName of (docNames[phase] || [])) {
        await prisma.expDoc.create({
          data: {
            expedienteId: exp.id,
            phase,
            name: docName,
            status: isPaid ? ExpDocStatus.VALIDATED : randomItem([ExpDocStatus.PENDING, ExpDocStatus.DELIVERED, ExpDocStatus.VALIDATED]),
          },
        })
      }
    }
  }

  // 10 rentals
  for (let i = 0; i < 10; i++) {
    const property = properties[28 + i] // First 10 rent properties
    const agent = randomItem(agents)
    const tenant = randomItem(buyers.filter((b) => b.type === ClientType.TENANT || b.type === ClientType.BUYER))
    const owner = randomItem(owners)
    const monthlyRent = property.price
    const totalCommission = monthlyRent // 1 month rent
    const agentPct = agent.commissionPct
    const agentAmount = totalCommission * agentPct
    const agencyAmount = totalCommission - agentAmount
    const isPaid = i < 8

    const tx = await prisma.transaction.create({
      data: {
        propertyId: property.id,
        buyerId: tenant.id,
        sellerId: owner.id,
        agentId: agent.id,
        closeDate: randomDate(90),
        finalPrice: monthlyRent,
      },
    })

    await prisma.commission.create({
      data: {
        transactionId: tx.id,
        agentId: agent.id,
        totalAmount: Math.round(totalCommission),
        agentAmount: Math.round(agentAmount),
        agencyAmount: Math.round(agencyAmount),
        status: isPaid ? CommissionStatus.PAID : CommissionStatus.PENDING,
        paidAt: isPaid ? randomDate(30) : null,
      },
    })

    const exp = await prisma.expediente.create({
      data: {
        propertyId: property.id,
        transactionId: tx.id,
        status: isPaid ? 'COMPLETADO' : 'EN_PROCESO',
      },
    })

    const rentDocs = ['Contrato de alquiler', 'Fianza depositada', 'Inventario', 'Seguro de hogar']
    for (const docName of rentDocs) {
      await prisma.expDoc.create({
        data: {
          expedienteId: exp.id,
          phase: 'CONTRATO',
          name: docName,
          status: isPaid ? ExpDocStatus.VALIDATED : randomItem([ExpDocStatus.PENDING, ExpDocStatus.DELIVERED]),
        },
      })
    }
  }

  // ─── 8. Audit Log entries ───
  console.log('📝 Creando registros de auditoría...')
  const auditActions = [
    { action: 'CREATE', entity: 'Property', entityId: properties[0].id },
    { action: 'UPDATE', entity: 'Property', entityId: properties[1].id },
    { action: 'CREATE', entity: 'Client', entityId: clients[0].id },
    { action: 'UPDATE', entity: 'Agent', entityId: agents[0].id },
    { action: 'CREATE', entity: 'Transaction', entityId: 'seed-tx' },
    { action: 'UPDATE', entity: 'Property', entityId: properties[3].id },
    { action: 'CREATE', entity: 'Visit', entityId: 'seed-visit' },
    { action: 'UPDATE', entity: 'Commission', entityId: 'seed-commission' },
    { action: 'CREATE', entity: 'Expediente', entityId: 'seed-exp' },
    { action: 'UPDATE', entity: 'Client', entityId: clients[2].id },
  ]

  for (const entry of auditActions) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        ip: '127.0.0.1',
        userAgent: 'Seed Script',
        createdAt: randomDate(30),
      },
    })
  }

  console.log('✅ Seed completado exitosamente!')
  console.log(`
  📊 Resumen:
  ──────────
  👤 1 usuario admin
  🏢 ${agents.length} agentes
  🏠 ${properties.length} propiedades (28 venta + 17 alquiler)
  👥 ${clients.length} clientes (30 compradores + 25 propietarios + 15 inquilinos)
  📋 180 visitas
  💰 25 transacciones (15 ventas + 10 alquileres)
  🏛️ ${profs.length} profesionales externos
  📝 10 registros de auditoría
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
