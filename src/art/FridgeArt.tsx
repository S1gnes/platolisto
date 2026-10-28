import type { ReactNode } from 'react';
import type { PresetId } from '../core/types';

// Illustrated placeholders for the preset fridge photos (350×270), until real photos land in public/presets/.

const FRAME = (
  <>
    <rect x="0" y="0" width="350" height="270" rx="22" fill="#DCE5E1" />
    <rect x="10" y="10" width="330" height="250" rx="16" fill="#EEF3F1" />
    <rect x="10" y="100" width="330" height="6" fill="#C6D2CD" />
    <rect x="10" y="194" width="330" height="6" fill="#C6D2CD" />
  </>
);

const DRAWER = (
  <>
    <rect x="18" y="208" width="314" height="44" rx="10" fill="#DCE5E1" />
    <rect x="145" y="214" width="60" height="6" rx="3" fill="#C3CFCA" />
  </>
);

const STUDENT = (
  <>
    <rect x="24" y="70" width="98" height="28" rx="4" fill="#D9C6A5" />
    <ellipse cx="38" cy="66" rx="9" ry="11" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <ellipse cx="60" cy="66" rx="9" ry="11" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <ellipse cx="82" cy="66" rx="9" ry="11" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <ellipse cx="104" cy="66" rx="9" ry="11" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <rect x="138" y="54" width="36" height="44" rx="5" fill="#FFFFFF" stroke="#CBD5D1" strokeWidth="1.5" />
    <rect x="136" y="50" width="40" height="8" rx="3" fill="#5E6B3A" />
    <rect x="144" y="70" width="24" height="10" rx="2" fill="#E9EFD9" />
    <ellipse cx="210" cy="84" rx="20" ry="14" fill="#F2C94C" />
    <ellipse cx="203" cy="80" rx="6" ry="3" fill="#F7DB7A" />
    <rect x="250" y="36" width="42" height="62" rx="4" fill="#FFFFFF" stroke="#CBD5D1" strokeWidth="1.5" />
    <path d="M250 36l21-10 21 10z" fill="#F4F6F7" stroke="#CBD5D1" strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="251" y="58" width="40" height="14" fill="#8FB3C9" />
    <circle cx="44" cy="178" r="11" fill="#D2553A" />
    <circle cx="66" cy="180" r="11" fill="#C8452F" />
    <circle cx="56" cy="160" r="10" fill="#DD6645" />
    <circle cx="84" cy="172" r="10" fill="#D2553A" />
    <path d="M56 148v4M44 165v3M84 160v3" stroke="#5E6B3A" strokeWidth="2" strokeLinecap="round" />
    <rect x="116" y="118" width="74" height="72" rx="12" fill="#D4E3C3" />
    <ellipse cx="140" cy="150" rx="13" ry="20" fill="#6E8B3D" transform="rotate(-20 140 150)" />
    <ellipse cx="166" cy="154" rx="12" ry="19" fill="#7C9A4E" transform="rotate(18 166 154)" />
    <ellipse cx="152" cy="172" rx="12" ry="12" fill="#5E7A35" />
    <rect x="206" y="146" width="78" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5D1" strokeWidth="1.5" />
    <rect x="212" y="158" width="66" height="26" rx="4" fill="#F3EEE3" />
    <rect x="204" y="140" width="82" height="9" rx="3" fill="#A94F2B" />
    <circle cx="310" cy="174" r="16" fill="#C98F5A" />
    <path d="M310 158c-1-6 2-10 5-12" stroke="#8C6A3C" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M302 170c4 6 12 6 16 0" stroke="#B07A48" strokeWidth="1.5" fill="none" />
  </>
);

