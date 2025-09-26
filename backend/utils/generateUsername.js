const User = require('../models/Userschema');

/**
 * Generate a unique username based on an email or preferred base string.
 * Strategy:
 * - Start with the local-part of the email (before @) as base
 * - If it exists, append a numeric suffix: base1, base2, ... until unique
 */
async function generateUniqueUsername(emailOrBase) {
  const base = (emailOrBase || '')
    .toString()
    .trim()
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-z0-9._-]/g, '') || 'user';

  // Quick check for base availability
  const exists = await User.exists({ username: base });
  if (!exists) return base;

  // Append incremental suffix until free
  let counter = 1;
  // Try a bounded loop first, then fall back to while for safety
  for (; counter <= 1000; counter++) {
    const candidate = `${base}${counter}`;
    // Using exists is efficient and returns null if none
    // eslint-disable-next-line no-await-in-loop
    const taken = await User.exists({ username: candidate });
    if (!taken) return candidate;
  }

  // Fallback with timestamp to avoid pathological collisions
  return `${base}-${Date.now()}`;
}

module.exports = generateUniqueUsername;


