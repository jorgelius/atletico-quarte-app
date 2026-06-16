-- ============================================================
-- Seed: 10 tácticas reales UEFA Pro — CD Atlético Quarte
-- Ejecutar en el panel SQL de Supabase (una sola vez)
-- Es seguro correrlo varias veces (ON CONFLICT DO NOTHING).
-- ============================================================

INSERT INTO tactics (
  id, coach_id, nombre, tipo, formato,
  descripcion, instrucciones, fotos_b64,
  pizarra_data, es_sugerido, es_publico,
  creado_en, actualizado_en
) VALUES

(
  'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000000',
  'Presión alta en 4-3-3', 'presion', 'F11',
  'Sistema de presión colectiva en bloque alto, popularizado por Klopp en Liverpool y Guardiola en Barcelona. Los tres delanteros orientan la presión hacia uno de los centrales rivales, los medios cortan las líneas de pase al pivote y los laterales anticipan a los extremos rivales. El objetivo es provocar el error o el pase largo en los primeros 6 segundos tras la posesión rival.',
  '["El delantero centro orienta el press cerrando el pase al central contrario sin exponerse al 1v1.", "Los extremos cubren los laterales rivales antes de que reciban el balón.", "Los mediocampistas anticipan la línea de pase al pivote rival cortando el espacio interior.", "La línea defensiva sube para achicar espacio y activar el fuera de juego colectivo.", "Si no se recupera en 6 segundos, repliegue organizado al bloque medio sin perder forma."]',
  '[]',
  null, true, true,
  1749254400000, 1749254400000
),

(
  'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000000',
  'Salida de balón desde el portero en 4-2-3-1', 'salida_balon', 'F11',
  'Sistema de construcción desde atrás con el portero como primer jugador de campo. El doble pivote ofrece dos opciones de salida a los centrales. Si el rival presiona, el lateral libre recibe en profundidad y el mediapunta cae a recibir de cara. La idea es superar la primera línea de presión rival con combinaciones cortas antes de abrir el juego hacia las bandas.',
  '["Los centrales se abren para crear ángulos de pase cómodos al portero.", "El pivote del lado del balón cae a recibir entre líneas liberando el carril al lateral.", "El lateral contrario sube en carrera cuando el central tiene el balón sin presión.", "El mediapunta cae a recibir de espaldas al rival e intenta girarse al primer toque.", "Si hay presión extrema, el portero lanza largo al delantero para perder la presión y resetear."]',
  '[]',
  null, true, true,
  1749340800000, 1749340800000
),

(
  'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000000',
  'Trampa de presión orientando al lateral', 'presion', 'F11',
  'Variante del pressing organizado donde el equipo NO presiona de frente sino que cierra el pase al centro, forzando deliberadamente el balón hacia el lateral del campo. Una vez el lateral rival recibe en la banda, el mediocampista de ese lado cierra, el lateral propio pisa y el delantero corta el pase interior. El rival queda atrapado en la cal sin opciones de salida.',
  '["El delantero cierra el pase al central contrario sin presionar frontalmente (solo orienta).", "El mediocampista del lado contrario cierra la línea de pase al centro antes de que llegue el balón.", "En el momento del pase al lateral rival, el mediocampista propio lanza el press a fondo.", "El lateral propio sube para cerrar el espacio detrás del mediocampista y evitar el pase a la espalda.", "El mediocampista del lado opuesto cubre el pase interior completando la trampa de 3 jugadores."]',
  '[]',
  null, true, true,
  1749427200000, 1749427200000
),

(
  'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000000',
  'Bloque bajo replegado y compacto', 'sistema', 'F11',
  'Sistema defensivo de repliegue profundo en 4-4-2 con las dos líneas (media y defensiva) muy juntas entre sí, dejando solo al doble pivote fuera del área propia. El espacio entre líneas no supera los 10 metros. El bloque bascule lateralmente con cada cambio de juego rival y solo un delantero sale a presionar en el momento en que el rival levanta la cabeza.',
  '["Las dos líneas de cuatro se mantienen a menos de 10 metros entre sí en todo momento.", "Los dos delanteros no presionan a la vez: uno activa, el otro observa y cubre el retorno.", "La línea de mediocampo no supera la línea del área grande propia durante el repliegue.", "Al cambio de juego lateral, todo el bloque bascule en conjunto en menos de 3 segundos.", "El defensa más alejado del balón cierra el carril central, nunca persigue al extremo rival."]',
  '[]',
  null, true, true,
  1749513600000, 1749513600000
),

(
  'b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000000',
  'Contraataque / transición defensa-ataque tras robo', 'transicion', 'F11',
  'La transición ofensiva es el momento más peligroso y el más difícil de defender en el fútbol moderno. Tras recuperar el balón en el mediocampo, el equipo tiene una ventana de 3-4 segundos donde el rival está desorganizado. El pivote juega rápido al extremo más adelantado, los delanteros hacen carreras en profundidad por los canales y el objetivo es llegar al área rival en 3 pases o menos.',
  '["El jugador que recupera mira hacia delante antes de controlar para identificar la opción más vertical.", "El primer pase debe ser hacia el jugador más avanzado en el carril libre, sin dudar.", "Los extremos abren en profundidad por las bandas para estirar la defensa rival.", "El delantero centro busca el carril entre los dos centrales rivales que corren hacia atrás.", "No se retiene el balón más de 2 toques en la transición: velocidad de circulación máxima."]',
  '[]',
  null, true, true,
  1749600000000, 1749600000000
),

