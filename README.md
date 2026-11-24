# Calculo amortización parcial de hipoteca fija

Calculadora web (HTML + JS, sin servidor) para simular una amortización parcial anticipada de una hipoteca a tipo fijo con sistema de amortización francés.

## Uso

Abrir `index.html` en el navegador. No requiere instalación ni servidor.

## Entradas

- Capital solicitado
- Interés nominal anual (TIN)
- Plazo original (años)
- Capital pendiente hoy
- Monto a amortizar (0 = ver solo la situación actual)
- Comisión por amortización anticipada (%)

## Resultados

- **Situación actual**: cuota, plazo restante, intereses pendientes, total a pagar.
- **Escenario 1 – Reducir plazo**: misma cuota; cuotas y tiempo ahorrados, ahorro en intereses.
- **Escenario 2 – Reducir cuota**: mismo plazo; nueva cuota, bajada mensual/anual, ahorro en intereses.
- Ahorro neto de comisión y rentabilidad del dinero amortizado.

Los datos introducidos se guardan en `localStorage`. El botón **Reset** los borra.

## Notas

Los intereses se calculan por meses iguales (TIN/12). Los bancos calculan por días reales, por lo que puede haber diferencias de pocos euros en el ahorro de intereses.
