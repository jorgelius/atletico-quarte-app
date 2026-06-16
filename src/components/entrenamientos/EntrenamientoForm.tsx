// Formulario de creación/edición de entrenamiento
import { useState, useRef } from 'react';
import { ArrowLeft, Plus, X, Save, Loader2, Camera } from 'lucide-react';
import type { Entrenamiento, CategoriaEntrenamiento, NivelEdad, FormatoPartido } from '@/types';
import PitchBoard, { type PitchBoardHandle } from '@/components/pizarra/PitchBoard';

const CATEGORIAS: CategoriaEntrenamiento[] = ['ataque','defensa','porteros','posesion','finalizacion','fisico','otros'];

function fileAB64(f: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });
}

interface Props {
  inicial?: Entrenamiento;
  authorId: string;
  canSugerir: boolean;
  onGuardar: (e: Entrenamiento) => Promise<void>;
  onCancelar: () => void;
}

export default function EntrenamientoForm({ inicial, authorId, canSugerir, onGuardar, onCancelar }: Props) {
  const [titulo,     setTitulo]    = useState(inicial?.titulo ?? '');
  const [categoria,  setCat]       = useState<CategoriaEntrenamiento>(inicial?.categoria ?? 'otros');
  const nivel: NivelEdad = inicial?.nivel ?? 'todos';
  const [duracion,   setDuracion]  = useState(inicial?.duracion_min ?? 20);
  const [jugMin,     setJugMin]    = useState(inicial?.num_jugadores_min ?? 6);
  const [jugMax,     setJugMax]    = useState(inicial?.num_jugadores_max ?? 12);
  const [material,   setMaterial]  = useState<string[]>(inicial?.material ?? []);
  const [matInput,   setMatInput]  = useState('');
  const [descripcion,setDesc]      = useState(inicial?.descripcion ?? '');
  const [instrucciones, setInst]   = useState<string[]>(inicial?.instrucciones ?? ['']);
  const [fotos,      setFotos]     = useState<string[]>(inicial?.fotos_b64 ?? []);
  const [pizarra,    setPizarra]   = useState<string | undefined>(inicial?.pizarra_data);
  const [sugerido,   setSugerido]  = useState(inicial?.es_sugerido ?? false);
  const [guardando,  setGuardando] = useState(false);
  const [fmt,        setFmt]       = useState<FormatoPartido>('F11');

  const pizarraRef = useRef<PitchBoardHandle>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  async function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const b64s = await Promise.all(files.slice(0, 4).map(fileAB64));
    setFotos(prev => [...prev, ...b64s].slice(0, 4));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setGuardando(true);
    const entrenamiento: Entrenamiento = {
      id:               inicial?.id ?? crypto.randomUUID(),
      author_id:        authorId,
      titulo:           titulo.trim(),
      categoria, nivel, duracion_min: duracion,
      num_jugadores_min: jugMin, num_jugadores_max: jugMax,
      material, descripcion,
      instrucciones: instrucciones.filter(i => i.trim()),
      fotos_b64:     fotos,
      pizarra_data:  pizarraRef.current?.getJSON() ?? pizarra,
      es_sugerido:   canSugerir ? sugerido : (inicial?.es_sugerido ?? false),
      creado_en:     inicial?.creado_en ?? Date.now(),
      actualizado_en: Date.now(),
    };
    await onGuardar(entrenamiento);
    setGuardando(false);
  }

  function addInstruccion() { setInst(prev => [...prev, '']); }
  function setInstruccion(i: number, v: string) { setInst(prev => prev.map((p, j) => j === i ? v : p)); }
  function removeInstruccion(i: number) { setInst(prev => prev.filter((_, j) => j !== i)); }
  function addMaterial() { if (matInput.trim()) { setMaterial(prev => [...prev, matInput.trim()]); setMatInput(''); } }

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      <div className="bg-quarte-azul text-white px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onCancelar}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-titulo font-bold">{inicial ? 'Editar' : 'Nuevo'} entrenamiento</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Título */}
        <div className="card flex flex-col gap-3">
          <input value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Título del ejercicio *" required
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-quarte-azul
                       outline-none text-base font-titulo font-bold text-quarte-negro" />

          {/* Categoría */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS.map(c => (
              <button key={c} type="button" onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-titulo font-semibold capitalize transition-colors
                  ${categoria === c ? 'bg-quarte-rojo text-white' : 'bg-gray-100 text-gray-600'}`}>
                {c}
              </button>
            ))}
          </div>

        </div>

        {/* Métricas */}
        <div className="card grid grid-cols-3 gap-3">
          <div>
            <label className="font-titulo text-xs font-semibold text-gray-500 block mb-1">Duración (min)</label>
            <input type="number" value={duracion} min={5} max={120} onChange={e => setDuracion(+e.target.value)}
              className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 focus:border-quarte-azul outline-none text-sm text-center" />
          </div>
          <div>
            <label className="font-titulo text-xs font-semibold text-gray-500 block mb-1">Jug. mín.</label>
            <input type="number" value={jugMin} min={1} max={22} onChange={e => setJugMin(+e.target.value)}
              className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 focus:border-quarte-azul outline-none text-sm text-center" />
          </div>
          <div>
            <label className="font-titulo text-xs font-semibold text-gray-500 block mb-1">Jug. máx.</label>
            <input type="number" value={jugMax} min={1} max={22} onChange={e => setJugMax(+e.target.value)}
              className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 focus:border-quarte-azul outline-none text-sm text-center" />
          </div>
        </div>

        {/* Material */}
        <div className="card flex flex-col gap-2">
          <p className="font-titulo font-bold text-sm text-quarte-negro">Material</p>
          <div className="flex gap-2">
            <input value={matInput} onChange={e => setMatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } }}
              placeholder="Ej: conos, balones…"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-quarte-azul outline-none text-sm" />
            <button type="button" onClick={addMaterial}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-quarte-azul text-white">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {material.map(m => (
              <span key={m} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                {m}
                <button type="button" onClick={() => setMaterial(prev => prev.filter(p => p !== m))}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div className="card">
          <p className="font-titulo font-bold text-sm text-quarte-negro mb-2">Descripción</p>
          <textarea value={descripcion} onChange={e => setDesc(e.target.value)} rows={3}
            placeholder="Describe el ejercicio brevemente…"
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-quarte-azul
                       outline-none text-sm font-cuerpo resize-none" />
        </div>

        {/* Instrucciones */}
        <div className="card flex flex-col gap-2">
          <p className="font-titulo font-bold text-sm text-quarte-negro">Pasos</p>
          {instrucciones.map((inst, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="w-6 h-6 mt-2 rounded-full bg-quarte-azul text-white text-xs font-titulo
                               font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
              <textarea value={inst} onChange={e => setInstruccion(i, e.target.value)} rows={2}
                placeholder={`Paso ${i+1}…`}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-quarte-azul
                           outline-none text-sm font-cuerpo resize-none" />
              {instrucciones.length > 1 && (
                <button type="button" onClick={() => removeInstruccion(i)}
                  className="w-7 h-7 mt-2 flex items-center justify-center rounded-lg bg-red-50 text-quarte-rojo">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInstruccion}
            className="flex items-center gap-2 text-quarte-azul text-sm font-titulo font-semibold hover:underline">
            <Plus size={14} /> Añadir paso
          </button>
        </div>

        {/* Fotos */}
        <div className="card flex flex-col gap-2">
          <p className="font-titulo font-bold text-sm text-quarte-negro">Fotos ({fotos.length}/4)</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {fotos.map((f, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img src={f} alt="" className="w-20 h-20 object-cover rounded-xl" />
                <button type="button" onClick={() => setFotos(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-quarte-rojo rounded-full text-white
                             flex items-center justify-center text-xs">×</button>
              </div>
            ))}
            {fotos.length < 4 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300
                           flex flex-col items-center justify-center gap-1 text-gray-400 flex-shrink-0">
                <Camera size={20} />
                <span className="text-[10px]">Añadir</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFotos} />
        </div>

        {/* Pizarra */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-titulo font-bold text-sm text-quarte-negro">Pizarra táctica</p>
            <div className="flex bg-white rounded-lg overflow-hidden border border-gray-200">
              {(['F7','F11'] as FormatoPartido[]).map(f => (
                <button key={f} type="button" onClick={() => setFmt(f)}
                  className={`px-3 py-1.5 text-xs font-titulo font-bold transition-colors
                    ${fmt === f ? 'bg-quarte-azul text-white' : 'text-gray-500'}`}>{f}</button>
              ))}
            </div>
          </div>
          <PitchBoard ref={pizarraRef} formato={fmt} initialData={pizarra}
            onChange={setPizarra} />
        </div>

        {/* Sugerido (solo admins/coordinadores) */}
        {canSugerir && (
          <div className="flex items-center gap-3 card">
            <input type="checkbox" id="sugerido" checked={sugerido}
              onChange={e => setSugerido(e.target.checked)}
              className="w-5 h-5 rounded accent-quarte-azul cursor-pointer" />
            <label htmlFor="sugerido" className="font-titulo font-semibold text-sm cursor-pointer">
              ⭐ Marcar como ejercicio sugerido por el club
            </label>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={guardando}
          className="btn-primario w-full flex items-center justify-center gap-2 sticky bottom-4">
          {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Publicar ejercicio'}
        </button>
      </form>
    </div>
  );
}
