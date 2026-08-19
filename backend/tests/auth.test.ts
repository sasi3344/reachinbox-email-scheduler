import { describe, it, expect } from 'vitest';
import { authService } from '../src/services/auth.service.js';

describe('Auth Service', () => {
  it('should generate and verify valid JWT token', () => {
    const userPayload = {
      id: 'test-user-id-123',
      email: 'alex@example.com',
      name: 'Alex Developer',
    };

    const token = authService.generateToken(userPayload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const verified = authService.verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(userPayload.id);
    expect(verified?.email).toBe(userPayload.email);
    expect(verified?.name).toBe(userPayload.name);
  });

  it('should return null when verifying corrupted token', () => {
    const corruptedToken = 'invalid.jwt.token.string';
    const verified = authService.verifyToken(corruptedToken);
    expect(verified).toBeNull();
  });
});
