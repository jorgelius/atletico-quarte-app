// Componente de input de formulario accesible y mobile-first
import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function InputField({ label, error, hint, id, className = '', ...props }: InputFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-titulo font-semibold text-sm text-quarte-negro">
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full min-h-[48px] px-4 py-3 rounded-xl border-2 text-base
          font-cuerpo text-quarte-negro bg-white
          transition-colors outline-none
          ${error
            ? 'border-quarte-rojo focus:border-quarte-rojo'
            : 'border-gray-200 focus:border-quarte-azul'
          }
          placeholder:text-gray-400
          ${className}
        `}
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-quarte-rojo font-medium">{error}</p>}
    </div>
  );
}
