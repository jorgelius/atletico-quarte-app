-- ============================================================
-- Seed: 32 ejercicios de entrenamiento — CD Atlético Quarte
-- Ejecutar en el panel SQL de Supabase (una sola vez)
-- Es seguro correrlo varias veces (ON CONFLICT DO NOTHING).
-- ============================================================

INSERT INTO trainings (
  id, coach_id, nombre, categoria, nivel,
  duracion_min, num_jugadores_min, num_jugadores_max,
  material, descripcion, instrucciones,
  fotos_b64, pizarra_data, es_sugerido, es_publico,
  creado_en, actualizado_en
) VALUES

-- ── Ejercicios originales ─────────────────────────────────────

(
  '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000000',
  'Rondo 3 contra 1 — Posesión básica', 'posesion', 'benjamin',
  15, 5, 8,
  '["Balones (2)", "Conos (8)"]',
  'Ejercicio clásico de posesión en espacio reducido. Tres jugadores forman un triángulo y deben mantener la pelota ante un defensor central. Trabaja el juego de uno-dos, el primer toque y la orientación del cuerpo.',
  '["Delimita un cuadrado de 8×8 m con conos.", "Coloca 3 jugadores en los vértices y 1 defensor en el centro.", "El grupo de 3 debe dar 8 pases consecutivos sin perder el balón.", "Cuando el defensor roba, él y el jugador que perdió el balón intercambian roles.", "Progresión: reduce el espacio a 6×6 m o añade un segundo defensor."]',
  '[]', null, true, true,
  1749254400000, 1749254400000
),
(
  '00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000000',
  'Conducción + cambio de ritmo', 'fisico', 'prebenjamin',
  12, 4, 10,
  '["Balones (1 por jugador)", "Conos (10)", "Picas (4)"]',
  'Circuito de conducción con cambios de ritmo para trabajar la habilidad técnica individual y la velocidad. Ideal para calentamiento o bloque técnico al inicio del entrenamiento.',
  '["Monta un circuito en zigzag con 5 conos separados 1,5 m entre sí.", "Al llegar al final del zigzag, conducción rápida 10 m hasta el siguiente cono.", "Regreso al punto de partida trotando con el balón.", "Cada jugador realiza 4 repeticiones.", "Competición: la mitad de la fila contra la otra mitad para motivar."]',
  '[]', null, true, true,
  1749340800000, 1749340800000
),
(
  '00000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000000',
  'Presión alta tras pérdida de balón', 'defensa', 'infantil',
  25, 10, 16,
  '["Balones (2)", "Petos (2 colores)", "Conos (12)"]',
  'Trabajo de presión colectiva inmediata tras perder el balón. Se entrena el concepto de pressing coordinado: los 3-4 jugadores más cercanos al balón cierran los espacios de forma sincronizada.',
  '["Divide el grupo en dos equipos de 6-8 jugadores. Un equipo ataca, el otro defiende en bloque bajo.", "Cuando el equipo atacante pierde el balón, los 3 jugadores más cercanos ejecutan pressing inmediato en menos de 3 segundos.", "El equipo que recupera el balón tiene 5 segundos para sacarlo de la zona de presión.", "Rotación cada 4 minutos para que todos pasen por el rol de presionador.", "Criterio de éxito: recuperar el balón en los primeros 6 segundos tras la pérdida."]',
  '[]', null, true, true,
  1749427200000, 1749427200000
),
(
  '00000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000000',
  'Combinación + remate a portería', 'finalizacion', 'alevin',
  20, 8, 14,
  '["Balones (4)", "Conos (6)", "Portería"]',
  'Ejercicio de finalización que combina circulación de balón y llegada al área. Trabaja el remate a la carrera, el control orientado y la definición bajo presión del portero.',
  '["Coloca dos filas de jugadores a 20 m de la portería a distintos ángulos.", "El jugador de la fila A pasa al jugador de la fila B que entra en profundidad.", "El receptor controla orientado, regatea el cono y remata a portería.", "Variante: añade un defensor pasivo que complica el control.", "Mínimo 3 remates por jugador. El portero trabaja 5 min y luego rota."]',
  '[]', null, true, true,
  1749513600000, 1749513600000
),

-- ── RONDOS Y POSESIÓN ─────────────────────────────────────────

