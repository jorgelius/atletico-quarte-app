// ============================================================
// PrimerAccesoPage — onboarding en 2 pasos tras el registro
// Paso 1: nombre, foto, rol / Paso 2: selección de equipo
// ============================================================
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, Camera, ChevronRight, ChevronLeft,
  Shield, ClipboardList, Settings2, Check, Lock,
} from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import type { Profile, Rol } from '@/types';
import { GRUPOS_EQUIPOS_SELECTOR } from '@/data/equipos';
import { Avatar } from '@/components/ui/Avatar';
import escudoImg from '@/assets/escudo.png';

const ROLES_UI: { value: Rol; label: string; desc: string; Icon: React.ElementType }[] = [
  { value: 'entrenador',  label: 'Entrenador/a',    desc: 'Dirijo un equipo',        Icon: Shield       },
  { value: 'coordinador', label: 'Coordinador/a',   desc: 'Gestiono varios equipos', Icon: ClipboardList },
  { value: 'admin',       label: 'Administrador/a', desc: 'Gestión del club',         Icon: Settings2    },
];

function fileABase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PrimerAccesoPage() {
  const { guardarPerfil, session, cargando } = usePerfilStore();
  const navigate = useNavigate();

  const [paso,         setPaso]         = useState<1 | 2>(1);
  const [nombre,       setNombre]       = useState('');
  const [rol,          setRol]          = useState<Rol>('entrenador');
  const [foto,         setFoto]         = useState<string | undefined>();
  const [teamIds,      setTeamIds]      = useState<string[]>([]);
  const [errNombre,    setErrNombre]    = useState('');
  const [errEquipo,    setErrEquipo]    = useState('');
  const [guardando,    setGuardando]    = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');
  const [codigoCargo,  setCodigoCargo]  = useState('');
  const [errCodigo,    setErrCodigo]    = useState('');

  const CODIGO_SECRETO = 'QUARTE2026';
  const necesitaCodigo = rol === 'coordinador' || rol === 'admin';

  function toggleEquipo(id: string) {
    setTeamIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    setErrEquipo('');
  }

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cargando && !session) {
      navigate('/login', { replace: true });
      return;
    }
    if (session?.user?.user_metadata?.nombre) {
      setNombre(session.user.user_metadata.nombre as string);
    }
  }, [session, cargando]);

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La foto no puede superar 2 MB'); return; }
    setFoto(await fileABase64(file));
  }

  function irAPaso2() {
    if (!nombre.trim()) { setErrNombre('El nombre es obligatorio'); return; }
    setErrNombre('');
    if (necesitaCodigo && codigoCargo !== CODIGO_SECRETO) {
      setErrCodigo('Código incorrecto. Contacta con la dirección del club.');
      return;
    }
    setErrCodigo('');
    setPaso(2);
  }

  async function handleEmpezar() {
    if (teamIds.length === 0) { setErrEquipo('Selecciona al menos un equipo para continuar'); return; }
    if (!session?.user) return;
    setErrEquipo('');
    setErrorGuardar('');
    setGuardando(true);
    try {
      const perfil: Profile = {
        id:         session.user.id,
        creado_en:  Date.now(),
        nombre:     nombre.trim(),
        rol,
        equipo:     teamIds[0],
        team_ids:   teamIds,
        avatar_b64: foto,
      };
      await guardarPerfil(perfil);
      navigate('/inicio', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el perfil';
      setErrorGuardar(
        msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('permission')
          ? 'Sin permisos en la base de datos. Activa las políticas RLS en Supabase.'
          : msg,
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-quarte-azul flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-quarte-azul via-blue-900 to-blue-950
                    flex flex-col items-center justify-start px-4 pt-8 pb-12">

      {/* Cabecera con escudo e indicador de paso */}
      <div className="flex flex-col items-center gap-2 mb-6 text-white text-center">
        <img
          src={escudoImg}
          alt="Escudo CD Atlético Quarte"
          className="w-20 h-20 object-contain drop-shadow-lg"
        />
        <h1 className="font-titulo text-xl font-extrabold tracking-tight">
          CD Atlético Quarte
        </h1>
        {/* Pill de paso */}
        <div className="flex items-center gap-2 mt-1">
          <div className={`h-2 rounded-full transition-all duration-300
                           ${paso === 1 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
          <div className={`h-2 rounded-full transition-all duration-300
                           ${paso === 2 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
        </div>
        <p className="text-blue-200 text-xs">Paso {paso} de 2</p>
      </div>

      {/* ── PASO 1 — Datos personales ──────────────────────────── */}
      {paso === 1 && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-titulo text-lg font-bold text-quarte-negro">Cuéntanos sobre ti</h2>
            <p className="text-sm text-gray-400 mt-0.5">Tu nombre y rol dentro del club.</p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar nombre={nombre} foto={foto} size="xl" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 bg-quarte-azul text-white
                           rounded-full flex items-center justify-center shadow-md
                           hover:bg-blue-900 transition-colors active:scale-95"
                aria-label="Añadir foto de perfil"
              >
                <Camera size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400">Foto de perfil (opcional)</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFoto}
            />
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="font-titulo font-semibold text-sm text-quarte-negro">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => { setNombre(e.target.value); setErrNombre(''); }}
              placeholder="Ej: Carlos García"
              autoComplete="name"
              className={`min-h-[48px] px-4 py-3 rounded-xl border-2 text-base font-cuerpo
                          text-quarte-negro bg-white transition-colors outline-none
                          placeholder:text-gray-400
                          ${errNombre
                            ? 'border-quarte-rojo'
                            : 'border-gray-200 focus:border-quarte-azul'}`}
            />
            {errNombre && (
              <p className="text-xs text-quarte-rojo font-medium">{errNombre}</p>
            )}
          </div>

          {/* Rol */}
          <div className="flex flex-col gap-2">
            <p className="font-titulo font-semibold text-sm text-quarte-negro">Rol</p>
            <div className="flex flex-col gap-2">
              {ROLES_UI.map(({ value, label, desc, Icon }) => {
                const activo = rol === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setRol(value); setCodigoCargo(''); setErrCodigo(''); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left
                                transition-all active:scale-[0.98]
                                ${activo
                                  ? 'border-quarte-azul bg-quarte-azulClaro'
                                  : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                     ${activo ? 'bg-quarte-azul text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-titulo font-semibold text-sm
                                     ${activo ? 'text-quarte-azul' : 'text-quarte-negro'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    {activo && <Check size={18} className="text-quarte-azul flex-shrink-0" />}
                  </button>
                );
              })}

              {/* Campo de código — solo visible para coordinador/admin */}
              {necesitaCodigo && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="font-titulo font-semibold text-sm text-quarte-negro flex items-center gap-1.5">
                    <Lock size={13} className="text-quarte-azul" />
                    Código de acceso
                  </label>
                  <input
                    type="password"
                    value={codigoCargo}
                    onChange={e => { setCodigoCargo(e.target.value); setErrCodigo(''); }}
                    placeholder="Código proporcionado por el club"
                    className={`min-h-[48px] px-4 py-3 rounded-xl border-2 text-base font-cuerpo
                                text-quarte-negro bg-white transition-colors outline-none
                                placeholder:text-gray-400
                                ${errCodigo
                                  ? 'border-quarte-rojo'
                                  : 'border-gray-200 focus:border-quarte-azul'}`}
                  />
                  {errCodigo && (
                    <p className="text-xs text-quarte-rojo font-medium">{errCodigo}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={irAPaso2}
            className="btn-primario flex items-center justify-center gap-2 w-full"
          >
            Continuar
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── PASO 2 — Selección de equipos ──────────────────────── */}
      {paso === 2 && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-titulo text-lg font-bold text-quarte-negro">
              ¿Con qué equipo(s) trabajas?
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Puedes seleccionar más de uno si llevas varios equipos.
            </p>
          </div>

          {errorGuardar && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl
                            px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorGuardar}</span>
            </div>
          )}

          {/* Grid de equipos agrupados — multi-select */}
          <div className="flex flex-col gap-5 max-h-[50vh] overflow-y-auto scrollbar-hide -mx-1 px-1 pb-1">
            {GRUPOS_EQUIPOS_SELECTOR.map(grupo => (
              <div key={grupo.label}>
                <p className="text-[10px] font-titulo font-bold text-gray-400 uppercase
                              tracking-widest mb-2">
                  {grupo.label}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {grupo.equipos.map(eq => {
                    const sel = teamIds.includes(eq.id);
                    return (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => toggleEquipo(eq.id)}
                        className={`relative flex flex-col items-start gap-0.5 px-3 py-2.5
                                    rounded-xl border-2 text-left transition-all active:scale-[0.97]
                                    ${sel
                                      ? 'border-quarte-azul bg-quarte-azulClaro'
                                      : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        {sel && (
                          <span className="absolute top-2 right-2">
                            <Check size={13} className="text-quarte-azul" />
                          </span>
                        )}
                        <p className={`font-titulo font-semibold text-sm leading-tight pr-4
                                       ${sel ? 'text-quarte-azul' : 'text-quarte-negro'}`}>
                          {eq.nombre}
                        </p>
                        {eq.sub && (
                          <p className="text-[11px] text-gray-400">{eq.sub}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {teamIds.length > 0 && (
            <p className="text-xs text-quarte-azul font-titulo font-semibold -mt-2">
              {teamIds.length === 1 ? '1 equipo seleccionado' : `${teamIds.length} equipos seleccionados`}
            </p>
          )}
          {errEquipo && (
            <p className="text-xs text-quarte-rojo font-medium -mt-3">{errEquipo}</p>
          )}

          {/* Acciones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="btn-outline flex items-center gap-1.5"
            >
              <ChevronLeft size={18} />
              Atrás
            </button>
            <button
              onClick={handleEmpezar}
              disabled={guardando}
              className="btn-primario flex-1 flex items-center justify-center gap-2"
            >
              {guardando
                ? <Loader2 size={18} className="animate-spin" />
                : <Check size={18} />}
              {guardando ? 'Guardando…' : 'Empezar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
