import type { ReactNode } from 'react';
import type { PlateArtId, PlateSpec, Recipe, Topping } from '../core/types';

// Hand-drawn plates copied from the mockups (100×100 grid).
const DRAWN: Record<PlateArtId, ReactNode> = {
  'egg-fried-rice': (
    <>
      <circle cx="50" cy="50" r="36" fill="#F1E3C2" />
      <circle cx="38" cy="40" r="3" fill="#F2C94C" />
      <circle cx="58" cy="36" r="3" fill="#F2C94C" />
      <circle cx="62" cy="58" r="3" fill="#F2C94C" />
      <circle cx="42" cy="62" r="3" fill="#F2C94C" />
      <circle cx="50" cy="50" r="3" fill="#F2C94C" />
      <ellipse cx="46" cy="44" rx="5" ry="3" fill="#6E8B3D" />
      <ellipse cx="60" cy="47" rx="5" ry="3" fill="#7C9A4E" />
      <ellipse cx="36" cy="54" rx="5" ry="3" fill="#6E8B3D" />
      <ellipse cx="54" cy="64" rx="5" ry="3" fill="#7C9A4E" />
      <circle cx="31" cy="44" r="2.5" fill="#D2553A" />
      <circle cx="66" cy="52" r="2.5" fill="#D2553A" />
    </>
  ),
  'lemon-chicken-rice': (
    <>
      <circle cx="50" cy="50" r="36" fill="#EFE6D2" />
      <ellipse cx="42" cy="46" rx="14" ry="9" fill="#C98F5A" transform="rotate(-20 42 46)" />
      <ellipse cx="58" cy="56" rx="14" ry="9" fill="#BF8350" transform="rotate(15 58 56)" />
      <path d="M34 45l14-5M50 56l13-3" stroke="#9E6A3C" strokeWidth="2" strokeLinecap="round" />
      <circle cx="64" cy="36" r="8" fill="#F2C94C" />
      <circle cx="64" cy="36" r="5.5" fill="#F7DB7A" />
      <circle cx="36" cy="62" r="2.5" fill="#5E6B3A" />
      <circle cx="44" cy="66" r="2" fill="#5E6B3A" />
    </>
  ),
  shakshuka: (
    <>
      <circle cx="50" cy="50" r="36" fill="#C8452F" />
      <circle cx="40" cy="42" r="9" fill="#FBF6EC" />
      <circle cx="40" cy="42" r="4" fill="#F2B632" />
      <circle cx="60" cy="54" r="9" fill="#FBF6EC" />
      <circle cx="60" cy="54" r="4" fill="#F2B632" />
      <path d="M30 60l6 3M62 34l5 4M48 68l6-2" stroke="#6E8B3D" strokeWidth="3" strokeLinecap="round" />
      <rect x="52" y="30" width="9" height="7" rx="1" fill="#F2C94C" transform="rotate(12 56 33)" />
      <rect x="32" y="56" width="8" height="6" rx="1" fill="#F2C94C" />
    </>
  ),
  tortilla: (
    <>
      <circle cx="50" cy="50" r="34" fill="#C98A2E" />
      <circle cx="50" cy="50" r="30" fill="#E9B949" />
      <path d="M50 50L80 50A30 30 0 0 0 71 29z" fill="#F6EFE4" />
      <path d="M50 50L80 50M50 50L71 29" stroke="#C98A2E" strokeWidth="2" />
      <circle cx="38" cy="58" r="2" fill="#C98A2E" />
      <circle cx="44" cy="40" r="1.5" fill="#C98A2E" />
    </>
  ),
};

// Small deterministic PRNG so a recipe always gets the same plate.
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RADIUS: Partial<Record<Topping['kind'], number>> = { egg: 9, blob: 8, chunk: 9, pepper: 11, wedge: 7 };