(
  '00000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000000',
  'Rondo 4v2 — Posesión en espacio reducido', 'posesion', 'benjamin',
  15, 6, 8,
  '["Balones (3)", "Conos (8)"]',
  'El rondo 4v2 es el ejercicio de posesión más universalmente empleado. Cuatro jugadores en la periferia de un cuadrado de 10×10 m mantienen la posesión frente a dos defensores centrales. Desarrolla el primer toque, la orientación del cuerpo, los apoyos permanentes y la velocidad de decisión bajo presión. Intensidad alta.',
  '["Delimita un cuadrado de 10×10 m con 4 conos.", "Coloca 4 jugadores en las esquinas y 2 defensores en el interior.", "Los 4 exteriores mantienen posesión con máximo 2 toques; el que supera los toques entra a defender.", "Cuando un defensor roba, él sale y entra el jugador que perdió el balón.", "Variante A: reducir a 1 toque para infantil y superior.", "Variante B: ampliar el cuadrado a 12×12 m y añadir un comodín central para facilitar la salida."]',
  '[]', null, true, true,
  1741564800000, 1741564800000
),
(
  '00000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000000',
  'Rondo 5v2 — Juego de posición circular', 'posesion', 'alevin',
  15, 7, 9,
  '["Balones (2)", "Conos (6)"]',
  'Variante más compleja del rondo clásico. Cinco jugadores en la periferia de un espacio de 12×12 m mantienen el balón contra dos presionadores. La mayor cantidad de opciones de pase obliga a una lectura más rápida del juego y mejora los apoyos laterales y diagonales. Intensidad alta.',
  '["Delimita un espacio de 12×12 m con conos.", "Distribuye 5 jugadores en la periferia y coloca 2 defensores en el centro.", "El grupo exterior mantiene la posesión con máximo 2 toques.", "Objetivo: alcanzar 10 pases consecutivos para conseguir un punto.", "Si los defensores interceptan el balón, los dos últimos jugadores que tocaron el balón pasan a defender.", "Variante: añadir un 3er defensor para aumentar la presión en categorías superiores."]',
  '[]', null, true, true,
  1741996800000, 1741996800000
),
(
  '00000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000000',
  'Rondo 3 colores — Posesión con equipo presionador rotativo', 'posesion', 'infantil',
  20, 9, 12,
  '["Balones (2)", "Petos de 3 colores distintos", "Conos (8)"]',
  'Ejercicio de posesión con tres equipos diferenciados. Dos equipos combinan juntos y uno presiona. Cuando el equipo presionador roba, el equipo que perdió el balón pasa a presionar. Trabaja la lectura táctica, la orientación del pase y la transición inmediata. Espacio: 20×15 m. Intensidad media-alta.',
  '["Forma tres grupos de 3-4 jugadores con petos de colores distintos (rojo, azul y amarillo).", "Los equipos rojo y azul poseen juntos (6-8 jugadores) contra el equipo amarillo que presiona.", "Los atacantes deben dar 7 pases consecutivos sin que el equipo presionador toque el balón.", "Si el equipo presionador roba el balón, el equipo que lo perdió pasa a presionar.", "Ningún jugador puede dar más de 2 toques consecutivos.", "Si el balón sale de los límites, el equipo que lo sacó pasa a defender.", "Variante: reducir el espacio a 15×12 m para aumentar la presión."]',
  '[]', null, true, true,
  1742428800000, 1742428800000
),
(
  '00000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000000',
  'Juego de posición posicional — Superioridad en zonas', 'posesion', 'infantil',
  25, 10, 14,
  '["Balones (3)", "Petos (2 colores)", "Conos (12)", "Porterías pequeñas (2)"]',
  'Ejercicio de juego de posición siguiendo el modelo posicional. El campo se divide en zonas y cada jugador tiene asignada su zona de responsabilidad. El objetivo es crear superioridad local mediante circulación de balón y movimiento sin balón. Espacio: 35×25 m. Intensidad media.',
  '["Divide el espacio de 35×25 m en 3 bandas horizontales (defensa, medio y ataque).", "Forma dos equipos de 5-7 jugadores. Cada jugador tiene asignada una zona preferente pero puede salir de ella.", "El equipo en posesión intenta combinar para generar una llegada a portería pequeña.", "Si el equipo defensor recupera el balón, tiene 5 segundos para cambiar al modo atacante.", "Penalización: si hay dos jugadores del mismo equipo en la misma zona sin el balón, se concede pase libre al rival.", "Variante: añadir 2 comodines exteriores que siempre apoyan al equipo en posesión."]',
  '[]', null, true, true,
  1742860800000, 1742860800000
),
(
  '00000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000000',
  'Posesión 6v6+3 comodines — Superioridad permanente', 'posesion', 'infantil',
  30, 15, 15,
  '["Balones (3)", "Petos (3 colores)", "Conos (12)"]',
  'Ejercicio de posesión en campo grande con superioridad permanente para el equipo atacante gracias a tres comodines neutrales. Los comodines siempre juegan a favor del equipo con posesión (9v6). Trabaja la circulación de balón, el cambio de juego y la superioridad numérica. Espacio: 40×30 m. Intensidad media.',
  '["Coloca dos equipos de 6 jugadores en un espacio de 40×30 m.", "Designa 3 jugadores como comodines (peto de tercer color) que siempre apoyan al equipo con posesión.", "El equipo en posesión debe dar un mínimo de 8 pases antes de intentar marcar en las porterías pequeñas.", "Si el equipo defensor recupera el balón, los comodines cambian automáticamente de bando.", "Los comodines tienen máximo 2 toques y no pueden marcar gol.", "Variante: reducir los comodines a 2 para aumentar la dificultad en fases avanzadas."]',
  '[]', null, true, true,
  1743292800000, 1743292800000
),
(
  '00000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000000',
  'Rueda de pases — Circulación y movilidad combinada', 'posesion', 'alevin',
  20, 8, 12,
  '["Balones (2)", "Conos (8)", "Picas (4)"]',
  'La rueda de pases es un ejercicio clásico de circulación de balón con movimiento constante. Los jugadores se disponen en círculo y combinan siguiendo patrones predeterminados, desplazándose al lugar del compañero tras cada pase. Trabaja el primer toque, la técnica de pase y la anticipación. Espacio: círculo de 15 m de diámetro. Intensidad baja-media.',
  '["Forma un círculo de 8-10 jugadores separados unos 5-6 m entre sí.", "El balón arranca desde el jugador A: A pasa a B y se desplaza a la posición de B.", "B recibe, pasa a C y se desplaza a la posición de C; el flujo continúa alrededor del círculo.", "Progresión 1: introducir un segundo balón que circula en sentido contrario.", "Progresión 2: el receptor debe controlar orientado de espaldas a la dirección del siguiente pase.", "Variante avanzada: cambiar el patrón a pasa uno salta uno."]',
  '[]', null, true, true,
  1743724800000, 1743724800000
),

