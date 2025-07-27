# Database Setup Guide

This guide will help you set up the Neon database and integrate it with Clerk authentication.

## 1. Set up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string from your project dashboard

## 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Clerk (you should already have these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/mail
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/mail

# Clerk Webhook (for syncing user data)
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

## 3. Database Migration

Run the following commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# (Optional) View your database in Prisma Studio
npx prisma studio
```

## 4. Set up Clerk Webhook

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to Webhooks
3. Create a new webhook endpoint
4. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
5. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the webhook secret and add it to your `.env` file as `CLERK_WEBHOOK_SECRET`

## 5. Test the Integration

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3001/sign-up`
3. Create a new account
4. You should be redirected to `/mail` and see your user data from both Clerk and the database

## 6. Database Schema Overview

The database includes the following main models:

- **User**: Stores user information synced from Clerk
- **Account**: Email accounts connected to users
- **Thread**: Email conversation threads
- **Email**: Individual email messages
- **EmailAddress**: Email addresses for senders/recipients
- **EmailAttachment**: File attachments
- **StripeSubscription**: Subscription management
- **ChatbotInteraction**: AI interaction tracking

## 7. Utility Functions

The following utility functions are available:

- `getCurrentUser()`: Get current user from both Clerk and database
- `getOrCreateUser()`: Get or create user in database if they don't exist

## 8. Webhook Handler

The webhook handler at `/api/webhooks/clerk` automatically:
- Creates new users in the database when they sign up
- Updates user information when it changes in Clerk
- Deletes users from the database when they're deleted in Clerk

## Troubleshooting

### Database Connection Issues
- Make sure your `DATABASE_URL` is correct
- Ensure your Neon database is active
- Check that your IP is allowed (if using IP restrictions)

### Webhook Issues
- Verify the webhook secret in your `.env` file
- Check that the webhook endpoint is accessible
- Monitor webhook delivery in the Clerk dashboard

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Use `npx prisma db push` to sync schema changes
- Check `npx prisma studio` to view your database 