(
  'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000000',
  'Ataque posicional con superioridades (juego de posición)', 'sistema', 'F11',
  'El juego de posición busca crear superioridades numéricas locales en zonas estratégicas del campo mediante la circulación rápida de balón y el movimiento sin balón. El equipo se organiza en cinco carriles verticales y tres líneas horizontales. El objetivo es atraer la presión rival hacia un lado para crear el 3v2 o 2v1 en el lado contrario o por la espalda de las líneas rivales.',
  '["El balón circula rápido para mover el bloque rival y abrir espacios entre líneas.", "Siempre debe haber un jugador situado entre las líneas rivales para recibir girado.", "El lateral del lado del balón sube a dar amplitud cuando el extremo se cierra al interior.", "El pivote ofrece como opción de seguridad (retorno) en cada posesión para mantener el control.", "El cambio de orientación al lado contrario es la señal que activa el ataque decisivo."]',
  '[]',
  null, true, true,
  1749686400000, 1749686400000
),

(
  'b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000000',
  'Presión tras pérdida (gegenpressing) en 5 segundos', 'presion', 'F11',
  'El gegenpressing es el concepto más identificativo del estilo de Jürgen Klopp. En los 3-5 segundos posteriores a la pérdida del balón, los jugadores más cercanos presionan de forma coordinada antes de que el rival pueda organizar el juego. La clave es que el jugador que pierde el balón es el primero en presionar, y los dos jugadores más cercanos cierran inmediatamente las líneas de pase del receptor.',
  '["El jugador que pierde el balón reacciona en menos de 1 segundo y presiona al receptor sin esperar.", "Los dos jugadores más cercanos cierran las líneas de pase del receptor de forma inmediata.", "Los jugadores más alejados NO persiguen; se reposicionan para controlar el segundo balón.", "Si no se recupera en 5 segundos, repliegue organizado al bloque medio sin correr alocadamente.", "Prohibido dar el pase largo: el equipo que pierde debe presionar, no escapar."]',
  '[]',
  null, true, true,
  1749772800000, 1749772800000
),

(
  'b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000000',
  'Basculación defensiva del bloque', 'sistema', 'F11',
  'La basculación es el movimiento colectivo del bloque defensivo hacia el lado donde está el balón. Cuando el rival cambia el juego hacia la banda contraria, todo el bloque se desplaza lateralmente de forma coordinada en menos de 3 segundos. El defensa más alejado del balón no persigue al extremo contrario: cierra el carril central. Los dos delanteros se mantienen escalonados para presionar la salida de balón.',
  '["Al cambio de juego rival, el bloque se desplaza completo hacia el nuevo lado del balón.", "El lateral del lado del balón cierra al extremo rival sin dejar la línea de fondo libre.", "El central más alejado del balón centra su posición para cortar el diagonal interior.", "La línea de medios y la de defensas se mueven siempre juntas, sin separarse más de 10 m.", "Los delanteros orientan la basculación presionando ligeramente al portador y no al defensa."]',
  '[]',
  null, true, true,
  1749859200000, 1749859200000
),

(
  'b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000000',
  'Córner ofensivo con bloqueos', 'balon_parado', 'F11',
  'Jugada de balón parado en córner con bloqueos coordinados aplicados al fútbol. Dos jugadores realizan pantallas sobre los marcadores de los delanteros que van a rematar, liberándolos en el punto de primer palo y segundo palo. El tercer delantero espera fuera del área por si el portero rechaza. El ejecutor del córner elige entre el primer palo y el segundo palo según el movimiento del portero rival.',
  '["Los bloqueadores se colocan pegados al defensa rival justo antes del saque del córner.", "El movimiento de los rematadores debe iniciarse en el momento exacto en que el ejecutor toca el balón.", "El rematador de primer palo hace un movimiento previo hacia dentro antes de romper al palo.", "El rematador de segundo palo cruza por detrás de los bloqueadores para desmarcar al rival.", "El ejecutor siempre tiene dos opciones claras: el primer palo directo o el segundo palo bombeado."]',
  '[]',
  null, true, true,
  1749945600000, 1749945600000
),

(
  'b0000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000000',
  'Falta lateral ofensiva al área', 'balon_parado', 'F11',
  'Jugada ensayada de falta lateral desde la banda ofensiva. El ejecutor centra al primer palo donde un delantero realiza un desmarque en curva. Un segundo delantero busca el segundo palo y un mediocampista se coloca en el punto de penalti para el segundo balón o el rechace del portero. Un cuarto jugador hace pantalla sobre el defensa del primer palo.',
  '["El rematador de primer palo realiza un movimiento previo hacia atrás antes de romper al palo.", "El bloqueador se coloca entre el rematador de primer palo y su marcador rival antes del saque.", "El rematador de segundo palo cruza en diagonal para dificultar el marcaje individual.", "El ejecutor centra con efecto hacia la portería (in-swinger) buscando el primer palo.", "El jugador del punto de penalti espera fuera del área el rechace del portero sin entrar antes de tiempo."]',
  '[]',
  null, true, true,
  1750032000000, 1750032000000
)

ON CONFLICT (id) DO NOTHING;
