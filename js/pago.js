// Cómo pagar el plan: un solo bloque que usan el registro (registro.html) y el
// perfil (perfil.html). Muestra el importe y, según el medio que elige el socio,
// lo que tiene que hacer: el QR de Mercado Pago, las opciones de Naranja X, el
// alias para transferir o el descuento por efectivo en el gym.
//
// El pago NO se cobra acá: la página no tiene credenciales de nadie. El socio paga
// por su lado (QR, transferencia, tarjeta o efectivo) y el gym confirma desde
// recepción («Cobrar»), que es lo que crea la membresía. Mientras tanto la solicitud
// queda «por confirmar» y el socio la ve en su perfil.
//
// Lo que falta cargar (links de Mercado Pago, alias) está en CONTENIDO.pagos; hasta
// que esté, la página lo dice con un marcador, nunca inventa un dato.

window.PAGO = (() => {
  const { $, $$, ic, ARS } = DS;
  const C = () => window.CONTENIDO;

  const MEDIOS = [
    { id: 'mercado_pago', nombre: 'Mercado Pago', sub: 'QR o link, desde el celular', icono: 'qr' },
    { id: 'tarjeta', nombre: 'Naranja X / tarjeta', sub: 'Plan Z, un pago, Visa, Mastercard', icono: 'cobros' },
    { id: 'transferencia', nombre: 'Transferencia', sub: 'Al alias del gym', icono: 'pagos' },
    { id: 'efectivo', nombre: 'Efectivo en el gym', sub: '10 % menos', icono: 'ingreso' },
  ];
  const nombreMedio = (id) => (MEDIOS.find(m => m.id === id) || { nombre: id }).nombre;

  // Cuánto se paga: mensual = precio del mes; trimestral = 3 × precio congelado por mes.
  // El 10 % sólo en efectivo (no acumulable con nada).
  function importe(plan, periodo = 'mensual', medio = 'mercado_pago') {
    const meses = periodo === 'trimestral' ? 3 : 1;
    const porMes = periodo === 'trimestral' ? plan.tri : plan.mensual;
    const base = porMes * meses;
    const descuento = medio === 'efectivo' ? Math.round(base * C().descuentoEfectivo) : 0;
    return { meses, porMes, base, descuento, total: base - descuento };
  }

  const wa = (txt) => `https://wa.me/${C().gym.whatsapp}?text=${encodeURIComponent(txt)}`;
  const marcador = (txt) => `<span class="etq">${ic('camara')}${txt}</span>`;

  function cuerpoMedio(est) {
    const { plan, periodo, medio, persona } = est;
    const imp = importe(plan, periodo, medio);
    const P = C().pagos; const quien = persona ? persona.nombre : 'socio nuevo';
    const comprobante = `<a class="btn btn-secundario" href="${wa(`Hola, soy ${quien}. Pagué el plan ${plan.nombre} ${periodo === 'trimestral' ? 'trimestral' : 'mensual'} (${ARS(imp.total)}) y les mando el comprobante.`)}" target="_blank" rel="noopener">${ic('wa')}Mandar el comprobante</a>`;
    const clave = `${plan.id}-${periodo}`;

    if (medio === 'mercado_pago') {
      const link = P.mercadoPago.links[clave] || P.mercadoPago.links.general || '';
      const qr = link ? `<canvas class="qr" data-qr="${link}" aria-label="QR de Mercado Pago para pagar ${ARS(imp.total)}"></canvas>`
        : P.mercadoPago.qrImagen ? `<img class="qr" src="${P.mercadoPago.qrImagen}" alt="QR de Mercado Pago del gym">`
        : `<div class="qr marcador">${marcador('QR · lo carga el gym')}</div>`;
      return `<div class="pago-qr">${qr}<div>
          <p>Escaneá el QR desde la app de Mercado Pago${link ? '' : P.mercadoPago.qrImagen ? ` y poné <b>${ARS(imp.total)}</b>` : ''}.${link ? ' El importe ya va cargado.' : ''}</p>
          ${link ? `<a class="btn btn-primario" href="${link}" target="_blank" rel="noopener">Abrir en Mercado Pago</a>` : ''}
          <p class="secundario">Cuando el gym ve el pago, tu plan arranca. Si querés que sea más rápido, mandá el comprobante.</p>${comprobante}</div></div>`;
    }
    if (medio === 'tarjeta') {
      const ops = P.naranjaX.opciones;
      est.opcionTarjeta = est.opcionTarjeta || (ops.find(o => !o.periodo || o.periodo === periodo) || ops[0]).id;
      return `<div class="pago-opciones" role="radiogroup" aria-label="Opciones con Naranja X">${ops.map(o => { const vale = !o.periodo || o.periodo === periodo; return `<button type="button" class="opcion-pago" role="radio" data-op="${o.id}" aria-checked="${est.opcionTarjeta === o.id}" ${vale ? '' : 'disabled'}><b>${o.nombre}</b><small>${o.detalle}${vale ? '' : ` · sólo con el plan de 3 meses`}</small></button>`; }).join('')}</div>
        <p>${est.opcionTarjeta === 'plan_z' ? `Con <b>Plan Z</b> el trimestral (${ARS(imp.total)}) sale en cuotas con tu Naranja X.` : `Un pago de <b>${ARS(imp.total)}</b> con Naranja X, Visa o Mastercard.`} Se pasa la tarjeta <b>en el gym</b>, con posnet, cuando vengas.</p>
        <p class="secundario">${P.naranjaX.nota}</p>`;
    }
    if (medio === 'transferencia') {
      return `<div class="pago-alias">${P.alias ? `<span class="rotulo">Alias</span><div class="alias"><b class="cod">${P.alias}</b><button type="button" class="btn btn-fantasma btn-compacto" data-copiar="${P.alias}">${ic('copiar')}Copiar</button></div><span class="secundario">Titular: ${P.titular}</span>`
        : `<span class="rotulo">Alias</span><div class="alias marcador">${marcador('Alias de transferencia · lo pasa el gym')}</div>`}</div>
        <p>Transferí <b>${ARS(imp.total)}</b> y mandá el comprobante: con eso el gym te activa el plan.</p>${comprobante}`;
    }
    return `<p>Pagás <b>${ARS(imp.total)}</b> en el mostrador la primera vez que vengas: <b>${ARS(imp.descuento)} menos</b> que por cualquier otro medio.</p>
      <p class="secundario">${C().gym.horario}. Tu cuenta ya queda creada; el plan arranca el día que pagás.</p>`;
  }

  // html del bloque entero: resumen del importe + medios + detalle del medio elegido
  function html(est) {
    const imp = importe(est.plan, est.periodo, est.medio);
    return `<div class="pago">
      <div class="pago-total"><span class="rotulo">${est.plan.nombre} · ${est.periodo === 'trimestral' ? '3 meses, precio congelado' : 'un mes'}</span>
        <div class="monto"><b class="display num">${ARS(imp.total)}</b>${imp.descuento ? `<s class="num">${ARS(imp.base)}</s>` : ''}</div>
        <span class="secundario">${est.periodo === 'trimestral' ? `${ARS(imp.porMes)} por mes × 3` : 'por mes'}${imp.descuento ? ' · 10 % menos en efectivo' : ''}</span></div>
      <div class="pago-medios" role="radiogroup" aria-label="Cómo pagás">${MEDIOS.map(m => `<button type="button" class="medio" role="radio" data-medio="${m.id}" aria-checked="${est.medio === m.id}">${ic(m.icono)}<span><b>${m.nombre}</b><small>${m.sub}</small></span></button>`).join('')}</div>
      <div class="pago-detalle" id="pago-detalle">${cuerpoMedio(est)}</div>
    </div>`;
  }

  // Dibuja los QR que haya en el bloque (la librería se carga sólo si hace falta).
  function dibujarQR(el) {
    const cs = $$('canvas[data-qr]', el); if (!cs.length) return;
    const css = getComputedStyle(document.documentElement);
    const pintar = () => cs.forEach(c => window.QRCode.toCanvas(c, c.dataset.qr, { width: 200, margin: 1, color: { dark: css.getPropertyValue('--qr-oscuro').trim(), light: css.getPropertyValue('--qr-claro').trim() } }));
    if (window.QRCode) return pintar();
    if (!document.querySelector('script[data-qrcode]')) { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1/build/qrcode.min.js'; s.dataset.qrcode = '1'; s.onload = pintar; document.head.appendChild(s); }
    else document.querySelector('script[data-qrcode]').addEventListener('load', pintar);
  }

  // Monta el bloque en `el` y avisa cada vez que cambia el medio: alCambiar(medio, importeTotal)
  function montar(el, est, alCambiar) {
    const pintar = () => {
      el.innerHTML = html(est); dibujarQR(el);
      $$('[data-medio]', el).forEach(b => b.onclick = () => { est.medio = b.dataset.medio; pintar(); if (alCambiar) alCambiar(est.medio, importe(est.plan, est.periodo, est.medio).total); });
      $$('[data-op]', el).forEach(b => b.onclick = () => { est.opcionTarjeta = b.dataset.op; pintar(); });
      $$('[data-copiar]', el).forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copiar); DS.toast('Alias copiado'); } catch (e) { DS.toast('No se pudo copiar; anotalo a mano', 'alerta'); } });
    };
    pintar();
    return { pintar, estado: est };
  }

  return { MEDIOS, nombreMedio, importe, html, montar };
})();
