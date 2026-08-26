// ============================================================
// PerfilForm — formulario de creación / edición del perfil local
// ============================================================
import { useState, useRef } from 'react';
import { Camera, Save, Loader2 } from 'lucide-react';
import type { Profile, Rol } from '@/types';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { Avatar } from './Avatar';
import { getEquipoNombre } from '@/data/equipos';


const ROLES: { value: Rol; label: string }[] = [
  { value: 'entrenador',   label: '⚽ Entrenador/a' },
  { value: 'coordinador',  label: '📋 Coordinador/a' },
  { value: 'admin',        label: '🔧 Administrador/a' },
];

interface PerfilFormProps {
  perfilInicial?: Partial<Profile>;
  onGuardar: (p: Omit<Profile, 'id' | 'creado_en'>) => Promise<void>;
  textoBoton?: string;
  mostrarCancelar?: boolean;
  onCancelar?: () => void;
}

interface Errores {
  nombre?: string;
}

// Convierte un File a base64
function fileABase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PerfilForm({
  perfilInicial = {},
  onGuardar,
  textoBoton = 'Guardar perfil',
  mostrarCancelar = false,
  onCancelar,
}: PerfilFormProps) {
  const [nombre,    setNombre]   = useState(perfilInicial.nombre   ?? '');
  const [rol,       setRol]      = useState<Rol>(perfilInicial.rol ?? 'entrenador');
  const [foto,      setFoto]     = useState<string | undefined>(perfilInicial.avatar_b64);
  const [guardando, setGuardando] = useState(false);
  const [errores,   setErrores]  = useState<Errores>({});

  const fileRef = useRef<HTMLInputElement>(null);

  // Validación básica
  function validar(): boolean {
    const e: Errores = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  // Manejo de foto
  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Limitar a 2 MB
    if (file.size > 2 * 1024 * 1024) {
      alert('La foto no puede superar 2 MB');
      return;
    }
    const b64 = await fileABase64(file);
    setFoto(b64);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      await onGuardar({
        nombre:     nombre.trim(),
        equipo:     perfilInicial.equipo ?? '',
        team_ids:   perfilInicial.team_ids ?? [],
        rol,
        avatar_b64: foto,
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Foto de perfil */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar nombre={nombre} foto={foto} size="xl" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-9 h-9 bg-quarte-azul text-white
                       rounded-full flex items-center justify-center shadow-md
                       hover:bg-blue-900 transition-colors active:scale-95"
            aria-label="Cambiar foto"
          >
            <Camera size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400">Toca para añadir foto</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFoto}
        />
      </div>

      {/* Nombre */}
      <InputField
        label="Nombre completo"
        value={nombre}
        onChange={e => {
          setNombre(e.target.value);
          if (errores.nombre) setErrores(prev => ({ ...prev, nombre: undefined }));
        }}
        placeholder="Ej: Carlos García"
        error={errores.nombre}
        autoComplete="name"
      />

      {/* Equipo — solo lectura, derivado de team_ids */}
      <div className="flex flex-col gap-1.5">
        <label className="font-titulo font-semibold text-sm text-quarte-negro">
          Equipo
        </label>
        <div className="w-full min-h-[48px] px-4 py-3 rounded-xl border-2 border-gray-200
                        bg-gray-50 text-base font-cuerpo text-quarte-negro flex items-center">
          {(perfilInicial.team_ids ?? []).map(id => getEquipoNombre(id)).join(' · ')
            || getEquipoNombre(perfilInicial.equipo ?? '')
            || '—'}
        </div>
        <p className="text-xs text-gray-400">El equipo se cambia desde el selector principal de la app.</p>
      </div>

      {/* Rol */}
      <SelectField
        label="Rol"
        value={rol}
        onChange={e => setRol(e.target.value as Rol)}
        options={ROLES}
      />

      {/* Botones */}
      <div className={`flex gap-3 ${mostrarCancelar ? 'flex-row' : 'flex-col'}`}>
        {mostrarCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="btn-outline flex-1"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={guardando}
          className={`btn-primario flex items-center justify-center gap-2 ${
            mostrarCancelar ? 'flex-1' : 'w-full'
          }`}
        >
          {guardando ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {guardando ? 'Guardando…' : textoBoton}
        </button>
      </div>
    </form>
  );
}
