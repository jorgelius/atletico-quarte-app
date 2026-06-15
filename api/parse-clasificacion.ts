// ============================================================
// Vercel Edge Function — parse-clasificacion
// Recibe texto en bruto y devuelve la clasificación en JSON.
// La clave de Anthropic vive en las variables de entorno de
// Vercel (nunca se expone al navegador).
// ============================================================

export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Eres un experto en fútbol español. Extraes tablas de clasificación de textos copiados de webs de federaciones de fútbol española.

INSTRUCCIONES:
- Detecta cada equipo y sus estadísticas: posición, nombre del equipo, partidos jugados (pj), ganados (pg), empatados (pe), perdidos (pp), goles a favor (gf), goles en contra (gc) y puntos (pts).
- Si el nombre del equipo contiene "Quarte", "Atlético Quarte", "C.D. Quarte", "CD Quarte" o similar, establece esNuestroEquipo: true.
- Devuelve ÚNICAMENTE un JSON array válido, sin texto adicional, sin bloques de código, sin explicaciones.

Formato exacto:
[{"posicion":1,"equipo":"Nombre equipo","pj":15,"pg":10,"pe":3,"pp":2,"gf":35,"gc":15,"pts":33,"esNuestroEquipo":false}]`;

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }

  try {
    const { text } = await req.json() as { text: string };

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'El campo "text" no puede estar vacío.' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada en Vercel.' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Extrae la tabla de clasificación del siguiente texto:\n\n${text}` }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json().catch(() => ({})) as Record<string, unknown>;
      return new Response(JSON.stringify({ error: `Error de Anthropic: ${anthropicRes.status}`, detail: err }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const data = await anthropicRes.json() as { content: { text: string }[] };
    const rawText = data?.content?.[0]?.text ?? '';

    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'La IA no devolvió un JSON válido.', raw: rawText }), {
        status: 422,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const rows = JSON.parse(jsonMatch[0]) as unknown[];
    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
}
