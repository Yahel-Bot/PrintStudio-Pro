# Plan de Rediseño: Interfaz Profesional Windows 11 Fluent para PrintStudio Pro

Este documento especifica el nuevo diseño de interfaz acordado para transformar **PrintStudio Pro** en una experiencia fluida, intuitiva y profesional, inspirada en la herramienta nativa de impresión de **Windows 11 (Fluent Design System)**.

---

## 1. Arquitectura General del Espacio de Trabajo (Layout de 3 Paneles)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [Logo] PrintStudio Pro v1.1.0   │   [🖨️ Impresión]  [📊 Corte de Caja]  [📱 Móvil QR]  [⚙️ Tarifas]  [🌙/☀️] │
├────────────────────────┬──────────────────────────────────────────┬──────────────────────────────┤
│ 📁 ARCHIVOS Y PÁGINAS  │ 📄 LIENZO DE PREVISUALIZACIÓN CENTRAL   │ ⚙️ PANEL DE CONFIGURACIÓN    │
│                        │                                          │                              │
│ ┌────────────────────┐ │                                          │ ┌───────────┬──────────────┐ │
│ │ Zona Carga / Drop  │ │         ┌──────────────────────┐         │ │  Rápida   │  Avanzada    │ │
│ └────────────────────┘ │         │                      │         │ └───────────┴──────────────┘ │
│                        │         │                      │         │                              │
│ Mosaico 2 Columnas:    │         │     Hoja de Papel    │         │ • Impresora Destino          │
│ ┌────────┐ ┌────────┐  │         │   (Aspect Ratio Real │         │ • Copias (Stepper + Scroll)  │
│ │ Foto 1 │ │ Foto 2 │  │         │    Carta/Oficio/Tab) │         │ • Modo Tinta (Auto/Color/BN) │
│ └────────┘ └────────┘  │         │                      │         │ • Tamaño & Orientación       │
│ ┌────────┐ ┌────────┐  │         │                      │         │ • Distribución N-up          │
│ │ Foto 3 │ │ Foto 4 │  │         └──────────────────────┘         │                              │
│ └────────┘ └────────┘  │                                          │ ──────────────────────────── │
│                        │   ┌──────────────────────────────────┐   │ 🏷️ RESUMEN DE COBRO (FIXED)   │
│                        │   │ ◀ 1 de 3 ▶   −  100%  +   ↶  ↷   │   │ Total: $XX.XX  [🖨️ Imprimir] │
│                        │   └──────────────────────────────────┘   │                              │
└────────────────────────┴──────────────────────────────────────────┴──────────────────────────────┘
```

---

## 2. Especificación Detallada de Componentes

### A. Barra Superior de Comandos (Fluent CommandBar)
- **Identidad**: Logo corporativo estilizado con badge de versión dinámica `v1.1.0` y estado de la impresora activa.
- **Botones de Modo**:
  - `[ 🖨️ Impresión ]`: Espacio principal de trabajo de 3 paneles.
  - `[ 📊 Corte de Caja ]`: Muestra la vista de balance diario, exportación CSV e impresión de corte.
  - `[ 📱 Móvil QR ]`: Abre el drawer / modal interactivo del Hotspot offline y código QR Dual.
  - `[ ⚙️ Tarifas ]`: Modal de calibración de costos y estado del motor de aprendizaje adaptativo.
  - `[ 🌙 / ☀️ ]`: Conmutador suave de tema visual.

### B. Panel Izquierdo: Archivos y Miniaturas (Ancho ~320px)
- **Zona Superior de Carga**: Botón compacto con textura sutil y selector de archivos nativo, compatible con arrastrar y soltar (PDF, Word, Excel, PowerPoint, JPG, PNG, HEIC).
- **Mosaico en Cuadrícula (2 Columnas)**:
  - Cada miniatura muestra su número de página, badge de detección inteligente (Color / B/N / Alta Densidad).
  - **Controles emergentes al pasar el cursor (Hover)**:
    - Botón de rotación rápida `🔄 90°`.
    - Selector individual de copias (`x1`, `x2`).
    - Botón para eliminar `✕`.
  - Botón de **"Limpiar Todo"** en el encabezado cuando existan archivos cargados.

### C. Panel Central: Lienzo de Previsualización en Vivo (Flex 1)
- **Fondo del Lienzo**: Superficie neutra con textura de trabajo que resalta la hoja física.
- **Hoja Física**:
  - Proporción real de aspecto (Letter, Legal, Oficio México, A4, Tabloide).
  - Sombra difusa realista de Windows 11 (`box-shadow: 0 12px 32px rgba(0,0,0,0.2)`).
  - Renderizado de cuadrícula de 1 a 35 fotos por página con soporte de rotación, ajuste o relleno.
  - Celdas vacías con sutil patrón punteado de elegancia profesional.
- **Píldora Flotante Inferior (Windows 11 Media Bar)**:
  - Paginador interactivo: `◀ Página X de Y ▶`.
  - Zoom de alta precisión: botones `−`, porcentaje actual editable/clic, `+`, y restablecer.
  - Herramientas rápidas: rotación de la imagen seleccionada `↶` `↷`.

### D. Panel Derecho: Control de Impresión y Cobro (Ancho ~340px)
Organizado en **2 Pestañas**:
1. **Pestaña "Impresión Rápida"**:
   - **Impresora**: Selector estilizado con icono de estado y detección de predeterminada.
   - **Copias del Juego**: Input numérico tipo Stepper de Windows con botones `▲` / `▼` y soporte de rueda del ratón (`onWheel`).
   - **Modo de Color / Tinta**: Segmented control de 3 estados: `[ ⚡ Auto ] [ 🎨 Color ] [ ⬛ B/N ]` con resumen de cobertura.
   - **Tamaño de Papel**: Selector con nombres y dimensiones físicas legibles.
   - **Orientación**: Selector segmentado `[ 📄 Vertical ] [ 📃 Horizontal ]`.
2. **Pestaña "Ajustes Avanzados"**:
   - **Distribución por Hoja**: Selector visual de fotos por página (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 35).
   - **Ajuste de Imagen**: Conmutador `[ Ajustar a página ] [ Rellenar hoja ]`.
   - **Rotación en Lote**: Botón para girar todas las imágenes en conjunto.
   - **Inspección de Cobertura**: Porcentaje de cian/magenta/amarillo/negro de la página activa.
3. **Pie Fijo de Cobro (Sticky Footer)**:
   - Visible en todo momento sin importar la pestaña seleccionada.
   - Indicador dinámico de **Escala por Volumen B/N** ($1.00, $0.80, $0.50, $0.40).
   - Desglose de subtotal tinta y cargo base.
   - **Total a Cobrar destacado en tipografía grande** con botón de edición manual rápida (que alimenta el motor de aprendizaje adaptativo de SQLite).
   - Botón de Acción Principal Windows 11: `[ 🖨️ Imprimir y Generar Ticket ]` en color azul Windows `#0078d4`.

