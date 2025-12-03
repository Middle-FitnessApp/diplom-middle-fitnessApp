// services/trainer.service.ts
import { prisma } from '../prisma.js'

export async function getClientsForTrainer(trainerId: string) {
  // 1) все клиенты
  const [allClients, links] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        phone: true,
        photo: true,
        role: true,
      },
    }),
    prisma.trainerClient.findMany({
      where: { trainerId },
      select: { clientId: true, starred: true },
    }),
  ])

  const map = new Map<string, boolean>()
  links.forEach((l) => map.set(l.clientId, l.starred))

  // 2) всем клиентам добавляем флаг starred, если есть связь
  return allClients.map((c) => ({
    ...c,
    starred: map.get(c.id) ?? false,
  }))
}

export async function toggleClientStar(trainerId: string, clientId: string) {
  const existing = await prisma.trainerClient.findUnique({
    where: { clientId }, // один клиент — один тренер
  })

  if (!existing) {
    const created = await prisma.trainerClient.create({
      data: { trainerId, clientId, starred: true },
    })
    return created.starred
  }

  const updated = await prisma.trainerClient.update({
    where: { clientId },
    data: { starred: !existing.starred },
  })

  return updated.starred
}
