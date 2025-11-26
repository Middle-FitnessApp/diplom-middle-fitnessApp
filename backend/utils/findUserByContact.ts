import { prisma } from '../prisma.js'

export type ContactType = 'email' | 'phone'

export async function findUserByEmailOrPhone(emailOrPhone: string): Promise<{
  user: Awaited<ReturnType<typeof prisma.user.findFirst>>
  type: ContactType
} | { user: null; type: ContactType }> {
  const isEmail = emailOrPhone.includes('@')

  const user = await prisma.user.findFirst({
    where: isEmail ? { email: emailOrPhone } : { phone: emailOrPhone },
  })

  return { user, type: isEmail ? 'email' : 'phone' }
}
