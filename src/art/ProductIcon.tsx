import type { ReactNode } from 'react';

// Flat product illustrations on a 48×48 grid, in the style of the mockups.
const ART: Record<string, ReactNode> = {
  chicken: (
    <>
      <path d="M31 31l7 7" stroke="#EFE3CF" strokeWidth="5" strokeLinecap="round" />
      <circle cx="40" cy="36" r="3.5" fill="#EFE3CF" />
      <circle cx="36" cy="40" r="3.5" fill="#EFE3CF" />
      <ellipse cx="21" cy="21" rx="15" ry="12" transform="rotate(45 21 21)" fill="#C98F5A" />
    </>
  ),
  tomato: (
    <>
      <circle cx="17" cy="30" r="9" fill="#D2553A" />
      <circle cx="31" cy="31" r="9" fill="#C8452F" />
      <circle cx="24" cy="19" r="8" fill="#DD6645" />
      <path d="M24 8v5M21 11h6" stroke="#5E6B3A" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  egg: (
    <>
      <ellipse cx="19" cy="27" rx="9" ry="11" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
      <ellipse cx="31" cy="25" rx="9" ry="11" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    </>
  ),
  herb: (
    <>
      <path d="M24 40V22M24 30l-8-8M24 28l8-9" stroke="#5E6B3A" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="16" r="7" fill="#6E8B3D" />
      <circle cx="14" cy="20" r="6" fill="#7C9A4E" />
      <circle cx="34" cy="17" r="6" fill="#7C9A4E" />
    </>
  ),
  chickpea: (
    <>
      <circle cx="16" cy="28" r="6" fill="#E3B873" />
      <circle cx="27" cy="30" r="6" fill="#D9A95F" />
      <circle cx="22" cy="20" r="6" fill="#EBC388" />
      <circle cx="33" cy="21" r="6" fill="#E3B873" />
      <circle cx="37" cy="32" r="5" fill="#D9A95F" />
    </>
  ),
  cheese: (
    <>
      <path d="M8 34h32V20z" fill="#F2C94C" stroke="#B9862B" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="30" cy="28" r="2.5" fill="#D9A93A" />
      <circle cx="22" cy="31" r="1.8" fill="#D9A93A" />
    </>
  ),
  potato: (
    <>
      <ellipse cx="19" cy="28" rx="11" ry="8" transform="rotate(-15 19 28)" fill="#C9A36A" />
      <ellipse cx="31" cy="22" rx="10" ry="7.5" transform="rotate(20 31 22)" fill="#B88F57" />
      <circle cx="15" cy="26" r="1.3" fill="#8C6A3C" />
      <circle cx="22" cy="31" r="1.3" fill="#8C6A3C" />
      <circle cx="33" cy="20" r="1.3" fill="#7A5A30" />
    </>
  ),
  pasta: (
    <>
      <rect x="9" y="13" width="22" height="8" rx="2.5" transform="rotate(-28 20 17)" fill="#E9B949" />
      <rect x="17" y="22" width="22" height="8" rx="2.5" transform="rotate(-28 28 26)" fill="#E3AE3A" />
      <rect x="9" y="30" width="22" height="8" rx="2.5" transform="rotate(-28 20 34)" fill="#EDC260" />
      <path d="M13 19l12-6M21 28l12-6M13 36l12-6" stroke="#C9932A" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  mince: (
    <>
      <rect x="6" y="24" width="36" height="14" rx="4" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
      <path d="M11 28c2-10 24-10 26 0z" fill="#C4574A" />
      <circle cx="19" cy="24" r="1.6" fill="#E08A7C" />
      <circle cx="26" cy="22" r="1.6" fill="#E08A7C" />
      <circle cx="31" cy="25" r="1.4" fill="#E08A7C" />
    </>
  ),
  rice: (
    <>
      <path d="M7 24h34a17 15 0 0 1-34 0z" fill="#A94F2B" />
      <path d="M9 24c2-10 28-10 30 0z" fill="#FBF6EC" />
      <ellipse cx="18" cy="20" rx="1.8" ry="1" fill="#E7DACA" />
      <ellipse cx="25" cy="17" rx="1.8" ry="1" fill="#E7DACA" />
      <ellipse cx="31" cy="21" rx="1.8" ry="1" fill="#E7DACA" />
    </>
  ),
  can: (
    <>
      <rect x="9" y="20" width="30" height="12" fill="#8FB3C9" />
      <ellipse cx="24" cy="32" rx="15" ry="5" fill="#8FB3C9" />
      <rect x="9" y="23" width="30" height="5" fill="#FBF6EC" />
      <ellipse cx="24" cy="20" rx="15" ry="5" fill="#CBD5D1" />
      <ellipse cx="24" cy="20" rx="11" ry="3.4" fill="#B9C5C1" />
    </>
  ),
  milk: (
    <>
      <rect x="15" y="15" width="18" height="27" rx="2" fill="#FFFFFF" stroke="#CBD5D1" strokeWidth="1.5" />
      <path d="M15 15l9-7 9 7z" fill="#F4F6F7" stroke="#CBD5D1" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="15.8" y="23" width="16.4" height="7" fill="#8FB3C9" />
    </>
  ),
  bread: (
    <>
      <ellipse cx="24" cy="25" rx="19" ry="7.5" transform="rotate(-30 24 25)" fill="#E3B873" />
      <path d="M15 31l4-6M21 28l4-6M27 24l4-6" stroke="#C4934A" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  garlic: (
    <>
      <path d="M24 9c-2 4-12 8-12 18a12 10 0 0 0 24 0c0-10-10-14-12-18z" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
      <path d="M24 14v22M19 20c-1 6-1 11 1 16M29 20c1 6 1 11-1 16" stroke="#E3D5BD" strokeWidth="1.2" fill="none" />
    </>
  ),
  pepper: (
    <>
      <path d="M13 19c0-5 6-6 11-4 5-2 11-1 11 4 0 11-4 21-11 21s-11-10-11-21z" fill="#D2553A" />
      <path d="M24 15V9" stroke="#5E6B3A" strokeWidth="3" strokeLinecap="round" />
      <path d="M19 20c-1 6 0 12 2 16" stroke="#E57A5F" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  onion: (
    <>
      <path d="M24 8c-1 3-2 4-2 6-7 2-11 8-11 14a13 12 0 0 0 26 0c0-6-4-12-11-14 0-2-1-3-2-6z" fill="#C98F5A" />
      <path d="M24 15c-4 4-5 10-4 18M24 15c4 4 5 10 4 18" stroke="#B07A48" strokeWidth="1.5" fill="none" />
    </>
  ),
  chorizo: (
    <>
      <path d="M13 31a12 12 0 1 1 22 0" stroke="#A8382A" strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="21" r="1.3" fill="#E8A090" />
      <circle cx="26" cy="15" r="1.3" fill="#E8A090" />
      <circle cx="32" cy="21" r="1.3" fill="#E8A090" />
    </>
  ),
  lentil: (
    <>
      {[
        [14, 26],
        [20, 21],
        [26, 25],
        [32, 20],
        [19, 31],
        [27, 32],
        [34, 28],
        [23, 16],
        [12, 33],
        [30, 36],
      ].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="3.2" ry="2.5" fill={i % 2 ? '#8A5A30' : '#9C6B3E'} />
      ))}
    </>
  ),
  frozen: (
    <>
      <path d="M12 9h24l2 31H10z" fill="#DCE5E1" stroke="#8FB3C9" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="19" cy="23" r="3" fill="#7C9A4E" />
      <circle cx="28" cy="27" r="3" fill="#F2B632" />
      <circle cx="24" cy="19" r="2.5" fill="#D2553A" />
      <circle cx="30" cy="19" r="2.5" fill="#6E8B3D" />
      <rect x="15" y="29" width="5" height="5" rx="1" fill="#E07B39" />
    </>
  ),
  cannedTomato: (
    <>
      <rect x="12" y="14" width="24" height="26" rx="3" fill="#C8452F" />
      <ellipse cx="24" cy="14" rx="12" ry="3.5" fill="#CBD5D1" />
      <rect x="12" y="22" width="24" height="9" fill="#FBF6EC" />
      <circle cx="24" cy="26.5" r="3" fill="#D2553A" />
    </>
  ),
  mozzarella: (
    <>
      <circle cx="18" cy="27" r="9" fill="#FFFFFF" stroke="#E3D5BD" strokeWidth="1.5" />
      <circle cx="31" cy="28" r="8" fill="#FFFFFF" stroke="#E3D5BD" strokeWidth="1.5" />
      <path d="M14 23c2-2 5-2 7 0" stroke="#EFE7DA" strokeWidth="1.5" fill="none" />
    </>
  ),
  yogurt: (
    <>
      <rect x="14" y="17" width="20" height="23" rx="4" fill="#FFFFFF" stroke="#CBD5D1" strokeWidth="1.5" />
      <rect x="12" y="12" width="24" height="6" rx="2" fill="#5E6B3A" />
      <rect x="18" y="25" width="12" height="7" rx="1.5" fill="#E9EFD9" />
    </>
  ),
  lemon: (
    <>
      <ellipse cx="24" cy="26" rx="14" ry="10" fill="#F2C94C" />
      <ellipse cx="19" cy="23" rx="4" ry="2" fill="#F7DB7A" />
      <path d="M37 24l4-2M11 28l-4 2" stroke="#E0B23A" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  leaves: (
    <>
      <ellipse cx="18" cy="26" rx="8" ry="13" transform="rotate(-20 18 26)" fill="#6E8B3D" />
      <ellipse cx="30" cy="27" rx="8" ry="12" transform="rotate(18 30 27)" fill="#7C9A4E" />
      <path d="M18 18l1 16M30 19l-1 15" stroke="#5E7A35" strokeWidth="1.2" />
    </>
  ),
  bag: (
    <>
      <path d="M12 18h24l-2 22H14z" fill="#E3B873" />
      <path d="M18 18v-3a6 6 0 0 1 12 0v3" stroke="#B9862B" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
};

const KEY_TO_ART: Record<string, string> = {
  chicken: 'chicken',
  'chicken thigh': 'chicken',
  'chicken breast': 'chicken',
  tomato: 'tomato',
  'cherry tomato': 'tomato',
  egg: 'egg',
  parsley: 'herb',
  cilantro: 'herb',
  basil: 'herb',
  mint: 'herb',
  chickpea: 'chickpea',
  bean: 'chickpea',
  pea: 'chickpea',
  cheese: 'cheese',
  manchego: 'cheese',
  parmesan: 'cheese',
  feta: 'cheese',
  potato: 'potato',
  pasta: 'pasta',
  noodle: 'pasta',
  'minced beef': 'mince',
  'minced meat': 'mince',
  beef: 'mince',
  rice: 'rice',
  'cooked rice': 'rice',
  tuna: 'can',
  salmon: 'can',
  milk: 'milk',
  bread: 'bread',
  garlic: 'garlic',
  'bell pepper': 'pepper',
  onion: 'onion',
  'green onion': 'onion',
  chorizo: 'chorizo',
  sausage: 'chorizo',
  ham: 'chorizo',
  bacon: 'chorizo',
  lentil: 'lentil',
  'frozen vegetable': 'frozen',
  'canned tomato': 'cannedTomato',
  mozzarella: 'mozzarella',
  yogurt: 'yogurt',
  'greek yogurt': 'yogurt',
  lemon: 'lemon',
  lime: 'lemon',
  spinach: 'leaves',
  lettuce: 'leaves',
};

interface Props {
  ingredientKey: string;
  size?: number;
}

export function ProductIcon({ ingredientKey, size = 34 }: Props) {
  const art = ART[KEY_TO_ART[ingredientKey] ?? 'bag'];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {art}
    </svg>
  );
}
