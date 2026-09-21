// Piezas que comparten registro.html y perfil.html: la barra simple del sitio, el
// selector de plan y período, y el texto de una solicitud pendiente.

window.CUENTA = (() => {
  const { $, $$, ic, ARS } = DS;
  const C = () => window.CONTENIDO;
  const planDe = (id) => C().planes.find(p => p.id === id) || C().planes.find(p => p.elegido);

  // Barra del sitio sin paradas: logo, nombre y los botones de cuenta.
  function barra(botones) {
    return `<header class="barra simple"><div class="barra-int">
      <a class="marca-link" href="index.html" aria-label="Volver a la página del gym"><img class="logo" src="recursos/logo.png" alt=""></a>
      <span class="nombre">Natura Gym</span>
      <nav aria-label="Cuenta"><div class="cuenta-btns">${botones}</div></nav>
    </div></header>`;
  }

  // Selector de plan (los tres, con el precio del período elegido) + mensual / 3 meses.
  // est = { plan_id, periodo }; alCambiar() se llama con cada toque.
  function selectorPlan(el, est, alCambiar) {
    const pintar = () => {
      el.innerHTML = `<div class="fila-periodo"><span class="rotulo">Período</span><div class="segmentado" role="radiogroup" aria-label="Período"><button type="button" role="radio" data-periodo="mensual" aria-checked="${est.periodo === 'mensual'}">Mensual</button><button type="button" role="radio" data-periodo="trimestral" aria-checked="${est.periodo === 'trimestral'}">3 meses · precio congelado</button></div></div>
        <div class="opciones-plan" role="radiogroup" aria-label="Plan">${C().planes.map(p => `<button type="button" class="opcion-plan" role="radio" data-plan="${p.id}" aria-checked="${est.plan_id === p.id}"><b>${p.nombre}${p.elegido ? ' · el más elegido' : ''}</b><small>${p.resumen}</small><span class="precio num">${ARS(est.periodo === 'trimestral' ? p.tri : p.mensual)}<small>por mes</small></span></button>`).join('')}</div>
        ${est.periodo === 'trimestral' ? `<p class="secundario">El trimestral se paga entero (3 meses) y el precio queda congelado. ${planDe(est.plan_id).triNota}.</p>` : ''}`;
      $$('[data-periodo]', el).forEach(b => b.onclick = () => { est.periodo = b.dataset.periodo; pintar(); if (alCambiar) alCambiar(); });
      $$('[data-plan]', el).forEach(b => b.onclick = () => { est.plan_id = b.dataset.plan; pintar(); if (alCambiar) alCambiar(); });
    };
    pintar();
  }

  const nombrePeriodo = (p) => p === 'trimestral' ? '3 meses' : 'mensual';

  return { barra, selectorPlan, planDe, nombrePeriodo };
})();
