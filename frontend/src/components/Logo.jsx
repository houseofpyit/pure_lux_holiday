import React from 'react';
import LOGO_IMAGE from '@/assets/Logo.png';

const MONOGRAM_URL = 'https://media.base44.com/images/public/user_6a58babfc31eee12a9cd192b/7fe1cb7bb_ChatGPTImageJul16202604_25_20PM.png';
const PRIMARY_URL = 'https://media.base44.com/images/public/user_6a58babfc31eee12a9cd192b/eb64fcc6c_ChatGPTImageJul16202604_23_15PM.png';

export function PrimaryLogo({ className = '', onDark = false }) {
  return (
    <img
      src={PRIMARY_URL}
      alt="Pure Luxe Holidays"
      className={`object-contain ${className}`}
      style={{ mixBlendMode: onDark ? 'normal' : 'screen' }}
    />
  );
}

export function Monogram({ className = '', onDark = false }) {
  return (
    <img
      src={MONOGRAM_URL}
      alt="Pure Luxe Holidays — PL Monogram"
      className={`object-contain ${className}`}
      style={{ mixBlendMode: onDark ? 'normal' : 'screen' }}
    />
  );
}

export function TextLogo({ className = '', onDark = false }) {
  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <span className="font-heading text-2xl tracking-wide">
        <span className="text-emerald-dark" style={onDark ? { color: '#F8F5F0' } : {}}>Pure</span>{' '}
        <span className="text-champagne">Luxe</span>
      </span>
      <span className="font-body text-[0.55rem] tracking-widest-luxe text-muted-foreground mt-0.5" style={onDark ? { color: 'rgba(248,245,240,0.6)' } : {}}>
        H O L I D A Y S
      </span>
    </div>
  );
}

// NOTE: `height` no longer defaults to 40. Previously the default value
// meant an inline `style={{ height: 40 }}` was ALWAYS applied, and inline
// styles override Tailwind classes — so passing className="h-16 lg:h-20..."
// had no visible effect; the logo was silently locked to 40px everywhere.
// Now: pass `height` (a number, e.g. height={52}) for a fixed pixel size,
// OR pass `className` with Tailwind height classes (e.g. "h-16 lg:h-20")
// for responsive sizing — not both at once, since `height` takes priority
// via inline style whenever it's provided.
export function ImageLogo({ className = '', height }) {
  return (
    <img
      src={LOGO_IMAGE}
      alt="Pure Luxe Holidays"
      className={`object-contain ${className}`}
      style={height ? { height } : undefined}
    />
  );
}

export { MONOGRAM_URL, PRIMARY_URL };