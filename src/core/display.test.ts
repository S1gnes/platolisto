import { describe, expect, it } from 'vitest';
import { qtySuffix, typedLabel } from './display';

describe('qtySuffix', () => {
  it('shows a count above one', () => {
    expect(qtySuffix('4')).toBe(' ×4');
  });

  it('says nothing for a single item or no quantity', () => {
    expect(qtySuffix('1')).toBe('');
    expect(qtySuffix(undefined)).toBe('');
    expect(qtySuffix('  ')).toBe('');
  });

  it('keeps a weight or volume as written', () => {
    expect(qtySuffix('500 g')).toBe(', 500 g');
  });
});

describe('typedLabel', () => {
  it('starts a typed name with a capital, like the catalog names', () => {
    expect(typedLabel('toilet paper')).toEqual({ en: 'Toilet paper', es: 'Toilet paper' });
  });
});