-- ── PRESIÓN Y DEFENSA ─────────────────────────────────────────

(
  '00000000-0000-0000-0000-00000000000b', 'a0000000-0000-0000-0000-000000000000',
  'Pressing alto por zonas — Trampa coordinada', 'defensa', 'infantil',
  25, 12, 16,
  '["Balones (4)", "Petos (2 colores)", "Conos (16)"]',
  'Entrenamiento del pressing alto coordinado por zonas del campo. El equipo que defiende sube colectivamente a presionar en los primeros 30 m, buscando cortar las líneas de pase y forzar el error rival. Se trabaja la señal de activación del press, el cierre de líneas y el fuera de juego activo. Espacio: campo completo o 60×40 m. Intensidad alta.',
  '["Divide el campo en 3 zonas horizontales con conos (zona de pressing en los primeros 30 m).", "El equipo defensor (8 jugadores) parte en bloque alto y espera la señal del líder.", "Cuando el rival inicia desde el portero, el líder activa el press con voz Press.", "Los delanteros cierran las líneas de pase al portero y obligan a jugar en largo.", "Los centrocampistas anticipan recepciones y los defensas suben la línea para fuera de juego.", "Si no se recupera en 8 segundos, el equipo se retira al bloque medio.", "Variante: el portero rival tiene 4 segundos para sacar con los pies."]',
  '[]', null, true, true,
  1744156800000, 1744156800000
),
(
  '00000000-0000-0000-0000-00000000000c', 'a0000000-0000-0000-0000-000000000000',
  'Gegenpressing — Contrapresión inmediata tras pérdida', 'defensa', 'infantil',
  25, 12, 16,
  '["Balones (3)", "Petos (2 colores)", "Conos (12)"]',
  'Entrenamiento específico de la contrapresión inmediata popularizada por Jürgen Klopp. En los 3-5 segundos posteriores a la pérdida, los jugadores más cercanos presionan coordinadamente para recuperar antes de que el rival organice el juego. Espacio: 40×30 m. Intensidad muy alta.',
  '["Dos equipos de 6 jugadores en un espacio de 40×30 m con porterías pequeñas.", "El equipo con posesión juega en ataque; al perder, el entrenador cronometra 5 segundos.", "El equipo que perdió el balón presiona con los 3 jugadores más cercanos.", "Si se recupera en 5 segundos, suma 1 punto. Si no, el rival ataca libremente.", "Clave: los jugadores deben avanzar hacia el balón al perderlo, NO retroceder.", "Regla: el equipo en posesión NO puede lanzar largo para escapar de la presión.", "Variante: aumentar el espacio a 50×35 m."]',
  '[]', null, true, true,
  1744588800000, 1744588800000
),
(
  '00000000-0000-0000-0000-00000000000d', 'a0000000-0000-0000-0000-000000000000',
  'Bloque medio defensivo — Organización en 4-4-2', 'defensa', 'infantil',
  25, 14, 16,
  '["Balones (3)", "Petos (2 colores)", "Conos (10)"]',
  'Trabajo de organización defensiva en bloque medio. El equipo defensor se sitúa entre el mediocampo y el área propia, cortando los pases entre líneas y compactando el espacio. Trabaja la compacidad del bloque, la basculación lateral y el cierre del espacio interior. Espacio: 60×40 m semidefensivo. Intensidad media.',
  '["Coloca dos equipos de 7-8 jugadores en un campo de 60×40 m con porterías grandes.", "El equipo defensor parte en bloque 4-4-2 dentro de su mitad de campo.", "El equipo atacante (10 jugadores) intenta combinar para romper el bloque y conseguir gol.", "El equipo defensor no puede superar el mediocampo; debe mantenerse compacto entre líneas.", "Cuando el atacante juega a la banda, la línea defensiva y la media basculan hacia ese lado.", "Si el equipo defensor recupera, tiene 5 segundos para sacarlo por la línea del rival.", "Variante: el entrenador lanza balones al ataque para simular pérdidas aleatorias."]',
  '[]', null, true, true,
  1745020800000, 1745020800000
),
(
  '00000000-0000-0000-0000-00000000000e', 'a0000000-0000-0000-0000-000000000000',
  'Coberturas y permutas — Defensa coordinada en línea', 'defensa', 'alevin',
  20, 8, 12,
  '["Balones (2)", "Petos (2 colores)", "Conos (8)"]',
  'Ejercicio específico de cobertura defensiva y permuta de posiciones. Cuando un defensa es superado, el compañero más cercano cubre la posición y el superado permuta hacia dentro. Trabaja la comunicación, la lectura de la situación y la sinfonía defensiva. Espacio: 30×25 m. Intensidad media.',
  '["Coloca 4 defensores en línea frente a 3-4 atacantes en un espacio de 30×25 m.", "El ataque comienza con pase desde el entrenador. Los atacantes buscan superar a los defensores.", "Cuando un atacante supera a un defensa en 1v1, el defensa del lado cierra para cubrir.", "El defensa superado persigue y ocupa la posición del compañero que cubrió (permuta).", "Los defensas deben comunicarse: Cubro, Tuyo, Ayuda.", "Variante: añadir un 5º atacante que llega desde atrás para entrenar la cobertura del segundo palo."]',
  '[]', null, true, true,
  1745452800000, 1745452800000
),
(
  '00000000-0000-0000-0000-00000000000f', 'a0000000-0000-0000-0000-000000000000',
  '1v1 defensivo — Frenar, canalizar y robar', 'defensa', 'alevin',
  20, 6, 12,
  '["Balones (3)", "Conos (8)", "Portería"]',
  'Entrenamiento específico del duelo defensivo individual. El defensa debe frenar al atacante, canalizarlo hacia la banda y robarle el balón o hacerle perder tiempo hasta que llegue ayuda. Trabaja la postura defensiva, el temporizar y el momento del robo. Espacio: pasillo de 20×10 m. Intensidad alta.',
  '["Dos filas: una de atacantes con balón y una de defensores, ambas a 20 m de la portería.", "El atacante parte desde el punto de inicio y el defensa sale a defenderle en el pasillo.", "El defensa frena el avance y coloca el cuerpo en el carril interior para canalizar al exterior.", "No se permite la entrada a las piernas hasta que el atacante levante la cabeza.", "El ejercicio termina en gol del atacante, robo del defensa o balón fuera.", "Tras cada duelo, los jugadores van al final de la fila contraria.", "Variante: añadir un segundo defensa que llega tarde para entrenar la cobertura."]',
  '[]', null, true, true,
  1745884800000, 1745884800000
),
(
  '00000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000000',
  'Achique y basculación lateral — Bloque compacto', 'defensa', 'infantil',
  25, 10, 16,
  '["Balones (3)", "Petos (2 colores)", "Conos (12)"]',
  'Entrenamiento del achique (reducción de espacios cuando el rival avanza) y la basculación lateral coordinada (desplazamiento colectivo del bloque según el lado del balón). Trabaja la comunicación, la compacidad y los conceptos de profundidad y amplitud defensiva. Espacio: 50×35 m. Intensidad media.',
  '["Coloca el bloque defensor (7 jugadores: 4 atrás + 3 medios) en su mitad de campo frente a 6-8 atacantes.", "El entrenador dirige el balón hacia la banda derecha: todo el bloque bascule hacia ese lado.", "Cuando el balón cambia de lado, el bloque bascule completamente en menos de 3 segundos.", "Si los atacantes avanzan en profundidad, el bloque achica subiendo la línea defensiva.", "El defensa más alejado del balón debe cerrar el carril central, nunca quedarse estático.", "Variante: añadir porterías pequeñas en los extremos del lado rival."]',
  '[]', null, true, true,
  1746316800000, 1746316800000
),

