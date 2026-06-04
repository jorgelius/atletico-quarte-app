// Componente de select de formulario accesible y mobile-first
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, error, options, id, className = '', ...props }: SelectFieldProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="font-titulo font-semibold text-sm text-quarte-negro">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full min-h-[48px] px-4 py-3 pr-10 rounded-xl border-2 text-base
            font-cuerpo text-quarte-negro bg-white appearance-none
            transition-colors outline-none
            ${error
              ? 'border-quarte-rojo focus:border-quarte-rojo'
              : 'border-gray-200 focus:border-quarte-azul'
            }
            ${className}
          `}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-quarte-rojo font-medium">{error}</p>}
    </div>
  );
}
