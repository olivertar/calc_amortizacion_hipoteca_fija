'use strict';

const STORAGE_KEY = 'calc-amortizacion-v1';
const FIELDS = ['capital', 'tin', 'anios', 'pendiente', 'amortizar', 'comision'];
const EPS = 0.005; // medio céntimo

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const pct = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

const $ = (id) => document.getElementById(id);

/** Cuota francesa para capital P, tasa mensual i, n meses. */
function cuotaFrancesa(P, i, n) {
  if (n <= 0) return 0;
  if (i === 0) return P / n;
  return (P * i) / (1 - Math.pow(1 + i, -n));
}

/**
 * Simula el pago mes a mes con cuota Q hasta saldar P.
 * La última cuota se ajusta al saldo restante.
 * Devuelve { meses, totalPagado, intereses }.
 */
function simular(P, i, Q) {
  let saldo = P;
  let meses = 0;
  let total = 0;
  const LIMITE = 12 * 200;
  while (saldo > EPS && meses < LIMITE) {
    const interes = saldo * i;
    if (Q <= interes) throw new Error('La cuota no cubre los intereses: revisa los datos.');
    const pago = Math.min(Q, saldo + interes);
    saldo = saldo + interes - pago;
    total += pago;
    meses++;
  }
  return { meses, totalPagado: total, intereses: total - P };
}

function formatPlazo(meses) {
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  const partes = [];
  if (a) partes.push(`${a} ${a === 1 ? 'año' : 'años'}`);
  if (m || !a) partes.push(`${m} ${m === 1 ? 'mes' : 'meses'}`);
  return partes.join(' y ');
}

function leerDatos() {
  const d = {};
  for (const f of FIELDS) d[f] = parseFloat($(f).value);
  if (Number.isNaN(d.comision)) d.comision = 0;
  return d;
}

function validar(d) {
  if ([d.capital, d.tin, d.anios, d.pendiente, d.amortizar].some(Number.isNaN))
    return 'Completa todos los campos.';
  if (d.capital <= 0 || d.anios <= 0 || d.pendiente <= 0)
    return 'Capital, años y pendiente deben ser mayores que 0.';
  if (d.tin < 0 || d.comision < 0 || d.amortizar < 0)
    return 'Interés, comisión y monto no pueden ser negativos.';
  if (d.pendiente > d.capital) return 'El capital pendiente no puede superar al solicitado.';
  if (d.amortizar >= d.pendiente) return 'El monto a amortizar debe ser menor que el capital pendiente (si es igual, es cancelación total).';
  return null;
}

function calcular(d) {
  const i = d.tin / 100 / 12;
  const N = Math.round(d.anios * 12);
  const Q = cuotaFrancesa(d.capital, i, N);

  const actual = simular(d.pendiente, i, Q);
  const nuevoP = d.pendiente - d.amortizar;
  const comisionEur = d.amortizar * d.comision / 100;

  // Escenario 1: misma cuota, menos plazo
  const s1 = simular(nuevoP, i, Q);
  s1.cuota = Q;

  // Escenario 2: mismo plazo, menos cuota.
  // Con plazo fijo la cuota es proporcional al capital: Q2 = Q · P'/P
  // (respeta el plazo fraccional real, incluida la última cuota parcial).
  const Q2 = Q * nuevoP / d.pendiente;
  const s2 = simular(nuevoP, i, Q2);
  s2.cuota = Q2;

  for (const s of [s1, s2]) {
    s.ahorroIntereses = actual.intereses - s.intereses;
    s.ahorroNeto = s.ahorroIntereses - comisionEur;
    s.rentabilidad = d.amortizar > 0 ? s.ahorroNeto / d.amortizar * 100 : 0;
    // total desembolsado desde hoy, incluyendo la amortización y la comisión
    s.desembolso = s.totalPagado + d.amortizar + comisionEur;
  }

  return { i, N, Q, actual, nuevoP, comisionEur, s1, s2 };
}

function card(k, v) {
  return `<div class="card"><div class="k">${k}</div><div class="v">${v}</div></div>`;
}

