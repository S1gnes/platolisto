import data from '../data/presets.json';
import { normalizeIngredient } from './normalize';
import type { Box2d, InventoryItem, PresetId } from './types';

export interface RawDetection {
  name: string;
  label_en?: string;
  label_es?: string;
  quantity?: string | null;
  confidence?: number;
  box_2d?: number[] | null;
}

export interface Preset {
  id: PresetId;
  /** Real photo under public/presets/, or null while the illustrated placeholder is used. */
  photo: string | null;
  width: number;
  height: number;
  detections: RawDetection[];
}

export const PRESETS = data.presets as Preset[];
export const PRESET_IDS: PresetId[] = ['student', 'market', 'empty'];

export function presetById(id: PresetId): Preset {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Unknown preset: ${id}`);
  return preset;
}

function toBox(box: number[] | null | undefined): Box2d | undefined {
  if (!box || box.length !== 4 || box.some((n) => typeof n !== 'number' || Number.isNaN(n))) return undefined;
  const [ymin, xmin, ymax, xmax] = box.map((n) => Math.min(1000, Math.max(0, n)));
  return ymax > ymin && xmax > xmin ? [ymin, xmin, ymax, xmax] : undefined;
}

let nextId = 0;
export function itemId(): string {
  nextId += 1;
  return `i${Date.now().toString(36)}${nextId}`;
}

/** Detections from a preset or the vision API → editable inventory, one row per ingredient. */
export function detectionsToItems(detections: RawDetection[]): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (const d of detections) {
    const key = normalizeIngredient(d.name);
    if (!key || items.some((item) => item.key === key)) continue;
    const name = d.name.trim();
    const labelEn = d.label_en || name.charAt(0).toUpperCase() + name.slice(1);
    items.push({
      id: itemId(),
      key,
      label: { en: labelEn, es: d.label_es || labelEn },
      qty: d.quantity ? String(d.quantity) : undefined,
      box: toBox(d.box_2d),
      // Presets carry short hand-written box labels; live detections use the chip name instead.
      boxLabel: d.label_en ? { en: d.label_en, es: d.label_es || d.label_en } : undefined,
    });
  }
  return items;
}
