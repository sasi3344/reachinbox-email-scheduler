export interface ParseResult {
  validEmails: string[];
  invalidCount: number;
  totalParsed: number;
  duplicateCount: number;
}

const EMAIL_GLOBAL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

export function cleanEmail(str: string): string {
  return str
    .replace(/[<>"'()[\]{}]/g, '') // remove surrounding brackets/quotes
    .trim()
    .toLowerCase();
}

export function validateEmail(email: string): boolean {
  const cleaned = cleanEmail(email);
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleaned);
}

/**
 * Extracts, cleans, deduplicates, and validates all email addresses from any CSV, TXT, or pasted text string.
 */
export function parseEmailsFromText(content: string): ParseResult {
  if (!content || !content.trim()) {
    return { validEmails: [], invalidCount: 0, totalParsed: 0, duplicateCount: 0 };
  }

  const seen = new Set<string>();
  const validEmails: string[] = [];
  let duplicateCount = 0;

  // Pass 1: Global regex match
  const matches = content.match(EMAIL_GLOBAL_REGEX) || [];
  for (const raw of matches) {
    const email = cleanEmail(raw);
    if (validateEmail(email)) {
      if (seen.has(email)) {
        duplicateCount++;
      } else {
        seen.add(email);
        validEmails.push(email);
      }
    }
  }

  // Pass 2: Line / comma / space token scan for any missed emails
  const tokens = content
    .split(/[\r\n,;\t\s]+/)
    .map((s) => cleanEmail(s))
    .filter((s) => s.length > 0 && !['email', 'emails', 'recipient', 'recipients', 'email address', 'mail'].includes(s));

  for (const token of tokens) {
    if (token.includes('@') && validateEmail(token)) {
      if (!seen.has(token)) {
        seen.add(token);
        validEmails.push(token);
      }
    }
  }

  const invalidCount = Math.max(0, tokens.length - validEmails.length - duplicateCount);

  return {
    validEmails,
    invalidCount,
    totalParsed: validEmails.length,
    duplicateCount,
  };
}
