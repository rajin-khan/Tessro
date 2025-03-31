// server/src/utils/id.js
import { customAlphabet } from 'nanoid';

const generateSessionId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export { generateSessionId };

export function generateUniqueId() {
  return nanoid();
}