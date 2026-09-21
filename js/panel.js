/* Armazón de los paneles («el mostrador partido»): barra lateral oscura en compu,
   pestañas abajo en el celular; a la izquierda la columna en vivo, a la derecha
   el trabajo. Cada rol declara sus secciones y qué va en la columna en vivo.

   PANEL.montar({
     roles: ['recepcion'], subtitulo: 'Recepción',
     grupos: [{ rotulo:'Hoy', secciones:['hoy','turnos'] }, …],
     secciones: { hoy: { t, d, ic, h(ctx) → html, montar(ctx, el), accion(ctx) → html } },
     pestanas: ['hoy','turnos','socios'],          // celular (más «Ahora» si hay columna en vivo)
     vivo: { t:'Ahora en el gym', h(ctx) → html, montar(ctx, el) } | null,
     alEntrar(ctx)
   })
   ctx = { yo, d, recargar(), pintar(), ir(k), refrescarVivo() } */
window.PANEL = (() => {
  const { $, $$, ic, fechaLarga, alternarTema, persona: personaHtml, estadoError, esqueleto } = DS;
  const CELULAR = () => matchMedia('(max-width: 760px)').matches;

  function montar(cfg) {
    const app = $('#app');
    const conVivo = !!cfg.vivo;
    // Nombre fijo de la sección para la barra (el título puede depender de la subruta).
    const nombre = (k) => { const s = cfg.secciones[k]; return s.nombre || (typeof s.t === 'string' ? s.t : k); };
    app.className = 'app' + (conVivo ? ' partido' : '');
    app.innerHTML = `
      <nav class="nav" aria-label="Secciones">
        <a class="nav-marca" href="../index.html" title="Ir a la página del gym"><img src="../recursos/logo.png" alt=""><div><b>Natura Gym</b><small>${cfg.subtitulo}</small></div></a>
        ${cfg.grupos.map(g => `<div class="nav-grupo"><div class="rotulo">${g.rotulo}</div>${g.secciones.map(k => `<a href="#${k}" data-k="${k}" title="${nombre(k)}">${ic(cfg.secciones[k].ic)}<span>${nombre(k)}</span><span class="cuenta" hidden></span></a>`).join('')}</div>`).join('')}
        <div class="nav-pie">
          <div class="estado-sis" title="${API.demo ? 'Modo demo · datos inventados' : 'Conectado a la base'}"><i></i><span id="estado-sis">${API.demo ? 'Modo demo · datos inventados' : 'Conectado a la base'}</span></div>
          <div id="yo"></div>
          <button class="btn btn-fantasma btn-compacto" type="button" id="btn-salir" title="Cerrar sesión">${ic('salir')}<span>Cerrar sesión</span></button>
        </div>
      </nav>
      <div class="principal">
        <header class="cabecera">
          <button class="btn-icono solo-celu" type="button" id="btn-atras" aria-label="Volver" hidden>${ic('atras')}</button>
          <div class="cab-titulo"><h1 id="titulo"></h1><div class="desc" id="desc"></div></div>
          <div class="acciones" id="acciones"></div>
          <button class="btn-icono" type="button" id="btn-tema" title="Claro / oscuro" aria-label="Claro / oscuro">${ic('tema')}</button>
        </header>
        <div class="contenido${conVivo ? ' partido' : ''}" id="contenido">
          ${conVivo ? `<aside class="vivo" id="vivo" aria-label="${cfg.vivo.t}"></aside>` : ''}
          <main class="trabajo" id="cuerpo"></main>
        </div>
      </div>
      <nav class="pestanas" id="pestanas" aria-label="Secciones">
        ${conVivo ? `<a href="#ahora" data-k="ahora">${ic(cfg.vivo.ic || 'reloj')}${cfg.vivo.pestana || 'Ahora'}</a>` : ''}
        ${cfg.pestanas.map(k => `<a href="#${k}" data-k="${k}">${ic(cfg.secciones[k].ic)}${nombre(k)}</a>`).join('')}
      </nav>`;

    $('#btn-tema').onclick = alternarTema;
    $('#btn-salir').onclick = async () => { await API.salir(); location.replace('../ingresar.html'); };

    const ctx = { yo: null, d: null, cfg,
      async recargar() { ctx.d = await API.datos(); },
      ir(k) { location.hash = '#' + k; },
      pintar, refrescarVivo, contar,
    };
    let seccionActual = null, timer = null;

    function claveActual() {
      const k = (location.hash || '').slice(1).split('/')[0];
      if (k === 'ahora' && conVivo) return 'ahora';
      return cfg.secciones[k] ? k : cfg.pestanas[0];
    }
    function pintar() {
      if (!ctx.d) return;   // el hash cambió antes de que llegaran los datos: se pinta al terminar de cargar
      const k = claveActual();
      const sub = (location.hash || '').slice(1).split('/').slice(1);
      document.body.dataset.sec = k;
      $$('.nav a, .pestanas a').forEach(a => { if (a.dataset.k === k) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      if (k === 'ahora') {
        $('#contenido').classList.remove('enfocada');
        $('#titulo').textContent = cfg.vivo.t; $('#desc').textContent = fechaLarga(new Date()); $('#acciones').innerHTML = '';
        refrescarVivo(); $('#btn-atras').hidden = true;
        return;
      }
      const s = cfg.secciones[k]; seccionActual = k;
      const enfocada = typeof s.enfocada === 'function' ? s.enfocada(ctx, sub) : !!s.enfocada;
      $('#contenido').classList.toggle('enfocada', enfocada);
      $('#titulo').textContent = typeof s.t === 'function' ? s.t(ctx, sub) : s.t;
      $('#desc').textContent = typeof s.d === 'function' ? s.d(ctx, sub) : (s.d || '');
      $('#acciones').innerHTML = s.accion ? s.accion(ctx, sub) : '';
      $('#btn-atras').hidden = !sub.length;
      $('#btn-atras').onclick = () => ctx.ir(k);
      const cuerpo = $('#cuerpo');
      try { cuerpo.innerHTML = s.h(ctx, sub); s.montar && s.montar(ctx, cuerpo, sub); }
      catch (e) { console.error(e); cuerpo.innerHTML = `<div class="panel">${estadoError('No se pudo mostrar esta sección', e.message, '<button class="btn btn-secundario" type="button" onclick="location.reload()">Volver a cargar</button>')}</div>`; }
      if (s.montarAcciones) s.montarAcciones(ctx, $('#acciones'), sub);
      elastizar(cuerpo);
      cuerpo.scrollTop = 0; $('#contenido').scrollTop = 0; window.scrollTo(0, 0);
      if (conVivo) refrescarVivo();
    }
    // En compu la sección entera entra en la pantalla (ver sitio.css): en cada panel del
    // trabajo, lo que va entre la cabecera y el pie se envuelve en `.panel-elastico`, que
    // se recorre solo cuando no entra. Los `.panel-cuerpo` quedan afuera salvo que lleven
    // `elastico` (buscador, chips y gráficos no se achican). El piso es su propio alto o
    // `--piso-elastico`, lo que sea menor: una lista corta no se achica, una larga muestra
    // por lo menos unas filas. Los nodos se mueven, no se copian: los handlers siguen vivos.
    function elastizar(raiz) {
      const piso = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--piso-elastico')) || 0;
      $$(':scope>.panel, :scope>:is(.fila-2,.fila-3)>.col>.panel, :scope>.armador>.panel', raiz).forEach(panel => {
        if ($(':scope>.panel-elastico', panel)) return;
        const hijos = [...panel.children];
        let desde = hijos.findIndex(h => !h.matches('.panel-cab, .panel-cuerpo:not(.elastico)'));
        if (desde < 0) return;
        let hasta = hijos.length; while (hasta > desde && hijos[hasta - 1].matches('.panel-pie')) hasta--;
        if (hasta <= desde) return;
        const env = document.createElement('div'); env.className = 'panel-elastico';
        panel.insertBefore(env, hijos[desde]);
        hijos.slice(desde, hasta).forEach(h => env.appendChild(h));
        if (!piso) return;
        // El piso va en el envoltorio y en el panel (con overflow:hidden el mínimo del panel
        // sería 0 y aplastaría la lista aunque ella tenga piso).
        const pisoLista = Math.min(env.scrollHeight, piso);
        const fijo = [...panel.children].filter(h => h !== env).reduce((t, h) => t + h.getBoundingClientRect().height, 0);
        env.style.minHeight = pisoLista + 'px';
        panel.style.minHeight = Math.ceil(fijo + pisoLista) + 'px';
      });
    }
    function refrescarVivo() {
      if (!conVivo || !ctx.d) return;
      const el = $('#vivo');
      try { el.innerHTML = cfg.vivo.h(ctx); cfg.vivo.montar && cfg.vivo.montar(ctx, el); } catch (e) { console.error(e); el.innerHTML = estadoError('La columna en vivo falló', e.message); }
    }
    // Contadores en la barra lateral (p. ej. «3» al lado de Pendientes).
    function contar(k, n) { const c = $(`.nav a[data-k="${k}"] .cuenta`); if (!c) return; c.textContent = n; c.hidden = !n; }

    addEventListener('hashchange', pintar);
    // La columna en vivo se refresca sola cada minuto (la hora, quién entró).
    timer = setInterval(async () => { if (document.hidden) return; await ctx.recargar(); refrescarVivo(); if (cfg.secciones[seccionActual]?.enVivo) pintar(); }, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { ctx.recargar().then(() => { refrescarVivo(); }); } });

    API.exigir(cfg.roles).then(async p => {
      if (!p) return;
      ctx.yo = p;
      $('#yo').innerHTML = personaHtml({ ini: Q.ini(p.nombre), n: p.nombre }, API.rotuloRol(p.rol));
      $('#cuerpo').innerHTML = `<div class="panel">${esqueleto(5)}</div>`;
      app.hidden = false;
      try { await ctx.recargar(); }
      catch (e) { $('#cuerpo').innerHTML = `<div class="panel">${estadoError('No se pudieron traer los datos', e.message, '<button class="btn btn-secundario" type="button" onclick="location.reload()">Reintentar</button>')}</div>`; return; }
      cfg.alEntrar && cfg.alEntrar(ctx);
      // En compu, «#ahora» no es una sección: la columna ya está a la vista.
      if (!CELULAR() && (location.hash || '').slice(1) === 'ahora') location.replace('#' + cfg.pestanas[0]);
      pintar();
    });
    return ctx;
  }

  // Al pasar de celular a compu con «#ahora» abierto, se vuelve a la primera sección.
  matchMedia('(max-width: 760px)').addEventListener('change', e => { if (!e.matches && (location.hash || '').slice(1) === 'ahora') location.replace('#' + ($('.pestanas a:nth-child(2)')?.dataset.k || 'hoy')); });

  return { montar, CELULAR };
})();