---

## 3. Sistema de Diseño Visual y Estilos (CSS Fluent Design)

| Elemento | Modo Oscuro (Dark Fluent) | Modo Claro (Light Fluent) |
|---|---|---|
| **Fondo Principal** | `#1e1e1e` / `#181818` | `#f3f3f3` / `#f9f9f9` |
| **Tarjetas y Paneles** | `#272727` con borde `rgba(255,255,255,0.08)` | `#ffffff` con borde `rgba(0,0,0,0.08)` |
| **Color de Acento** | `#0078d4` (Hover: `#1084d9`) | `#0067b8` (Hover: `#005da6`) |
| **Tipografía** | `'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif` |
| **Radio de Borde** | `6px` a `8px` (estándar Windows 11) |
| **Transiciones** | `150ms cubic-bezier(0.1, 0.9, 0.2, 1)` |

---

## 4. Garantía de Invarianza (Reglas de Oro de PrintStudio Pro)
1. **Lógica de Costos Intacta**: `calculatePrintCosts`, escalas B/N obligatorias y factores de ajuste no se modifican.
2. **Motor SQLite Intacto**: Canales IPC `saveSale`, `getCorte`, `savePriceCorrection` y el suavizado exponencial de aprendizaje funcionan exactamente igual.
3. **Generador de Tickets y Documentos**: Las funciones de impresión nativa `generateTicketHTML`, `generatePrintHTML` y `print-document` mantienen sus dimensiones calibradas.
4. **Hotspot WinRT y Servidor Móvil**: Endpoints `/`, `/upload`, `/ticket/:id` y el gestor de punto de acceso no se alteran.
