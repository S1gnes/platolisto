import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { config } from '../config';
import type {
  Allergy,
  Diet,
  InventoryItem,
  Lang,
  ListItem,
  Localized,
  Love,
  Prefs,
  ScanSource,
} from '../core/types';
import { safeStorage } from './safeStorage';

export const defaultPrefs: Prefs = {
  allergies: [],
  diet: 'anything',
  loves: [],
  budget: config.budget.default,
};

export interface ListEntry {
  key: string;
  dealId: string | null;
  recipe: { id: string; title: Localized };
}

interface ScanState {
  source: ScanSource | null;
  items: InventoryItem[];
}

interface PersistedState {
  lang: Lang;
  onboarded: boolean;
  prefs: Prefs;
  plus: boolean;
  ageConfirmed: boolean;
  scan: ScanState;
  list: ListItem[];
  bar: string[];
}

export interface AppState extends PersistedState {
  setLang: (lang: Lang) => void;
  finishOnboarding: () => void;
  toggleAllergy: (allergy: Allergy) => void;
  setDiet: (diet: Diet) => void;
  toggleLove: (love: Love) => void;
  setBudget: (budget: number) => void;
  setPlus: (on: boolean) => void;
  confirmAge: () => void;
  setScan: (source: ScanSource, items: InventoryItem[]) => void;
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (id: string) => void;
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void;
  /** Adds missing ingredients to the shopping list. Returns how many new rows were created. */
  addToList: (entries: ListEntry[]) => number;
  toggleListItem: (id: string) => void;
  removeCheckedItems: () => void;
  setBar: (items: string[]) => void;
  resetDemo: () => void;
}

function detectLang(): Lang {
  try {
    return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const demoDefaults = (): Omit<PersistedState, 'lang'> => ({
  onboarded: false,
  prefs: defaultPrefs,
  plus: false,
  ageConfirmed: false,
  scan: { source: null, items: [] },
  list: [],
  bar: [],
});

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      lang: detectLang(),
      ...demoDefaults(),

      setLang: (lang) => set({ lang }),
      finishOnboarding: () => set({ onboarded: true }),
      toggleAllergy: (allergy) =>
        set((s) => ({ prefs: { ...s.prefs, allergies: toggle(s.prefs.allergies, allergy) } })),
      setDiet: (diet) => set((s) => ({ prefs: { ...s.prefs, diet } })),
      toggleLove: (love) => set((s) => ({ prefs: { ...s.prefs, loves: toggle(s.prefs.loves, love) } })),
      setBudget: (budget) => set((s) => ({ prefs: { ...s.prefs, budget } })),
      setPlus: (plus) => set({ plus }),
      confirmAge: () => set({ ageConfirmed: true }),

      setScan: (source, items) => set({ scan: { source, items } }),
      addInventoryItem: (item) =>
        set((s) => {
          if (s.scan.items.some((i) => i.key === item.key)) return s;
          return { scan: { source: s.scan.source ?? 'typed', items: [...s.scan.items, item] } };
        }),
      removeInventoryItem: (id) =>
        set((s) => ({ scan: { ...s.scan, items: s.scan.items.filter((i) => i.id !== id) } })),
      updateInventoryItem: (id, patch) =>
        set((s) => ({
          scan: { ...s.scan, items: s.scan.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) },
        })),

      addToList: (entries) => {
        let added = 0;
        const list = get().list.map((item) => ({ ...item, recipes: [...item.recipes] }));
        for (const entry of entries) {
          const existing = list.find((item) => item.key === entry.key);
          if (existing) {
            if (!existing.recipes.some((r) => r.id === entry.recipe.id)) existing.recipes.push(entry.recipe);
            continue;
          }
          list.push({
            id: `${entry.key}:${entry.dealId ?? 'none'}`,
            key: entry.key,
            dealId: entry.dealId,
            recipes: [entry.recipe],
            checked: false,
          });
          added += 1;
        }
        set({ list });
        return added;
      },
      toggleListItem: (id) =>
        set((s) => ({ list: s.list.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)) })),
      removeCheckedItems: () => set((s) => ({ list: s.list.filter((item) => !item.checked) })),

      setBar: (bar) => set({ bar }),
      resetDemo: () => set(demoDefaults()),
    }),
    {
      name: 'platolisto',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s): PersistedState => ({
        lang: s.lang,
        onboarded: s.onboarded,
        prefs: s.prefs,
        plus: s.plus,
        ageConfirmed: s.ageConfirmed,
        scan: s.scan,
        list: s.list,
        bar: s.bar,
      }),
    },
  ),
);
