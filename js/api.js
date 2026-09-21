// Acceso a datos del sitio: una sola puerta para la base (Supabase) o el modo demo.
// Las pantallas llaman a API.*, nunca a supabase directamente, así el día que
// la app Android/iOS use el mismo backend no hay nada que reescribir acá.
//
// Cuentas: las crea el gym. Cada persona tiene un rol (socio / profe / recepcion /
// admin) que decide a qué panel entra. El socio entra con su teléfono (o mail) y
// la clave inicial que le dieron; la primera vez el sistema le pide cambiarla.
// Como Supabase Auth trabaja con mail, un teléfono se guarda como
// <dígitos>@socios.naturagym.ar; el teléfono real queda en `personas`.
//
// Lecturas: `API.datos()` trae una foto de las tablas que la pantalla necesita
// (lo que las políticas RLS dejan ver) y las cuentas se hacen en `consultas.js`,
// iguales en los dos modos. Las escrituras van método por método.
//
// Modo demo: sin URL/key en config.js, o con el interruptor `ingresar.html?demo`
// (queda guardado; `?demo=0` lo apaga). Datos inventados en datos/demo.js.

window.API = (() => {
  const CFG = window.CONFIG || {};
  const CLAVE_SESION = 'ng-sesion', CLAVE_DEMO = 'ng-demo';
  const DOMINIO_TEL = '@socios.naturagym.ar';
  const ROLES = { socio: 'Socio', profe: 'Profe', recepcion: 'Recepción', admin: 'Administración' };
  // El socio entra a su perfil (plan, días, pagos); «Mi Natura» (app/) queda para más adelante.
  const PANEL = { socio: 'perfil', profe: 'profe', recepcion: 'recepcion', admin: 'admin' };

  // Interruptor del modo demo (se decide antes de tocar nada).
  try {
    const q = new URLSearchParams(location.search).get('demo');
    if (q !== null) { if (q === '0' || q === 'no') localStorage.removeItem(CLAVE_DEMO); else localStorage.setItem(CLAVE_DEMO, '1'); }
  } catch (e) {}
  let forzado = false; try { forzado = localStorage.getItem(CLAVE_DEMO) === '1'; } catch (e) {}
  const sinConfig = !CFG.supabaseUrl || !CFG.supabaseKey;
  const demo = sinConfig || forzado;

  const hoyIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const sumarMeses = (isoFecha, n) => { const d = new Date(isoFecha + 'T00:00:00'); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };

  function aMail(id) {
    const s = String(id || '').trim();
    if (s.includes('@')) return s.toLowerCase();
    const dig = s.replace(/\D/g, '');
    return dig ? dig + DOMINIO_TEL : s;
  }

  const MENSAJES = {
    'Invalid login credentials': 'El teléfono o la clave no coinciden. Si no tenés cuenta, pedila en el mostrador.',
    'Email not confirmed': 'La cuenta todavía no está activada. Avisá en el mostrador.',
    'Failed to fetch': 'No hay conexión. Probá de nuevo en un momento.',
    'La clase está completa': 'La clase está completa. Elegí otro horario.',
  };
  const error = (e) => new Error(MENSAJES[e?.message] || e?.message || 'Algo salió mal. Probá de nuevo.');
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));

  /* ================= MODO DEMO (sin base) ================= */
  const D = {
    datos: null,
    cargar() { if (!this.datos) this.datos = window.DEMO_DATOS ? window.DEMO_DATOS.cargar() : null; return this.datos; },
    guardar() { if (window.DEMO_DATOS && this.datos) window.DEMO_DATOS.guardar(this.datos); },
    leerSesion() { try { return JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null'); } catch (e) { return null; } },
    guardarSesion(p) { try { if (p) localStorage.setItem(CLAVE_SESION, JSON.stringify(p)); else localStorage.removeItem(CLAVE_SESION); } catch (e) {} },
    siguiente(k) { const c = this.datos.contadores; c[k] = (c[k] || 1) + 1; return c[k] - 1; },
  };
  // Cuentas de prueba: usuario → id de persona. Todas con clave 1234.
  const CUENTAS_DEMO = { socio: 'demo-socio', nuevo: 'demo-nuevo', profe: 'demo-profe', recepcion: 'demo-recepcion', admin: 'demo-admin' };

  const apiDemo = {
    demo: true,
    async ingresar(id, clave) {
      await esperar(350);
      const d = D.cargar();
      const pid = CUENTAS_DEMO[String(id).trim().toLowerCase()];
      // cuentas de prueba (clave 1234) o alguien que se registró desde la página en esta demo
      const dig = String(id).replace(/\D/g, '');
      const p = pid ? d.personas.find(p => p.id === pid) : dig && d.personas.find(p => p.clave && p.telefono && p.telefono.replace(/\D/g, '') === dig);
      if (!p || clave !== (pid ? '1234' : p.clave)) throw error({ message: 'Invalid login credentials' });
      D.guardarSesion({ id: p.id, rol: p.rol });
      return p;
    },
    async sesion() { const s = D.leerSesion(); if (!s) return null; const d = D.cargar(); return d.personas.find(p => p.id === s.id) || null; },
    async salir() { D.guardarSesion(null); },
    async cambiarClave() { const p = await this.sesion(); if (!p) throw new Error('No hay sesión.'); p.debe_cambiar_clave = false; D.guardar(); return p; },
    // Autoalta desde la página: crea la cuenta (con la clave que eligió, así no se la pedimos
    // de nuevo) y deja la solicitud del plan pendiente hasta que el gym confirme el pago.
    async registrarse({ nombre, telefono, mail, clave, plan_id, periodo = 'mensual', medio = 'mercado_pago', importe }) {
      await esperar(400);
      const d = D.cargar();
      if (!nombre || !telefono || !clave) throw new Error('Faltan nombre, teléfono y clave.');
      if (String(clave).length < 4) throw new Error('La clave tiene que tener al menos 4 caracteres.');
      if (d.personas.some(p => p.telefono && p.telefono.replace(/\D/g, '') === telefono.replace(/\D/g, ''))) throw new Error('Ya hay una cuenta con ese teléfono. Iniciá sesión.');
      const p = { id: 'demo-p' + D.siguiente('persona'), nombre, telefono, mail: mail || null, rol: 'socio', activo: true, fecha_alta: hoyIso(), debe_cambiar_clave: false, origen: 'web', clave: String(clave) };   // la clave sólo se guarda en la demo
      d.personas.push(p);
      d.solicitudes.push({ id: D.siguiente('solicitud'), persona_id: p.id, plan_id, periodo, medio, importe, estado: 'pendiente', creado_en: new Date().toISOString() });
      D.guardar(); D.guardarSesion({ id: p.id, rol: p.rol });
      return p;
    },
    async elegirMedio(solicitud_id, medio, importe) { const d = D.cargar(); const s = d.solicitudes.find(s => s.id === solicitud_id); if (s) { s.medio = medio; s.importe = importe; D.guardar(); } return s; },
    async crearSolicitud({ persona_id, plan_id, periodo, medio, importe }) {
      const d = D.cargar(); d.solicitudes.filter(s => s.persona_id === persona_id && s.estado === 'pendiente').forEach(s => s.estado = 'reemplazada');
      const s = { id: D.siguiente('solicitud'), persona_id, plan_id, periodo, medio, importe, estado: 'pendiente', creado_en: new Date().toISOString() }; d.solicitudes.push(s); D.guardar(); return s;
    },

    async datos() { await esperar(120); const d = D.cargar(); d.solicitudes = d.solicitudes || []; return d; },
    async pagosDe(persona_id) { const d = D.cargar(); return d.pagos.filter(p => p.persona_id === persona_id).sort((a, b) => b.fecha.localeCompare(a.fecha)); },

    async marcarIngreso(persona_id, medio = 'mostrador') {
      const d = D.cargar(); const f = { id: D.siguiente('ingreso'), persona_id, momento: new Date().toISOString(), medio }; d.ingresos.push(f); D.guardar(); return f;
    },
    async crearPersona({ nombre, telefono, mail, rol = 'socio', clave, objetivo, nota, horario }) {
      await esperar(300);
      const d = D.cargar();
      if (!nombre || (!telefono && !mail) || !clave) throw new Error('Faltan nombre, teléfono (o mail) y clave.');
      if (d.personas.some(p => p.telefono && telefono && p.telefono.replace(/\D/g, '') === telefono.replace(/\D/g, ''))) throw new Error('Ya hay una cuenta con ese teléfono.');
      const p = { id: 'demo-p' + D.siguiente('persona'), nombre, telefono, mail: mail || null, rol, activo: true, fecha_alta: hoyIso(), debe_cambiar_clave: true, objetivo: objetivo || null, nota: nota || null, horario: horario || null };
      d.personas.push(p); D.guardar(); return p;
    },
    async editarPersona(id, campos) { const d = D.cargar(); const p = d.personas.find(p => p.id === id); if (!p) throw new Error('No existe la persona.'); Object.assign(p, campos); D.guardar(); return p; },
    async cobrar({ persona_id, plan_id, periodo = 'mensual', medio = 'efectivo', importe, desde, registrado_por }) {
      await esperar(250);
      const d = D.cargar(); const meses = periodo === 'trimestral' ? 3 : 1;
      const vigente = d.membresias.filter(m => m.persona_id === persona_id).sort((a, b) => b.hasta.localeCompare(a.hasta))[0];
      const inicio = desde || (vigente && vigente.hasta >= hoyIso() ? sumarMeses(vigente.hasta, 0) : hoyIso());
      const m = { id: D.siguiente('membresia'), persona_id, plan_id, periodo, desde: inicio, hasta: sumarMeses(inicio, meses), importe, medio, congelada_desde: null };
      d.membresias.push(m); d.pagos.push({ id: m.id, persona_id, membresia_id: m.id, fecha: hoyIso(), importe, medio, registrado_por });
      (d.solicitudes || []).filter(s => s.persona_id === persona_id && s.estado === 'pendiente').forEach(s => { s.estado = 'confirmada'; s.membresia_id = m.id; });
      D.guardar(); return m;
    },
    async reservar(clase_id, fecha, persona_id) {
      await esperar(200);
      const d = D.cargar(); const c = d.clases.find(c => c.id === clase_id);
      const ocupados = d.reservas.filter(r => r.clase_id === clase_id && r.fecha === fecha && r.estado === 'reservada').length;
      if (ocupados >= c.cupo) throw error({ message: 'La clase está completa' });
      const ya = d.reservas.find(r => r.clase_id === clase_id && r.fecha === fecha && r.persona_id === persona_id);
      if (ya) { ya.estado = 'reservada'; D.guardar(); return ya; }
      const r = { id: D.siguiente('reserva'), clase_id, persona_id, fecha, estado: 'reservada', creado_en: new Date().toISOString() }; d.reservas.push(r); D.guardar(); return r;
    },
    async cancelarReserva(id) { const d = D.cargar(); const r = d.reservas.find(r => r.id === id); if (r) { r.estado = 'cancelada'; D.guardar(); } return r; },
    async cambiarReserva(id, clase_id, fecha) {
      const d = D.cargar(); const r = d.reservas.find(r => r.id === id); if (!r) throw new Error('No existe la reserva.');
      const nueva = await this.reservar(clase_id, fecha, r.persona_id); if (nueva.id !== r.id) r.estado = 'cancelada'; D.guardar(); return nueva;
    },
    async marcarAsistencia(reserva_id, estado) { const d = D.cargar(); const r = d.reservas.find(r => r.id === reserva_id); if (r) { r.estado = estado; D.guardar(); } return r; },
    async guardarRutina(rutina, ejercicios) {
      await esperar(250);
      const d = D.cargar();
      let r;
      if (rutina.id) { r = d.rutinas.find(x => x.id === rutina.id); Object.assign(r, rutina); d.rutina_ejercicios = d.rutina_ejercicios.filter(x => x.rutina_id !== r.id); }
      else { r = { id: D.siguiente('rutina'), general: false, activa: true, creado_en: new Date().toISOString(), ...rutina }; d.rutinas.push(r); }
      ejercicios.forEach((e, i) => d.rutina_ejercicios.push({ id: D.siguiente('rutina_ejercicio'), rutina_id: r.id, dia: e.dia, orden: e.orden ?? i + 1, ejercicio_id: e.ejercicio_id, series: e.series, reps: String(e.reps), descanso_seg: e.descanso_seg ?? null, nota: e.nota || null }));
      D.guardar(); return r;
    },
    async asignarRutina(persona_id, rutina_id, nota, asignada_por) {
      const d = D.cargar(); const hoy = hoyIso();
      d.asignaciones.filter(a => a.persona_id === persona_id && !a.hasta).forEach(a => a.hasta = hoy);
      const a = { id: D.siguiente('asignacion'), persona_id, rutina_id, desde: hoy, hasta: null, asignada_por, nota: nota || null }; d.asignaciones.push(a); D.guardar(); return a;
    },
    async guardarEjercicio(e) {
      const d = D.cargar();
      if (e.id) { const x = d.ejercicios.find(x => x.id === e.id); Object.assign(x, e); D.guardar(); return x; }
      const x = { id: D.siguiente('ejercicio'), musculos: [], peso: true, video_url: null, ...e }; d.ejercicios.push(x); D.guardar(); return x;
    },
    async registrar({ persona_id, ejercicio_id, rutina_ejercicio_id, serie, reps, peso_kg, fecha }) {
      const d = D.cargar(); const f = fecha || hoyIso();
      const ya = d.registros.find(r => r.persona_id === persona_id && r.ejercicio_id === ejercicio_id && r.fecha === f && r.serie === serie);
      if (ya) { ya.reps = reps; ya.peso_kg = peso_kg; D.guardar(); return ya; }
      const r = { id: D.siguiente('registro'), persona_id, ejercicio_id, rutina_ejercicio_id: rutina_ejercicio_id || null, fecha: f, serie, reps, peso_kg: peso_kg ?? null, creado_en: new Date().toISOString() };
      d.registros.push(r); D.guardar(); return r;
    },
    async guardarClase(c) {
      const d = D.cargar();
      if (c.id) { const x = d.clases.find(x => x.id === c.id); Object.assign(x, c); D.guardar(); return x; }
      const x = { id: D.siguiente('clase'), activa: true, duracion_min: 60, cupo: 15, ...c }; d.clases.push(x); D.guardar(); return x;
    },
    async reiniciarDemo() { D.datos = window.DEMO_DATOS.reiniciar(); return D.datos; },
  };

  /* ================= SUPABASE ================= */
  let sb = null;
  function cliente() {
    if (!sb) {
      if (!window.supabase) throw new Error('No se pudo cargar la librería de Supabase.');
      sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey);
    }
    return sb;
  }
  const ok = ({ data, error: e }) => { if (e) throw error(e); return data; };

  async function personaActual() {
    const { data: { user } } = await cliente().auth.getUser();
    if (!user) return null;
    const data = ok(await cliente().from('personas').select('*').eq('id', user.id).single());
    try { localStorage.setItem(CLAVE_SESION, JSON.stringify({ id: data.id, rol: data.rol })); } catch (x) {}
    return data;
  }

  const apiReal = {
    demo: false,
    async ingresar(id, clave) { ok(await cliente().auth.signInWithPassword({ email: aMail(id), password: clave })); return personaActual(); },
    async sesion() { try { return await personaActual(); } catch (e) { return null; } },
    async salir() { await cliente().auth.signOut(); try { localStorage.removeItem(CLAVE_SESION); } catch (e) {} },
    async registrarse({ nombre, telefono, mail, clave, plan_id, periodo = 'mensual', medio = 'mercado_pago', importe }) {
      const { data, error: e } = await cliente().functions.invoke('registrarse', { body: { nombre, telefono, mail, clave, plan_id, periodo, medio, importe } });
      if (e) throw error(e); if (data?.error) throw new Error(data.error);
      ok(await cliente().auth.signInWithPassword({ email: aMail(mail || telefono), password: clave }));
      return personaActual();
    },
    async elegirMedio(solicitud_id, medio, importe) { return ok(await cliente().from('solicitudes').update({ medio, importe }).eq('id', solicitud_id).select().single()); },
    async crearSolicitud({ persona_id, plan_id, periodo, medio, importe }) {
      ok(await cliente().from('solicitudes').update({ estado: 'reemplazada' }).eq('persona_id', persona_id).eq('estado', 'pendiente'));
      return ok(await cliente().from('solicitudes').insert({ persona_id, plan_id, periodo, medio, importe }).select().single());
    },
    async cambiarClave(nueva) {
      ok(await cliente().auth.updateUser({ password: nueva }));
      const { data: { user } } = await cliente().auth.getUser();
      ok(await cliente().from('personas').update({ debe_cambiar_clave: false }).eq('id', user.id));
      return personaActual();
    },

    // Una foto de las tablas: lo que RLS deje ver a quien está logueado.
    // Reservas de ±7 días e ingresos de 30 días; los registros de un socio se
    // traen todos (son los suyos) y los del staff, los del socio que se mira.
    async datos() {
      const c = cliente(); const hoy = new Date();
      const desde = new Date(hoy); desde.setDate(desde.getDate() - 30);
      const rDesde = new Date(hoy); rDesde.setDate(rDesde.getDate() - 7);
      const rHasta = new Date(hoy); rHasta.setDate(rHasta.getDate() + 14);
      const iso = (d) => d.toISOString().slice(0, 10);
      const [personas, planes, membresias, pagos, solicitudes, clases, reservas, ingresos, ejercicios, rutinas, rutina_ejercicios, asignaciones, registros, ocupacion] = await Promise.all([
        c.from('personas').select('*').order('nombre'), c.from('planes').select('*').order('orden'),
        c.from('membresias').select('*'), c.from('pagos').select('*').gte('fecha', iso(desde)),
        c.from('solicitudes').select('*').order('creado_en', { ascending: false }),
        c.from('clases').select('*').eq('activa', true).order('hora'),
        c.from('reservas').select('*').gte('fecha', iso(rDesde)).lte('fecha', iso(rHasta)),
        c.from('ingresos').select('*').gte('momento', desde.toISOString()).order('momento', { ascending: false }),
        c.from('ejercicios').select('*').order('nombre'), c.from('rutinas').select('*').eq('activa', true).order('nombre'),
        c.from('rutina_ejercicios').select('*').order('dia').order('orden'),
        c.from('asignaciones').select('*'), c.from('registros').select('*').order('fecha', { ascending: false }).limit(5000),
        c.rpc('ocupacion_clases', { desde: iso(rDesde), hasta: iso(rHasta) }),
      ].map(p => p.then(ok)));
      return { personas, planes, membresias, pagos, solicitudes, clases, reservas, ingresos, ejercicios, rutinas, rutina_ejercicios, asignaciones, registros, ocupacion };
    },

    // Todos los pagos de una persona (datos() sólo trae los últimos 30 días).
    async pagosDe(persona_id) { return ok(await cliente().from('pagos').select('*').eq('persona_id', persona_id).order('fecha', { ascending: false })); },
    async marcarIngreso(persona_id, medio = 'mostrador') { return ok(await cliente().from('ingresos').insert({ persona_id, medio }).select().single()); },
    async crearPersona({ nombre, telefono, mail, rol = 'socio', clave, objetivo, nota }) {
      const { data, error: e } = await cliente().functions.invoke('crear-socio', { body: { nombre, telefono, mail, rol, clave } });
      if (e) throw error(e); if (data?.error) throw new Error(data.error);
      if (objetivo || nota) ok(await cliente().from('personas').update({ objetivo, nota }).eq('id', data.id));
      return { id: data.id, nombre, telefono, rol };
    },
    async editarPersona(id, campos) { return ok(await cliente().from('personas').update(campos).eq('id', id).select().single()); },
    async cobrar({ persona_id, plan_id, periodo = 'mensual', medio = 'efectivo', importe, desde, registrado_por }) {
      const meses = periodo === 'trimestral' ? 3 : 1;
      const inicio = desde || hoyIso();
      const m = ok(await cliente().from('membresias').insert({ persona_id, plan_id, periodo, desde: inicio, hasta: sumarMeses(inicio, meses), importe, medio }).select().single());
      ok(await cliente().from('pagos').insert({ persona_id, membresia_id: m.id, importe, medio, registrado_por }));
      ok(await cliente().from('solicitudes').update({ estado: 'confirmada', membresia_id: m.id }).eq('persona_id', persona_id).eq('estado', 'pendiente'));
      return m;
    },
    async reservar(clase_id, fecha, persona_id) { return ok(await cliente().from('reservas').upsert({ clase_id, fecha, persona_id, estado: 'reservada' }, { onConflict: 'clase_id,persona_id,fecha' }).select().single()); },
    async cancelarReserva(id) { return ok(await cliente().from('reservas').update({ estado: 'cancelada' }).eq('id', id).select().single()); },
    async cambiarReserva(id, clase_id, fecha) {
      const vieja = ok(await cliente().from('reservas').select('*').eq('id', id).single());
      const nueva = await this.reservar(clase_id, fecha, vieja.persona_id);
      if (nueva.id !== id) await this.cancelarReserva(id);
      return nueva;
    },
    async marcarAsistencia(reserva_id, estado) { return ok(await cliente().from('reservas').update({ estado }).eq('id', reserva_id).select().single()); },
    async guardarRutina(rutina, ejercicios) {
      const c = cliente(); let r;
      if (rutina.id) { r = ok(await c.from('rutinas').update(rutina).eq('id', rutina.id).select().single()); ok(await c.from('rutina_ejercicios').delete().eq('rutina_id', r.id)); }
      else r = ok(await c.from('rutinas').insert({ general: false, ...rutina }).select().single());
      if (ejercicios.length) ok(await c.from('rutina_ejercicios').insert(ejercicios.map((e, i) => ({ rutina_id: r.id, dia: e.dia, orden: e.orden ?? i + 1, ejercicio_id: e.ejercicio_id, series: e.series, reps: String(e.reps), descanso_seg: e.descanso_seg ?? null, nota: e.nota || null }))));
      return r;
    },
    async asignarRutina(persona_id, rutina_id, nota, asignada_por) {
      const c = cliente(); const hoy = hoyIso();
      ok(await c.from('asignaciones').update({ hasta: hoy }).eq('persona_id', persona_id).is('hasta', null));
      return ok(await c.from('asignaciones').insert({ persona_id, rutina_id, nota, asignada_por, desde: hoy }).select().single());
    },
    async guardarEjercicio(e) { return ok(await cliente().from('ejercicios').upsert(e).select().single()); },
    async registrar({ persona_id, ejercicio_id, rutina_ejercicio_id, serie, reps, peso_kg, fecha }) {
      return ok(await cliente().from('registros').upsert({ persona_id, ejercicio_id, rutina_ejercicio_id: rutina_ejercicio_id || null, serie, reps, peso_kg, fecha: fecha || hoyIso() }, { onConflict: 'persona_id,ejercicio_id,fecha,serie' }).select().single());
    },
    async guardarClase(c) { return ok(await cliente().from('clases').upsert(c).select().single()); },
    async reiniciarDemo() { throw new Error('No hay demo que reiniciar: estás en la base real.'); },
  };

  const api = demo ? apiDemo : apiReal;
  api.forzadoDemo = forzado; api.sinConfig = sinConfig;
  api.ROLES = ROLES;
  api.rotuloRol = (rol) => ROLES[rol] || rol;
  api.destino = (p) => `${PANEL[p.rol] || 'app'}/index.html`;   // con index.html explícito: funciona también con file://

  // Exige sesión: devuelve la persona o manda a ingresar. `roles` limita quién puede estar acá.
  api.exigir = async function (roles) {
    const p = await api.sesion();
    const volver = encodeURIComponent(location.pathname.split('/').slice(-2).join('/'));
    if (!p) { location.replace(`../ingresar.html?volver=${volver}`); return null; }
    if (p.debe_cambiar_clave && !location.pathname.endsWith('clave.html')) { location.replace('../clave.html'); return null; }
    if (roles && !roles.includes(p.rol)) { location.replace('../' + api.destino(p)); return null; }
    return p;
  };
  api.aMail = aMail;
  api.hoyIso = hoyIso;
  return api;
})();
