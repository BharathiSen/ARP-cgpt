'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'custom';
  isLoading?: boolean;
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  href,
  className = '',
  children,
  ...props
}: ButtonProps) {
  let baseClass = '';

  if (variant === 'primary') {
    baseClass = 'ds-btn-primary';
  } else if (variant === 'ghost') {
    baseClass = 'ds-btn-ghost';
  }

  const combinedClassName = `${baseClass} ${className} flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && children}
      </Link>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && children}
    </button>
  );
}
