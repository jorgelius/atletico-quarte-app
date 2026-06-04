// ============================================================
// RegistroPage — registro con Supabase Auth
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';

export default function RegistroPage() {
  const [nombre,     setNombre]     = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [password2,  setPassword2]  = useState('');
  const [mostrarPwd, setMostrarPwd] = useState(false);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');
  const [confirmado, setConfirmado] = useState(false);

  const { registrar } = usePerfilStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !password) return;

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
      const { needsConfirmation } = await registrar(email.trim(), password, nombre.trim());
      if (needsConfirmation) {
        // Supabase requiere confirmación por email
        setConfirmado(true);
      } else {
        // Sin confirmación → ir directo al onboarding de perfil
        navigate('/primer-acceso', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
      setError(
        msg.includes('already registered')
          ? 'Ya existe una cuenta con ese email'
          : msg
      );
    } finally {
      setCargando(false);
    }
  }

  // Pantalla de confirmación pendiente
  if (confirmado) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-quarte-azul to-blue-900
                      flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-titulo text-lg font-bold text-quarte-negro mb-2">
            ¡Revisa tu email!
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Te hemos enviado un enlace de confirmación a <strong>{email}</strong>.
            Haz clic en él para activar tu cuenta.
          </p>
          <Link to="/login" className="btn-primario w-full flex items-center justify-center">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-quarte-azul to-blue-900
                    flex flex-col items-center justify-center px-4 py-8">
      {/* Cabecera */}
      <div className="flex flex-col items-center gap-2 mb-6 text-white text-center">
        <h1 className="font-titulo text-2xl font-extrabold tracking-tight">
          Crear cuenta
        </h1>
        <p className="text-blue-200 text-sm">CD Atlético Quarte</p>
      </div>

      {/* Tarjeta */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre completo"
              required
              autoComplete="name"
              className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-base font-cuerpo
                         text-quarte-negro placeholder:text-gray-400 bg-white transition-colors"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-base font-cuerpo
                         text-quarte-negro placeholder:text-gray-400 bg-white transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={mostrarPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña (mín. 6 caracteres)"
              required
              autoComplete="new-password"
              className="w-full min-h-[48px] pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-base font-cuerpo
                         text-quarte-negro placeholder:text-gray-400 bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setMostrarPwd(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-quarte-azul"
              aria-label={mostrarPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrarPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              placeholder="Confirmar contraseña"
              required
              autoComplete="new-password"
              className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200
                         focus:border-quarte-azul outline-none text-base font-cuerpo
                         text-quarte-negro placeholder:text-gray-400 bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn-primario w-full flex items-center justify-center gap-2 mt-1"
          >
            {cargando ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      <p className="mt-5 text-blue-200 text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-white font-semibold hover:underline">Iniciar sesión</Link>
      </p>
    </div>
  );
}
