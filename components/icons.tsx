import type { ComponentType, SVGProps } from 'react';
import type { Sport } from '@/lib/types';

export type IconProps = SVGProps<SVGSVGElement>;

// Shared 24×24 stroke-icon wrapper (DESIGN.md §4). Icons inherit color via
// currentColor; size is set by the caller (width/height props or CSS).
function Svg(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const IconChart = (p: IconProps) => (
  <Svg {...p}><path d="M6 20v-6" /><path d="M12 20V4" /><path d="M18 20v-10" /></Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 9h18" />
  </Svg>
);

export const IconPlusCircle = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v8" /><path d="M8 12h8" /></Svg>
);

export const IconTarget = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </Svg>
);

export const IconSun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="M4.9 4.9l1.4 1.4" /><path d="M17.7 17.7l1.4 1.4" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="M6.3 17.7l-1.4 1.4" /><path d="M19.1 4.9l-1.4 1.4" />
  </Svg>
);

export const IconMoon = (p: IconProps) => (
  <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Svg>
);

export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" />
  </Svg>
);

export const IconSliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21v-7" /><path d="M4 10V3" />
    <path d="M12 21v-9" /><path d="M12 8V3" />
    <path d="M20 21v-5" /><path d="M20 12V3" />
    <path d="M2 14h4" /><path d="M10 8h4" /><path d="M18 16h4" />
  </Svg>
);

export const IconSwim = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
  </Svg>
);

export const IconBike = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" />
    <circle cx="15" cy="5" r="1" fill="currentColor" />
    <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
  </Svg>
);

export const IconRun = (p: IconProps) => (
  <Svg {...p}><path d="M13 2 3 14h7l-1 8 12-14h-7l-1-6z" fill="currentColor" stroke="none" /></Svg>
);

export const IconGym = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.5 12h7" />
    <rect x="4.5" y="8" width="3" height="8" rx="1" />
    <rect x="16.5" y="8" width="3" height="8" rx="1" />
    <path d="M2.5 10.5v3" /><path d="M21.5 10.5v3" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>
);

export const IconX = (p: IconProps) => (
  <Svg {...p}><path d="M18 6 6 18" /><path d="M6 6l12 12" /></Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </Svg>
);

export const IconChevronL = (p: IconProps) => (
  <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>
);

export const IconChevronR = (p: IconProps) => (
  <Svg {...p}><path d="M9 18l6-6-6-6" /></Svg>
);

export const IconFlag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <path d="M4 22v-7" />
  </Svg>
);

export const IconHeart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z" />
  </Svg>
);

export const IconClipboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </Svg>
);

export const IconZzz = (p: IconProps) => (
  <Svg {...p}><path d="M4 9h5l-5 6h5" /><path d="M13 5h5l-5 6h5" /></Svg>
);

export const SPORT_ICONS: Record<Sport, ComponentType<IconProps>> = {
  swim: IconSwim,
  bike: IconBike,
  run: IconRun,
  gym: IconGym,
};

// Logo mark: three overlapping rings in the three discipline colors.
export const LogoTri = (p: IconProps) => (
  <svg viewBox="0 0 32 24" fill="none" strokeWidth={2.5} aria-hidden="true" {...p}>
    <circle cx="8" cy="12" r="6" stroke="var(--c-swim)" />
    <circle cx="16" cy="12" r="6" stroke="var(--c-bike)" />
    <circle cx="24" cy="12" r="6" stroke="var(--c-run)" />
  </svg>
);
