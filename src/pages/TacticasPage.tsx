// ============================================================
// TacticasPage — Fase 5 (reutiliza PitchBoard)
// ============================================================
import { useEffect, useState, useRef } from 'react';
import {
  LayoutGrid, Plus, Star, ArrowLeft,
  Edit2, Trash2, Save, Loader2, Camera, BookOpen, ThumbsUp, User,
} from 'lucide-react';
import { usePerfilStore } from '@/stores/perfilStore';
import { useTacticasStore } from '@/stores/tacticasStore';
import { getFormatoEquipo } from '@/data/equipos';
import PitchBoard, { type PitchBoardHandle } from '@/components/pizarra/PitchBoard';
import type { Tactica, TipoTactica, FormatoPartido } from '@/types';

type Tab  = 'todo' | 'sugeridos' | 'favoritos' | 'mios';
type View = { mode: 'list' } | { mode: 'detail'; id: string } | { mode: 'form'; item?: Tactica };

const TIPOS: TipoTactica[] = ['sistema','balon_parado','presion','salida_balon','transicion','otros'];
const COLOR_TIPO: Record<string, string> = {
  sistema:       'bg-blue-100 text-blue-700',
  balon_parado:  'bg-yellow-100 text-yellow-700',
  presion:       'bg-red-100 text-red-700',
  salida_balon:  'bg-green-100 text-green-700',
  transicion:    'bg-purple-100 text-purple-700',
  otros:         'bg-gray-100 text-gray-600',
};

function fileAB64(f: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });
}

