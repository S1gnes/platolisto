import { describe, expect, it } from 'vitest';
import { ApiError, errorCode, withRetry, type ApiErrorCode } from './api';

/** A call that fails with the given codes, one per attempt, then succeeds. */
function flaky(...failures: ApiErrorCode[]) {
  let attempts = 0;
  const run = async () => {
    const failure = failures[attempts];
    attempts += 1;
    if (failure) throw new ApiError(failure);
    return 'ok';
  };
  return { run, attempts: () => attempts };
}

describe('withRetry', () => {
  it('returns the first answer when it works', async () => {
    const call = flaky();
    await expect(withRetry(call.run, 0)).resolves.toBe('ok');
    expect(call.attempts()).toBe(1);
  });

  it('tries once more after a passing failure', async () => {
    for (const code of ['upstream', 'bad_response', 'rate_limited'] as const) {
      const call = flaky(code);
      await expect(withRetry(call.run, 0)).resolves.toBe('ok');
      expect(call.attempts()).toBe(2);
    }
  });

  it('gives up after the second failure', async () => {
    const call = flaky('upstream', 'bad_response');
    const error = await withRetry(call.run, 0).catch((e: unknown) => e);
    expect(errorCode(error)).toBe('bad_response');
    expect(call.attempts()).toBe(2);
  });

  it('does not retry what a second try cannot fix', async () => {
    for (const code of ['offline', 'not_configured', 'quota', 'timeout', 'too_large', 'blocked'] as const) {
      const call = flaky(code);
      const error = await withRetry(call.run, 0).catch((e: unknown) => e);
      expect(errorCode(error)).toBe(code);
      expect(call.attempts()).toBe(1);
    }
  });
});
