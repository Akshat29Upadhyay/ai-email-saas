import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the Clerk user ID from command line argument or use default
  const clerkUserId = process.argv[2] || 'user_test123';
  
  console.log('🌱 Seeding database for user:', clerkUserId);

  // Create or get existing account
  let account;
  try {
    account = await prisma.account.create({
      data: {
        clerkUserId: clerkUserId,
        token: `token_${clerkUserId}_${Date.now()}`,
        provider: 'gmail',
        emailAddress: 'test@example.com',
        name: 'Test User',
      },
    });
  } catch (error) {
    // If account already exists, find it
    account = await prisma.account.findFirst({
      where: {
        clerkUserId: clerkUserId,
        provider: 'gmail',
      },
    });
    
    if (!account) {
      throw new Error('Failed to create or find account');
    }
  }

  console.log('✅ Created account:', account.emailAddress);

  // Create sample email addresses
  const emailAddresses = await Promise.all([
    // From addresses
    prisma.emailAddress.upsert({
      where: {
        accountId_address: {
          accountId: account.id,
          address: 'john.smith@company.com',
        },
      },
      update: {},
      create: {
        accountId: account.id,
        name: 'John Smith',
        address: 'john.smith@company.com',
        raw: 'John Smith <john.smith@company.com>',
      },
    }),
    prisma.emailAddress.upsert({
      where: {
        accountId_address: {
          accountId: account.id,
          address: 'sarah.johnson@company.com',
        },
      },
      update: {},
      create: {
        accountId: account.id,
        name: 'Sarah Johnson',
        address: 'sarah.johnson@company.com',
        raw: 'Sarah Johnson <sarah.johnson@company.com>',
      },
    }),
    prisma.emailAddress.upsert({
      where: {
        accountId_address: {
          accountId: account.id,
          address: 'tech.team@company.com',
        },
      },
      update: {},
      create: {
        accountId: account.id,
        name: 'Tech Team',
        address: 'tech.team@company.com',
        raw: 'Tech Team <tech.team@company.com>',
      },
    }),
    prisma.emailAddress.upsert({
      where: {
        accountId_address: {
          accountId: account.id,
          address: 'hr@company.com',
        },
      },
      update: {},
      create: {
        accountId: account.id,
        name: 'HR Department',
        address: 'hr@company.com',
        raw: 'HR Department <hr@company.com>',
      },
    }),
    prisma.emailAddress.upsert({
      where: {
        accountId_address: {
          accountId: account.id,
          address: 'marketing@company.com',
        },
      },
      update: {},
      create: {
        accountId: account.id,
        name: 'Marketing Team',
        address: 'marketing@company.com',
        raw: 'Marketing Team <marketing@company.com>',
      },
    }),
    // To address (the user)
    prisma.emailAddress.upsert({
      where: {
        accountId_address: {
          accountId: account.id,
          address: 'test@example.com',
        },
      },
      update: {},
      create: {
        accountId: account.id,
        name: 'Test User',
        address: 'test@example.com',
        raw: 'Test User <test@example.com>',
      },
    }),
  ]);

  const [johnSmith, sarahJohnson, techTeam, hrDept, marketingTeam, testUser] = emailAddresses;

  console.log('✅ Created email addresses');

  // Create sample threads with diverse content
  const threads = [
    {
      subject: 'Q4 Project Update - Major Milestones Achieved',
      lastMessageDate: new Date('2024-01-15T10:30:00'),
      participantIds: ['john.smith@company.com', 'test@example.com'],
      inboxStatus: true,
      draftStatus: false,
      sentStatus: false,
      emails: [
        {
          subject: 'Q4 Project Update - Major Milestones Achieved',
          bodySnippet: 'Hi team, I wanted to share our progress on the Q4 goals...',
          body: `
            <div>
              <p>Hi team,</p>
              <p>I wanted to share our progress on the Q4 goals. We've made significant strides in several key areas:</p>
              <ul>
                <li>Product development is 85% complete</li>
                <li>Marketing campaign has launched successfully</li>
                <li>Customer feedback has been overwhelmingly positive</li>
                <li>Revenue targets are 92% achieved</li>
              </ul>
              <p>Let's schedule a meeting next week to discuss the final quarter push and plan for Q1.</p>
              <p>Best regards,<br>John</p>
            </div>
          `,
          sentAt: new Date('2024-01-15T10:30:00'),
          receivedAt: new Date('2024-01-15T10:31:00'),
          hasAttachments: true,
          emailLabel: 'inbox' as const,
          sensitivity: 'normal' as const,
        }
      ]
    },
    {
      subject: 'Meeting Tomorrow at 2 PM - Agenda Attached',
      lastMessageDate: new Date('2024-01-15T09:15:00'),
      participantIds: ['sarah.johnson@company.com', 'test@example.com'],
      inboxStatus: true,
      draftStatus: false,
      sentStatus: false,
      emails: [
        {
          subject: 'Meeting Tomorrow at 2 PM - Agenda Attached',
          bodySnippet: 'Just a reminder about our scheduled meeting...',
          body: `
            <div>
              <p>Hi there,</p>
              <p>Just a reminder about our scheduled meeting tomorrow at 2 PM. We'll be discussing:</p>
              <ul>
                <li>Project timeline updates</li>
                <li>Resource allocation for next quarter</li>
                <li>Budget review and approvals</li>
                <li>Team performance metrics</li>
              </ul>
              <p>Please come prepared with your updates and any questions you might have.</p>
              <p>Thanks,<br>Sarah</p>
            </div>
          `,
          sentAt: new Date('2024-01-15T09:15:00'),
          receivedAt: new Date('2024-01-15T09:16:00'),
          hasAttachments: true,
          emailLabel: 'inbox' as const,
          sensitivity: 'normal' as const,
        }
      ]
    },
    {
      subject: 'AI Email RAG Implementation - Confidential',
      lastMessageDate: new Date('2024-01-15T08:45:00'),
      participantIds: ['tech.team@company.com', 'test@example.com'],
      inboxStatus: true,
      draftStatus: false,
      sentStatus: false,
      emails: [
        {
          subject: 'AI Email RAG Implementation - Confidential',
          bodySnippet: 'Great news! We\'ve successfully implemented the AI-driven email RAG system...',
          body: `
            <div>
              <p>Hello team,</p>
              <p>Great news! We've successfully implemented the AI-driven email RAG system. The new features include:</p>
              <ul>
                <li>Smart email categorization and tagging</li>
                <li>Intelligent search capabilities with semantic understanding</li>
                <li>Automated response suggestions based on context</li>
                <li>Advanced analytics dashboard for email insights</li>
                <li>Integration with existing CRM systems</li>
              </ul>
              <p>This represents a significant milestone in our AI integration efforts and positions us ahead of competitors.</p>
              <p><strong>Note:</strong> This information is confidential and should not be shared outside the team.</p>
              <p>Regards,<br>Tech Team</p>
            </div>
          `,
          sentAt: new Date('2024-01-15T08:45:00'),
          receivedAt: new Date('2024-01-15T08:46:00'),
          hasAttachments: true,
          emailLabel: 'inbox' as const,
          sensitivity: 'confidential' as const,
        }
      ]
    },
    {
      subject: 'New Employee Onboarding - Welcome!',
      lastMessageDate: new Date('2024-01-14T16:20:00'),
      participantIds: ['hr@company.com', 'test@example.com'],
      inboxStatus: true,
      draftStatus: false,
      sentStatus: false,
      emails: [
        {
          subject: 'New Employee Onboarding - Welcome!',
          bodySnippet: 'Welcome to the team! Here\'s everything you need to know...',
          body: `
            <div>
              <p>Welcome to the team!</p>
              <p>We're excited to have you join us. Here's everything you need to know for your first week:</p>
              <h3>Day 1 Schedule:</h3>
              <ul>
                <li>9:00 AM - Welcome meeting with HR</li>
                <li>10:00 AM - IT setup and system access</li>
                <li>11:00 AM - Team introductions</li>
                <li>2:00 PM - Project overview and goals</li>
              </ul>
              <h3>Important Links:</h3>
              <ul>
                <li>Employee handbook: <a href="#">Company Handbook</a></li>
                <li>Benefits portal: <a href="#">Benefits Portal</a></li>
                <li>Time tracking: <a href="#">Time Tracker</a></li>
              </ul>
              <p>If you have any questions, don't hesitate to reach out!</p>
              <p>Best regards,<br>HR Team</p>
            </div>
          `,
          sentAt: new Date('2024-01-14T16:20:00'),
          receivedAt: new Date('2024-01-14T16:21:00'),
          hasAttachments: false,
          emailLabel: 'inbox' as const,
          sensitivity: 'personal' as const,
        }
      ]
    },
    {
      subject: 'Marketing Campaign Results - Q4 Performance',
      lastMessageDate: new Date('2024-01-14T14:30:00'),
      participantIds: ['marketing@company.com', 'test@example.com'],
      inboxStatus: true,
      draftStatus: false,
      sentStatus: false,
      emails: [
        {
          subject: 'Marketing Campaign Results - Q4 Performance',
          bodySnippet: 'Here are the results from our Q4 marketing campaigns...',
          body: `
            <div>
              <p>Hi everyone,</p>
              <p>Here are the results from our Q4 marketing campaigns:</p>
              <h3>Key Metrics:</h3>
              <ul>
                <li>Email open rate: 28.5% (up 15% from Q3)</li>
                <li>Click-through rate: 4.2% (up 8% from Q3)</li>
                <li>Conversion rate: 2.1% (up 12% from Q3)</li>
                <li>Revenue generated: $125,000</li>
              </ul>
              <h3>Top Performing Campaigns:</h3>
              <ol>
                <li>Holiday Product Launch (32% open rate)</li>
                <li>Customer Success Stories (29% open rate)</li>
                <li>Feature Announcements (26% open rate)</li>
              </ol>
              <p>Great work team! Let's keep this momentum going into Q1.</p>
              <p>Cheers,<br>Marketing Team</p>
            </div>
          `,
          sentAt: new Date('2024-01-14T14:30:00'),
          receivedAt: new Date('2024-01-14T14:31:00'),
          hasAttachments: true,
          emailLabel: 'inbox' as const,
          sensitivity: 'normal' as const,
        }
      ]
    },
    {
      subject: 'Draft: Response to Client Feedback',
      lastMessageDate: new Date('2024-01-14T11:45:00'),
      participantIds: ['test@example.com', 'client@example.com'],
      inboxStatus: false,
      draftStatus: true,
      sentStatus: false,
      emails: [
        {
          subject: 'Draft: Response to Client Feedback',
          bodySnippet: 'Thank you for your valuable feedback on our recent project...',
          body: `
            <div>
              <p>Dear [Client Name],</p>
              <p>Thank you for your valuable feedback on our recent project. We appreciate you taking the time to share your thoughts.</p>
              <p>We've reviewed your comments and would like to address the following points:</p>
              <ul>
                <li>Timeline concerns - We're working to expedite delivery</li>
                <li>Feature requests - These are being evaluated by our team</li>
                <li>Communication improvements - We're implementing new processes</li>
              </ul>
              <p>We value our partnership and are committed to delivering the best possible results.</p>
              <p>Best regards,<br>[Your Name]</p>
            </div>
          `,
          sentAt: new Date('2024-01-14T11:45:00'),
          receivedAt: new Date('2024-01-14T11:45:00'),
          hasAttachments: false,
          emailLabel: 'draft' as const,
          sensitivity: 'normal' as const,
        }
      ]
    },
    {
      subject: 'Sent: Weekly Team Update',
      lastMessageDate: new Date('2024-01-13T17:00:00'),
      participantIds: ['test@example.com', 'team@company.com'],
      inboxStatus: false,
      draftStatus: false,
      sentStatus: true,
      emails: [
        {
          subject: 'Sent: Weekly Team Update',
          bodySnippet: 'Here\'s our weekly team update for this week...',
          body: `
            <div>
              <p>Hi team,</p>
              <p>Here's our weekly team update for this week:</p>
              <h3>Completed This Week:</h3>
              <ul>
                <li>Finalized Q4 project deliverables</li>
                <li>Completed client presentations</li>
                <li>Updated documentation</li>
              </ul>
              <h3>Next Week's Priorities:</h3>
              <ul>
                <li>Begin Q1 planning</li>
                <li>Client meetings scheduled</li>
                <li>Team training sessions</li>
              </ul>
              <p>Great work everyone!</p>
              <p>Best regards,<br>Test User</p>
            </div>
          `,
          sentAt: new Date('2024-01-13T17:00:00'),
          receivedAt: new Date('2024-01-13T17:00:00'),
          hasAttachments: false,
          emailLabel: 'sent' as const,
          sensitivity: 'normal' as const,
        }
      ]
    },
    {
      subject: 'System Maintenance Notice - Tonight 2-4 AM',
      lastMessageDate: new Date('2024-01-13T15:30:00'),
      participantIds: ['tech.team@company.com', 'test@example.com'],
      inboxStatus: true,
      draftStatus: false,
      sentStatus: false,
      emails: [
        {
          subject: 'System Maintenance Notice - Tonight 2-4 AM',
          bodySnippet: 'Scheduled maintenance will occur tonight from 2-4 AM...',
          body: `
            <div>
              <p>Hello everyone,</p>
              <p>Scheduled maintenance will occur tonight from 2-4 AM EST. During this time, the following services may be temporarily unavailable:</p>
              <ul>
                <li>Email system</li>
                <li>File sharing platform</li>
                <li>Internal communication tools</li>
              </ul>
              <p>We apologize for any inconvenience and appreciate your patience.</p>
              <p>If you experience any issues after the maintenance window, please contact IT support.</p>
              <p>Regards,<br>IT Team</p>
            </div>
          `,
          sentAt: new Date('2024-01-13T15:30:00'),
          receivedAt: new Date('2024-01-13T15:31:00'),
          hasAttachments: false,
          emailLabel: 'inbox' as const,
          sensitivity: 'normal' as const,
        }
      ]
    }
  ];

  for (const threadData of threads) {
    const thread = await prisma.thread.create({
      data: {
        subject: threadData.subject,
        lastMessageDate: threadData.lastMessageDate,
        participantIds: threadData.participantIds,
        inboxStatus: threadData.inboxStatus,
        draftStatus: threadData.draftStatus,
        sentStatus: threadData.sentStatus,
        accountId: account.id,
      },
    });

    for (const emailData of threadData.emails) {
      // Determine the from address based on the subject/content
      let fromAddress = johnSmith; // default
      if (emailData.subject.includes('Sarah') || emailData.subject.includes('Meeting')) {
        fromAddress = sarahJohnson;
      } else if (emailData.subject.includes('AI') || emailData.subject.includes('Tech') || emailData.subject.includes('System')) {
        fromAddress = techTeam;
      } else if (emailData.subject.includes('HR') || emailData.subject.includes('Employee') || emailData.subject.includes('Onboarding')) {
        fromAddress = hrDept;
      } else if (emailData.subject.includes('Marketing') || emailData.subject.includes('Campaign')) {
        fromAddress = marketingTeam;
      } else if (emailData.emailLabel === 'sent') {
        fromAddress = testUser;
      }

      const email = await prisma.email.create({
        data: {
          threadId: thread.id,
          subject: emailData.subject,
          bodySnippet: emailData.bodySnippet,
          body: emailData.body,
          sentAt: emailData.sentAt,
          receivedAt: emailData.receivedAt,
          hasAttachments: emailData.hasAttachments,
          emailLabel: emailData.emailLabel,
          sensitivity: emailData.sensitivity,
          fromId: fromAddress.id,
          internetMessageId: `msg_${Date.now()}_${Math.random()}`,
          createdTime: emailData.sentAt,
          lastModifiedTime: emailData.sentAt,
          sysLabels: [],
          keywords: [],
          sysClassifications: [],
          meetingMessageMethod: null,
          internetHeaders: [],
          nativeProperties: {},
          folderId: null,
          omitted: [],
        },
      });

      // Connect email to recipients
      if (emailData.emailLabel === 'sent') {
        // For sent emails, connect to various recipients
        await prisma.email.update({
          where: { id: email.id },
          data: {
            to: {
              connect: [
                { id: johnSmith.id },
                { id: sarahJohnson.id },
                { id: techTeam.id }
              ],
            },
          },
        });
      } else {
        // For received emails, connect to the test user
        await prisma.email.update({
          where: { id: email.id },
          data: {
            to: {
              connect: { id: testUser.id },
            },
          },
        });
      }

      // Create attachments if needed
      if (emailData.hasAttachments) {
        const attachmentNames = [
          'Q4_Report.pdf',
          'Meeting_Agenda.docx',
          'Technical_Specifications.pdf',
          'Marketing_Analytics.xlsx'
        ];
        
        const randomAttachment = attachmentNames[Math.floor(Math.random() * attachmentNames.length)];
        
        await prisma.emailAttachment.create({
          data: {
            emailId: email.id,
            name: randomAttachment,
            mimeType: randomAttachment.endsWith('.pdf') ? 'application/pdf' : 
                     randomAttachment.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
            inline: false,
            contentId: null,
            content: null,
            contentLocation: null,
          },
        });
      }
    }
  }

  console.log('✅ Created sample threads and emails');

  // Create sample Stripe subscription
  try {
    await prisma.stripeSubscription.create({
      data: {
        clerkUserId: clerkUserId,
        subscriptionId: `sub_${clerkUserId}_${Date.now()}`,
        productId: 'prod_test123',
        priceId: 'price_test123',
        customerId: `cus_${clerkUserId}`,
        currentPeriodEnd: new Date('2024-12-31'),
      },
    });
  } catch (error) {
    // Subscription might already exist, that's okay
    console.log('ℹ️  Stripe subscription already exists or failed to create');
  }

  console.log('✅ Created sample subscription');

  // Create sample chatbot interactions for the last 7 days
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayString = date.toISOString().split('T')[0];
    
    await prisma.chatbotInteraction.create({
      data: {
        clerkUserId: clerkUserId,
        day: dayString,
        count: Math.floor(Math.random() * 10) + 1,
      },
    });
  }

  console.log('✅ Created sample chatbot interactions');

  console.log('🎉 Database seeded successfully for user:', clerkUserId);
  console.log('📧 Created 8 email threads with various types:');
  console.log('   - 6 inbox emails (normal, confidential, personal)');
  console.log('   - 1 draft email');
  console.log('   - 1 sent email');
  console.log('   - Multiple attachments and different senders');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 