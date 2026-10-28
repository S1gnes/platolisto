/** Split a server-sent-events buffer into complete `data:` payloads and the unfinished rest. */
export function splitSse(buffer: string): { events: string[]; rest: string } {
  const blocks = buffer.split(/\r?\n\r?\n/);
  const rest = blocks.pop() ?? '';
  const events = blocks
    .map((block) =>
      block
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n'),
    )
    .filter(Boolean);
  return { events, rest };
}

interface StreamChunk {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
}

/** Visible text in one Gemini stream chunk (thought parts are skipped). */
export function chunkText(data: string): string {
  try {
    const chunk = JSON.parse(data) as StreamChunk;
    const parts = chunk.candidates?.[0]?.content?.parts ?? [];
    return parts
      .filter((part) => !part.thought && typeof part.text === 'string')
      .map((part) => part.text)
      .join('');
  } catch {
    return '';
  }
}
