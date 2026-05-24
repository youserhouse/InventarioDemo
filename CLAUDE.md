# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ejecutar la aplicación

No hay proceso de build. Sirve los archivos con cualquier servidor HTTP estático:

```bash
python3 -m http.server 8080
# o bien
npx serve .
# o simplemente abrir index.html directamente en el navegador
```

No hay dependencias que instalar, ni paso de compilación, ni tests ni linter configurados.

## Arquitectura

Es una **SPA en vanilla JS/HTML/CSS puro** — sin frameworks, sin bundler, sin npm. La app entera son tres archivos:

- `index.html` — toda la estructura HTML y estilos inline de maquetación
- `styles.css` — sistema de temas con variables CSS (dark/light), primitivas de layout, estilos de componentes
- `app.js` — toda la lógica de la aplicación (332 líneas, sin módulos, funciones globales)

### Flujo de datos

Todo el estado vive en **`localStorage`** bajo cinco claves:

| Clave | Contenido |
|---|---|
| `ic_theme` | `"dark"` o `"light"` |
| `ic_config` | Tamaños de caja y precios de hamburguesa (objeto `CFG`) |
| `ic_apertura` | Inventario de apertura (cajas/sueltas de carne y pan, botes de salsa) |
| `ic_ventas` | Recaudación del día (tarjeta + efectivo en euros) |
| `ic_cierre` | Inventario de cierre (misma forma que apertura) |

La configuración también se refleja en el objeto global `CFG` en memoria y se mantiene sincronizada mediante `saveConfig()` / `loadConfig()`.

### Flujo de pestañas

La app tiene un flujo lineal de 5 pestañas: **Apertura → Ventas → Cierre → Cuadre → Config**. Cada paso de guardado (`saveApertura`, `saveVentas`, `saveCierre`) escribe en localStorage y avanza a la siguiente pestaña. La pestaña Config es accesible en cualquier momento.

El estado de las pestañas se gestiona con clases CSS (`active`, `done`) sobre los elementos `.tab` a través de `goTo(n)`.

### Algoritmo de cuadre (`buildCuadre`)

La lógica de negocio central lee los tres snapshots de localStorage y calcula:

```
initCarne  = apertura.meat_boxes  × CFG.meatBox  + apertura.meat_loose
initPan    = apertura.bread_boxes × CFG.breadBox + apertura.bread_loose
finalCarne / finalPan — misma fórmula con los valores de cierre

carneConsumida = initCarne − finalCarne
panConsumido   = initPan   − finalPan
hamburguesasPorStock = min(carneConsumida, panConsumido)  // solo cuenta hamburguesas completas (ambos ingredientes deben confirmar el déficit)

hamburguesasPorDinero = (tarjeta + efectivo) / precioMedio()  // precioMedio = (priceJam + priceEsp) / 2
diff = hamburguesasPorStock − round(hamburguesasPorDinero)    // positivo = inventario faltante
```

Umbrales de alerta: `diff === 0` → ok; `0 < diff ≤ 2` → warn; `diff > 2` → danger; `diff < 0` → anomalía inversa.

La validación de ingresos usa un umbral separado sobre `|ingresosReales − ingresosEsperados|`: `< €2` ok, `< €15` warn, `≥ €15` danger.

### Cálculo de inventario (`calc(prefix)`)

`prefix` es `'a'` (apertura) o `'c'` (cierre). La función lee los tamaños de caja **directamente de los `<input>` de configuración** (no del objeto `CFG`), de modo que refleja ediciones en curso antes de que se guarden. Los IDs de los elementos siguen el patrón `{prefix}_meat_boxes`, `{prefix}_meat_loose`, `{prefix}_meat_total`, etc.

### Salvaguardas de configuración

- Al iniciar, una función autoinvocada valida `ic_config` y la elimina si los tamaños de caja son cero o inválidos.
- `loadConfig()` y `saveConfig()` fuerzan `meatBox ≥ 1` y `breadBox ≥ 1`.
- Los eventos de input para calc están enlazados de tres formas (`oninput`, `onchange`, `onkeyup` inline + `addEventListener` en JS) para compatibilidad amplia con navegadores.

## Convenciones

- **Idioma**: todo el texto de la UI, los nombres de variables en la lógica y las claves de localStorage están en español (`apertura`, `cierre`, `cuadre`, `ventas`, `carne`, `pan`).
- **Formato de números**: las cantidades mostradas usan la localización española (separador decimal con coma, p.ej. `€14,50`), pero los valores de entrada y los cálculos usan floats nativos de JS.
- **Sin módulos**: todo es global. Las funciones se llaman directamente desde atributos `onclick` en el HTML.
- **Temas CSS**: los colores son variables CSS definidas en los selectores `[data-theme="dark"]` y `[data-theme="light"]`. La variable `--amber` es el color de acento principal.
- **Severidad de badges**: `.badge.ok` (verde), `.badge.warn` (amarillo), `.badge.bad` (rojo) — se aplican dinámicamente en `buildCuadre` y `setBadge`.
- **Convención Faltan/Sobran en ingredientes**: `meatDiff = meatConsumed − burgersByMoneyR`. Si `> 0` → "Sobran" (se consumió más de lo vendido, falta registro de venta). Si `< 0` → "Faltan" (el stock no cubre las ventas, falta consumo en inventario).
- **Valores por defecto**: caja de carne = 72 unidades, caja de pan = 30 unidades, Space Jam = €13,50, Especial = €15,50.
