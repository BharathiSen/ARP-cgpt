import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { UpgradeEmail } from '@/components/emails/UpgradeEmail';

// Create a Resend instance. Fallback safely if env var is missing during build time
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendWelcomeEmail = async (email: string, name: string) => {
  if (!resend) {
    console.log('Resend key not found, skipping welcome email.');
    return;
  }

  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Update with your verified domain in production
      to: email,
      subject: 'Welcome to AI Reliability Platform',
      react: WelcomeEmail({ name }),
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

export const sendUpgradeEmail = async (email: string, name: string) => {
  if (!resend) {
    console.log('Resend key not found, skipping upgrade email.');
    return;
  }

  try {
    await resend.emails.send({
      from: 'Acme <upgrade@resend.dev>', // Update with your verified domain in production
      to: email,
      subject: 'Your Account has been Upgraded - PRO Tier',
      react: UpgradeEmail({ name }),
    });
  } catch (error) {
    console.error('Failed to send upgrade email:', error);
  }
};
