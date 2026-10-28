import type { DrinkStyle } from '../art/DrinkArt';
import type { Localized } from '../core/types';

// Static bartender content from the mockup. Milestone 4 replaces it with the bundled TheCocktailDB dataset.

export interface MockDrink {
  id: string;
  name: Localized;
  style: DrinkStyle;
  summary: Localized;
  minutes: number;
  have: number;
  total: number;
  missing?: Localized;
}

export const BAR_ITEMS: Localized[] = [
  { en: 'White rum', es: 'Ron blanco' },
  { en: 'Limes', es: 'Limas' },
  { en: 'Fresh mint', es: 'Hierbabuena' },
  { en: 'Sugar', es: 'Azúcar' },
  { en: 'Soda water', es: 'Soda' },
  { en: 'Cola', es: 'Cola' },
];

export const BAR_DRINKS: MockDrink[] = [
  {
    id: 'mojito',
    name: { en: 'Mojito', es: 'Mojito' },
    style: 'mojito',
    summary: { en: 'Rum, lime, mint, sugar, soda', es: 'Ron, lima, hierbabuena, azúcar, soda' },
    minutes: 5,
    have: 5,
    total: 5,
  },
  {
    id: 'cuba-libre',
    name: { en: 'Cuba Libre', es: 'Cuba libre' },
    style: 'cola',
    summary: { en: 'Rum, cola, lime', es: 'Ron, cola, lima' },
    minutes: 2,
    have: 3,
    total: 3,
  },
  {
    id: 'daiquiri',
    name: { en: 'Daiquiri', es: 'Daiquiri' },
    style: 'coupe',
    summary: { en: 'Rum, lime, sugar', es: 'Ron, lima, azúcar' },
    minutes: 3,
    have: 3,
    total: 3,
  },
  {
    id: 'pina-colada',
    name: { en: 'Piña colada', es: 'Piña colada' },
    style: 'tropical',
    summary: { en: '', es: '' },
    minutes: 5,
    have: 1,
    total: 3,
    missing: { en: 'pineapple juice, coconut cream', es: 'zumo de piña, crema de coco' },
  },
];