const MARKET = (
  <>
    <rect x="22" y="76" width="100" height="24" rx="6" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <ellipse cx="44" cy="80" rx="14" ry="8.5" transform="rotate(-12 44 80)" fill="#C98F5A" />
    <ellipse cx="72" cy="78" rx="14" ry="8.5" transform="rotate(10 72 78)" fill="#BF8350" />
    <ellipse cx="100" cy="81" rx="13" ry="8" transform="rotate(-6 100 81)" fill="#C98F5A" />
    <rect x="20" y="68" width="104" height="32" rx="7" fill="#FFFFFF" opacity="0.35" stroke="#CBD5D1" strokeWidth="1.2" />
    <path d="M138 98h58V64z" fill="#F2C94C" stroke="#B9862B" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="180" cy="88" r="3" fill="#D9A93A" />
    <circle cx="168" cy="92" r="2" fill="#D9A93A" />
    <circle cx="186" cy="78" r="2" fill="#D9A93A" />
    <path d="M230 98l3-34M236 98v-36M242 98l-3-34" stroke="#5E6B3A" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="224" cy="56" r="9" fill="#6E8B3D" />
    <circle cx="236" cy="46" r="10" fill="#7C9A4E" />
    <circle cx="248" cy="56" r="9" fill="#6E8B3D" />
    <circle cx="230" cy="40" r="7" fill="#7C9A4E" />
    <circle cx="244" cy="40" r="7" fill="#6E8B3D" />
    <rect x="227" y="82" width="18" height="5" rx="2" fill="#A94F2B" />
    <path d="M286 70c-2 4-11 7-11 16a11 9 0 0 0 22 0c0-9-9-12-11-16z" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <path d="M312 72c-2 4-11 7-11 15a11 9 0 0 0 22 0c0-8-9-11-11-15z" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <path d="M286 76v18M312 78v17" stroke="#E3D5BD" strokeWidth="1.2" />
    <path d="M28 160c0-6 6-7 12-5 6-2 12-1 12 5 0 13-4 28-12 28s-12-15-12-28z" fill="#D2553A" />
    <path d="M40 155v-7" stroke="#5E6B3A" strokeWidth="3" strokeLinecap="round" />
    <path d="M58 164c0-6 6-7 12-5 6-2 12-1 12 5 0 12-4 26-12 26s-12-14-12-26z" fill="#E0A03A" />
    <path d="M70 159v-7" stroke="#5E6B3A" strokeWidth="3" strokeLinecap="round" />
    <circle cx="114" cy="178" r="15" fill="#C98F5A" />
    <path d="M114 163c-1-5 2-9 5-10" stroke="#8C6A3C" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M106 175c4 5 12 5 16 0" stroke="#B07A48" strokeWidth="1.5" fill="none" />
    <circle cx="144" cy="180" r="14" fill="#BF8350" />
    <path d="M144 166c-1-5 2-8 5-9" stroke="#8C6A3C" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M137 178c4 4 10 4 14 0" stroke="#A66F40" strokeWidth="1.5" fill="none" />
    <ellipse cx="214" cy="182" rx="36" ry="8" transform="rotate(-5 214 182)" fill="#5E7A35" />
    <ellipse cx="216" cy="168" rx="34" ry="7.5" transform="rotate(5 216 168)" fill="#6E8B3D" />
    <circle cx="181" cy="185" r="3" fill="#C9D7A4" />
    <circle cx="249" cy="171" r="3" fill="#C9D7A4" />
    <path d="M270 140h60l-4 50a4 4 0 0 1-4 4h-44a4 4 0 0 1-4-4z" fill="#E3B873" opacity="0.5" />
    <ellipse cx="286" cy="176" rx="12" ry="9" fill="#C9A36A" />
    <ellipse cx="310" cy="178" rx="12" ry="9" fill="#B88F57" />
    <ellipse cx="298" cy="160" rx="12" ry="9" fill="#C9A36A" />
    <ellipse cx="318" cy="156" rx="9" ry="7" fill="#B88F57" />
    <path
      d="M272 150l56 36M272 170l40 24M286 140l42 28M328 150l-50 40M328 172l-30 22M306 140l-34 24"
      stroke="#C4934A"
      strokeWidth="1.2"
    />
    <rect x="276" y="134" width="48" height="8" rx="3" fill="#A94F2B" />
  </>
);

const EMPTY = (
  <>
    <ellipse cx="61" cy="86" rx="20" ry="14" fill="#F2C94C" />
    <ellipse cx="54" cy="82" rx="6" ry="3" fill="#F7DB7A" />
    <rect x="262" y="52" width="40" height="46" rx="4" fill="#FFFFFF" stroke="#CBD5D1" strokeWidth="1.5" />
    <path d="M262 52l20-10 20 10z" fill="#F4F6F7" stroke="#CBD5D1" strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="263" y="66" width="38" height="12" fill="#8FB3C9" />
    <rect x="138" y="176" width="74" height="18" rx="4" fill="#D9C6A5" />
    <ellipse cx="156" cy="172" rx="9" ry="11" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <ellipse cx="176" cy="172" rx="9" ry="11" fill="#FBF6EC" stroke="#D9C6A5" strokeWidth="1.5" />
    <ellipse cx="196" cy="181" rx="7" ry="4" fill="#C9B48F" />
  </>
);

const CONTENT: Record<PresetId, ReactNode> = { student: STUDENT, market: MARKET, empty: EMPTY };

/** `preset: null` draws an empty fridge frame. */
export function FridgeArt({ preset, label }: { preset: PresetId | null; label: string }) {
  return (
    <svg
      role={preset ? 'img' : undefined}
      aria-label={preset ? label : undefined}
      aria-hidden={preset ? undefined : true}
      viewBox="0 0 350 270"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      {FRAME}
      {preset && CONTENT[preset]}
      {DRAWER}
    </svg>
  );
}

const THUMBS: Record<PresetId, ReactNode> = {
  student: (
    <>
      <circle cx="12" cy="13" r="4" fill="#FBF6EC" />
      <circle cx="27" cy="13" r="4" fill="#F2C94C" />
      <circle cx="13" cy="29" r="4" fill="#D2553A" />
      <rect x="22" y="25" width="12" height="9" rx="2" fill="#7C9A4E" />
    </>
  ),
  market: (
    <>
      <circle cx="10" cy="13" r="4" fill="#C98F5A" />
      <circle cx="20" cy="13" r="4" fill="#6E8B3D" />
      <circle cx="30" cy="13" r="4" fill="#D2553A" />
      <rect x="8" y="25" width="24" height="9" rx="2" fill="#E3B873" />
    </>
  ),
  empty: (
    <>
      <circle cx="30" cy="13" r="4" fill="#F2C94C" />
      <rect x="8" y="27" width="8" height="7" rx="2" fill="#FFFFFF" />
    </>
  ),
};

export function PresetThumb({ preset }: { preset: PresetId }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#DCE5E1" />
      <rect x="2" y="19" width="36" height="2" fill="#C6D2CD" />
      {THUMBS[preset]}
    </svg>
  );
}