function render(d, r) {
  const { Q, actual, s1, s2, comisionEur } = r;
  const mesesAhorrados = actual.meses - s1.meses;
  const bajaCuota = Q - s2.cuota;

  $('actual').innerHTML = [
    card('Cuota mensual actual', eur.format(Q)),
    card('Plazo restante', formatPlazo(actual.meses)),
    card('Cuotas restantes', actual.meses),
    card('Intereses pendientes', eur.format(actual.intereses)),
    card('Total a pagar desde hoy', eur.format(actual.totalPagado)),
  ].join('');

  // Sin amortización: solo valores actuales
  const hayAmortizacion = d.amortizar > 0;
  $('comparativa').hidden = !hayAmortizacion;
  $('resultados').hidden = false;
  if (!hayAmortizacion) return;

  const g =(v) => `<span class="good">${v}</span>`;
  const dash = '—';

  const filas = [
    ['sep', 'Después de amortizar'],
    ['Capital pendiente (deuda)', eur.format(d.pendiente), eur.format(r.nuevoP), eur.format(r.nuevoP)],
    ['Cuota mensual', eur.format(Q), eur.format(s1.cuota), eur.format(s2.cuota)],
    ['Cuotas restantes', actual.meses, s1.meses, s2.meses],
    ['Plazo restante', formatPlazo(actual.meses), formatPlazo(s1.meses), formatPlazo(s2.meses)],
    ['Intereses a pagar', eur.format(actual.intereses), eur.format(s1.intereses), eur.format(s2.intereses)],
    ['<strong>Total a pagar en cuotas</strong> (capital + intereses)', `<strong>${eur.format(actual.totalPagado)}</strong>`, `<strong>${eur.format(s1.totalPagado)}</strong>`, `<strong>${eur.format(s2.totalPagado)}</strong>`],
    ['Comisión', dash, eur.format(comisionEur), eur.format(comisionEur)],
    ['Desembolso total (cuotas + amortización + comisión)', eur.format(actual.totalPagado), eur.format(s1.desembolso), eur.format(s2.desembolso)],
    ['sep', 'Ahorros'],
    ['Ahorro en intereses', dash, g(eur.format(s1.ahorroIntereses)), g(eur.format(s2.ahorroIntereses))],
    ['Ahorro neto (− comisión)', dash, g(eur.format(s1.ahorroNeto)), g(eur.format(s2.ahorroNeto))],
    ['Cuotas ahorradas', dash, g(mesesAhorrados), '0'],
    ['Tiempo ahorrado', dash, g(formatPlazo(mesesAhorrados)), dash],
    ['Baja de cuota mensual', dash, '0 €', g(`${eur.format(bajaCuota)} (${pct.format(bajaCuota / Q * 100)} %)`)],
    ['Baja de cuota anual', dash, '0 €', g(eur.format(bajaCuota * 12))],
    ['Rentabilidad del dinero amortizado', dash, `${pct.format(s1.rentabilidad)} %`, `${pct.format(s2.rentabilidad)} %`],
  ];

  $('tabla').innerHTML = filas.map((f) =>
    f[0] === 'sep'
      ? `<tr class="sep"><td colspan="4">${f[1]}</td></tr>`
      : `<tr>${f.map((c) => `<td>${c}</td>`).join('')}</tr>`
  ).join('');

  const dif = s1.ahorroNeto - s2.ahorroNeto;
  $('conclusion').innerHTML = `
    <p><strong>Reducir plazo</strong> ahorra ${eur.format(s1.ahorroNeto)} netos y acaba la hipoteca
       ${formatPlazo(mesesAhorrados)} antes (${mesesAhorrados} cuotas menos).
       Deuda: ${eur.format(r.nuevoP)}; pagarás ${eur.format(s1.totalPagado)} (con intereses) en ${s1.meses} cuotas de ${eur.format(s1.cuota)}.</p>
    <p><strong>Reducir cuota</strong> ahorra ${eur.format(s2.ahorroNeto)} netos y libera
       ${eur.format(bajaCuota)} al mes (${eur.format(bajaCuota * 12)} al año).
       Deuda: ${eur.format(r.nuevoP)}; pagarás ${eur.format(s2.totalPagado)} (con intereses) en ${s2.meses} cuotas de ${eur.format(s2.cuota)}.</p>
    <p>Diferencia a favor de reducir plazo: <strong>${eur.format(dif)}</strong> en intereses.</p>
  `;

  $('resultados').hidden = false;
}

function guardar() {
  const data = {};
  for (const f of FIELDS) data[f] = $(f).value;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* sin storage */ }
}

function cargar() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!data) return false;
    for (const f of FIELDS) if (data[f] != null) $(f).value = data[f];
    return true;
  } catch { return false; }
}

function onSubmit(e) {
  if (e) e.preventDefault();
  const d = leerDatos();
  const err = validar(d);
  const errEl = $('error');
  if (err) {
    errEl.textContent = err;
    errEl.hidden = false;
    $('resultados').hidden = true;
    return;
  }
  try {
    const r = calcular(d);
    errEl.hidden = true;
    guardar();
    render(d, r);
  } catch (ex) {
    errEl.textContent = ex.message;
    errEl.hidden = false;
    $('resultados').hidden = true;
  }
}

function onReset() {
  for (const f of FIELDS) $(f).value = '';
  $('comision').value = '0';
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* sin storage */ }
  $('error').hidden = true;
  $('resultados').hidden = true;
  $('capital').focus();
}

$('form').addEventListener('submit', onSubmit);
$('reset').addEventListener('click', onReset);
if (cargar()) onSubmit();
