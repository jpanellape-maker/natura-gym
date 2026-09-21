// Cuentas sobre la foto de datos (API.datos()). Son iguales en modo demo y con la
// base real: reciben el objeto `d` con las tablas y devuelven lo que la pantalla
// muestra. Nada de acá toca el DOM ni la base.

window.Q = (() => {
  const iso = (f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  const hoyIso = () => iso(new Date());
  const fechaDe = (s) => new Date(s + 'T00:00:00');
  const sumarDias = (s, n) => { const f = fechaDe(s); f.setDate(f.getDate() + n); return iso(f); };
  const diaSemana = (s) => { const d = fechaDe(s).getDay(); return d === 0 ? 7 : d; };   // 1 lunes … 7 domingo
  const diasEntre = (a, b) => Math.round((fechaDe(b) - fechaDe(a)) / 86400000);
  const hhmm = (f) => `${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`;
  const minutos = (hora) => { const [h, m] = hora.split(':').map(Number); return h * 60 + m; };
  const ini = (n) => String(n || '').split(' ').filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const nombreCorto = (n) => String(n || '').split(' ')[0];
  const por = (xs, k) => xs.reduce((m, x) => { (m[x[k]] = m[x[k]] || []).push(x); return m; }, {});

  const persona = (d, id) => d.personas.find(p => p.id === id);
  const plan = (d, id) => d.planes.find(p => p.id === id);
  const socios = (d) => d.personas.filter(p => p.rol === 'socio' && p.activo !== false);

  /* ---- cuota ---- */
  function membresiaVigente(d, pid) {
    return d.membresias.filter(m => m.persona_id === pid).sort((a, b) => b.hasta.localeCompare(a.hasta))[0] || null;
  }
  // El estado se escribe: al día / vence hoy / vence en N días / vencida hace N / congelada / sin plan.
  function cuota(d, pid) {
    const m = membresiaVigente(d, pid);
    if (!m) return { estado: 'sin_plan', texto: 'Sin plan', tono: '', dias: null, membresia: null, plan: null };
    const p = plan(d, m.plan_id); const dias = diasEntre(hoyIso(), m.hasta);
    if (m.congelada_desde) return { estado: 'congelada', texto: 'Congelada', tono: 'info', dias, membresia: m, plan: p };
    if (dias < 0) return { estado: 'vencida', texto: dias === -1 ? 'Vencida ayer' : `Vencida hace ${-dias} días`, tono: 'critico', dias, membresia: m, plan: p };
    if (dias === 0) return { estado: 'vence_hoy', texto: 'Vence hoy', tono: 'alerta', dias, membresia: m, plan: p };
    if (dias <= 7) return { estado: 'por_vencer', texto: `Vence en ${dias} día${dias === 1 ? '' : 's'}`, tono: 'alerta', dias, membresia: m, plan: p };
    return { estado: 'al_dia', texto: 'Al día', tono: 'ok', dias, membresia: m, plan: p };
  }

  /* ---- ingresos ---- */
  const ingresosDe = (d, pid) => d.ingresos.filter(i => i.persona_id === pid).sort((a, b) => b.momento.localeCompare(a.momento));
  const ingresosHoy = (d) => { const h = hoyIso(); return d.ingresos.filter(i => i.momento.slice(0, 10) === h || new Date(i.momento).toDateString() === new Date().toDateString()); };
  // «Adentro» = entró en las últimas 2 horas (no hay registro de salida; se dice así en pantalla).
  function adentro(d, ahora = new Date(), ventanaMin = 120) {
    const desde = ahora.getTime() - ventanaMin * 60000; const vistos = new Set();
    return d.ingresos.filter(i => { const t = new Date(i.momento).getTime(); return t >= desde && t <= ahora.getTime(); })
      .sort((a, b) => b.momento.localeCompare(a.momento))
      .filter(i => { if (vistos.has(i.persona_id)) return false; vistos.add(i.persona_id); return true; })
      .map(i => ({ ...i, persona: persona(d, i.persona_id), cuota: cuota(d, i.persona_id), hora: hhmm(new Date(i.momento)) }));
  }

  /* ---- clases ---- */
  function ocupados(d, clase_id, fecha) {
    if (d.ocupacion) { const o = d.ocupacion.find(o => o.clase_id === clase_id && o.fecha === fecha); return o ? Number(o.reservados) : d.reservas.filter(r => r.clase_id === clase_id && r.fecha === fecha && r.estado !== 'cancelada').length; }
    return d.reservas.filter(r => r.clase_id === clase_id && r.fecha === fecha && r.estado !== 'cancelada').length;   // anotados: reservados o ya pasados por la clase
  }
  function clasesDelDia(d, fecha, ahora = new Date()) {
    const ds = diaSemana(fecha); const esHoy = fecha === hoyIso(); const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
    return d.clases.filter(c => c.activa !== false && c.dia_semana === ds).sort((a, b) => a.hora.localeCompare(b.hora)).map(c => {
      const reservas = d.reservas.filter(r => r.clase_id === c.id && r.fecha === fecha && r.estado !== 'cancelada').map(r => ({ ...r, persona: persona(d, r.persona_id) }));
      const n = ocupados(d, c.id, fecha); const inicio = minutos(c.hora), fin = inicio + (c.duracion_min || 60);
      const momento = !esHoy ? (fecha < hoyIso() ? 'pasada' : 'proxima') : minAhora >= fin ? 'pasada' : minAhora >= inicio ? 'en_curso' : 'proxima';
      const nivel = n >= c.cupo ? 'lleno' : n / c.cupo >= .8 ? 'alto' : 'normal';
      return { ...c, fecha, reservas, ocupados: n, libres: Math.max(0, c.cupo - n), nivel, momento, profe: persona(d, c.profe_id), inicioMin: inicio };
    });
  }
  // Quiénes vienen: reservas de hoy de clases que empiezan en los próximos 90 minutos.
  function llegan(d, ahora = new Date(), ventanaMin = 90) {
    const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
    return clasesDelDia(d, hoyIso(), ahora).filter(c => c.inicioMin >= minAhora - 10 && c.inicioMin <= minAhora + ventanaMin);
  }
  const semana = (d, desde) => Array.from({ length: 7 }, (_, i) => { const f = sumarDias(desde, i); return { fecha: f, clases: clasesDelDia(d, f) }; });
  const lunesDe = (s) => sumarDias(s, 1 - diaSemana(s));
  const reservasDe = (d, pid) => d.reservas.filter(r => r.persona_id === pid && r.estado !== 'cancelada').map(r => ({ ...r, clase: d.clases.find(c => c.id === r.clase_id) })).filter(r => r.clase).sort((a, b) => (a.fecha + a.clase.hora).localeCompare(b.fecha + b.clase.hora));
  const proximasReservas = (d, pid) => { const h = hoyIso(); const ahora = hhmm(new Date()); return reservasDe(d, pid).filter(r => r.estado === 'reservada' && (r.fecha > h || (r.fecha === h && r.clase.hora >= ahora))); };

  /* ---- rutinas ---- */
  const ejercicio = (d, id) => d.ejercicios.find(e => e.id === id);
  function rutinaCompleta(d, rid) {
    const r = d.rutinas.find(r => r.id === rid); if (!r) return null;
    const filas = d.rutina_ejercicios.filter(x => x.rutina_id === rid).sort((a, b) => a.dia - b.dia || a.orden - b.orden).map(x => ({ ...x, ejercicio: ejercicio(d, x.ejercicio_id) }));
    const porDia = Array.from({ length: r.dias }, (_, i) => ({ n: i + 1, ejercicios: filas.filter(x => x.dia === i + 1) }));
    const asignados = d.asignaciones.filter(a => a.rutina_id === rid && !a.hasta).length;
    return { ...r, porDia, filas, asignados, creador: persona(d, r.creada_por) };
  }
  const asignacionVigente = (d, pid) => d.asignaciones.find(a => a.persona_id === pid && !a.hasta) || null;
  function miRutina(d, pid) {
    const a = asignacionVigente(d, pid); if (!a) return null;
    const r = rutinaCompleta(d, a.rutina_id); if (!r) return null;
    // Qué día toca: cuenta los días distintos entrenados esta semana y sigue con el siguiente.
    const lunes = lunesDe(hoyIso()); const hoy = hoyIso();
    const fechas = [...new Set(d.registros.filter(x => x.persona_id === pid && x.fecha >= lunes && x.fecha < hoy).map(x => x.fecha))];
    const hechosHoy = d.registros.some(x => x.persona_id === pid && x.fecha === hoy);
    const toca = Math.min(fechas.length + 1, r.dias);
    return { asignacion: a, rutina: r, toca, hechosEstaSemana: fechas.length, hechosHoy, asignadaPor: persona(d, a.asignada_por) };
  }
  const registrosDe = (d, pid, eid) => d.registros.filter(r => r.persona_id === pid && (!eid || r.ejercicio_id === eid)).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.serie - b.serie);
  // Última sesión de un ejercicio (series de la fecha más reciente) y la de hoy.
  function ultimaSesion(d, pid, eid, antesDe = hoyIso()) {
    const rs = registrosDe(d, pid, eid).filter(r => r.fecha < antesDe); if (!rs.length) return null;
    const f = rs[rs.length - 1].fecha; return { fecha: f, series: rs.filter(r => r.fecha === f) };
  }
  const sesionHoy = (d, pid, eid) => registrosDe(d, pid, eid).filter(r => r.fecha === hoyIso());
  // Progreso por ejercicio: mejor carga por sesión, en orden.
  function progreso(d, pid) {
    const porEj = por(registrosDe(d, pid), 'ejercicio_id');
    return Object.entries(porEj).map(([eid, rs]) => {
      const e = ejercicio(d, Number(eid)); const sesiones = Object.entries(por(rs, 'fecha')).sort((a, b) => a[0].localeCompare(b[0])).map(([f, s]) => ({ fecha: f, max: Math.max(...s.map(x => Number(x.peso_kg) || 0)), reps: s.reduce((t, x) => t + x.reps, 0), series: s.length }));
      const primera = sesiones[0], ultima = sesiones[sesiones.length - 1];
      return { ejercicio: e, sesiones, mejor: Math.max(...sesiones.map(s => s.max)), desde: primera.max, ahora: ultima.max, delta: ultima.max - primera.max, ultimaFecha: ultima.fecha };
    }).filter(x => x.ejercicio).sort((a, b) => b.ultimaFecha.localeCompare(a.ultimaFecha));
  }
  const entrenamientosPorSemana = (d, pid, semanas = 8) => Array.from({ length: semanas }, (_, i) => {
    const lunes = sumarDias(lunesDe(hoyIso()), -7 * (semanas - 1 - i)); const dom = sumarDias(lunes, 6);
    const dias = new Set(d.ingresos.filter(x => x.persona_id === pid && x.momento.slice(0, 10) >= lunes && x.momento.slice(0, 10) <= dom).map(x => x.momento.slice(0, 10)));
    return { lunes, n: dias.size };
  });

  /* ---- ficha y listas ---- */
  function resumenSocio(d, p) {
    const ult = ingresosDe(d, p.id)[0]; const a = asignacionVigente(d, p.id);
    return { ...p, ini: ini(p.nombre), cuota: cuota(d, p.id), ultimoIngreso: ult ? ult.momento : null, rutina: a ? d.rutinas.find(r => r.id === a.rutina_id) : null, asignacion: a };
  }
  const listaSocios = (d) => socios(d).map(p => resumenSocio(d, p)).sort((a, b) => a.nombre.localeCompare(b.nombre));
  function ficha(d, pid) {
    const p = persona(d, pid); if (!p) return null;
    const base = resumenSocio(d, p);
    return { ...base, ingresos: ingresosDe(d, pid).slice(0, 8), reservas: proximasReservas(d, pid).slice(0, 5), pagos: d.pagos.filter(x => x.persona_id === pid).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5),
      rutinaCompleta: base.asignacion ? rutinaCompleta(d, base.asignacion.rutina_id) : null, entrenos: entrenamientosPorSemana(d, pid, 4).reduce((t, s) => t + s.n, 0), progreso: progreso(d, pid).slice(0, 4) };
  }
  const normalizar = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const buscar = (d, texto, rol = 'socio') => { const t = normalizar(texto).trim(); if (!t) return []; const dig = t.replace(/\D/g, ''); return d.personas.filter(p => (!rol || p.rol === rol) && (normalizar(p.nombre).includes(t) || (dig.length >= 3 && String(p.telefono || '').replace(/\D/g, '').includes(dig)))).slice(0, 8).map(p => resumenSocio(d, p)); };

  // Pendientes del día para el staff: sin rutina, vencen esta semana, vencidos, sin venir hace 14 días.
  function pendientes(d) {
    const hoy = hoyIso(); const hace14 = sumarDias(hoy, -14);
    const lista = listaSocios(d);
    return {
      sinRutina: lista.filter(s => !s.rutina && s.cuota.estado !== 'vencida'),
      vencenSemana: lista.filter(s => ['vence_hoy', 'por_vencer'].includes(s.cuota.estado)).sort((a, b) => a.cuota.dias - b.cuota.dias),
      vencidos: lista.filter(s => s.cuota.estado === 'vencida').sort((a, b) => b.cuota.dias - a.cuota.dias),
      ausentes: lista.filter(s => s.cuota.estado === 'al_dia' && (!s.ultimoIngreso || s.ultimoIngreso.slice(0, 10) < hace14)),
      nuevos: lista.filter(s => diasEntre(s.fecha_alta, hoy) <= 30),
      // se registraron desde la página y eligieron plan: falta que el gym confirme el pago
      porConfirmar: (d.solicitudes || []).filter(s => s.estado === 'pendiente').map(s => ({ ...lista.find(x => x.id === s.persona_id), solicitud: s })).filter(s => s.id),
    };
  }

  /* ---- indicadores del dueño ---- */
  function indicadores(d) {
    const hoy = hoyIso(); const lista = listaSocios(d);
    const porDia = {}; d.ingresos.forEach(i => { const f = i.momento.slice(0, 10); porDia[f] = (porDia[f] || 0) + 1; });
    const dias28 = Array.from({ length: 28 }, (_, i) => { const f = sumarDias(hoy, -(27 - i)); return { fecha: f, n: porDia[f] || 0 }; });
    const semanaActual = dias28.slice(21).reduce((t, x) => t + x.n, 0), semanaAnterior = dias28.slice(14, 21).reduce((t, x) => t + x.n, 0);
    const porHora = Array.from({ length: 24 }, () => 0); d.ingresos.forEach(i => porHora[new Date(i.momento).getHours()]++);
    const horaPico = porHora.indexOf(Math.max(...porHora));
    const sem = semana(d, hoy); const clasesSem = sem.flatMap(x => x.clases);   // los próximos 7 días
    const cupoTotal = clasesSem.reduce((t, c) => t + c.cupo, 0), reservados = clasesSem.reduce((t, c) => t + c.ocupados, 0);
    const porClase = Object.values(por(clasesSem, 'nombre')).map(cs => ({ nombre: cs[0].nombre, cupo: cs.reduce((t, c) => t + c.cupo, 0), reservados: cs.reduce((t, c) => t + c.ocupados, 0) })).sort((a, b) => b.reservados / b.cupo - a.reservados / a.cupo);
    // Comparación honesta: el mismo día de la semana pasada, recortado a la hora actual.
    const ahora = new Date(); const hace7 = sumarDias(hoy, -7);
    const mismoDiaHastaAhora = d.ingresos.filter(i => i.momento.slice(0, 10) === hace7 && (new Date(i.momento).getHours() * 60 + new Date(i.momento).getMinutes()) <= ahora.getHours() * 60 + ahora.getMinutes()).length;
    const p = pendientes(d);
    const alDia = lista.filter(s => ['al_dia', 'por_vencer', 'vence_hoy', 'congelada'].includes(s.cuota.estado));
    const porPlan = ['basico', 'premium', 'gold'].map(id => ({ plan: plan(d, id), n: alDia.filter(s => s.cuota.plan && s.cuota.plan.id === id).length }));
    const cobradoMes = d.pagos.filter(x => x.fecha.slice(0, 7) === hoy.slice(0, 7)).reduce((t, x) => t + x.importe, 0);
    return { dias28, semanaActual, semanaAnterior, horaPico, porHora, ocupacion: cupoTotal ? reservados / cupoTotal : 0, porClase, activos: alDia.length, totalSocios: lista.length,
      vencenSemana: p.vencenSemana.length, vencidos: p.vencidos.length, ausentes: p.ausentes.length, nuevos: p.nuevos.length, sinRutina: p.sinRutina.length, porPlan, cobradoMes, hoy: ingresosHoy(d).length, mismoDiaHastaAhora, pendientes: p };
  }

  return { iso, hoyIso, fechaDe, sumarDias, diaSemana, diasEntre, hhmm, minutos, ini, nombreCorto, por, persona, plan, socios, membresiaVigente, cuota, ingresosDe, ingresosHoy, adentro, ocupados, clasesDelDia, llegan, semana, lunesDe, reservasDe, proximasReservas,
    ejercicio, rutinaCompleta, asignacionVigente, miRutina, registrosDe, ultimaSesion, sesionHoy, progreso, entrenamientosPorSemana, resumenSocio, listaSocios, ficha, buscar, pendientes, indicadores };
})();
