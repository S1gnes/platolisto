import raw from '../data/deals-demo.json';
import { toDeal } from './deals';
import type { DealRecord } from './types';

/** The fixed example deals from the brief, so tests don't depend on this week's real prices. */
export const DEMO_DEALS = (raw as DealRecord[]).map(toDeal);
