import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    return null
  }

  // Get user from database
  const dbUser = await prisma.user.findUnique({
    where: { id: clerkUser.id },
    include: {
      accounts: true,
      chatbotInteraction: true,
      stripeSubscription: true,
    }
  })

  return {
    clerkUser,
    dbUser
  }
}

export async function getOrCreateUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    return null
  }

  // Try to get user from database
  let dbUser = await prisma.user.findUnique({
    where: { id: clerkUser.id },
    include: {
      accounts: true,
      chatbotInteraction: true,
      stripeSubscription: true,
    }
  })

  // If user doesn't exist in database, create them
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: clerkUser.id,
        emailAddress: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        imageUrl: clerkUser.imageUrl || null,
      },
      include: {
        accounts: true,
        chatbotInteraction: true,
        stripeSubscription: true,
      }
    })
  }

  return {
    clerkUser,
    dbUser
  }
} 