// Plan de implementación: calculadora de recuperación y modo diapositiva (?diapo=1..6).
(function () {
  function $(id) { return document.getElementById(id); }
  var pesos = function (n) { return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  function calcula() {
    var f = +$('faltas').value, v = +$('valor').value, p = +$('pct').value, d = +$('dias').value;
    var pac = f * d * p / 100;
    $('o-faltas').textContent = f; $('o-valor').textContent = pesos(v); $('o-pct').textContent = p + ' %'; $('o-dias').textContent = d;
    $('monto').textContent = pesos(pac * v);
    $('detalle').textContent = Math.round(pac) + ' pacientes que vuelven a la silla';
  }
  if ($('faltas')) {
    ['faltas', 'valor', 'pct', 'dias'].forEach(function (id) { $(id).addEventListener('input', calcula); });
    calcula();
  }
  var q = /[?&]diapo=(\d)/.exec(location.search);
  if (q) {
    document.body.classList.add('diapo');
    var ids = ['portada', 'dijiste', 'calcula', 'plan', 'tiempo', 'inversion'];
    var n = Math.max(1, Math.min(ids.length, +q[1]));
    document.querySelectorAll('section').forEach(function (s) { s.style.display = s.id === ids[n - 1] ? '' : 'none'; });
  }
})();
