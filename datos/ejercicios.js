// Catálogo de ejercicios del gym, transcripto de la hoja «Lista de ejercicios»
// (Prevención Salud) que usan hoy las rutinas. Es el catálogo inicial: el profe
// lo amplía desde su panel. Los músculos siguen las claves del muñeco (DS.MUSC).
//
// cat: bipodal · unipodal · bilateral · unilateral · zona_media · saltos · aerobico
// sub: sólo zona media (antiextension / antirrotacion / antiflexion / dinamicos)
//      y saltos (bipedales / unipodales)
// peso: true si se anota carga en kg; false si va por tiempo o sin carga.

window.EJERCICIOS_CATALOGO = (() => {
  const e = (id, nombre, cat, musculos, extra = {}) => ({ id, nombre, cat, musculos, peso: true, ...extra });
  return [
    // ---- Bipodales (ambos pies, mismo apoyo) ----
    e('sentadilla-paralela', 'Sentadilla paralela', 'bipodal', ['cuadriceps', 'gluteos']),
    e('sentadilla-profunda', 'Sentadilla profunda', 'bipodal', ['cuadriceps', 'gluteos']),
    e('sentadilla-sumo', 'Sentadilla sumo', 'bipodal', ['gluteos', 'cuadriceps', 'isquios']),
    e('peso-muerto-convencional', 'Peso muerto convencional', 'bipodal', ['isquios', 'gluteos', 'dorsales']),
    e('peso-muerto-rumano', 'Peso muerto rumano', 'bipodal', ['isquios', 'gluteos']),
    e('hip-thrust-prono', 'Hip thrust prono', 'bipodal', ['gluteos', 'isquios']),
    e('puente-gluteos-bilateral', 'Puente de glúteos bilateral', 'bipodal', ['gluteos', 'isquios'], { peso: false }),
    e('elevacion-talones-pie', 'Elevación de talones de pie', 'bipodal', ['gemelos']),
    e('buenos-dias', 'Buenos días', 'bipodal', ['isquios', 'gluteos', 'dorsales']),
    e('sentadilla-salto', 'Sentadilla con salto (bipodal)', 'bipodal', ['cuadriceps', 'gluteos', 'gemelos'], { peso: false }),
    // ---- Unipodales ----
    e('sentadilla-una-pierna', 'Sentadilla a una pierna', 'unipodal', ['cuadriceps', 'gluteos'], { peso: false }),
    e('sentadilla-bulgara', 'Sentadilla búlgara', 'unipodal', ['cuadriceps', 'gluteos']),
    e('estocada-atras', 'Estocada atrás (unipodal dominante)', 'unipodal', ['cuadriceps', 'gluteos']),
    e('step-up', 'Step up', 'unipodal', ['cuadriceps', 'gluteos']),
    e('step-down', 'Step down', 'unipodal', ['cuadriceps', 'gluteos']),
    e('peso-muerto-unipodal', 'Peso muerto unipodal', 'unipodal', ['isquios', 'gluteos']),
    e('hip-thrust-unipodal', 'Hip thrust unipodal', 'unipodal', ['gluteos', 'isquios']),
    e('elevacion-talon-unipodal', 'Elevación de talón unipodal', 'unipodal', ['gemelos']),
    e('skater-squat', 'Skater squat', 'unipodal', ['cuadriceps', 'gluteos'], { peso: false }),
    // ---- Bilaterales (ambos lados trabajan juntos) ----
    e('press-banca', 'Press banca', 'bilateral', ['pecho', 'triceps', 'hombros']),
    e('press-inclinado', 'Press inclinado', 'bilateral', ['pecho', 'hombros', 'triceps']),
    e('press-militar-barra', 'Press militar barra', 'bilateral', ['hombros', 'triceps']),
    e('remo-barra', 'Remo con barra', 'bilateral', ['dorsales', 'biceps']),
    e('dominadas', 'Dominadas', 'bilateral', ['dorsales', 'biceps'], { peso: false }),
    e('fondos-paralelas', 'Fondos en paralelas', 'bilateral', ['pecho', 'triceps'], { peso: false }),
    e('curl-barra', 'Curl barra', 'bilateral', ['biceps']),
    e('extension-triceps-polea', 'Extensión de tríceps polea', 'bilateral', ['triceps']),
    e('jalon-pecho', 'Jalón al pecho', 'bilateral', ['dorsales', 'biceps']),
    // ---- Unilaterales ----
    e('press-mancuerna-unilateral', 'Press mancuerna unilateral', 'unilateral', ['pecho', 'triceps']),
    e('remo-mancuerna-unilateral', 'Remo mancuerna unilateral', 'unilateral', ['dorsales', 'biceps']),
    e('press-hombro-unilateral', 'Press hombro unilateral', 'unilateral', ['hombros', 'triceps']),
    e('curl-mancuerna-unilateral', 'Curl mancuerna unilateral', 'unilateral', ['biceps']),
    e('triceps-mancuerna-unilateral', 'Tríceps mancuerna unilateral', 'unilateral', ['triceps']),
    e('jalon-unilateral', 'Jalón unilateral', 'unilateral', ['dorsales', 'biceps']),
    e('pallof-press', 'Pallof press', 'unilateral', ['abdomen'], { zona: 'antirrotacion' }),
    e('farmer-carry-unilateral', 'Farmer carry unilateral', 'unilateral', ['abdomen', 'hombros'], { zona: 'antiflexion' }),
    e('zancada-caminando', 'Zancada caminando', 'unilateral', ['cuadriceps', 'gluteos']),
    // ---- Zona media ----
    e('plancha-frontal', 'Plancha frontal', 'zona_media', ['abdomen'], { sub: 'antiextension', peso: false }),
    e('dead-bug', 'Dead bug', 'zona_media', ['abdomen'], { sub: 'antiextension', peso: false }),
    e('roll-out-rueda', 'Roll out con rueda', 'zona_media', ['abdomen', 'dorsales'], { sub: 'antiextension', peso: false }),
    e('hollow-hold', 'Hollow hold', 'zona_media', ['abdomen'], { sub: 'antiextension', peso: false }),
    e('plancha-lateral-rotacion', 'Plancha lateral con rotación', 'zona_media', ['abdomen'], { sub: 'antirrotacion', peso: false }),
    e('marcha-antirrotacional', 'Marcha antirotacional', 'zona_media', ['abdomen'], { sub: 'antirrotacion', peso: false }),
    e('plancha-lateral', 'Plancha lateral', 'zona_media', ['abdomen'], { sub: 'antiflexion', peso: false }),
    e('farmer-carry', 'Farmer carry', 'zona_media', ['abdomen', 'hombros'], { sub: 'antiflexion' }),
    e('crunch', 'Crunch', 'zona_media', ['abdomen'], { sub: 'dinamicos', peso: false }),
    e('crunch-polea', 'Crunch polea', 'zona_media', ['abdomen'], { sub: 'dinamicos' }),
    e('elevacion-piernas', 'Elevación de piernas', 'zona_media', ['abdomen'], { sub: 'dinamicos', peso: false }),
    e('russian-twist', 'Russian twist', 'zona_media', ['abdomen'], { sub: 'dinamicos' }),
    // ---- Saltos (pliometría) ----
    e('salto-vertical', 'Salto vertical', 'saltos', ['cuadriceps', 'gluteos', 'gemelos'], { sub: 'bipedales', peso: false }),
    e('salto-horizontal', 'Salto horizontal', 'saltos', ['cuadriceps', 'gluteos', 'gemelos'], { sub: 'bipedales', peso: false }),
    e('drop-jump', 'Drop jump', 'saltos', ['cuadriceps', 'gemelos'], { sub: 'bipedales', peso: false }),
    e('salto-cajon', 'Salto al cajón', 'saltos', ['cuadriceps', 'gluteos'], { sub: 'bipedales', peso: false }),
    e('multisaltos', 'Multisaltos', 'saltos', ['cuadriceps', 'gemelos'], { sub: 'bipedales', peso: false }),
    e('saltos-unipodales-lugar', 'Saltos unipodales en el lugar', 'saltos', ['gemelos', 'cuadriceps'], { sub: 'unipodales', peso: false }),
    e('saltos-laterales-unipodales', 'Saltos laterales unipodales', 'saltos', ['gemelos', 'gluteos'], { sub: 'unipodales', peso: false }),
    e('salto-frontal-unipodal', 'Salto frontal unipodal', 'saltos', ['cuadriceps', 'gemelos'], { sub: 'unipodales', peso: false }),
    e('skipping-alto', 'Skipping alto', 'saltos', ['cuadriceps', 'gemelos'], { sub: 'unipodales', peso: false }),
    e('saltos-adelante-atras', 'Saltos adelante/atrás', 'saltos', ['gemelos', 'cuadriceps'], { sub: 'unipodales', peso: false }),
    // ---- Aeróbico (diario): va por tiempo e intensidad, no por carga ----
    e('pasadas', 'Pasadas', 'aerobico', ['cuadriceps', 'gemelos'], { peso: false, tiempo: true }),
    e('bici', 'Bici', 'aerobico', ['cuadriceps'], { peso: false, tiempo: true }),
    e('remo-aerobico', 'Remo', 'aerobico', ['dorsales', 'cuadriceps'], { peso: false, tiempo: true }),
    e('running', 'Running', 'aerobico', ['cuadriceps', 'gemelos', 'isquios'], { peso: false, tiempo: true }),
  ];
})();

// Cómo se rotula cada categoría en pantalla (el orden es el de la hoja).
window.EJERCICIOS_CATEGORIAS = [
  { k: 'bipodal',    n: 'Bipodales',    d: 'ambos pies, mismo apoyo' },
  { k: 'unipodal',   n: 'Unipodales',   d: 'un pie por vez' },
  { k: 'bilateral',  n: 'Bilaterales',  d: 'ambos lados trabajan juntos' },
  { k: 'unilateral', n: 'Unilaterales', d: 'un lado por vez' },
  { k: 'zona_media', n: 'Zona media',   d: 'antiextensión, antirrotación, antiflexión, dinámicos' },
  { k: 'saltos',     n: 'Saltos',       d: 'pliometría' },
  { k: 'aerobico',   n: 'Aeróbico',     d: 'diario, por tiempo e intensidad' },
];
window.EJERCICIOS_SUB = {
  antiextension: 'Antiextensión', antirrotacion: 'Antirrotación', antiflexion: 'Antiflexión lateral', dinamicos: 'Dinámicos',
  bipedales: 'Bipedales', unipodales: 'Unipodales',
};