-- ── TRANSICIONES ──────────────────────────────────────────────

(
  '00000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000000',
  'Transición D→A — Ataque veloz tras recuperación', 'ataque', 'infantil',
  25, 10, 14,
  '["Balones (4)", "Petos (2 colores)", "Conos (8)", "Porterías (2)"]',
  'Entrenamiento de la transición ofensiva inmediata tras la recuperación del balón. En cuanto el equipo recupera la posesión, pasa a modo ataque en los primeros 3 segundos buscando espacios entre líneas y superioridad numérica local. Espacio: campo completo o 60×40 m. Intensidad alta.',
  '["Forma dos equipos de 5-7 jugadores en campo completo con porteros.", "El equipo A ataca y el equipo B defiende. Cuando B recupera, el equipo A pasa a defender.", "Criterio de éxito: tras la recuperación, el equipo B debe llegar al área rival en menos de 6 segundos.", "Se prohíbe el pase largo inmediato a menos que haya un compañero libre en profundidad.", "El jugador que recupera el balón debe mirar hacia delante antes de controlar.", "Variante: tras la recuperación, el equipo tiene 1 jugador de superioridad durante 4 segundos."]',
  '[]', null, true, true,
  1746576000000, 1746576000000
),
(
  '00000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000000',
  'Transición A→D — Reacción defensiva inmediata tras pérdida', 'defensa', 'infantil',
  20, 10, 14,
  '["Balones (3)", "Petos (2 colores)", "Conos (10)"]',
  'Entrenamiento de la transición defensiva tras perder el balón. Los jugadores deben reconocer el instante de la pérdida y reaccionar: los más cercanos presionan y los de atrás reorganizan el bloque. Trabaja la velocidad de reacción y la disciplina táctica. Espacio: 50×35 m. Intensidad alta.',
  '["Dos equipos de 5-7 jugadores en un espacio de 50×35 m con porterías.", "El equipo A ataca con posesión. Cuando pierde el balón, debe reaccionar en menos de 3 segundos.", "Los 2-3 jugadores más cercanos al balón presionan inmediatamente. Los demás retroceden.", "El jugador que perdió el balón es el primero en presionar (responsabilidad del error).", "El equipo B tiene 6 segundos para avanzar hacia la portería rival antes de que el bloque se reorganice.", "Se puntúa: 1 punto por recuperar en menos de 3 segundos; 1 punto por gol.", "Variante: el entrenador introduce el balón al equipo B para simular pérdidas repentinas."]',
  '[]', null, true, true,
  1746835200000, 1746835200000
),
(
  '00000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000000',
  'Transiciones 4v4+porteros — Partido de transiciones', 'ataque', 'alevin',
  25, 10, 10,
  '["Balones (4)", "Petos (2 colores)", "Porterías (2)", "Conos (8)"]',
  'Partido reducido 4v4 con porteros diseñado para entrenar las transiciones ofensivas y defensivas en espacios comprimidos. Cada recuperación del balón debe convertirse inmediatamente en ataque. Espacio: 35×25 m. Intensidad alta. Ideal para desarrollar la velocidad de pensamiento en transición.',
  '["Forma dos equipos de 4 jugadores de campo más 1 portero por equipo en un campo de 35×25 m.", "El partido se juega con reglas normales pero sin regla de fuera de juego.", "Al recuperar el balón, el equipo tiene 4 segundos máximo para salir jugando hacia adelante.", "Penalización: si el equipo en posesión hace más de 5 pases sin avanzar, el balón pasa al rival.", "El portero puede participar en la construcción del juego (salida con los pies).", "Se juegan series de 4 minutos con 1 minuto de descanso entre series.", "Variante: reducir el espacio a 25×18 m para aumentar la intensidad de las transiciones."]',
  '[]', null, true, true,
  1747094400000, 1747094400000
),
(
  '00000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000000',
  'Ataque rápido tras recuperación — Verticalidad en 6 segundos', 'ataque', 'infantil',
  25, 10, 14,
  '["Balones (4)", "Petos (2 colores)", "Conos (8)", "Portería"]',
  'Entrenamiento del ataque rápido en verticalidad tras recuperar el balón en campo propio. El objetivo es llegar a portería rival en el mínimo de pases posibles (3-4 máximo) antes de que el rival recupere posiciones defensivas. Trabaja el pase en profundidad, el desdoblamiento y la llegada al área. Espacio: campo completo. Intensidad alta.',
  '["El equipo atacante (6 jugadores) parte desde la línea de mediocampo con el balón.", "El equipo rival (4-6 jugadores) parte desordenado en campo propio y debe reorganizarse.", "El equipo atacante tiene 6 segundos para llegar al área rival desde la recuperación.", "Se permiten máximo 3 pases antes del remate; si se superan, el balón pasa al rival.", "El jugador que recupera el balón tiene 2 segundos para decidir: conducir o dar el pase de profundidad.", "Variante: añadir un portero en la portería que defiende para dar realismo a la finalización."]',
  '[]', null, true, true,
  1747353600000, 1747353600000
),
(
  '00000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000000',
  'Contraataque 3v2 y 2v1 — Superioridad ofensiva veloz', 'ataque', 'alevin',
  20, 8, 12,
  '["Balones (4)", "Petos (2 colores)", "Conos (6)", "Portería"]',
  'Entrenamiento específico del contraataque en situaciones de superioridad numérica. El jugador más avanzado lidera la salida y los compañeros acompañan el movimiento. Trabaja la toma de decisiones bajo velocidad, el momento del pase y la definición. Espacio: pasillo de 40×20 m. Intensidad muy alta.',
  '["El ejercicio comienza con el entrenador lanzando un balón al espacio para el equipo atacante (3 jugadores).", "Un defensor activo (o dos en la fase 3v2) intenta frenar el contraataque.", "El jugador con el balón decide: si hay pasillo conduce; si el defensor cierra, pase al lado libre.", "El atacante sin balón que llega al segundo palo es la opción de devolución si el portero cierra el primer palo.", "Para la variante 2v1: mismo principio pero con mayor urgencia en el pase.", "Rotación continua: tras cada contraataque los tres atacantes pasan a defender y entran tres nuevos.", "Variante: el entrenador añade un 2º defensor rezagado para aumentar la presión."]',
  '[]', null, true, true,
  1747612800000, 1747612800000
),

