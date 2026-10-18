import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' }) {
  const styles = variant === 'primary' ? 'bg-ink text-white shadow-[0_12px_30px_rgba(37,27,33,.18)] hover:-translate-y-0.5 hover:bg-lavender hover:shadow-[0_16px_35px_rgba(61,42,54,.22)]' : variant === 'secondary' ? 'border border-ink/15 bg-white/80 text-ink hover:-translate-y-0.5 hover:border-lavender hover:bg-white' : 'text-ink hover:bg-black/5';
  return <button className={`min-h-12 rounded-[.9rem] px-6 py-3 text-xs font-bold uppercase tracking-[.1em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`} {...props}>{children}</button>;
}
