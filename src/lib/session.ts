import crypto from 'node:crypto';

const SESSION_PREFIX = 'kf_session_v1';

function getSecret() {
  return process.env.SESSION_SECRET || 'change-this-session-secret-before-production';
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createAdminSession(userId: number) {
  const payload = JSON.stringify({ userId, role: 'GENERAL_MANAGER', exp: Date.now() + 1000 * 60 * 60 * 12 });
  const encoded = Buffer.from(payload).toString('base64url');
  return `${SESSION_PREFIX}.${encoded}.${sign(encoded)}`;
}

export function verifyAdminSession(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== SESSION_PREFIX) return null;

  const [, encoded, providedSignature] = parts;
  const expectedSignature = sign(encoded);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      userId: number;
      role: string;
      exp: number;
    };
    if (session.role !== 'GENERAL_MANAGER' || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}