// ── Formulario de táctica ────────────────────────────────────
function TacticaForm({ inicial, authorId, canSugerir, formatoForzado, onGuardar, onCancelar }: {
  inicial?: Tactica; authorId: string; canSugerir: boolean; formatoForzado: FormatoPartido;
  onGuardar: (t: Tactica) => Promise<void>; onCancelar: () => void;
}) {
  const [titulo,    setTitulo]   = useState(inicial?.titulo ?? '');
  const [tipo,      setTipo]     = useState<TipoTactica>(inicial?.tipo ?? 'sistema');
  const [fmt] = useState<FormatoPartido>(inicial?.formato ?? formatoForzado);
  const [desc,      setDesc]     = useState(inicial?.descripcion ?? '');
  const [insts,     setInsts]    = useState<string[]>(inicial?.instrucciones ?? ['']);
  const [fotos,     setFotos]    = useState<string[]>(inicial?.fotos_b64 ?? []);
  const [sugerido,  setSugerido] = useState(inicial?.es_sugerido ?? false);
  const [guardando, setGuardando] = useState(false);
  const pizarraRef = useRef<PitchBoardHandle>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  async function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const b64s = await Promise.all(Array.from(e.target.files ?? []).slice(0, 3).map(fileAB64));
    setFotos(prev => [...prev, ...b64s].slice(0, 3));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setGuardando(true);
    const t: Tactica = {
      id: inicial?.id ?? crypto.randomUUID(), author_id: authorId,
      titulo: titulo.trim(), tipo, formato: fmt, descripcion: desc,
      instrucciones: insts.filter(i => i.trim()), fotos_b64: fotos,
      pizarra_data: pizarraRef.current?.getJSON() ?? inicial?.pizarra_data,
      es_sugerido: canSugerir ? sugerido : (inicial?.es_sugerido ?? false),
      creado_en: inicial?.creado_en ?? Date.now(), actualizado_en: Date.now(),
    };
    await onGuardar(t);
    setGuardando(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      <div className="bg-quarte-verde text-white px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onCancelar} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-titulo font-bold">{inicial ? 'Editar' : 'Nueva'} táctica</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        <div className="card flex flex-col gap-3">
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título *" required
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-quarte-verde
                       outline-none text-base font-titulo font-bold" />
          <div className="flex flex-wrap gap-1.5">
            {TIPOS.map(t => (
              <button key={t} type="button" onClick={() => setTipo(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-titulo font-semibold capitalize transition-colors
                  ${tipo === t ? 'bg-quarte-verde text-white' : 'bg-gray-100 text-gray-600'}`}>
                {t.replace('_',' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center px-4 py-2 bg-quarte-verde text-white rounded-xl w-fit">
            <span className="text-sm font-titulo font-bold">{fmt}</span>
          </div>
        </div>

        <div className="card">
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
            placeholder="Descripción del sistema o jugada…"
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-quarte-verde
                       outline-none text-sm font-cuerpo resize-none" />
        </div>

        {/* Instrucciones */}
        <div className="card flex flex-col gap-2">
          <p className="font-titulo font-bold text-sm">Instrucciones de ejecución</p>
          {insts.map((inst, i) => (
            <div key={i} className="flex gap-2">
              <span className="w-6 h-6 mt-2 rounded-full bg-quarte-verde text-white text-xs font-titulo font-bold
                               flex items-center justify-center flex-shrink-0">{i+1}</span>
              <textarea value={inst} onChange={e => setInsts(prev => prev.map((p, j) => j === i ? e.target.value : p))}
                rows={2} placeholder={`Instrucción ${i+1}…`}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-quarte-verde
                           outline-none text-sm font-cuerpo resize-none" />
              {insts.length > 1 && (
                <button type="button" onClick={() => setInsts(prev => prev.filter((_,j) => j !== i))}
                  className="w-7 h-7 mt-2 flex items-center justify-center rounded-lg bg-red-50 text-quarte-rojo">
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setInsts(prev => [...prev, ''])}
            className="flex items-center gap-1.5 text-quarte-verde text-sm font-titulo font-semibold hover:underline">
            <Plus size={14} /> Añadir paso
          </button>
        </div>

        {/* Fotos */}
        <div className="card flex gap-2 items-center">
          {fotos.map((f, i) => (
            <div key={i} className="relative">
              <img src={f} alt="" className="w-20 h-20 object-cover rounded-xl" />
              <button type="button" onClick={() => setFotos(p => p.filter((_,j) => j !== i))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-quarte-rojo rounded-full text-white flex items-center justify-center text-xs">×</button>
            </div>
          ))}
          {fotos.length < 3 && (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
              <Camera size={20} /><span className="text-[10px] mt-1">Foto</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFotos} />
        </div>

        {/* Pizarra */}
        <div>
          <p className="font-titulo font-bold text-sm text-quarte-negro mb-2">Pizarra animada</p>
          <PitchBoard ref={pizarraRef} formato={fmt} initialData={inicial?.pizarra_data} />
        </div>

        {canSugerir && (
          <div className="flex items-center gap-3 card">
            <input type="checkbox" id="sug-tac" checked={sugerido} onChange={e => setSugerido(e.target.checked)}
              className="w-5 h-5 rounded accent-quarte-verde cursor-pointer" />
            <label htmlFor="sug-tac" className="font-titulo font-semibold text-sm cursor-pointer">
              ⭐ Marcar como táctica sugerida por el club
            </label>
          </div>
        )}

        <button type="submit" disabled={guardando}
          className="btn-touch bg-quarte-verde text-white w-full flex items-center justify-center gap-2 sticky bottom-4 shadow-md">
          {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Publicar táctica'}
        </button>
      </form>
    </div>
  );
}

// ── Detalle de táctica ───────────────────────────────────────
function TacticaDetalle({ item, isFav, canEdit, onBack, onToggleFav, onEdit, onBorrar }: {
  item: Tactica; isFav: boolean; canEdit: boolean;
  onBack: () => void; onToggleFav: () => void;
  onEdit: () => void; onBorrar: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      <div className="bg-quarte-verde text-white px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-titulo font-bold text-base line-clamp-1">{item.titulo}</h1>
          <p className="text-green-200 text-xs capitalize">{item.tipo.replace('_',' ')} · {item.formato}</p>
        </div>
        <button onClick={onToggleFav} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10">
          <Star size={18} fill={isFav ? '#F59E0B' : 'none'} stroke={isFav ? '#F59E0B' : 'white'} />
        </button>
        {canEdit && (
          <>
            <button onClick={onEdit} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10"><Edit2 size={16} /></button>
            <button onClick={onBorrar} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/30"><Trash2 size={16} /></button>
          </>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {item.fotos_b64.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {item.fotos_b64.map((f, i) => <img key={i} src={f} alt="" className="h-36 rounded-xl object-cover flex-shrink-0" />)}
          </div>
        )}
        {item.descripcion && (
          <div className="card"><p className="text-sm text-gray-700 font-cuerpo leading-relaxed">{item.descripcion}</p></div>
        )}
        {item.instrucciones.length > 0 && (
          <div className="card">
            <p className="font-titulo font-bold text-sm mb-3">Ejecución</p>
            <ol className="flex flex-col gap-3">
              {item.instrucciones.map((inst, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-quarte-verde text-white text-xs font-titulo font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <p className="text-sm text-gray-700 font-cuerpo">{inst}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
        {item.pizarra_data && (
          <div>
            <p className="font-titulo font-bold text-sm text-quarte-negro mb-2">Pizarra</p>
            <PitchBoard formato={item.formato} readOnly initialData={item.pizarra_data} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────
export default function TacticasPage() {
  const { perfil, activeTeamId } = usePerfilStore();
  const store      = useTacticasStore();
  const [tab,  setTab]  = useState<Tab>('todo');
  const [view, setView] = useState<View>({ mode: 'list' });

  useEffect(() => {
    if (activeTeamId) store.cargar(activeTeamId);
  }, [activeTeamId]);

  if (!perfil) return null;
  const canSugerir = perfil.rol === 'admin' || perfil.rol === 'coordinador';
  const teamId = activeTeamId ?? '';
  const formatoEquipo = getFormatoEquipo(teamId);

  const filtered = (() => {
    let base = store.items.filter(t => t.formato === formatoEquipo);
    if (tab === 'sugeridos') base = base.filter(t => t.es_sugerido);
    if (tab === 'favoritos') base = base.filter(t => store.isFav(t.id));
    if (tab === 'mios')      base = base.filter(t => t.author_id === teamId);
    return base.sort((a, b) => b.creado_en - a.creado_en);
  })();

  if (view.mode === 'detail') {
    const item = store.items.find(t => t.id === (view as { mode:'detail'; id:string }).id);
    if (!item) { setView({ mode: 'list' }); return null; }
    return <TacticaDetalle item={item} isFav={store.isFav(item.id)} canEdit={item.author_id === teamId || canSugerir}
      onBack={() => setView({ mode:'list' })} onToggleFav={() => store.toggleFav(perfil.id, item.id)}
      onEdit={() => setView({ mode:'form', item })}
      onBorrar={async () => { await store.borrar(item.id, teamId); setView({ mode:'list' }); }} />;
  }

  if (view.mode === 'form') {
    const fi = (view as { mode:'form'; item?: Tactica }).item;
    return <TacticaForm inicial={fi} authorId={teamId} canSugerir={canSugerir} formatoForzado={formatoEquipo}
      onGuardar={async t => { await store.guardar(t); setView({ mode:'list' }); }}
      onCancelar={() => setView({ mode:'list' })} />;
  }

  const tabs = [
    { id: 'todo',      icon: <BookOpen size={14}/>,  label: 'Todo' },
    { id: 'sugeridos', icon: <ThumbsUp size={14}/>,  label: 'Club' },
    { id: 'favoritos', icon: <Star size={14}/>,       label: 'Favs' },
    { id: 'mios',      icon: <User size={14}/>,       label: 'Míos' },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-quarte-gris">
      <div className="bg-quarte-verde text-white px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 pb-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <LayoutGrid size={20} />
          </div>
          <div className="flex-1">
            <h1 className="font-titulo text-lg font-bold">Tácticas</h1>
            <p className="text-green-200 text-xs">{store.items.length} tácticas disponibles</p>
          </div>
          <button onClick={() => setView({ mode:'form' })}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-titulo
                          font-semibold border-b-2 transition-colors
                          ${tab === t.id ? 'text-white border-white' : 'text-green-300 border-transparent'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
            <LayoutGrid size={48} className="opacity-20" />
            <p className="font-titulo font-semibold">Sin tácticas aquí</p>
            <p className="text-sm text-center">Crea la primera pulsando +</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(item => (
              <button key={item.id} onClick={() => setView({ mode:'detail', id: item.id })}
                className="card text-left flex items-start gap-3 active:scale-[0.98] transition-transform w-full">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-titulo font-bold capitalize
                                      ${COLOR_TIPO[item.tipo] ?? COLOR_TIPO.otros}`}>
                      {item.tipo.replace('_',' ')}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-titulo font-bold">
                      {item.formato}
                    </span>
                    {item.es_sugerido && <span className="text-[10px] bg-quarte-azulClaro text-quarte-azul px-2 py-0.5 rounded-full font-titulo font-bold">⭐</span>}
                  </div>
                  <p className="font-titulo font-bold text-sm text-quarte-negro line-clamp-2">{item.titulo}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); store.toggleFav(perfil!.id, item.id); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-yellow-50 flex-shrink-0">
                  <Star size={16} fill={store.isFav(item.id) ? '#F59E0B' : 'none'} stroke={store.isFav(item.id) ? '#F59E0B' : '#9CA3AF'} />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
