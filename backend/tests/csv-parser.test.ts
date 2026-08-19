import { describe, it, expect } from 'vitest';
import { parseAndValidateEmails, isValidEmail } from '../src/utils/csv-parser.util.js';

describe('CSV and Email Parsing Utility', () => {
  it('should validate valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('john.doe+work@domain.co.uk')).toBe(true);
    expect(isValidEmail('reachinbox@sub.domain.org')).toBe(true);
  });

  it('should invalidate incorrect email syntax', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('john@')).toBe(false);
    expect(isValidEmail('john@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('should parse, validate, and deduplicate a mixed raw list of emails', () => {
    const rawInput = `
      email
      alex@reachinbox.io
      bob@example.com
      alex@reachinbox.io
      invalid-email-address
      charlie@domain.com
      "diana@company.org"
      bad@format@test.com
    `;

    const result = parseAndValidateEmails(rawInput);

    expect(result.validEmails).toEqual([
      'alex@reachinbox.io',
      'bob@example.com',
      'charlie@domain.com',
      'diana@company.org',
    ]);
    expect(result.validEmails.length).toBe(4);
    expect(result.duplicatesCount).toBe(1);
    expect(result.invalidEmails).toContain('invalid-email-address');
    expect(result.invalidEmails).toContain('bad@format@test.com');
  });

  it('should handle comma and semicolon delimited content', () => {
    const rawInput = 'user1@a.com, user2@b.com; user3@c.com, user1@a.com';
    const result = parseAndValidateEmails(rawInput);

    expect(result.validEmails).toEqual(['user1@a.com', 'user2@b.com', 'user3@c.com']);
    expect(result.duplicatesCount).toBe(1);
  });
});
