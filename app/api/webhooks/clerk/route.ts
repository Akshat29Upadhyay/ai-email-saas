import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  // Handle the webhook
  switch (eventType) {
    case 'user.created':
      const user = evt.data;
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            emailAddress: user.email_addresses[0]?.email_address || '',
            firstName: user.first_name || null,
            lastName: user.last_name || null,
            imageUrl: user.image_url || null,
          },
        });
        console.log('User created in database:', user.id);
      } catch (error) {
        console.error('Error creating user in database:', error);
      }
      break;
    
    case 'user.updated':
      const updatedUser = evt.data;
      try {
        await prisma.user.update({
          where: { id: updatedUser.id },
          data: {
            emailAddress: updatedUser.email_addresses[0]?.email_address || '',
            firstName: updatedUser.first_name || null,
            lastName: updatedUser.last_name || null,
            imageUrl: updatedUser.image_url || null,
          },
        });
        console.log('User updated in database:', updatedUser.id);
      } catch (error) {
        console.error('Error updating user in database:', error);
      }
      break;
    
    case 'user.deleted':
      const deletedUser = evt.data;
      try {
        await prisma.user.delete({
          where: { id: deletedUser.id },
        });
        console.log('User deleted from database:', deletedUser.id);
      } catch (error) {
        console.error('Error deleting user from database:', error);
      }
      break;
    
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response('', { status: 200 })
} 