# Email SaaS Setup Guide

This guide will help you set up the AI Email SaaS application with the updated Prisma schema that uses Clerk ID directly.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in your project root with the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/mail
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/mail

# Clerk Webhook (optional for now)
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Database Setup

1. **Set up Neon Database:**
   - Go to [Neon Console](https://console.neon.tech/)
   - Create a new project
   - Copy the connection string to your `DATABASE_URL`

2. **Push the schema to your database:**
   ```bash
   npm run db:push
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Seed the Database (Optional)

To test the application with sample data:

```bash
npm run db:seed
```

This will create:
- A test account with Clerk ID `user_test123`
- Sample email threads and messages
- Test Stripe subscription data
- Sample chatbot interactions

### 5. Start the Development Server

```bash
npm run dev
```

## 🏗️ Architecture Overview

### Updated Database Schema

The application now uses **Clerk ID directly** instead of a separate User model:

- **Account**: Email accounts linked to Clerk users
- **Thread**: Email conversation threads
- **Email**: Individual email messages
- **EmailAddress**: Sender/recipient addresses
- **EmailAttachment**: File attachments
- **StripeSubscription**: Subscription management
- **ChatbotInteraction**: AI interaction tracking

### Key Changes Made

1. **Removed User Model**: No more separate user table
2. **Direct Clerk ID Usage**: All models now reference `clerkUserId` directly
3. **Simplified Relations**: Cleaner database structure
4. **Updated API Routes**: All endpoints use Clerk authentication

## 🔧 API Endpoints

### Mail API
- `GET /api/mail/threads` - Get user's email threads
- `GET /api/mail/threads/[id]` - Get specific thread details
- `GET /api/mail/test` - Test database connection

### Query Parameters
- `folder`: `inbox` | `sent` | `draft`
- `q`: Search query for full-text search

## 🎯 Testing the Application

### 1. Database Connection Test

Visit `/api/mail/test` to verify:
- Clerk authentication is working
- Database connection is successful
- User data is accessible

### 2. Mail Interface

1. Sign up/sign in with Clerk
2. Navigate to `/mail`
3. You should see the email interface
4. If seeded, you'll see sample emails
5. Test search and folder navigation

### 3. Sample Data

The seed script creates:
- 3 sample email threads
- Various email types (inbox, sent, draft)
- Attachments and different sensitivity levels
- Test subscription data

## 🛠️ Development Commands

```bash
# Database
npm run db:push          # Push schema to database
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed with sample data
npm run db:studio        # Open Prisma Studio

# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

## 🔍 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure Neon database is active
- Check IP restrictions if applicable

### Clerk Authentication Issues
- Verify Clerk keys are correct
- Check environment variables
- Ensure Clerk app is properly configured

### No Data Showing
- Run the seed script: `npm run db:seed`
- Check browser console for errors
- Verify API endpoints are working

### Prisma Issues
- Run `npm run db:generate` after schema changes
- Use `npm run db:push` for schema updates
- Check Prisma Studio for data verification

## 📁 Project Structure

```
ai-email-saas/
├── app/
│   ├── api/mail/          # Mail API routes
│   ├── mail/              # Mail interface
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # UI components
│   ├── database-status.tsx # Database status component
│   └── header.tsx         # Header component
├── lib/
│   ├── db.ts              # Database utilities
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/
│   └── schema.prisma      # Database schema
├── scripts/
│   └── seed.ts            # Database seed script
└── .env                   # Environment variables
```

## 🚀 Next Steps

1. **Set up real email integration** (Gmail, Outlook, etc.)
2. **Implement AI features** (RAG, smart replies, summaries)
3. **Add Stripe integration** for subscriptions
4. **Deploy to production** (Vercel, Railway, etc.)
5. **Set up monitoring** and analytics

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all environment variables
3. Check the browser console for errors
4. Review the API responses in Network tab

The application is now ready to use with the simplified Clerk ID-based architecture! 🎉 