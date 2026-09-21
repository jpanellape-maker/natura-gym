// Datos de muestra del MODO DEMO: socios inventados, ingresos y reservas
// armados alrededor de la hora actual para que el mostrador se vea vivo.
// Se generan una vez por día y se guardan en localStorage, así lo que se hace
// en una pantalla (alta, ingreso, reserva) se ve en las otras. Nada de acá es real.

window.DEMO_DATOS = (() => {
  const CLAVE = 'ng-demo-datos-v6';
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dias = (n, desde = hoy) => { const d = new Date(desde); d.setDate(d.getDate() + n); return d; };

  // Generador determinístico: los mismos nombres cada vez.
  let semilla = 20260920;
  const azar = () => { semilla ^= semilla << 13; semilla >>>= 0; semilla ^= semilla >>> 17; semilla ^= semilla << 5; semilla >>>= 0; return semilla / 4294967296; };
  const entre = (a, b) => a + Math.floor(azar() * (b - a + 1));
  const elegir = (xs) => xs[Math.floor(azar() * xs.length)];

  const NOMBRES = ['Martina Ríos', 'Rodrigo Paz', 'Camila Sosa', 'Julián Ferreyra', 'Valentina Ledesma', 'Tomás Aguirre', 'Lucía Benítez', 'Franco Quiroga', 'Sofía Herrera', 'Agustín Moyano',
    'Florencia Vega', 'Mateo Cabral', 'Micaela Bustos', 'Lautaro Gómez', 'Paula Romero', 'Ezequiel Torres', 'Carla Peralta', 'Nahuel Medina', 'Julieta Castro', 'Bruno Villalba',
    'Antonella Ruiz', 'Facundo Oviedo', 'Rocío Domínguez', 'Ignacio Salas', 'Brenda Acosta', 'Santiago Luna', 'Melina Arias', 'Gonzalo Pereyra', 'Daniela Molina', 'Emiliano Farías',
    'Abril Cáceres', 'Joaquín Ramos', 'Milagros Ponce', 'Leandro Díaz', 'Guadalupe Núñez', 'Ramiro Suárez', 'Ailén Correa', 'Cristian Ávila', 'Pilar Godoy', 'Marcos Toledo',
    'Nadia Ojeda', 'Ariel Vera', 'Celeste Maldonado', 'Damián Roldán', 'Jazmín Escobar', 'Kevin Barrios', 'Lara Ibáñez', 'Maximiliano Coria', 'Renata Lucero', 'Sebastián Gauna'];
  const OBJETIVOS = ['Bajar de peso', 'Ganar masa muscular', 'Fuerza', 'Mantenerme activo', 'Volver después de una lesión'];
  const HORARIOS = ['mañana', 'mediodía', 'tarde', 'noche'];

  function generar() {
    const personas = [
      { id: 'demo-admin', nombre: 'Natura Gym', telefono: '358 572 5645', rol: 'admin', activo: true, fecha_alta: '2026-01-05', debe_cambiar_clave: false },
      { id: 'demo-recepcion', nombre: 'Carolina Ejemplo', telefono: '358 555 0001', rol: 'recepcion', activo: true, fecha_alta: '2026-02-01', debe_cambiar_clave: false, ejemplo: true },
      { id: 'demo-profe', nombre: 'Nico Ejemplo', telefono: '358 555 0002', rol: 'profe', activo: true, fecha_alta: '2026-01-05', debe_cambiar_clave: false, ejemplo: true },
      { id: 'demo-profe-2', nombre: 'Lucía Ejemplo', telefono: '358 555 0003', rol: 'profe', activo: true, fecha_alta: '2026-03-10', debe_cambiar_clave: false, ejemplo: true },
    ];
    NOMBRES.forEach((n, i) => personas.push({
      id: i === 0 ? 'demo-socio' : i === 1 ? 'demo-nuevo' : `demo-s${i}`, nombre: n, telefono: `358 55${String(10000 + i * 37).slice(-5)}`.replace(/(\d{3}) (\d{2})(\d{3})(\d{2})/, '$1 $2$3 $4'),
      rol: 'socio', activo: true, fecha_alta: iso(dias(-entre(3, 600))), debe_cambiar_clave: i === 1,
      objetivo: elegir(OBJETIVOS), horario: elegir(HORARIOS), nota: i % 9 === 4 ? 'Molestia en la rodilla derecha: sin saltos.' : null,
    }));
    const socios = personas.filter(p => p.rol === 'socio');

    // Planes reales y membresías: la mayoría al día, algunas por vencer, algunas vencidas.
    const planes = [
      { id: 'basico', nombre: 'Básico', precio_mensual: 75000, precio_tri: 58000, orden: 1 },
      { id: 'premium', nombre: 'Premium', precio_mensual: 90000, precio_tri: 75000, orden: 2 },
      { id: 'gold', nombre: 'Gold', precio_mensual: 130000, precio_tri: 115000, orden: 3 },
    ];
    const membresias = []; const pagos = []; let mid = 1;
    socios.forEach((s, i) => {
      if (s.id === 'demo-nuevo') return;                         // el nuevo todavía no pagó
      const plan = i % 5 === 0 ? planes[0] : i % 7 === 3 ? planes[2] : planes[1];
      const periodo = i % 6 === 0 ? 'trimestral' : 'mensual';
      const meses = periodo === 'trimestral' ? 3 : 1;
      const restan = i === 0 ? 12 : i % 11 === 0 ? -entre(1, 20) : i % 9 === 0 ? entre(0, 6) : entre(7, 28);   // la socia de muestra, al día
      const hasta = dias(restan); const desde = new Date(hasta); desde.setMonth(desde.getMonth() - meses);
      const medio = elegir(['efectivo', 'transferencia', 'mercado_pago', 'efectivo']);
      const importe = Math.round((periodo === 'trimestral' ? plan.precio_tri * 3 : plan.precio_mensual) * (medio === 'efectivo' ? 0.9 : 1));
      membresias.push({ id: mid, persona_id: s.id, plan_id: plan.id, periodo, desde: iso(desde), hasta: iso(hasta), importe, medio, congelada_desde: i % 23 === 5 ? iso(dias(-3)) : null });
      pagos.push({ id: mid, persona_id: s.id, membresia_id: mid, fecha: iso(desde), importe, medio, registrado_por: 'demo-recepcion' });
      mid++;
    });

    // Clases de la semana (horarios del Instagram). dia_semana: 1 lunes … 6 sábado.
    const clases = []; let cid = 1;
    const agregar = (nombre, dias_, hora, cupo, profe_id, duracion_min = 60) => dias_.forEach(d => clases.push({ id: cid++, nombre, dia_semana: d, hora, duracion_min, cupo, profe_id, activa: true }));
    agregar('Cross Training', [1, 3, 5], '06:30', 15, 'demo-profe');
    agregar('Calistenia', [1, 2, 3, 4, 5], '09:30', 12, 'demo-profe-2');
    agregar('Natura Senior', [2, 4], '10:00', 12, 'demo-profe-2');
    agregar('Calistenia', [1, 2, 3, 4, 5], '16:00', 12, 'demo-profe-2');
    agregar('Cross Funcional', [1, 3, 5], '17:30', 15, 'demo-profe');
    agregar('Cross Training', [1, 3, 5], '18:00', 15, 'demo-profe');
    agregar('Cross Funcional', [2, 4], '18:00', 15, 'demo-profe');
    agregar('Híbrido', [1, 3, 5], '18:30', 15, 'demo-profe');
    agregar('Aero Box', [1, 3, 5], '19:30', 15, 'demo-profe-2');
    agregar('Aero Funcional', [2, 4], '19:30', 15, 'demo-profe-2');
    agregar('Cross Training', [6], '11:00', 15, 'demo-profe');

    // Reservas: de ayer a 7 días adelante, con ocupación variada (algunas clases llenas).
    const reservas = []; let rid = 1;
    for (let off = -7; off <= 7; off++) {
      const f = dias(off); const ds = f.getDay() === 0 ? 7 : f.getDay();
      clases.filter(c => c.dia_semana === ds).forEach(c => {
        const ocupacion = c.hora === '18:00' || c.hora === '18:30' ? entre(11, c.cupo) : c.hora === '06:30' ? entre(4, 9) : entre(3, c.cupo - 3);
        const quienes = socios.slice().sort(() => azar() - .5).slice(0, ocupacion);
        quienes.forEach(s => { if (reservas.some(r => r.persona_id === s.id && r.fecha === iso(f))) return;   // una clase por día por persona
          reservas.push({ id: rid++, clase_id: c.id, persona_id: s.id, fecha: iso(f), estado: off < 0 ? (azar() < .85 ? 'asistio' : 'falto') : 'reservada' }); });
      });
    }
    // La socia de muestra siempre tiene una clase mañana y otra pasado.
    [1, 3].forEach(off => { const f = dias(off); const ds = f.getDay() === 0 ? 7 : f.getDay(); const c = clases.find(c => c.dia_semana === ds && c.hora >= '17:00'); if (c && !reservas.some(r => r.persona_id === 'demo-socio' && r.fecha === iso(f))) reservas.push({ id: rid++, clase_id: c.id, persona_id: 'demo-socio', fecha: iso(f), estado: 'reservada' }); });

    // Ingresos: 4 semanas para los indicadores, y hoy hasta la hora actual.
    const ingresos = []; let iid = 1;
    const ahora = new Date();
    for (let off = -28; off <= 0; off++) {
      const f = dias(off); const dow = f.getDay();
      if (dow === 0) continue;                                   // domingo: cerrado
      const cuantos = dow === 6 ? entre(18, 30) : entre(55, 95);
      const quienes = socios.slice().sort(() => azar() - .5).slice(0, cuantos);
      quienes.forEach(s => {
        // horas pico: 7-9, 12-14, 17-21
        const h = elegir([6, 7, 7, 8, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21]);
        const m = entre(0, 59); const momento = new Date(f); momento.setHours(h, m, 0, 0);
        if (off === 0 && momento > ahora) return;
        if (dow === 6 && (h < 11 || h > 13)) return;
        ingresos.push({ id: iid++, persona_id: s.id, momento: momento.toISOString(), medio: elegir(['mostrador', 'qr', 'qr', 'tablet']) });
      });
    }
    // Gente «adentro» ahora mismo (entradas en las últimas 2 horas), sólo si el gym está abierto.
    const abierto = (() => { const dw = ahora.getDay(), m = ahora.getHours() * 60 + ahora.getMinutes(); return dw === 0 ? false : dw === 6 ? m >= 11 * 60 && m <= 13 * 60 + 30 : m >= 6 * 60 + 30 && m <= 22 * 60; })();
    const recientes = abierto ? socios.slice(10, 22) : [];
    recientes.forEach((s, i) => { const m = new Date(ahora.getTime() - (8 + i * 9) * 60000); ingresos.push({ id: iid++, persona_id: s.id, momento: m.toISOString(), medio: i % 3 ? 'qr' : 'mostrador' }); });
    // La socia de muestra entrenó 3 veces por semana las últimas 8 semanas.
    for (let w = 8; w >= 1; w--) [1, 3, 5].forEach(d => { const f = dias(-w * 7 + d - hoy.getDay()); if (f < hoy) { const m = new Date(f); m.setHours(18, entre(0, 40), 0, 0); ingresos.push({ id: iid++, persona_id: 'demo-socio', momento: m.toISOString(), medio: 'qr' }); } });

    // Ejercicios: el catálogo de la hoja, con id numérico como en la base.
    const ejercicios = (window.EJERCICIOS_CATALOGO || []).map((e, i) => ({ ...e, id: i + 1, clave: e.id, video_url: null }));
    const ej = (clave) => ejercicios.find(e => e.clave === clave).id;

    // Las 5 rutinas generales (propuesta hasta que el dueño pase las reales), armadas con la hoja.
    const rutinas = []; const rutina_ejercicios = []; let reid = 1;
    const armar = (id, nombre, objetivo, descripcion, diasSemana, plan) => {
      rutinas.push({ id, nombre, objetivo, descripcion, dias: diasSemana, general: true, activa: true, creada_por: 'demo-profe', creado_en: '2026-09-01' });
      plan.forEach((dia, di) => dia.forEach(([clave, series, reps, descanso, nota], oi) => rutina_ejercicios.push({ id: reid++, rutina_id: id, dia: di + 1, orden: oi + 1, ejercicio_id: ej(clave), series, reps, descanso_seg: descanso, nota: nota || null })));
    };
    armar(1, 'Iniciación', 'Aprender la técnica y agarrar el hábito', 'Tres días de cuerpo entero con los básicos bipodales y bilaterales, cargas livianas.', 3, [
      [['sentadilla-paralela', 3, '10', 90, 'Con el peso del cuerpo o la barra vacía'], ['press-banca', 3, '10', 90], ['remo-barra', 3, '10', 90], ['plancha-frontal', 3, '30 s', 45], ['bici', 1, '10 min', 0, 'Intensidad baja']],
      [['peso-muerto-rumano', 3, '10', 90], ['press-militar-barra', 3, '10', 90], ['jalon-pecho', 3, '10', 90], ['dead-bug', 3, '8 por lado', 45], ['pasadas', 1, '8 min', 0, 'Intensidad media']],
      [['sentadilla-sumo', 3, '12', 90], ['press-inclinado', 3, '10', 90], ['remo-mancuerna-unilateral', 3, '10 por lado', 60], ['plancha-lateral', 3, '20 s por lado', 45], ['remo-aerobico', 1, '10 min', 0, 'Intensidad baja']],
    ]);
    armar(2, 'Fuerza', 'Subir pesos en los básicos', 'Cuatro días: dos de piernas y dos de tren superior, series de 5 con descansos largos.', 4, [
      [['sentadilla-profunda', 5, '5', 180], ['peso-muerto-convencional', 3, '5', 180], ['sentadilla-bulgara', 3, '8 por lado', 90], ['hollow-hold', 3, '30 s', 60]],
      [['press-banca', 5, '5', 180], ['remo-barra', 4, '6', 150], ['press-militar-barra', 3, '6', 150], ['dominadas', 3, 'al fallo', 120], ['pallof-press', 3, '10 por lado', 60]],
      [['peso-muerto-rumano', 4, '6', 150], ['hip-thrust-prono', 4, '8', 120], ['step-up', 3, '8 por lado', 90], ['farmer-carry', 3, '30 m', 90]],
      [['press-inclinado', 4, '6', 150], ['jalon-pecho', 4, '8', 120], ['fondos-paralelas', 3, 'al fallo', 120], ['curl-barra', 3, '8', 90], ['extension-triceps-polea', 3, '10', 90]],
    ]);
    armar(3, 'Hipertrofia', 'Ganar masa muscular', 'Cuatro días con series de 8 a 12, mucho volumen en unilaterales y accesorios.', 4, [
      [['sentadilla-paralela', 4, '8-12', 120], ['zancada-caminando', 3, '12 por lado', 90], ['hip-thrust-prono', 4, '10', 90], ['elevacion-talones-pie', 4, '15', 60], ['crunch-polea', 3, '12', 60]],
      [['press-banca', 4, '8-12', 120], ['press-mancuerna-unilateral', 3, '10 por lado', 90], ['press-hombro-unilateral', 3, '10 por lado', 90], ['extension-triceps-polea', 3, '12', 60], ['triceps-mancuerna-unilateral', 3, '12 por lado', 60]],
      [['peso-muerto-rumano', 4, '8-12', 120], ['sentadilla-bulgara', 3, '10 por lado', 90], ['hip-thrust-unipodal', 3, '12 por lado', 60], ['elevacion-talon-unipodal', 3, '15 por lado', 45], ['elevacion-piernas', 3, '12', 60]],
      [['jalon-pecho', 4, '8-12', 120], ['remo-mancuerna-unilateral', 3, '10 por lado', 90], ['jalon-unilateral', 3, '12 por lado', 60], ['curl-barra', 3, '10', 60], ['curl-mancuerna-unilateral', 3, '12 por lado', 60]],
    ]);
    armar(4, 'Bajar de peso', 'Circuitos y cardio con fuerza', 'Tres días en circuito: fuerza con poco descanso y aeróbico al final de cada sesión.', 3, [
      [['sentadilla-sumo', 3, '15', 45], ['press-inclinado', 3, '12', 45], ['remo-barra', 3, '12', 45], ['russian-twist', 3, '20', 30], ['bici', 1, '15 min', 0, 'Intensidad media']],
      [['estocada-atras', 3, '12 por lado', 45], ['jalon-pecho', 3, '12', 45], ['press-militar-barra', 3, '12', 45], ['crunch', 3, '20', 30], ['pasadas', 1, '12 min', 0, 'Intensidad alta']],
      [['peso-muerto-rumano', 3, '12', 45], ['fondos-paralelas', 3, '10', 45], ['step-up', 3, '12 por lado', 45], ['plancha-frontal', 3, '40 s', 30], ['running', 1, '15 min', 0, 'Intensidad media']],
    ]);
    armar(5, 'Funcional', 'Movilidad, resistencia y peso corporal', 'Tres días de unipodales, zona media y saltos, casi todo con el peso del cuerpo.', 3, [
      [['sentadilla-una-pierna', 3, '6 por lado', 60], ['skater-squat', 3, '8 por lado', 60], ['dead-bug', 3, '10 por lado', 45], ['salto-vertical', 4, '5', 60], ['multisaltos', 3, '10', 60]],
      [['peso-muerto-unipodal', 3, '8 por lado', 60], ['dominadas', 3, 'al fallo', 90], ['marcha-antirrotacional', 3, '10 por lado', 45], ['salto-cajon', 4, '5', 60], ['skipping-alto', 3, '20 s', 45]],
      [['step-down', 3, '8 por lado', 60], ['farmer-carry-unilateral', 3, '30 m por lado', 60], ['plancha-lateral-rotacion', 3, '8 por lado', 45], ['saltos-laterales-unipodales', 3, '8 por lado', 60], ['saltos-adelante-atras', 3, '10', 60]],
    ]);

    // Asignaciones: cada socio (menos el nuevo y unos pocos) tiene una rutina vigente.
    const asignaciones = []; let aid = 1;
    socios.forEach((s, i) => {
      if (s.id === 'demo-nuevo' || i % 13 === 6) return;
      const r = s.id === 'demo-socio' ? 3 : (i % 5) + 1;
      asignaciones.push({ id: aid++, persona_id: s.id, rutina_id: r, desde: iso(dias(-entre(5, 60))), hasta: null, asignada_por: 'demo-profe', nota: s.id === 'demo-socio' ? 'Si el press sale cómodo, subí a 42,5.' : null });
    });

    // Registros de la socia de muestra: 8 semanas de press banca y sentadilla subiendo de a poco.
    const registros = []; let regid = 1;
    const cargar = (clave, base, paso) => {
      const eid = ej(clave);
      for (let w = 8; w >= 1; w--) {
        const f = dias(-w * 7 + 1 - hoy.getDay()); if (f >= hoy) continue;
        const peso = base + (8 - w) * paso;
        for (let s = 1; s <= 4; s++) registros.push({ id: regid++, persona_id: 'demo-socio', ejercicio_id: eid, rutina_ejercicio_id: null, fecha: iso(f), serie: s, reps: s === 4 ? 8 : 10, peso_kg: peso });
      }
    };
    cargar('press-banca', 30, 1.5); cargar('sentadilla-paralela', 40, 2.5); cargar('peso-muerto-rumano', 40, 2.5); cargar('jalon-pecho', 35, 2.5);

    return { generado: iso(hoy), personas, planes, membresias, pagos, solicitudes: [], clases, reservas, ingresos, ejercicios, rutinas, rutina_ejercicios, asignaciones, registros,
      contadores: { membresia: mid, solicitud: 1, reserva: rid, ingreso: iid, rutina: 6, rutina_ejercicio: reid, asignacion: aid, registro: regid, clase: cid, persona: 1000, ejercicio: ejercicios.length + 1 } };
  }

  function cargar() {
    try { const d = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (d && d.generado === iso(hoy)) return d; } catch (e) {}
    const d = generar(); guardar(d); return d;
  }
  function guardar(d) { try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) {} }
  function reiniciar() { try { localStorage.removeItem(CLAVE); } catch (e) {} return cargar(); }
  return { cargar, guardar, reiniciar };
})();
