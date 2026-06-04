// Badge de rol / estado
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variante?: 'azul' | 'rojo' | 'verde' | 'gris' | 'naranja';
  className?: string;
}

const variantes = {
  azul:    'bg-quarte-azulClaro text-quarte-azul',
  rojo:    'bg-red-50 text-quarte-rojo',
  verde:   'bg-green-50 text-quarte-verde',
  gris:    'bg-gray-100 text-gray-600',
  naranja: 'bg-orange-50 text-orange-600',
};

export function Badge({ children, variante = 'gris', className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1 px-2.5 py-0.5
      rounded-full text-xs font-titulo font-semibold
      ${variantes[variante]} ${className}
    `}>
      {children}
    </span>
  );
}
