// ============================================================
// Edge Function: parse-clasificacion
// Deno runtime — llama a la API de Anthropic para convertir
// texto copiado de una web de federación en JSON estructurado.
//
// Deploy:
//   supabase functions deploy parse-clasificacion
// Secrets:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres un experto en fútbol español. Extraes tablas de clasificación de textos copiados de webs de federaciones de fútbol española.

INSTRUCCIONES:
- Detecta cada equipo y sus estadísticas: posición (pos), nombre del equipo, partidos jugados (pj), ganados (pg), empatados (pe), perdidos (pp), goles a favor (gf), goles en contra (gc) y puntos (pts).
- Si el nombre del equipo contiene "Quarte", "Atlético Quarte", "C.D. Quarte", "CD Quarte", "CF Quarte" o similar, establece esNuestroEquipo: true.
- Devuelve ÚNICAMENTE un JSON array válido, sin texto adicional, sin bloques de código, sin explicaciones.

Formato exacto del array:
[{"posicion":1,"equipo":"Nombre equipo","pj":15,"pg":10,"pe":3,"pp":2,"gf":35,"gc":15,"pts":33,"esNuestroEquipo":false}]`;

function buildPrompt(text: string): string {
  return `Extrae la tabla de clasificación del siguiente texto y devuelve el JSON array:\n\n${text}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'El campo "text" es obligatorio y no puede estar vacío.' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } },
      );
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada en los secrets de Supabase.' }),
        { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
      );
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
        messages: [{ role: 'user', content: buildPrompt(text) }],
      }),
    });

    if (!anthropicRes.ok) {
      const errData = await anthropicRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${anthropicRes.status}`, detail: errData }),
        { status: 502, headers: { ...corsHeaders, 'content-type': 'application/json' } },
      );
    }

    const data = await anthropicRes.json();
    const rawText: string = data?.content?.[0]?.text ?? '';

    // Extrae el primer JSON array del texto de respuesta
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'La IA no devolvió un JSON array válido.', raw: rawText }),
        { status: 422, headers: { ...corsHeaders, 'content-type': 'application/json' } },
      );
    }

    const rows = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ rows }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  }
});
