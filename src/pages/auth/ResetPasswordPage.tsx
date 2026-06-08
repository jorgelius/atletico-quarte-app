// ============================================================
// ResetPasswordPage — establecer nueva contraseña tras recovery
// ============================================================
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock, Loader2, CheckCircle2, AlertCircle,
  Eye, EyeOff, KeyRound, ArrowLeft, XCircle,
} from 'lucide-react';
import { supabase } from '@/data/supabaseClient';
import escudoImg from '@/assets/escudo.png';

type Estado = 'verificando' | 'listo' | 'exito' | 'invalido';

export default function ResetPasswordPage() {
  const [estado,     setEstado]     = useState<Estado>('verificando');
  const [password,   setPassword]   = useState('');
  const [password2,  setPassword2]  = useState('');
  const [mostrarPwd, setMostrarPwd] = useState(false);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Timeout: si en 6 s no llega el evento PASSWORD_RECOVERY, el enlace es inválido
    const timeout = setTimeout(() => {
      setEstado(e => e === 'verificando' ? 'invalido' : e);
    }, 6000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        clearTimeout(timeout);
        setEstado('listo');
      }
    });

    // Por si la sesión ya estaba activa al montar (reload)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        clearTimeout(timeout);
        setEstado('listo');
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setEstado('exito');
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    } finally {
      setCargando(false);
    }
  }

  const bgClass = "min-h-screen bg-gradient-to-b from-quarte-azul to-blue-900 flex flex-col items-center justify-center px-4 py-8";

  // ── Estados de pantalla ───────────────────────────────────
  if (estado === 'verificando') {
    return (
      <div className={bgClass}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 size={40} className="text-quarte-azul mx-auto mb-4 animate-spin" />
          <p className="text-sm text-gray-500 font-cuerpo">Verificando enlace de recuperación…</p>
        </div>
      </div>
    );
  }

  if (estado === 'invalido') {
    return (
      <div className={bgClass}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
          <XCircle size={48} className="text-quarte-rojo mx-auto mb-4" />
          <h2 className="font-titulo text-lg font-bold text-quarte-negro mb-2">
            Enlace inválido o expirado
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Este enlace de recuperación ya no es válido. Solicita uno nuevo desde la pantalla de inicio de sesión.
          </p>
          <Link
            to="/forgot-password"
            className="btn-primario w-full flex items-center justify-center gap-2"
          >
            Solicitar nuevo enlace
          </Link>
          <Link
            to="/login"
            className="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-quarte-azul transition-colors"
          >
            <ArrowLeft size={14} />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  if (estado === 'exito') {
    return (
      <div className={bgClass}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
          <CheckCircle2 size={48} className="text-quarte-verde mx-auto mb-4" />
          <h2 className="font-titulo text-lg font-bold text-quarte-negro mb-2">
            ¡Contraseña actualizada!
          </h2>
          <p className="text-sm text-gray-500">
            Tu contraseña ha sido restablecida correctamente.
            Redirigiendo al inicio de sesión…
          </p>
        </div>
      </div>
    );
  }

  // ── Formulario de nueva contraseña ────────────────────────
  return (
    <div className={bgClass}>
      {/* Cabecera */}
      <div className="flex flex-col items-center gap-3 mb-8 text-white text-center">
        <img
          src={escudoImg}
          alt="Escudo CD Atlético Quarte"
          className="w-20 h-20 object-contain drop-shadow-lg"
        />
        <h1 className="font-titulo text-2xl font-extrabold tracking-tight text-white">
          CD Atlético Quarte
        </h1>
      </div>

      {/* Tarjeta */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="font-titulo text-lg font-bold text-quarte-negro mb-1">
          Nueva contraseña
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Elige una contraseña segura para tu cuenta del club.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nueva contraseña */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pwd-new" className="font-titulo font-semibold text-sm text-quarte-negro">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="pwd-new"
                type={mostrarPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mín. 6 caracteres"
                autoComplete="new-password"
                required
                className="w-full min-h-[48px] pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-base font-cuerpo
                           text-quarte-negro placeholder:text-gray-400 bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setMostrarPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-quarte-azul transition-colors"
                aria-label={mostrarPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pwd-confirm" className="font-titulo font-semibold text-sm text-quarte-negro">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="pwd-confirm"
                type="password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                required
                className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-base font-cuerpo
                           text-quarte-negro placeholder:text-gray-400 bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn-primario w-full flex items-center justify-center gap-2 mt-1"
          >
            {cargando
              ? <Loader2 size={18} className="animate-spin" />
              : <KeyRound size={18} />}
            {cargando ? 'Actualizando…' : 'Establecer nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
