// ============================================================
// ForgotPasswordPage — solicitar enlace de recuperación
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, Send, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/data/supabaseClient';
import escudoImg from '@/assets/escudo.png';

export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');
  const [enviado,  setEnviado]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setCargando(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setEnviado(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar el enlace');
    } finally {
      setCargando(false);
    }
  }

  // ── Pantalla de confirmación ──────────────────────────────
  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-quarte-azul to-blue-900
                      flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
          <CheckCircle2 size={48} className="text-quarte-verde mx-auto mb-4" />
          <h2 className="font-titulo text-lg font-bold text-quarte-negro mb-2">
            ¡Revisa tu email!
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Hemos enviado un enlace de recuperación a{' '}
            <strong className="text-quarte-negro">{email}</strong>.
            Úsalo para crear una nueva contraseña.
          </p>
          <Link
            to="/login"
            className="btn-primario w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // ── Formulario principal ──────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-quarte-azul to-blue-900
                    flex flex-col items-center justify-center px-4 py-8">
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
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Introduce tu email y te enviaremos un enlace para restablecerla.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl
                          px-4 py-3 mb-4 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email-forgot" className="font-titulo font-semibold text-sm text-quarte-negro">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="email-forgot"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="entrenador@atleticoquarte.es"
                autoComplete="email"
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
            {cargando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {cargando ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      </div>

      <p className="mt-5 text-blue-200 text-sm">
        <Link
          to="/login"
          className="text-white font-semibold hover:underline flex items-center gap-1.5 justify-center"
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
