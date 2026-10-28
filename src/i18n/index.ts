import { useMemo } from 'react';
import { useApp } from '../state/store';
import type { Lang, Localized } from '../core/types';
import { en, type MessageKey } from './en';
import { es } from './es';

export type { MessageKey };
type Vars = Record<string, string | number>;

/** Keys that have both a `.one` and an `.other` form, without the suffix. */
export type PluralKey = {
  [K in MessageKey]: K extends `${infer B}.one` ? (`${B}.other` extends MessageKey ? B : never) : never;
}[MessageKey];

const dictionaries: Record<Lang, Record<MessageKey, string>> = { en, es };
const locales: Record<Lang, string> = { en: 'en-IE', es: 'es-ES' };

export interface Translator {
  (key: MessageKey, vars?: Vars): string;
  lang: Lang;
  locale: string;
  plural(key: PluralKey, count: number, vars?: Vars): string;
  /** Price with cents, e.g. "€3.90" / "3,90 €". */
  price(cents: number): string;
  /** Price without cents when they are zero, e.g. "€3". */
  priceShort(cents: number): string;
  /** Pick the current language from a localized value. */
  pick(text: Localized): string;
}

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export function createTranslator(lang: Lang): Translator {
  const dict = dictionaries[lang];
  const locale = locales[lang];
  const rules = new Intl.PluralRules(locale);
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
  const moneyWhole = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const t = ((key: MessageKey, vars?: Vars) => interpolate(dict[key] ?? en[key] ?? key, vars)) as Translator;
  t.lang = lang;
  t.locale = locale;
  t.plural = (key, count, vars) => {
    const form = rules.select(count) === 'one' ? 'one' : 'other';
    return t(`${key}.${form}` as MessageKey, { n: count, ...vars });
  };
  t.price = (cents) => money.format(cents / 100);
  t.priceShort = (cents) => (cents % 100 === 0 ? moneyWhole : money).format(cents / 100);
  t.pick = (text) => text[lang] || text.en;
  return t;
}

export function useT(): Translator {
  const lang = useApp((s) => s.lang);
  return useMemo(() => createTranslator(lang), [lang]);
}
