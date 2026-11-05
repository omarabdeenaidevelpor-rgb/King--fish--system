import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const ADMIN_TOKEN_PREFIX = 'admin';
const ADMIN_TOKEN_LIFETIME_SECONDS = 60 * 60 * 8;

export interface AdminAuthConfig {
  username: string;
  password: string;
  email: string;
  tokenSecret: string;
}

interface AdminSessionPayload {
  userId: number;
  expiresAt: number;
}

export function getAdminAuthConfig(): AdminAuthConfig {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_TOKEN_SECRET } = process.env;

  if (!ADMIN_USERNAME?.trim() || !ADMIN_PASSWORD || !ADMIN_EMAIL?.trim() || !ADMIN_TOKEN_SECRET) {
    throw new Error(
      'Admin login requires ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, and ADMIN_TOKEN_SECRET.',
    );
  }

  if (
    ADMIN_PASSWORD.length < 8
    || ADMIN_PASSWORD === 'replace-with-a-strong-password'
    || ADMIN_TOKEN_SECRET.length < 32
    || ADMIN_TOKEN_SECRET === 'replace-with-at-least-32-random-characters'
  ) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters and ADMIN_TOKEN_SECRET at least 32 characters.');
  }

  return {
    username: ADMIN_USERNAME.trim(),
    password: ADMIN_PASSWORD,
    email: ADMIN_EMAIL.trim(),
    tokenSecret: ADMIN_TOKEN_SECRET,
  };
}

export function secureCompare(left: string, right: string): boolean {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function createAdminSessionToken(userId: number, tokenSecret: string): string {
  const payload: AdminSessionPayload = {
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + ADMIN_TOKEN_LIFETIME_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', tokenSecret)
    .update(`${ADMIN_TOKEN_PREFIX}.${encodedPayload}`)
    .digest('base64url');

  return `${ADMIN_TOKEN_PREFIX}.${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string,
  tokenSecret: string,
): AdminSessionPayload | null {
  const [prefix, encodedPayload, signature, extraPart] = token.split('.');
  if (prefix !== ADMIN_TOKEN_PREFIX || !encodedPayload || !signature || extraPart) {
    return null;
  }

  const expectedSignature = createHmac('sha256', tokenSecret)
    .update(`${prefix}.${encodedPayload}`)
    .digest();
  const providedSignature = Buffer.from(signature, 'base64url');

  if (
    providedSignature.length !== expectedSignature.length
    || !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as Partial<AdminSessionPayload>;
    const currentTime = Math.floor(Date.now() / 1000);

    const { userId, expiresAt } = payload;
    if (
      typeof userId !== 'number'
      || typeof expiresAt !== 'number'
      || !Number.isSafeInteger(userId)
      || !Number.isSafeInteger(expiresAt)
      || expiresAt <= currentTime
    ) {
      return null;
    }

    return { userId, expiresAt };
  } catch {
    return null;
  }
}
