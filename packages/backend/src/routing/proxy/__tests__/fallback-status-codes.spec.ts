import { shouldTriggerFallback, shouldTriggerFallbackForZeroUsage } from '../fallback-status-codes';

describe('shouldTriggerFallback', () => {
  it.each([400, 401, 403, 404, 405, 409, 422, 424, 429, 500, 501, 502, 503, 504])(
    'should return true for error status %d',
    (status) => {
      expect(shouldTriggerFallback(status)).toBe(true);
    },
  );

  it.each([200, 201, 204, 301, 302])('should return false for non-error status %d', (status) => {
    expect(shouldTriggerFallback(status)).toBe(false);
  });

  it('should still fallback for provider context length errors', () => {
    expect(shouldTriggerFallback(400)).toBe(true);
  });
});

describe('shouldTriggerFallbackForZeroUsage', () => {
  it('returns true for a 200 whose usage reports 0 prompt AND 0 completion tokens', () => {
    // OpenRouter free-tier silent-failure signature (#2781): HTTP 200 but the
    // provider generated nothing and reported no usage at all.
    expect(shouldTriggerFallbackForZeroUsage({ prompt_tokens: 0, completion_tokens: 0 })).toBe(
      true,
    );
  });

  it.each([
    [{ prompt_tokens: 12, completion_tokens: 34 }],
    [{ prompt_tokens: 0, completion_tokens: 12 }],
    [{ prompt_tokens: 12, completion_tokens: 0 }],
    // Anthropic-native shape normalized by parseUsageObject: cache reads are
    // summed into prompt_tokens, so real input always leaves prompt_tokens > 0.
    [{ prompt_tokens: 4, completion_tokens: 0, cache_read_tokens: 4 }],
  ])('returns false for real usage %j', (usage) => {
    expect(shouldTriggerFallbackForZeroUsage(usage)).toBe(false);
  });

  it.each([null, undefined])('returns false when usage is absent (%s)', (usage) => {
    expect(shouldTriggerFallbackForZeroUsage(usage)).toBe(false);
  });
});