-- ── ATAQUE Y FINALIZACIÓN ─────────────────────────────────────

(
  '00000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000000',
  'Finalización tras centro lateral — Llegada al área', 'finalizacion', 'alevin',
  25, 8, 14,
  '["Balones (6)", "Conos (8)", "Portería"]',
  'Ejercicio de finalización mediante centros desde las bandas. Trabaja la sincronía entre el centrador y los rematadores, las llegadas al primer y segundo palo, y el remate de cabeza o punta del pie. Uno de los ejercicios más usados en preactivación antes de partido. Espacio: campo completo con área. Intensidad media-alta.',
  '["Coloca dos filas de centradores en las bandas (izquierda y derecha) a la altura del área grande.", "Coloca dos filas de rematadores en el centro, partiendo desde los 30 m.", "El centrador conduce hasta la línea de fondo y centra; el primer rematador llega al primer palo y el segundo al segundo palo.", "El portero defiende la portería real.", "Tras cada centro, las filas rotan: centrador pasa a rematador, rematador va al final de centradores.", "Criterio de éxito: al menos 1 de cada 3 centros debe ser rematado a portería.", "Variante: añadir 1 defensor que presiona al rematador."]',
  '[]', null, true, true,
  1747872000000, 1747872000000
),
(
  '00000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000000',
  'Definición 1v1 con portero — Mano a mano', 'finalizacion', 'alevin',
  20, 6, 10,
  '["Balones (6)", "Conos (4)", "Portería"]',
  'Entrenamiento específico del mano a mano entre delantero y portero. El atacante debe resolver la situación con calma, eligiendo el lado, el momento del disparo y el engaño al portero. El portero trabaja la lectura del atacante y el achique. Espacio: pasillo de 25×12 m. Intensidad alta.',
  '["El entrenador lanza el balón en profundidad para el atacante desde el mediocampo.", "El atacante controla y avanza en carrera hacia la portería con el portero que sale a achicar.", "El atacante decide: disparar antes de que el portero llegue, o esperar a rodearle.", "El portero trabaja el achique correcto: no salir demasiado pronto ni quedarse corto.", "Cada atacante realiza mínimo 5 repeticiones alternando entrada por la izquierda y la derecha.", "Variante: el entrenador añade un defensor con salida retrasada para crear más urgencia.", "Variante 2: balón en el suelo desde el punto de penalty para trabajar la definición pura."]',
  '[]', null, true, true,
  1748044800000, 1748044800000
),
(
  '00000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000000',
  'Circuito de finalización — Rotación de disparos por estaciones', 'finalizacion', 'todos',
  25, 8, 14,
  '["Balones (8)", "Conos (10)", "Picas (4)", "Portería"]',
  'Circuito de múltiples estaciones de finalización que mantiene alta la densidad de remates por jugador. Cada estación trabaja un tipo distinto de disparo: remate de cabeza, volea, disparo de larga distancia, remate tras pared y penalti. Espacio: área grande y sus proximidades. Intensidad media.',
  '["Monta 4 estaciones alrededor del área: E1 disparo desde fuera del área, E2 remate de cabeza con balón lanzado, E3 remate de primera tras pared con un compañero, E4 penalti.", "Los jugadores se distribuyen en grupos de 2-3 en cada estación.", "Cada jugador realiza 3 remates en su estación y rota a la siguiente en sentido horario.", "El portero defiende la portería durante todo el circuito y rota cada 5 minutos.", "El entrenador registra los goles de cada jugador para añadir elemento competitivo.", "Variante: añadir una estación de remate en carrera tras recibir un pase en profundidad.", "Criterio de calidad: el remate debe ir entre los tres palos; el remate alto no puntúa."]',
  '[]', null, true, true,
  1748217600000, 1748217600000
),
(
  '00000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000000',
  'Ataque posicional con superioridad — 8v6 con porteros', 'ataque', 'infantil',
  30, 14, 16,
  '["Balones (3)", "Petos (2 colores)", "Conos (12)", "Porterías (2)"]',
  'Partido con superioridad numérica permanente para el equipo atacante (8v6) para entrenar la creación de ocasiones mediante juego posicional. El equipo en superioridad debe aprender a aprovechar las ventajas numéricas y combinar antes de lanzarse al ataque. Trabaja la paciencia, el cambio de ritmo y la definición. Espacio: 60×40 m. Intensidad media.',
  '["Equipo A (8 jugadores) vs Equipo B (6 jugadores) en campo de 60×40 m con porteros.", "El equipo A siempre ataca; el equipo B siempre defiende durante los primeros 10 minutos.", "El equipo A debe dar mínimo 6 pases antes de poder rematar.", "El equipo B, si recupera, tiene 5 segundos para llegar a la portería rival (contraataque).", "Tras 10 minutos, rotar: 2 jugadores del equipo A pasan al B y 2 del B al A.", "Variante: el equipo A pierde 1 jugador si no marca en 2 minutos, reduciendo su superioridad."]',
  '[]', null, true, true,
  1748390400000, 1748390400000
),
(
  '00000000-0000-0000-0000-00000000001a', 'a0000000-0000-0000-0000-000000000000',
  'Juego entre líneas — Pase al espacio interior', 'ataque', 'infantil',
  25, 10, 14,
  '["Balones (3)", "Petos (3 colores)", "Conos (12)"]',
  'Entrenamiento específico del pase entre las líneas defensivas rivales para habilitar al jugador en la espalda de los centrocampistas contrarios. Es el concepto clave del fútbol asociativo moderno. Trabaja el tercer hombre, el movimiento para habilitar y el timing del pase. Espacio: 40×30 m con zonas. Intensidad media.',
  '["Divide el campo en 4 bandas horizontales: zona 1 construcción, zona 2 mediocampo defensivo, zona 3 entre líneas, zona 4 ataque.", "El equipo A (8-9 jugadores) posee el balón y debe conectar con el jugador en zona 3.", "El equipo B (5-6 jugadores) ocupa zonas 1, 2 y 4 para defender, dejando zona 3 libre.", "El jugador receptor en zona 3 debe moverse constantemente para recibir de espaldas y girarse.", "Tras recibir en zona 3, puede avanzar a zona 4 o devolver para recomenzar el ataque.", "Punto extra: si el receptor en zona 3 gira y llega a zona 4 sin pérdida, suma 2 puntos.", "Variante: añadir un defensor activo en zona 3 para aumentar la dificultad."]',
  '[]', null, true, true,
  1748563200000, 1748563200000
),
(
  '00000000-0000-0000-0000-00000000001b', 'a0000000-0000-0000-0000-000000000000',
  'Paredes y desmarques — Combinaciones en zona de ataque', 'ataque', 'alevin',
  20, 8, 12,
  '["Balones (4)", "Conos (8)", "Portería"]',
  'Entrenamiento de las combinaciones de 1-2 (paredes) y los desmarques de ruptura y apoyo en zona ofensiva. Trabaja la sincronía entre jugadores, el timing del desmarque y la finalización. Es la base del juego asociativo en el último tercio del campo. Espacio: mitad atacante, 40×30 m. Intensidad media-alta.',
  '["Fase analítica: A pasa a B, B devuelve de primera (pared) y A continúa en profundidad hacia portería.", "Progresión: añadir un defensor pasivo que condiciona el momento del 1-2.", "Segunda fase: grupos de 3 jugadores (A, B, C). A inicia, B hace de pared, C hace desmarque como tercero en discordia.", "Regla: la pared debe ser siempre de primer toque; la devolución no puede superar los 2 segundos.", "Criterio: el desmarque de C debe producirse antes de que se complete el 1-2, no después.", "Variante: ampliar a situación 3v2 con defensores activos para dar realismo al ejercicio."]',
  '[]', null, true, true,
  1748736000000, 1748736000000
),

