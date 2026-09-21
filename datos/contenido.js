// Contenido de la página pública de Natura Gym.
// Todo lo que el gym puede querer cambiar (precios, horarios, nombres) está acá,
// sin tocar el HTML. Fuente: Documentación/planes.md e instagram.md.

window.CONTENIDO = {
  gym: {
    nombre: 'Natura Gym',
    lema: ['Entrená con la ', 'mejor energía.'],
    bajada: 'Musculación, funcional, calistenia, cross y kinesiología en Av. Marconi 853, Río Cuarto. Desde Premium, con un profe que te guía.',
    direccion: 'Av. Marconi 853, Río Cuarto',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Av.+Marconi+853,+R%C3%ADo+Cuarto,+C%C3%B3rdoba',
    horario: 'Lunes a viernes 6:30 a 22:00 · sábados 11:00 a 13:30',
    whatsapp: '5493585725645',
    whatsappTexto: '358 572 5645',
    instagram: 'naturagym.riocuarto',
    convenios: ['Sancor Seguros', 'AGEC', 'Naranja X'],
  },

  // Planes reales (flyer de septiembre 2026). Los precios son por mes.
  // El trimestral «congela el precio por 3 meses» y varía según cantidad de clases.
  planes: [
    { id: 'basico', nombre: 'Básico', mensual: 75000, tri: 58000, triNota: '1 a 3 clases · $ 63.000 con 4 a 6', ingresosPorDia: 1, clasesIncluidas: false, congelar: false,
      resumen: 'Sala y musculación',
      items: [['si', 'Acceso a sala y musculación'], ['no', 'Ayuda del profe en la sala'], ['no', 'Rutina personalizada por objetivo'], ['no', 'Seguimiento mensual del plan'], ['extra', 'Clases grupales: pago extra'], ['extra', 'Cinta caminadora: pago extra'], ['extra', '2 ingresos por día: pago extra'], ['no', 'Congelar días']] },
    { id: 'premium', nombre: 'Premium', mensual: 90000, tri: 75000, triNota: '1 a 3 clases · $ 80.000 con 4 a 6', elegido: true, ingresosPorDia: 1, clasesIncluidas: true, congelar: false,
      resumen: 'Con profe que te guía · clases incluidas',
      items: [['si', 'Acceso a sala y musculación'], ['si', '<b>Ayuda del profe en la sala</b>'], ['si', '<b>Rutina personalizada por objetivo</b>'], ['si', 'Seguimiento mensual del plan'], ['si', 'Clases grupales incluidas'], ['si', '15 % en estética (1ª y 2ª sesión) · 5 % en el bar'], ['extra', '2 ingresos por día: pago extra'], ['no', 'Congelar días']] },
    { id: 'gold', nombre: 'Gold', mensual: 130000, tri: 115000, triNota: '1 a 3 clases · $ 120.000 con 3 a 4', ingresosPorDia: 2, clasesIncluidas: true, congelar: true,
      resumen: 'Todo, 2 ingresos por día y congelar',
      items: [['si', 'Acceso a sala y musculación'], ['si', 'Ayuda del profe en la sala'], ['si', 'Rutina personalizada por objetivo'], ['si', 'Seguimiento mensual del plan'], ['si', 'Clases grupales incluidas'], ['si', '25 % en estética · 10 % en el bar'], ['si', '<b>2 ingresos por día</b>'], ['si', '<b>Congelar hasta 30 días por año</b>']] },
  ],
  descuentoEfectivo: 0.10,

  // Clases y horarios: tabla de Instagram (Documentación/instagram.md). Sin adjetivos que no estén ahí.
  clases: [
    { nombre: 'Cross Training', dias: 'Lun · Mié · Vie', horas: '06:30 y 18:00', desc: 'Fuerza y resistencia en circuito.' },
    { nombre: 'Calistenia', dias: 'Lun a vie', horas: '09:30, 14:30, 16:00 y 18:00', desc: 'Peso corporal, movilidad y control.' },
    { nombre: 'Natural Train', dias: 'Mar · Jue 07:30', horas: 'Lun · Jue 16:30', desc: 'Entrenamiento funcional general.' },
    { nombre: 'Natura Senior', dias: 'Mar · Jue', horas: '10:00', desc: 'Fuerza y equilibrio para mayores.' },
    { nombre: 'Cross Funcional', dias: 'Lun · Mié · Vie 17:30', horas: 'Mar · Jue 18:00', desc: 'Circuitos de todo el cuerpo.' },
    { nombre: 'Híbrido', dias: 'Lun · Mié · Vie', horas: '18:30', desc: 'Mitad sala, mitad funcional.' },
    { nombre: 'Aero Funcional', dias: 'Lun · Mié · Vie', horas: '19:30', desc: 'Funcional con trabajo aeróbico.' },
    { nombre: 'Aero Box', dias: 'Lun · Mié · Vie', horas: '19:30', desc: 'Boxeo recreativo, no competitivo.' },
  ],

  espacios: ['Sala de musculación', 'Sala de funcional', 'Recepción y bar', 'Kinesiología', 'Estética', 'Martes Comunidad · Natura Fest'],

  // Nombres y especialidades DE EJEMPLO hasta que el gym pase los reales; la página los rotula así.
  profesEjemplo: true,
  profes: [
    { ini: 'N', nombre: 'Nico', que: 'Musculación y fuerza · arma las rutinas' },
    { ini: 'L', nombre: 'Lucía', que: 'Funcional y Aero Box' },
    { ini: 'M', nombre: 'Matías', que: 'Cross Training y Calistenia' },
    { ini: 'V', nombre: 'Valeria', que: 'Natura Senior' },
  ],
  kinesiologia: { telefono: '358 413 5318' },

  // Beneficios: lo que el socio recibe además de entrenar. Fuente: historias de
  // Instagram del gym (carpeta Beneficios/) y el flyer de planes. Para agregar uno
  // nuevo se suma una fila acá; la página los agrupa por `tipo`:
  //   dia      → pasa un día fijo de la semana (bar)
  //   pago     → cómo conviene pagar
  //   plan     → viene con el plan (Premium / Gold)
  //   convenio → alianzas con otras empresas
  // `desde` = a partir de qué plan vale (null = todos). `marca` = la empresa aliada.
  beneficios: [
    { tipo: 'dia', dia: 'Martes', marca: 'Powerade', titulo: '60 % en la segunda bebida', detalle: 'En la segunda consumición de Powerade, Monster o agua, en el bar del gym.', desde: null },
    { tipo: 'dia', dia: 'Jueves', marca: 'Across Sport Nutrition', titulo: 'Bebida isotónica libre', detalle: 'Todo el día, en el bar del gym.', desde: null },
    { tipo: 'pago', marca: 'Naranja X', titulo: 'El trimestral en cuotas con Plan Z', detalle: 'Pagás el plan de 3 meses con tu tarjeta Naranja X en cuotas. Precio congelado por 3 meses.', desde: null },
    { tipo: 'pago', marca: null, titulo: '10 % menos en efectivo', detalle: 'En cualquier plan, no acumulable con otras promos.', desde: null },
    { tipo: 'plan', marca: null, titulo: '15 % en estética', detalle: 'En la primera y segunda sesión. Con Gold, 25 %.', desde: 'premium' },
    { tipo: 'plan', marca: null, titulo: '5 % en el bar', detalle: 'Con Gold, 10 %.', desde: 'premium' },
    { tipo: 'plan', marca: null, titulo: 'Congelá hasta 30 días por año', detalle: 'Te vas de viaje y el plan te espera.', desde: 'gold' },
    { tipo: 'convenio', marca: 'Sancor Seguros · Prevención Salud', titulo: 'Convenio para afiliados', detalle: 'Consultá el descuento en el mostrador con tu credencial.', desde: null },
    { tipo: 'convenio', marca: 'AGEC', titulo: 'Convenio gremial', detalle: 'Para afiliados al gremio de empleados de comercio. Consultá en el mostrador.', desde: null },
  ],

  // Cómo se paga. Lo que está vacío lo completa el gym (ver sitio/README.md):
  //   mercadoPago.links → un link de pago por plan y período (los crea el gym en la
  //                       app de Mercado Pago: Cobrar → Link de pago); la página lo
  //                       convierte en QR. Clave: '<plan>-<periodo>', p. ej. 'premium-mensual'.
  //   mercadoPago.qrImagen → si prefiere el QR fijo del local (una imagen), va acá.
  //   alias → alias de transferencia (CBU/CVU).
  pagos: {
    mercadoPago: { links: {}, qrImagen: '' },
    alias: '',
    titular: 'Natura Gym and Fitness',
    naranjaX: {
      opciones: [
        { id: 'plan_z', nombre: 'Plan Z', detalle: 'El trimestral en cuotas, con precio congelado 3 meses.', periodo: 'trimestral' },
        { id: 'un_pago', nombre: 'Un pago', detalle: 'Mensual o trimestral, se debita en el resumen.', periodo: null },
      ],
      nota: 'Las cuotas exactas te las confirma el gym al pasar la tarjeta. También aceptan Visa y Mastercard.',
    },
  },
};
