import { ApplicationStatus } from './applications.service';

export interface StatusMeta {
  label: string;
  /** Dot / accent colour. */
  dot: string;
  /** Pill background + text. */
  pill: string;
  /** Top border of the board column. */
  accent: string;
}

export const STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  ToApply: {
    label: 'To apply',
    dot: 'bg-slate-400',
    pill: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    accent: 'border-t-slate-400',
  },
  Applied: {
    label: 'Applied',
    dot: 'bg-sky-500',
    pill: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    accent: 'border-t-sky-500',
  },
  Interview: {
    label: 'Interview',
    dot: 'bg-amber-500',
    pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    accent: 'border-t-amber-500',
  },
  Offer: {
    label: 'Offer',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    accent: 'border-t-emerald-500',
  },
  Rejected: {
    label: 'Rejected',
    dot: 'bg-rose-500',
    pill: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    accent: 'border-t-rose-500',
  },
};

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-500',
  'from-sky-500 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-pink-400',
  'from-fuchsia-500 to-purple-500',
];

/** Stable gradient per company so the same company always gets the same colour. */
export function avatarGradient(company: string): string {
  let hash = 0;
  for (const char of company.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function initials(company: string): string {
  const words = company.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : company.slice(0, 2)).toUpperCase();
}
