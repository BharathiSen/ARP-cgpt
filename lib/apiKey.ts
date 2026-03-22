import crypto from 'crypto';
import prisma from './prisma';

export async function createApiKey(userId: string, keyName?: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const key = `arp_${token}`;
  
  await prisma.user.update({
    where: { id: userId },
    data: { apiKey: key },
  });

  return { key };
}