function drawTopping(kind: Topping['kind'], color: string, x: number, y: number, rot: number, key: string): ReactNode {
  const r = `rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`;
  switch (kind) {
    case 'grain':
      return <ellipse key={key} cx={x} cy={y} rx="2.6" ry="1.3" fill={color} transform={r} />;
    case 'dot':
      return <circle key={key} cx={x} cy={y} r="2.6" fill={color} />;
    case 'pea':
      return <circle key={key} cx={x} cy={y} r="3.8" fill={color} />;
    case 'tube':
      return (
        <g key={key} transform={r}>
          <rect x={x - 5.5} y={y - 2.2} width="11" height="4.4" rx="1.6" fill={color} />
          <path d={`M${x - 3} ${y - 2.2}v4.4M${x + 1} ${y - 2.2}v4.4`} stroke="#C9932A" strokeWidth="0.8" />
        </g>
      );
    case 'noodle':
      return (
        <path
          key={key}
          d={`M${x - 9} ${y}q4.5 -6 9 0t9 0`}
          stroke={color}
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          transform={r}
        />
      );
    case 'flake':
      return <ellipse key={key} cx={x} cy={y} rx="4" ry="2.6" fill={color} transform={r} />;
    case 'leaf':
      return <ellipse key={key} cx={x} cy={y} rx="5" ry="2.8" fill={color} transform={r} />;
    case 'chunk':
      return (
        <g key={key} transform={r}>
          <ellipse cx={x} cy={y} rx="9" ry="6" fill={color} />
          <path d={`M${x - 6} ${y}h12`} stroke="#9E6A3C" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 'slice':
      return (
        <g key={key}>
          <circle cx={x} cy={y} r="4.4" fill={color} />
          <circle cx={x - 1.3} cy={y - 1} r="0.9" fill="#E8A090" />
          <circle cx={x + 1.5} cy={y + 1.2} r="0.9" fill="#E8A090" />
        </g>
      );
    case 'cube':
      return <rect key={key} x={x - 3} y={y - 3} width="6" height="6" rx="1.2" fill={color} transform={r} />;
    case 'strip':
      return <rect key={key} x={x - 6} y={y - 1.6} width="12" height="3.2" rx="1.6" fill={color} transform={r} />;
    case 'egg':
      return (
        <g key={key}>
          <circle cx={x} cy={y} r="9" fill="#FBF6EC" />
          <circle cx={x} cy={y} r="4" fill="#F2B632" />
        </g>
      );
    case 'blob':
      return <ellipse key={key} cx={x} cy={y} rx="8" ry="6.5" fill={color} transform={r} />;
    case 'wedge':
      return (
        <g key={key} transform={r}>
          <path d={`M${x - 7} ${y}a7 7 0 0 0 14 0z`} fill={color} />
          <path d={`M${x - 5} ${y}a5 5 0 0 0 10 0z`} fill="#F7DB7A" />
        </g>
      );
    case 'pepper':
      return (
        <g key={key} transform={r}>
          <ellipse cx={x} cy={y} rx="11" ry="7" fill={color} />
          <ellipse cx={x} cy={y} rx="7.5" ry="4.2" fill="#EFE6D2" />
          <path d={`M${x - 11} ${y}h-3`} stroke="#5E6B3A" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
  }
}

function proceduralPlate(id: string, spec: PlateSpec): ReactNode {
  const random = seeded(id);
  const placed: { x: number; y: number; r: number }[] = [];
  const nodes: ReactNode[] = [<circle key="base" cx="50" cy="50" r="36" fill={spec.base} />];
  // Big pieces first, kept apart; small bits scatter freely on top.
  const order = [...spec.toppings].sort((a, b) => (RADIUS[b.kind] ?? 0) - (RADIUS[a.kind] ?? 0));
  order.forEach((topping, ti) => {
    const size = RADIUS[topping.kind] ?? 3;
    for (let n = 0; n < topping.count; n += 1) {
      let x = 50;
      let y = 50;
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const angle = random() * Math.PI * 2;
        const dist = Math.sqrt(random()) * (34 - size - 2);
        x = 50 + Math.cos(angle) * dist;
        y = 50 + Math.sin(angle) * dist;
        if (size < 6 || placed.every((p) => Math.hypot(p.x - x, p.y - y) > p.r + size)) break;
      }
      if (size >= 6) placed.push({ x, y, r: size });
      nodes.push(drawTopping(topping.kind, topping.color, x, y, random() * 180, `${ti}-${n}`));
    }
  });
  return nodes;
}

const FALLBACK: PlateSpec = { base: '#F1E3C2', toppings: [{ kind: 'leaf', color: '#6E8B3D', count: 5 }] };

interface Props {
  recipe: Pick<Recipe, 'id' | 'art' | 'plate'>;
  size: number;
  /** Accessible name; omit for decorative use. */
  label?: string;
}

export function PlateArt({ recipe, size, label }: Props) {
  const content = recipe.art ? DRAWN[recipe.art] : proceduralPlate(recipe.id, recipe.plate ?? FALLBACK);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2D3BF" strokeWidth="2" />
      {content}
    </svg>
  );
}
