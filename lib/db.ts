import { prisma } from './prisma';

// Get or create account for a user
export async function getOrCreateAccount(clerkUserId: string, accountData: {
  token: string;
  provider: string;
  emailAddress: string;
  name: string;
}) {
  return await prisma.account.upsert({
    where: {
      clerkUserId_provider: {
        clerkUserId,
        provider: accountData.provider,
      },
    },
    update: {
      token: accountData.token,
      emailAddress: accountData.emailAddress,
      name: accountData.name,
    },
    create: {
      clerkUserId,
      token: accountData.token,
      provider: accountData.provider,
      emailAddress: accountData.emailAddress,
      name: accountData.name,
    },
  });
}

// Get all accounts for a user
export async function getUserAccounts(clerkUserId: string) {
  return await prisma.account.findMany({
    where: { clerkUserId },
    include: {
      threads: {
        include: {
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              attachments: true,
            },
          },
        },
        orderBy: {
          lastMessageDate: 'desc',
        },
      },
      emailAddresses: true,
    },
  });
}

// Get threads for a user
export async function getUserThreads(clerkUserId: string, folder: 'inbox' | 'sent' | 'draft' = 'inbox') {
  const accounts = await prisma.account.findMany({
    where: { clerkUserId },
    include: {
      threads: {
        where: {
          ...(folder === 'inbox' && { inboxStatus: true }),
          ...(folder === 'sent' && { sentStatus: true }),
          ...(folder === 'draft' && { draftStatus: true }),
        },
        include: {
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              attachments: true,
            },
            orderBy: {
              sentAt: 'desc',
            },
          },
        },
        orderBy: {
          lastMessageDate: 'desc',
        },
      },
    },
  });

  // Flatten threads from all accounts
  return accounts.flatMap(account => account.threads);
}

// Get a specific thread with all emails
export async function getThread(threadId: string, clerkUserId: string) {
  return await prisma.thread.findFirst({
    where: {
      id: threadId,
      account: {
        clerkUserId,
      },
    },
    include: {
      emails: {
        include: {
          from: true,
          to: true,
          cc: true,
          bcc: true,
          attachments: true,
        },
        orderBy: {
          sentAt: 'asc',
        },
      },
      account: true,
    },
  });
}

// Search threads
export async function searchThreads(clerkUserId: string, query: string) {
  const accounts = await prisma.account.findMany({
    where: { clerkUserId },
    include: {
      threads: {
        where: {
          OR: [
            { subject: { contains: query, mode: 'insensitive' } },
            {
              emails: {
                some: {
                  OR: [
                    { subject: { contains: query, mode: 'insensitive' } },
                    { body: { contains: query, mode: 'insensitive' } },
                    { bodySnippet: { contains: query, mode: 'insensitive' } },
                  ],
                },
              },
            },
          ],
        },
        include: {
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              attachments: true,
            },
            orderBy: {
              sentAt: 'desc',
            },
          },
        },
        orderBy: {
          lastMessageDate: 'desc',
        },
      },
    },
  });

  return accounts.flatMap(account => account.threads);
}

// Get user's Stripe subscription
export async function getUserSubscription(clerkUserId: string) {
  return await prisma.stripeSubscription.findUnique({
    where: { clerkUserId },
  });
}

// Get user's chatbot interactions
export async function getUserChatbotInteractions(clerkUserId: string) {
  return await prisma.chatbotInteraction.findMany({
    where: { clerkUserId },
    orderBy: { day: 'desc' },
  });
}

// Create or update chatbot interaction
export async function updateChatbotInteraction(clerkUserId: string, day: string) {
  return await prisma.chatbotInteraction.upsert({
    where: {
      day_clerkUserId: {
        day,
        clerkUserId,
      },
    },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      clerkUserId,
      day,
      count: 1,
    },
  });
} 