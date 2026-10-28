import type { ReactNode } from 'react';

// Drink illustrations from the bartender mockup (52×52), plus a generic glass.
const DRINKS: Record<string, ReactNode> = {
  mojito: (
    <>
      <path d="M16 12h20l-2 30H18z" fill="#DDEBC8" opacity="0.9" />
      <path d="M17 22h18l-1.4 20H18.4z" fill="#BFD69B" />
      <ellipse cx="22" cy="18" rx="4" ry="2.5" fill="#6E8B3D" transform="rotate(-25 22 18)" />
      <ellipse cx="29" cy="16" rx="4" ry="2.5" fill="#7C9A4E" transform="rotate(20 29 16)" />
      <circle cx="34" cy="13" r="4" fill="#9CC25A" />
    </>
  ),
  cola: (
    <>
      <path d="M17 12h18l-2 30H19z" fill="#5A2E1B" />
      <path d="M17 12h18l-.4 6H17.4z" fill="#8C4A2A" />
      <circle cx="33" cy="13" r="5" fill="#9CC25A" />
      <rect x="22" y="22" width="6" height="6" rx="1" fill="#E7F0F5" opacity="0.6" />
    </>
  ),
  coupe: (
    <>
      <path d="M12 14h28L26 28z" fill="#EAF0D2" />
      <path d="M26 28v12M20 40h12" stroke="#EAF0D2" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="37" cy="14" r="4.5" fill="#9CC25A" />
    </>
  ),
  tropical: (
    <>
      <path d="M17 12h18l-2 30H19z" fill="#F2DE9B" />
      <path d="M30 10l5-4" stroke="#F2C14E" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 14l6 3-6 3z" fill="#9CC25A" />
    </>
  ),
  shot: (
    <>
      <path d="M19 18h14l-2 20H21z" fill="#E9C46A" opacity="0.9" />
      <path d="M19 18h14l-.4 4H19.4z" fill="#F7E3A1" />
    </>
  ),
};

export type DrinkStyle = keyof typeof DRINKS;

export function DrinkArt({ style, muted }: { style: DrinkStyle; muted?: boolean }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
      <rect width="52" height="52" rx="14" fill={muted ? '#3B3024' : '#4A3D2F'} />
      {DRINKS[style]}
    </svg>
  );
}
