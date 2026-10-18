import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' }) {
  const styles = variant === 'primary' ? 'bg-ink text-white hover:bg-lavender' : variant === 'secondary' ? 'border border-ink/15 bg-white text-ink hover:border-lavender' : 'text-ink hover:bg-black/5';
  return <button className={`min-h-11 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`} {...props}>{children}</button>;
}