-- ── PORTEROS Y BALÓN PARADO ───────────────────────────────────

(
  '00000000-0000-0000-0000-00000000001c', 'a0000000-0000-0000-0000-000000000000',
  'Blocajes y reflejos — Técnica de portero bajo presión', 'porteros', 'todos',
  20, 2, 4,
  '["Balones (8)", "Conos (4)", "Portería"]',
  'Entrenamiento específico para porteros centrado en la técnica de blocaje (capturar el balón con las manos) y los reflejos ante disparos a corta distancia. Trabaja la posición base, el blocaje alto y bajo y la respuesta ante remates consecutivos. Espacio: portería y área pequeña. Intensidad media.',
  '["El portero parte en posición base centrado en la portería. El entrenador lanza balones desde 10-15 m.", "Serie 1: disparos rasantes a ambos lados alternando; el portero debe posicionarse antes del disparo.", "Serie 2: blocajes altos. El entrenador lanza balones a la altura del pecho y hombros.", "Serie 3: reflejos. El portero está de espaldas al entrenador; al girarse, disparo inmediato.", "Serie 4: dos disparos consecutivos. El portero hace el primer blocaje y reacciona al segundo.", "Descanso de 30 segundos entre series. Mínimo 3 series de cada tipo.", "Variante: añadir un segundo lanzador desde el otro lado."]',
  '[]', null, true, true,
  1748822400000, 1748822400000
),
(
  '00000000-0000-0000-0000-00000000001d', 'a0000000-0000-0000-0000-000000000000',
  'Juego de pies y saque de portería — Construcción desde atrás', 'porteros', 'todos',
  20, 4, 8,
  '["Balones (4)", "Conos (6)", "Portería"]',
  'Entrenamiento del portero moderno como primer jugador de campo. Trabaja el control con el pie dominante y no dominante, el pase en corto, el saque de portería y la decisión entre jugar corto o largo según la presión. Espacio: campo completo. Intensidad baja-media.',
  '["El portero recibe pases hacia atrás desde distintos ángulos y distribuye con el pie.", "Ejercicio 1: pases cortos en triángulo con dos defensas centrales. El portero actúa como tercer central.", "Ejercicio 2: el entrenador presiona con un jugador. El portero decide: jugar corto o lanzar largo.", "Ejercicio 3: saque de portería. El portero practica 10 lanzamientos al pie de un delantero a 40 m.", "Ejercicio 4: el portero lanza con la mano a un extremo abierto en la banda para simular saque rápido.", "Criterio: el pase del portero debe llegar al pie, no al espacio donde el receptor deba perseguir.", "Variante: añadir un presionador activo que obliga al portero a decidir más rápido."]',
  '[]', null, true, true,
  1748908800000, 1748908800000
),
(
  '00000000-0000-0000-0000-00000000001e', 'a0000000-0000-0000-0000-000000000000',
  'Salidas y dominio del área — Centros y balones aéreos', 'porteros', 'todos',
  20, 4, 8,
  '["Balones (6)", "Conos (4)", "Portería"]',
  'Entrenamiento del portero en las salidas a centros laterales y dominio del área en situaciones de máxima afluencia. Trabaja el posicionamiento inicial, la lectura de la trayectoria del centro, la comunicación y el puñetazo cuando no se puede atrapar. Espacio: área grande y sus bandas. Intensidad media.',
  '["El entrenador o jugadores centran desde distintos puntos de la banda (fondo, línea de penalty, mediocampo).", "Serie 1: centros abiertos y altos. El portero sale con confianza para atrapar en el punto máximo.", "Serie 2: centros cerrados con un jugador rival que llega al segundo palo.", "Serie 3: córner. El portero parte pegado al palo y lee el centro para salir al punto máximo.", "El portero debe comunicar Mia antes de salir para que los defensas no interfieran.", "Si no llega con seguridad al balón, debe puñetear lejos del área en lugar de intentar atrapar.", "Variante: añadir 2 atacantes que disputan el balón al portero."]',
  '[]', null, true, true,
  1748995200000, 1748995200000
),
(
  '00000000-0000-0000-0000-00000000001f', 'a0000000-0000-0000-0000-000000000000',
  '1v1 portero-delantero — Achique y lectura del mano a mano', 'porteros', 'todos',
  20, 4, 8,
  '["Balones (6)", "Conos (4)", "Portería"]',
  'Entrenamiento específico del mano a mano desde la perspectiva del portero. Trabaja el achique correcto (cuándo y cuánto salir), la posición del cuerpo para cubrir ángulo, la lectura del atacante y la parada con los pies en el momento del disparo. Espacio: pasillo de 25×12 m. Intensidad alta.',
  '["El entrenador lanza el balón en profundidad hacia el área para el delantero.", "El portero lee la trayectoria y decide: salir a achicar o esperar en la línea de portería.", "Regla de achique: el portero debe salir cuando el delantero aún no controla el balón.", "El portero extiende el cuerpo para cubrir el máximo ángulo sin caer demasiado pronto.", "Cuando el delantero dispara, el portero no debe saltar sino abrir las piernas y expandir el cuerpo.", "Se alternan delanteros que entran por la izquierda, el centro y la derecha.", "Variante: el delantero tiene la opción de picar el balón por encima del portero."]',
  '[]', null, true, true,
  1749081600000, 1749081600000
),
(
  '00000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000000',
  'Defensa de córner y barrera en falta — Balón parado defensivo', 'porteros', 'infantil',
  25, 10, 14,
  '["Balones (6)", "Conos (4)", "Portería"]',
  'Entrenamiento del balón parado defensivo: organización de la barrera en faltas y la defensa del área en córners. El portero dirige la organización de sus compañeros. Trabaja el posicionamiento de la barrera, la distancia correcta y la reacción al segundo balón. Espacio: área grande y zona de falta. Intensidad media.',
  '["Parte 1 - Defensa de córner: coloca atacantes en las zonas habituales (primer palo, zona 6, zona 11).", "El portero organiza a los defensores antes de cada córner: Rojo primer palo, Azul segundo palo.", "El ejecutor lanza 10 córners de distintos tipos: directo, bombeado, al primer palo y al segundo palo.", "El portero actúa como director: sale al balón si está en su zona o se queda si el centro es largo.", "Parte 2 - Barrera en falta: coloca a 4 jugadores formando una barrera a 9,15 m del balón.", "El portero indica la posición de la barrera según el ángulo de la falta.", "Se lanzan 10 faltas: directas al primer palo (tapa la barrera) y al segundo palo (cubre el portero)."]',
  '[]', null, true, true,
  1749168000000, 1749168000000
)

ON CONFLICT (id) DO NOTHING;
