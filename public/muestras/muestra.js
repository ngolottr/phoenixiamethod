// Propuesta visual para un prospecto. Los datos van en <script type="application/json" id="datos">.
// Con ?diapo=1..5 muestra una sola sección a 1080x1350 (para sacar las imágenes del carrusel).
(function () {
  var D = JSON.parse(document.getElementById('datos').textContent);
  var raiz = document.getElementById('app');
  var r = document.documentElement.style;
  Object.keys(D.colores || {}).forEach(function (k) { r.setProperty('--' + k, D.colores[k]); });
  document.title = 'Propuesta para ' + D.negocio + ' · Phoenix IA Method';

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Módulos: lo que Phoenix puede implementar, cada uno con una mini vista.
  var MOD = {
    web: ['Una página que funciona', 'Rápida, pensada para el celular y con su información al día.',
      '<div class="pin">' + esc(D.negocio) + '</div><div class="fila">Servicios <span>›</span></div><div class="fila">Horarios <span>›</span></div><div class="fila">Cómo llegar <span>›</span></div>'],
    reserva: ['Reserva en línea 24/7', 'Sus clientes eligen ' + esc(D.palabras.servicio) + ', día y hora sin tener que escribir ni llamar.',
      '<div class="fila"><span>Jueves 10:30</span><b style="color:var(--a)">Libre</b></div><div class="fila"><span>Jueves 12:00</span><b style="color:var(--a)">Libre</b></div><div class="fila" style="opacity:.5"><span>Jueves 15:00</span><span>Tomada</span></div>'],
    recordatorio: ['Recordatorios automáticos', 'Un mensaje antes de cada hora para confirmar. Menos horas perdidas.',
      '<div class="burb">Hola 👋 Te recordamos tu hora de mañana a las 10:30. ¿Confirmas?</div><div class="burb yo">Sí, confirmo ✅</div>'],
    google: ['Ficha de Google completa', 'Que aparezcan bien cuando los buscan, con botón para reservar.',
      '<div class="pin">' + esc(D.negocio) + '</div><div>' + esc(D.rubro) + ' · ' + esc(D.ciudad) + '</div><span class="mb">Reservar</span> <span class="mb" style="background:#fff;color:var(--txt)">Llamar</span>'],
    panel: ['Su agenda en el celular', 'Ven las reservas del día en un solo lugar y les llega un aviso con cada una.',
      '<b>Hoy</b><div class="fila"><span>10:30</span><span>' + esc(D.palabras.ejemplo1) + '</span></div><div class="fila"><span>12:00</span><span>' + esc(D.palabras.ejemplo2) + '</span></div><div class="fila"><span>16:00</span><span>' + esc(D.palabras.ejemplo1) + '</span></div>'],
    pedidos: ['Pedidos en línea', 'Un catálogo simple para pedir desde el celular y coordinar la entrega.',
      '<div class="fila"><span>' + esc(D.palabras.producto) + '</span><span class="mb" style="margin:0">Pedir</span></div><div class="fila"><span>Estado del pedido</span><span>En camino</span></div>'],
    asistente: ['Asistente que responde al tiro', 'Contesta las preguntas de siempre (horarios, cobertura, cómo reservar) a cualquier hora, y lo difícil se lo pasa a ustedes.',
      '<div class="burb yo">¿Atienden el sábado?</div><div class="burb">¡Sí! El sábado hay horas en la mañana. ¿Te reservo una?</div>'],
    leads: ['Contactos calificados', 'Cada contacto llega ordenado: qué necesita, para cuándo y si está en su zona. Así atienden primero a los que están listos.',
      '<div class="fila"><span>' + esc(D.palabras.ejemplo1) + ' · esta semana</span><b style="color:#1e9e5a">A · listo</b></div><div class="fila"><span>Consulta de precios</span><b style="color:#f5a623">B · tibio</b></div><div class="fila"><span>Fuera de zona</span><b style="color:var(--sub)">C</b></div>'],
    medicion: ['Resultados medibles', 'Un tablero simple con lo que importa: cuántas reservas llegan, de dónde vienen, cuántas se confirman y cuántas horas se recuperan. Se revisa juntos cada mes.',
      '<b>Este mes</b><div class="fila"><span>Reservas en línea</span><b>—</b></div><div class="fila"><span>Confirmadas por recordatorio</span><b>—</b></div><div class="fila"><span>Llegaron por Google</span><b>—</b></div><div style="font-size:11px;color:var(--sub);margin-top:6px">Se llena con sus datos reales desde el primer día</div>'],
    resenas: ['Más reseñas, sin pedirlas a mano', 'Después de cada atención, un mensaje amable pide la reseña en Google.',
      '<div class="burb">¡Gracias por venir! ¿Nos dejarías tu opinión? Nos ayuda mucho 🙏</div><div class="est">★★★★★</div>']
  };

  function seccion(id, cont) { var s = el('section'); s.id = id; var e = el('div', 'env'); e.appendChild(cont); s.appendChild(e); return s; }

  var f = document.createDocumentFragment();
  var marca = el('div', 'env marca', 'Phoenix IA Method <span>Propuesta para ' + esc(D.negocio) + '</span>');
  f.appendChild(marca);

  // 1 · Portada
  var c1 = el('div', 'cabeza');
  c1.innerHTML = '<div class="k">Propuesta visual · ' + esc(D.rubro) + ' · ' + esc(D.ciudad) + '</div>' +
    '<h1>' + esc(D.titulo) + '</h1><p class="lead">' + esc(D.bajada) + '</p>' +
    '<span class="chip">Pruébelo abajo: la reserva funciona como si fuera real</span>';
  f.appendChild(seccion('portada', c1));

  // 2 · Lo que vimos
  var c2 = el('div');
  c2.innerHTML = '<div class="k">Lo que vimos</div><h2>' + esc(D.problema.titulo) + '</h2>' +
    '<div class="problema"><div class="tarj hoy"><div class="et">Hoy</div><p>' + esc(D.problema.hoy) + '</p></div>' +
    '<div class="tarj manana"><div class="et">Con Phoenix</div><p>' + esc(D.problema.manana) + '</p></div></div>';
  f.appendChild(seccion('problema', c2));

  // 3 · Demo interactiva
  var c3 = el('div', 'demo');
  var txt = el('div');
  txt.innerHTML = '<div class="k">Pruébelo</div><h2>Así reservaría un cliente</h2>' +
    '<ol class="guia"><li><i>1</i>Elige ' + esc(D.palabras.servicio) + '</li><li><i>2</i>Elige día y hora</li><li><i>3</i>Le llega la confirmación por WhatsApp, y a ustedes también</li></ol>';
  var tel = el('div', 'tel');
  var pan = el('div', 'pan');
  pan.innerHTML = '<div class="isla"></div><div class="bar">' + esc(D.corto) + ' <small>' + esc(D.palabras.verbo) + '</small></div>';
  var pasos = el('div', 'pasos');
  pan.appendChild(pasos); tel.appendChild(pan); c3.appendChild(txt); c3.appendChild(tel);
  f.appendChild(seccion('demo', c3));

  var est = { s: null, d: null, h: null };
  function dias() {
    var out = [], n = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], t = new Date();
    for (var i = 1; out.length < 4; i++) { var x = new Date(t); x.setDate(t.getDate() + i); if (x.getDay() !== 0) out.push({ n: n[x.getDay()], d: x.getDate() }); }
    return out;
  }
  function pinta(p) {
    pasos.innerHTML = '';
    if (p === 0) {
      var h = el('div', 'hero', '<div class="et">' + esc(D.rubro) + '</div><h3>' + esc(D.hero) + '</h3><p>' + esc(D.heroSub) + '</p>');
      var b = el('button', 'bt', esc(D.palabras.boton)); b.onclick = function () { pinta(1); };
      var b2 = el('button', 'bt sec', 'Escribir por WhatsApp');
      h.appendChild(b); h.appendChild(b2); pasos.appendChild(h);
      pasos.appendChild(el('div', 'tit', esc(D.palabras.titServicios)));
      D.servicios.forEach(function (s) { var o = el('button', 'op', '<span class="i">' + s[0] + '</span><span><b>' + esc(s[1]) + '</b><s>' + esc(s[2]) + '</s></span>'); o.onclick = function () { est.s = s[1]; pinta(2); }; pasos.appendChild(o); });
    } else if (p === 1) {
      pasos.appendChild(el('div', 'tit', '¿Qué necesita?'));
      D.servicios.forEach(function (s) { var o = el('button', 'op', '<span class="i">' + s[0] + '</span><span><b>' + esc(s[1]) + '</b><s>' + esc(s[2]) + '</s></span>'); o.onclick = function () { est.s = s[1]; pinta(2); }; pasos.appendChild(o); });
    } else if (p === 2) {
      pasos.appendChild(el('div', 'tit', esc(est.s)));
      pasos.appendChild(el('div', '', '<p style="color:var(--sub);font-size:14px;margin:0 4px 10px">Elija el día</p>'));
      var g = el('div', 'dias');
      dias().forEach(function (x) { var b = el('button', 'd' + (est.d === x.n + ' ' + x.d ? ' sel' : ''), x.n + '<b>' + x.d + '</b>'); b.onclick = function () { est.d = x.n + ' ' + x.d; pinta(2); }; g.appendChild(b); });
      pasos.appendChild(g);
      if (est.d) {
        pasos.appendChild(el('div', '', '<p style="color:var(--sub);font-size:14px;margin:16px 4px 10px">Elija la hora</p>'));
        var hs = el('div', 'horas');
        ['10:00', '11:30', '13:00', '15:30', '17:00', '18:30'].forEach(function (hh) { var b = el('button', 'd', hh); b.onclick = function () { est.h = hh; pinta(3); }; hs.appendChild(b); });
        pasos.appendChild(hs);
      }
      var v = el('button', 'bt sec', 'Volver'); v.onclick = function () { est.d = null; pinta(1); }; pasos.appendChild(v);
    } else {
      var ok = el('div', 'ok', '<div class="c">✓</div><h3>¡Listo, quedó reservado!</h3><p>' + esc(est.s) + '<br>' + esc(est.d) + ' a las ' + esc(est.h) + '</p>' +
        '<div class="wa">Hola 👋 Tu hora en ' + esc(D.corto) + ' quedó para el ' + esc(est.d) + ' a las ' + esc(est.h) + '. Te recordamos el día antes.<small>WhatsApp automático · ejemplo</small></div>');
      var otra = el('button', 'bt sec', 'Probar de nuevo'); otra.onclick = function () { est = { s: null, d: null, h: null }; pinta(0); };
      ok.appendChild(otra); pasos.appendChild(ok);
    }
  }
  pinta(0);

  // 4 · Todo lo que podemos implementar
  var c4 = el('div');
  c4.innerHTML = '<div class="k">Todo lo que podemos implementar</div><h2>No es solo una página</h2><p class="lead">Todo se mide. Se parte por lo que más les sirve y se suma lo demás cuando los números lo justifiquen.</p>';
  var g = el('div', 'grid');
  D.modulos.forEach(function (k) { var m = MOD[k]; if (!m) return; var d = el('div', 'mod', '<div class="mini">' + m[2] + '</div><h4>' + m[0] + '</h4><p>' + m[1] + '</p>'); g.appendChild(d); });
  c4.appendChild(g);
  f.appendChild(seccion('modulos', c4));

  // 5 · Cómo trabajamos
  var c5 = el('div');
  c5.innerHTML = '<div class="k">Cómo trabajamos</div><h2>No les dejo una herramienta y me voy</h2>' +
    '<div class="flujo"><div><b>1</b><h4>Diagnóstico</h4><p>Entendemos cómo trabajan hoy y qué les cuesta.</p></div>' +
    '<div><b>2</b><h4>Lo dejamos andando</h4><p>Con su información, sus horarios y sus servicios.</p></div>' +
    '<div><b>3</b><h4>Les enseño a usarlo</h4><p>Una sesión práctica y una guía simple con capturas.</p></div>' +
    '<div><b>4</b><h4>Lo medimos juntos</h4><p>Con su tablero de resultados: se revisa cada mes y se ajusta lo que haga falta.</p></div></div>';
  f.appendChild(seccion('como', c5));

  // 6 · Cierre
  var c6 = el('div', 'cierre');
  c6.innerHTML = '<div class="k">Siguiente paso</div><h2>¿Lo vemos en 15 minutos?</h2><p class="lead" style="margin-left:auto;margin-right:auto">Por videollamada les muestro cómo quedaría con su información real. Sin compromiso.</p>' +
    '<div class="acc"><a class="boton" href="https://phoenixiamethod.cl/agendar">Agendar 15 minutos</a><a class="boton sec" href="https://phoenixiamethod.cl">Conocer Phoenix IA Method</a></div>';
  f.appendChild(seccion('cierre', c6));

  var pie = el('footer', '', '<b>Phoenix IA Method</b> · Nicolás Golott · phoenixiamethod.cl<br>Muestra de ejemplo, hecha para ' + esc(D.negocio) + '. No es su sitio actual ni usa sus datos.');
  f.appendChild(pie);
  var pd = el('div', 'pie-diapo', '<b>Phoenix IA Method</b> · Propuesta para ' + esc(D.negocio) + ' · muestra de ejemplo');
  f.appendChild(pd);
  raiz.appendChild(f);

  // Modo diapositiva
  var q = /[?&]diapo=(\d)/.exec(location.search);
  if (q) {
    document.body.classList.add('diapo');
    var ids = ['portada', 'problema', 'demo', 'modulos', 'como'];
    var n = Math.max(1, Math.min(5, +q[1]));
    ids.forEach(function (id, i) { document.getElementById(id).style.display = (i === n - 1) ? '' : 'none'; });
    document.getElementById('cierre').style.display = 'none';
    if (n === 5) { var ci = document.getElementById("cierre"); ci.style.display = ""; ci.style.marginTop = "28px"; ci.querySelector(".acc").innerHTML = "<span class=\"boton\">phoenixiamethod.cl/agendar</span>"; }
    if (n === 1) { document.body.classList.add("d1"); document.getElementById("demo").style.display = ""; var ch = document.querySelector("#portada .chip"); ch.parentNode.removeChild(ch); }
    if (n === 3) { est = { s: D.servicios[0][1], d: dias()[1].n + ' ' + dias()[1].d, h: '11:30' }; pinta(3); }
  }
})();
