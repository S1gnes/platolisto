import { describe, expect, it } from 'vitest';
import { chunkText, splitSse } from './sse';

describe('splitSse', () => {
  it('returns complete events and keeps the unfinished tail', () => {
    const { events, rest } = splitSse('data: {"a":1}\n\ndata: {"b":2}\r\n\r\ndata: {"c"');
    expect(events).toEqual(['{"a":1}', '{"b":2}']);
    expect(rest).toBe('data: {"c"');
  });

  it('ignores comments and other fields', () => {
    expect(splitSse(': keep-alive\n\nevent: x\ndata: hi\n\n').events).toEqual(['hi']);
  });
});

describe('chunkText', () => {
  it('joins visible parts and skips thoughts', () => {
    const data = JSON.stringify({ candidates: [{ content: { parts: [{ text: 'hmm', thought: true }, { text: 'Add ' }, { text: 'chilli.' }] } }] });
    expect(chunkText(data)).toBe('Add chilli.');
  });

  it('survives broken chunks', () => {
    expect(chunkText('not json')).toBe('');
    expect(chunkText('{}')).toBe('');
  });
});
