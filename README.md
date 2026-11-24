# Calculo amortización parcial de hipoteca fija

Calculadora web (HTML + JS, sin servidor) para simular una amortización parcial anticipada de una hipoteca a tipo fijo con sistema de amortización francés.

**Usar online:** https://olivertar.github.io/calc_amortizacion_hipoteca_fija/

## Uso

Usar la versión online o abrir `index.html` en el navegador. No requiere instalación ni servidor.

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

## Aviso legal

Esta calculadora es una herramienta **orientativa y gratuita**, con fines exclusivamente informativos y educativos.

- Los resultados son **estimaciones** basadas en un modelo simplificado (sistema francés, tipo fijo, intereses por meses iguales) y pueden diferir de los cálculos de tu entidad financiera, que aplica sus propias condiciones, redondeos, cómputo de días, comisiones, seguros y productos vinculados.
- **No constituye asesoramiento financiero, fiscal ni legal**, ni una oferta o recomendación para realizar ninguna operación.
- Antes de tomar cualquier decisión, verifica las cifras con tu entidad financiera o con un profesional cualificado. Los únicos datos vinculantes son los que proporcione tu banco.
- El autor **no se hace responsable** de la exactitud de los resultados, de posibles errores u omisiones, ni de las decisiones que se tomen o los daños que puedan derivarse del uso de esta herramienta o de la información que ofrece.
- Los datos introducidos se procesan únicamente en tu navegador y se guardan en su `localStorage`. No se envían ni se almacenan en ningún servidor.

El software se proporciona "tal cual", sin garantías de ningún tipo.
