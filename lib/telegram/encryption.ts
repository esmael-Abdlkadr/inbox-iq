import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(userId: string): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || 'default-secret-change-in-production';
  return crypto
    .createHash('sha256')
    .update(`${userId}:${secret}`)
    .digest();
}

export function encryptSession(session: string, userId: string): string {
  const key = getEncryptionKey(userId);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(session, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptSession(encryptedData: string, userId: string): string {
  const key = getEncryptionKey(userId);
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function hashPhoneNumber(phone: string): string {
  return crypto
    .createHash('sha256')
    .update(phone)
    .digest('hex')
    .substring(0, 16);
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return '****';
  return `****${phone.slice(-4)}`;
}

