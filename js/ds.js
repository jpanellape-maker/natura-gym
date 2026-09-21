/* Librería de componentes del prototipo: iconos, formatos, toast, modal, QR, muñeco. */
window.DS=(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ARS=n=>'$'+n.toLocaleString('es-AR');
const KG=n=>n.toLocaleString('es-AR');
const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIAS_C=['D','L','M','X','J','V','S'];
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const fechaLarga=f=>`${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`;
const fechaCorta=f=>`${String(f.getDate()).padStart(2,'0')}/${String(f.getMonth()+1).padStart(2,'0')}`;
const fechaAnio=f=>`${fechaCorta(f)}/${f.getFullYear()}`;
const hace=n=>n===0?'hoy':n===1?'ayer':`hace ${n} días`;

/* Un solo set de iconos: trazo 2, extremos redondeados, grilla 24. */
const I={
  hoy:'<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="3"/>',
  socios:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/>',
  cobros:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
  clases:'<path d="M4 12h2M18 12h2"/><rect x="6" y="8" width="3" height="8" rx="1"/><rect x="15" y="8" width="3" height="8" rx="1"/><path d="M9 12h6"/>',
  ingreso:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
  planes:'<path d="M20 12V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6"/><path d="M4 10h16"/><path d="M16 19l2 2 4-4"/>',
  equipo:'<circle cx="12" cy="7" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  rutina:'<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7h-7M17 21h.01"/>',
  pagos:'<path d="M12 2v20M17 6.5a4 4 0 0 0-3.5-2.5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-3.5A4 4 0 0 1 7 13.5"/>',
  tilde:'<path d="M20 6L9 17l-5-5"/>',
  cerrar:'<path d="M18 6L6 18M6 6l12 12"/>',
  mas:'<path d="M12 5v14M5 12h14"/>',
  menos:'<path d="M5 12h14"/>',
  buscar:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  alerta:'<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  ok:'<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
  error:'<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
  chev:'<path d="M9 6l6 6-6 6"/>',
  atras:'<path d="M15 18l-6-6 6-6"/>',
  wa:'<path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.3A8.5 8.5 0 1 1 21 11.5z"/>',
  reloj:'<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/>',
  lapiz:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  basura:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  reiniciar:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/>',
  tema:'<path d="M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.4A5.5 5.5 0 0 1 13.4 3.1C13 3 12.5 3 12 3z"/>',
  volver:'<path d="M3 12h18M3 12l6-6M3 12l6 6"/>',
  camara:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
  campana:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  filtro:'<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  ordenar:'<path d="M12 5v14M8 9l4-4 4 4M8 15l4 4 4-4"/>',
  copiar:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  salir:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  dueno:'<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
  profe:'<circle cx="12" cy="7" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M16 4l3-1v4"/>',
  socio:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/>',
  tablet:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 17h.01"/>',
  pesa:'<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>',
  fuego:'<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-3-8 0 4-5 6-5 12 0 4 3 7 7 7z"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  ojo:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  candado:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  mapa:'<path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
};
const ic=(k,cls='')=>`<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[k]||''}</svg>`;

/* tema: respeta el sistema y permite forzar */
function tema(t){if(t)document.documentElement.dataset.theme=t;else delete document.documentElement.dataset.theme;try{localStorage.setItem('ng-tema',t||'');}catch(e){}}
try{const q=new URLSearchParams(location.search).get('tema');const t=q||localStorage.getItem('ng-tema');if(t)document.documentElement.dataset.theme=t;}catch(e){}
function alternarTema(){const oscuro=matchMedia('(prefers-color-scheme:dark)').matches;const actual=document.documentElement.dataset.theme||(oscuro?'dark':'light');tema(actual==='dark'?'light':'dark');}

/* toast */
function toast(txt,icono='ok'){let c=$('.toasts');if(!c){c=document.createElement('div');c.className='toasts';document.body.appendChild(c);}
  const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.innerHTML=ic(icono)+'<span>'+txt+'</span>';c.appendChild(t);
  setTimeout(()=>{t.style.transition='opacity 180ms';t.style.opacity='0';setTimeout(()=>t.remove(),200);},2600);}

/* modal */
function modal({titulo,cuerpo,pie='',alCerrar}){
  const f=document.createElement('div');f.className='modal-fondo';
  f.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-t"><div class="modal-cab"><h3 id="modal-t">${titulo}</h3><button type="button" class="btn-icono" data-cerrar aria-label="Cerrar">${ic('cerrar')}</button></div><div class="modal-cuerpo">${cuerpo}</div>${pie?`<div class="modal-pie">${pie}</div>`:''}</div>`;
  const cerrar=()=>{f.remove();document.removeEventListener('keydown',esc);alCerrar&&alCerrar();};
  const esc=e=>{if(e.key==='Escape')cerrar();};
  f.addEventListener('click',e=>{if(e.target===f||e.target.closest('[data-cerrar]'))cerrar();});
  document.addEventListener('keydown',esc);document.body.appendChild(f);
  const primero=f.querySelector('input,select,button:not([data-cerrar])');primero&&primero.focus();
  return {el:f,cerrar};
}

/* QR simulado: patrón determinístico a partir del código (no es un QR real, pero se ve como uno) */
function qr(codigo,tam=180){
  const N=25,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');
  g.fillStyle='#fff';g.fillRect(0,0,N,N);g.fillStyle='#0E1419';
  let h=2166136261;for(const ch of codigo){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
  const rnd=()=>{h^=h<<13;h>>>=0;h^=h>>>17;h^=h<<5;h>>>=0;return h/4294967296;};
  const ojo=(x,y)=>{g.fillRect(x,y,7,7);g.fillStyle='#fff';g.fillRect(x+1,y+1,5,5);g.fillStyle='#0E1419';g.fillRect(x+2,y+2,3,3);};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const enOjo=(x<8&&y<8)||(x>=N-8&&y<8)||(x<8&&y>=N-8);if(!enOjo&&rnd()<.45)g.fillRect(x,y,1,1);}
  ojo(0,0);ojo(N-7,0);ojo(0,N-7);
  for(let i=8;i<N-8;i++){if(i%2===0){g.fillRect(i,6,1,1);g.fillRect(6,i,1,1);}}
  const img=document.createElement('img');img.className='qr';img.width=img.height=tam;img.alt='Código QR de ingreso';img.src=c.toDataURL();return img;
}

/* muñeco: silueta simétrica, se dibuja la mitad derecha y se espeja */
const MUSC={pecho:'pecho',hombros:'hombros',biceps:'bíceps',triceps:'tríceps',abdomen:'abdomen',dorsales:'espalda',cuadriceps:'cuádriceps',gluteos:'glúteos',isquios:'isquiotibiales',gemelos:'gemelos'};
const MITAD='M49 27L56 27C57 32 62 35 69 37C77 39 80 46 80 57C80 71 82 87 84 100C85 110 82 114 78 113C75 112 74 106 73 98C71 86 69 74 68 64C67 62 66 62 66 66C64 78 64 90 66 108C67 118 68 128 66 142C65 154 63 160 63 172C63 182 62 190 62 194C62 197 65 199 60 199L52 199C52 190 52 180 52 172C52 160 51 140 51 126C51 121 49 118 49 116Z';
const MUSC_SVG={
  pecho:'<path d="M49 40C58 38 66 40 68 46C68 54 60 58 49 56Z"/>',
  hombros:'<path d="M66 37C72 35 78 39 79 46C77 50 70 50 66 46Z"/>',
  biceps:'<ellipse cx="75" cy="68" rx="4.5" ry="12"/>',
  abdomen:'<rect x="49.5" y="60" width="8" height="8" rx="2"/><rect x="49.5" y="70" width="8" height="8" rx="2"/><rect x="49.5" y="80" width="8" height="8" rx="2"/>',
  cuadriceps:'<ellipse cx="58" cy="140" rx="6.5" ry="24"/>',
  dorsales:'<path d="M49 40L67 43C69 52 64 66 56 78L49 82Z"/>',
  triceps:'<ellipse cx="75" cy="68" rx="4.5" ry="12"/>',
  gluteos:'<ellipse cx="58" cy="111" rx="7.5" ry="8"/>',
  isquios:'<ellipse cx="58" cy="142" rx="6" ry="22"/>',
  gemelos:'<ellipse cx="57" cy="177" rx="4.5" ry="12"/>'
};
const FRENTE=['pecho','hombros','biceps','abdomen','cuadriceps'],ESPALDA=['hombros','dorsales','triceps','gluteos','isquios','gemelos'];
function muneco(vista,ms){
  const lista=vista==='f'?FRENTE:ESPALDA;
  const capa=lista.map(k=>`<g class="m${ms.includes(k)?' on':''}">${MUSC_SVG[k]}</g>`).join('');
  const espejo='transform="matrix(-1 0 0 1 100 0)"';
  return `<svg viewBox="0 0 100 208" aria-hidden="true"><g class="cuerpo"><circle cx="50" cy="13" r="10"/><rect x="45" y="20" width="10" height="9"/><path d="${MITAD}"/><path d="${MITAD}" ${espejo}/></g>${capa}<g ${espejo}>${capa}</g><text class="vista" x="50" y="207" text-anchor="middle">${vista==='f'?'FRENTE':'ESPALDA'}</text></svg>`;
}
const munecos=ms=>`<div class="muneco">${muneco('f',ms)}${muneco('e',ms)}</div>`;
/* animación del ejercicio (si hay) + muñeco con los músculos pintados */
const demo=(nombre,ms)=>{const m=(window.EJERCICIOS_MEDIA||{})[nombre];return `<div class="demo">${m?`<img src="${m.gif}" alt="Animación de ${nombre}" loading="lazy">`:''}${munecos(ms)}</div>`;};
const comoSeHace=nombre=>{const m=(window.EJERCICIOS_MEDIA||{})[nombre];if(!m)return '';return `<details class="como"><summary>${ic('chev')}Cómo se hace</summary><ol class="pasos">${m.pasos.map(p=>`<li>${p}</li>`).join('')}</ol><div class="credito">Animación © Gym visual</div></details>`;};

/* estado de cuota → badge escrito */
function badgeCuota(s){
  if(s.estado==='vencida')return `<span class="badge critico">Vencida ${hace(-s.diasVence)}</span>`;
  if(s.estado==='vence-hoy')return `<span class="badge alerta">Vence hoy</span>`;
  if(s.estado==='por-vencer')return `<span class="badge alerta">Vence en ${s.diasVence} días</span>`;
  return `<span class="badge ok">Al día</span>`;
}
const avatar=(s,cls='')=>`<span class="avatar ${cls}" aria-hidden="true">${s.ini}</span>`;
const persona=(s,sub)=>`<div class="persona">${avatar(s)}<div class="quien"><b>${s.n}</b><span>${sub||''}</span></div></div>`;

/* estados vacíos / error */
const vacio=(titulo,txt,accion='')=>`<div class="estado">${ic('info')}<b>${titulo}</b><span>${txt}</span>${accion}</div>`;
const estadoError=(que,como,accion='')=>`<div class="estado error">${ic('alerta')}<b>${que}</b><span>${como}</span>${accion}</div>`;
const esqueleto=(n=4)=>`<div class="esqueleto" aria-busy="true" aria-label="Cargando">${'<i></i>'.repeat(n)}</div>`;

/* tabla con orden por encabezado (flecha visible en todas las columnas) */
function tabla({cols,filas,render,clave,vacioTxt,alClic,pagina=10}){
  let orden={k:cols.find(c=>c.orden)?.k||null,dir:1},pag=0,filtro=()=>true,cont;
  function html(){
    const datos=filas.filter(filtro).slice().sort((a,b)=>{if(!orden.k)return 0;const c=cols.find(c=>c.k===orden.k);const va=c.valor?c.valor(a):a[orden.k],vb=c.valor?c.valor(b):b[orden.k];return (va>vb?1:va<vb?-1:0)*orden.dir;});
    const tot=datos.length,pags=Math.max(1,Math.ceil(tot/pagina));pag=Math.min(pag,pags-1);
    const visibles=datos.slice(pag*pagina,(pag+1)*pagina);
    const th=cols.map(c=>`<th class="${c.der?'der ':''}${c.p?'p'+c.p:''} ${c.k?'ordenable':''}" data-k="${c.k||''}" ${orden.k===c.k&&c.k?`aria-sort="${orden.dir>0?'ascending':'descending'}"`:''}>${c.t}${c.k?'<span class="flecha">▲</span>':''}</th>`).join('');
    const tb=visibles.length?visibles.map(f=>`<tr class="fila" data-id="${clave(f)}">${render(f).map((cel,i)=>`<td class="${cols[i].der?'der ':''}${cols[i].p?'p'+cols[i].p:''}">${cel}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${cols.length}">${vacioTxt||vacio('Nada por acá','No hay filas que coincidan con el filtro.')}</td></tr>`;
    return `<div class="tabla-env"><table class="tabla"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>
      <div class="panel-pie"><span class="num">${tot} ${tot===1?'fila':'filas'}</span><div class="der"><button type="button" class="btn btn-fantasma btn-compacto" data-pag="-1" ${pag===0?'disabled':''}>Anterior</button><span class="num">${pag+1} de ${pags}</span><button type="button" class="btn btn-fantasma btn-compacto" data-pag="1" ${pag>=pags-1?'disabled':''}>Siguiente</button></div></div>`;
  }
  function montar(el){cont=el;pintar();}
  function pintar(){cont.innerHTML=html();
    $$('th.ordenable',cont).forEach(th=>th.onclick=()=>{const k=th.dataset.k;if(orden.k===k)orden.dir*=-1;else orden={k,dir:1};pintar();});
    $$('[data-pag]',cont).forEach(b=>b.onclick=()=>{pag+=+b.dataset.pag;pintar();});
    if(alClic)$$('tr.fila',cont).forEach(tr=>tr.onclick=()=>alClic(tr.dataset.id));}
  return {montar,pintar,filtrar(fn){filtro=fn;pag=0;pintar();}};
}

return {$,$$,ARS,KG,DIAS,DIAS_C,MESES,fechaLarga,fechaCorta,fechaAnio,hace,ic,tema,alternarTema,toast,modal,qr,muneco,munecos,MUSC,demo,comoSeHace,badgeCuota,avatar,persona,vacio,estadoError,esqueleto,tabla};
})();
