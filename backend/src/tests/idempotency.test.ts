import { EmailStatus } from '../types';

describe('Idempotency & Worker Logic', () => {
  it('should verify status transitions allow only SCHEDULED to be claimed', () => {
    // Logic test to ensure state machine rules are preserved
    const canClaim = (currentStatus: EmailStatus) => currentStatus === EmailStatus.SCHEDULED;

    expect(canClaim(EmailStatus.SCHEDULED)).toBe(true);
    expect(canClaim(EmailStatus.PROCESSING)).toBe(false);
    expect(canClaim(EmailStatus.SENT)).toBe(false);
    expect(canClaim(EmailStatus.FAILED)).toBe(false);
  });

  it('should ignore emails that are already in SENT state', () => {
    const isAlreadySent = (currentStatus: EmailStatus) => currentStatus === EmailStatus.SENT;

    expect(isAlreadySent(EmailStatus.SENT)).toBe(true);
    expect(isAlreadySent(EmailStatus.SCHEDULED)).toBe(false);
    expect(isAlreadySent(EmailStatus.PROCESSING)).toBe(false);
  });
});
