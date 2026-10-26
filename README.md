# Lumen · Dashboard de recompensas

Dashboard de prueba, solo frontend, inspirado en un programa de puntos tipo tarjeta de crédito. Todos los datos son aleatorios y se generan en el navegador.

## Cómo correrlo

```bash
npm install
npm run dev
```

Luego abre la URL que imprime Vite (normalmente `http://localhost:5173`).

## Stack

- **React 19 + Vite 7 + TypeScript** (modo estricto, sin `any`).
- **Tailwind CSS v4** para todos los estilos (sin CSS por componente).
- **Motion** (antes Framer Motion) para las animaciones.
- **Heroicons** para los íconos.
- La gráfica es SVG hecho a mano, sin librería de charts.

## Lo que tiene

- **Cambio de tema con círculo:** al pulsar sol o luna, el nuevo tema se expande en un círculo desde el botón hasta cubrir la pantalla. Usa la View Transitions API; en navegadores sin soporte o con "reducir movimiento" activo, el cambio es instantáneo.
- **Tarjeta principal** con contador animado, barra de progreso de nivel y una luz que sigue al cursor.
- **Beneficios por nivel** (Plata, Oro, Platino) con selector deslizante.
- **Ofertas** que se activan y desactivan con animación y aviso flotante.
- **Historial de puntos** que se actualiza al canjear.
- **Gráfica de puntos ganados** con rangos 7D, 30D y 90D, tooltip con cursor, navegación con flechas del teclado y vista de tabla.
- **Modal de canje** que descuenta puntos de verdad dentro de la demo.
- **Paleta de comandos** con `Ctrl K`.

## Atajos

| Tecla | Acción |
|---|---|
| `Ctrl K` | Abrir la paleta de comandos |
| `T` | Cambiar el tema |
| `R` | Regenerar todos los datos |
| `Esc` | Cerrar ventanas y menús |

## Estructura

```
src/
  theme/        ThemeProvider con la transición circular
  data/mock.ts  generador de datos aleatorios con semilla
  lib/          formato, hooks, íconos y constantes de animación
  components/   tarjetas, navegación, modales y gráfica
```
