import jwt from 'jsonwebtoken';
import { config } from '../config';

const MAGIC_PURPOSE = 'magic_link';

/**
 * Create a signed, short-lived token that lets a business owner sign in from an
 * emailed link. The token carries a distinctive purpose so it is easy to tell
 * magic-link tokens apart from normal session tokens.
 */
export const createMagicToken = (userId: string): string =>
  jwt.sign({ userId, purpose: MAGIC_PURPOSE }, config.jwtSecret || 'fallback_secret', {
    expiresIn: '7d',
  });

/** Build the absolute magic-link URL a business receives by email. */
export const buildMagicLink = (userId: string): string => {
  const base = config.siteUrl.replace(/\/+$/, '');
  return `${base}/login?token=${encodeURIComponent(createMagicToken(userId))}`;
};

/**
 * Verify an emailed magic-link token and return the user id it belongs to, or
 * null when the token is invalid, expired or of the wrong purpose.
 */
export const verifyMagicToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret || 'fallback_secret') as {
      userId?: string;
      purpose?: string;
    };
    if (decoded && decoded.purpose === MAGIC_PURPOSE && typeof decoded.userId === 'string') {
      return decoded.userId;
    }
    return null;
  } catch {
    return null;
  }
};
