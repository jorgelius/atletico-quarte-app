// ============================================================
// LoginPage — autenticación con Supabase Auth
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import escudoImg from '@/assets/escudo.png';

export default function LoginPage() {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [mostrarPwd, setMostrarPwd] = useState(false);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');

  const { login } = usePerfilStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setCargando(true);
    setError('');
    // Atajo: "admin" sin @ → cuenta de administración del club
    const emailFinal = email.trim().toLowerCase() === 'admin'
      ? 'admin@atleticoquarte.local'
      : email.trim();
    try {
      await login(emailFinal, password);
      navigate('/inicio', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(
        msg.includes('Invalid login credentials')
          ? 'Email o contraseña incorrectos'
          : msg
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-quarte-azul to-blue-900
                    flex flex-col items-center justify-center px-4 py-8">
      {/* Cabecera */}
      <div className="flex flex-col items-center gap-3 mb-8 text-white text-center">
        <img src={escudoImg} alt="Escudo CD Atlético Quarte" className="w-20 h-20 object-contain drop-shadow-lg" />
        <h1 className="font-titulo text-2xl font-extrabold tracking-tight text-white">
          CD Atlético Quarte
        </h1>
      </div>

      {/* Tarjeta */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="font-titulo text-lg font-bold text-quarte-negro mb-1">
          Iniciar sesión
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Accede con tu cuenta del club.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email-login" className="font-titulo font-semibold text-sm text-quarte-negro">
              Email o usuario
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="email-login"
                type="text"
                inputMode="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
                className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200
                           focus:border-quarte-azul outline-none text-base font-cuerpo
                           text-quarte-negro placeholder:text-gray-400 bg-white transition-colors"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="pwd-login" className="font-titulo font-semibold text-sm text-quarte-negro">
                Contraseña
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-quarte-azul hover:underline font-semibold"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="pwd-login"
                type={mostrarPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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

          {/* Botón principal */}
          <button
            type="submit"
            disabled={cargando}
            className="btn-primario w-full flex items-center justify-center gap-2 mt-1"
          >
            {cargando ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>

      {/* Link a registro */}
      <p className="mt-5 text-blue-200 text-sm">
        ¿Primera vez?{' '}
        <Link to="/registro" className="text-white font-semibold hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
