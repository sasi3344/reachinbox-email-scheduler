export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface ExtractedEmailResult {
  validEmails: string[];
  invalidEmails: string[];
  duplicatesCount: number;
  totalParsed: number;
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

export function parseAndValidateEmails(rawContent: string): ExtractedEmailResult {
  if (!rawContent || typeof rawContent !== 'string') {
    return { validEmails: [], invalidEmails: [], duplicatesCount: 0, totalParsed: 0 };
  }

  // Split by common delimiters (newline, comma, semicolon, tab)
  const tokens = rawContent
    .split(/[\r\n,;\t]+/)
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter((t) => t.length > 0 && !/^email$/i.test(t) && !/^recipient$/i.test(t)); // Filter CSV headers

  const seen = new Set<string>();
  const validEmails: string[] = [];
  const invalidEmails: string[] = [];
  let duplicatesCount = 0;

  for (const token of tokens) {
    const cleanEmail = token.toLowerCase();
    if (isValidEmail(cleanEmail)) {
      if (seen.has(cleanEmail)) {
        duplicatesCount++;
      } else {
        seen.add(cleanEmail);
        validEmails.push(cleanEmail);
      }
    } else {
      invalidEmails.push(token);
    }
  }

  return {
    validEmails,
    invalidEmails,
    duplicatesCount,
    totalParsed: tokens.length,
  };
}
