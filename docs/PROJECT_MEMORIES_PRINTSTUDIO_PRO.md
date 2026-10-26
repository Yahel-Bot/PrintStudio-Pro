# PrintStudio Pro — Memoria Técnica y Registro de Cambios

**ID de Conversación Gemini/Antigravity:** `976a39c3-81ff-426f-aa62-a330f9583f27`  
**Fecha:** Septiembre 2026  
**Usuario:** Yahel  

---

## 1. Resumen General del Proyecto
**PrintStudio Pro** (anteriormente conocido durante el desarrollo como `YARS_Smart_Printer_Pro`) es una aplicación de escritorio diseñada para optimizar, diseñar, previsualizar e imprimir documentos y fotografías en múltiples cuadrículas (layouts), calculando costos de tinta y permitiendo la carga inalámbrica de fotos desde teléfonos móviles mediante códigos QR.

- **Directorio de Código Fuente:** `C:\Users\yahel\YARS_Smart_Printer_Pro`
- **Ubicación de Instalación Activa:** `C:\Users\yahel\AppData\Local\Programs\PrintStudio Pro`
  - Ejecutable: `PrintStudio Pro.exe`
  - Paquete principal: `resources\app.asar`
  - Respaldo de seguridad previo: `resources\app.asar.bak`
- **Compilaciones y Portables Disponibles:**
  - `C:\Users\yahel\Downloads\PrintStudio_Pro_Updated.exe`
  - `C:\Users\yahel\YARS_Smart_Printer_Pro\build\PrintStudio Pro 1.0.0.exe`

---

## 2. Stack Tecnológico
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS / Vanilla CSS modular.
- **Desktop Runtime:** Electron (v31.7.7) con `contextBridge` seguro (`electronAPI`).
- **Servidor Móvil:** Express.js, Multer para subida de archivos multipart, localtunnel para conexión remota vía código QR.
- **Base de Datos Local:** SQLite (`better-sqlite3` v12.9.0).
- **Empaquetado:** `electron-builder` v24.13.3 con targets portable y win-unpacked.

---

## 3. Problemas Diagnosticados y Soluciones Aplicadas

### A. Corrección de Error de JavaScript al Iniciar (`server.js`)
* **Problema:** La aplicación arrojaba un cuadro de diálogo con `SyntaxError: missing ) after argument list` en `server.js` línea 55.
* **Causa Raíz:** En `server.js`, la plantilla HTML de la página web móvil estaba incrustada en un template string multilínea (`res.send(\`...\`)`), lo que provocaba colisiones sintácticas con comillas invertidas y variables `${...}` del script cliente.
* **Solución:** Se extrajo y desacopló la interfaz web en un archivo HTML limpio e independiente: `C:\Users\yahel\YARS_Smart_Printer_Pro\upload_client.html`. `server.js` lee y sirve este archivo inyectando dinámicamente el token de subida. Adicionalmente, se configuraron las rutas `GET /`, `GET /upload` y `GET /upload/:token` para prevenir errores 404 al escanear el QR desde smartphones.

### B. Corrección de Cuadrículas (Layouts) y Orientación de Papel
* **Problema:** Los diseños necesitaban ajustarse a todos los tamaños de papel y orientaciones sin deformaciones.
* **Solución en `index.js` y `src/App.tsx`:**
  - Se mapearon con precisión matemática los 10 esquemas de cuadrícula: **1, 2, 3, 4, 5, 7, 8, 9, 10 y 35 fotos por página**.
  - Soporte completo para orientación **Vertical (Portrait)** y **Horizontal (Landscape)**.
  - Compatibilidad de dimensiones reales para:
    - **Letter / Carta:** 8.5" x 11"
    - **Legal / Oficio Estándar:** 8.5" x 14"
    - **Oficio México:** 8.5" x 13.4"
    - **A4:** 8.27" x 11.69"
    - **Tabloid / Doble Carta:** 11" x 17"

### C. Rotación de Imágenes sin Recortes al Imprimir
* **Problema:** Al rotar imágenes (90°, 180°, 270°), la impresión podía recortar los bordes o desbordar las celdas.
* **Solución:**
  - En la interfaz de usuario se agregaron controles completos de rotación: botón de acceso rápido `🔄 90°`, dropdown de selección, campo numérico y botón de `Rotar todas (90°)`.
  - En `generatePrintHTML`, cuando la rotación es de 90° o 270°, un contenedor flex dinámico invierte automáticamente el ancho y alto asignados (`isRot90 ? width: cellHeightIn; height: cellWidthIn`), preservando `object-fit: contain` para evitar cualquier recorte o desborde en el papel físico.

### D. Vista Previa en Vivo (Live Preview) Fiel y Multipágina
* **Problema:** Al cargar pocas imágenes con un diseño de muchas celdas (ej. 1 foto con layout de 9), la vista previa rellenaba todos los espacios con la misma foto aunque solo se fuera a imprimir una.
* **Solución:**
  - El motor de vista previa ahora calcula la lista exacta de instancias a imprimir según la cantidad (`quantity`) asignada a cada imagen.
  - Las celdas sobrantes quedan vacías, respetando el tamaño y disposición exacta que tendrán en la hoja final.
  - Si la cantidad total de fotos sobrepasa la capacidad de una hoja, se activa un navegador multipágina interactivo (`◄ Página X de Y ►`) para revisar cada hoja antes de enviar a imprimir.
  - La hoja en pantalla se renderiza con el aspecto físico real (proporción, fondo blanco y sombra).

### E. Controles Numéricos y Soporte para Rueda del Ratón (`onWheel`)
* **Cantidad por Imagen (`res.quantity`):** Permite escribir el valor numérico, presionar flechas ▲/▼ o deslizar la rueda del ratón sobre el control para subir/bajar la cantidad rápidamente.
* **Copias de cada Página (Juegos de impresión):** Control dedicado en la barra lateral con soporte para teclado, flechas y rueda del ratón.
* El cálculo de hojas totales y el costo de tinta se actualizan dinámicamente en función de ambas variables.

### F. Modernización de la Interfaz Web Móvil (Subida QR)
* **Diseño:** Adaptado a la estética oscura e índigo de PrintStudio Pro (`#0f172a`, `#1e293b`, `#6366f1`).
* **Experiencia de usuario móvil:** Botón táctil grande, área de drag & drop, lista de archivos seleccionados con insignias de peso/tamaño, barra de progreso y mensajes de confirmación claros en español.

---

## 4. Regla Importante de Mantenimiento
> **Regla solicitada por el usuario:**  
> *"PLEASE DON'T CHANGE ANYTHING ELSE, MAKING THIS PROGRAM HAS TAKEN SO MUCH TIME SO PLEASE DONT BREAK IT."*  
> Mantener siempre intacto el diseño visual existente, paletas de colores, cálculos de costos, canales IPC y componentes funcionales.

---

## 5. Transferencia Móvil Inalámbrica Directa sin Red Wi-Fi Externa (SoftAP Hotspot)
* **Arquitectura (`hotspot_manager.js`):**
  - Implementación de punto de acceso local utilizando la API de Windows Mobile Hotspot / SoftAP (`netsh wlan` / WinRT `NetworkOperatorTetheringManager`).
  - Asigna red Wi-Fi privada propia en la PC (`YARS 9277`) con IP local determinista `192.168.137.1` en el puerto 3500.
  - No requiere router de tienda, módem ni conexión a internet activa.
* **Flujo de Doble Código QR:**
  1. **QR Paso 1 (Credenciales Wi-Fi):** Cadena estándar `WIFI:S:YARS 9277;T:WPA;P:pass1234;;`. Al escanear con la cámara del celular, el smartphone se enlaza directamente a la PC con un solo toque.
  2. **QR Paso 2 (Web de Carga):** URL directa `http://192.168.137.1:3500/upload/...` para abrir el portal de envío en el navegador del teléfono.
* **Opciones de Conectividad en UI (`App.tsx`):**
  - **📶 Sin Wi-Fi (Directo):** Activa/apaga el punto de acceso local con un botón y muestra clientes conectados.
  - **🌐 Wi-Fi Local:** Conexión vía router LAN de la tienda (`192.168.100.164`), filtrando adaptadores virtuales (WARP/VPNs).
  - **☁️ Datos Móviles / Remoto:** Enlace público mediante túnel con indicador de contraseña.
  - **🔍 Agrandar QR:** Modal de pantalla completa (`BigQrModal`) para escanear cómodamente desde el mostrador.

---

## 6. Carga de Archivos y Automatización de Documentos (Electron 31 & Office Bridge)
* **Compatibilidad Electron 31+ (`webUtils.getPathForFile`):**
  - Por seguridad, Chromium ya no expone la propiedad `file.path` en eventos Drag & Drop de HTML5.
  - Se implementó `window.electronAPI.getPathForFile(file)` en `preload.js` y `src/App.tsx`, garantizando que tanto el arrastre de archivos como el explorador obtengan la ruta absoluta física de Windows.
* **Canal IPC `convert-office` y `office_bridge.py`:**
  - Registrado en `index.js` para renderizar documentos `.pdf`, `.docx`, `.xlsx`, `.pptx` como imágenes para la vista previa.
  - Automatización COM con Word/PowerPoint con supresión de diálogos en segundo plano (`DisplayAlerts = 0`, `Visible = False`) y tiempo límite de 45s.
  - Empaquetado `asarUnpack: ["office_bridge.py"]` en `package.json` para que Python siempre pueda invocarlo en disco.

---

## 7. Vista Previa en Vivo Fiel de Color vs Blanco y Negro (WYSIWYG)
* **Filtro Reactivo de Escala de Grises:**
  - Aplicado a la hoja central de impresión y a la lista de miniaturas:
    ```css
    filter: isPageColor(item) ? 'none' : 'grayscale(100%) contrast(105%)';
    transition: filter 0.25s ease-in-out;
    ```
  - Refleja instantáneamente los cambios entre `🎨 Color`, `⚫ B/N` y `Automático`.
* **Alternancia Individual por Página:**
  - Cada miniatura cuenta con una etiqueta clickeable (`🎨 Color` / `⚫ B/N`) para forzar el modo de una hoja específica si el usuario lo desea.
* **Coherencia Física con el Papel Impreso:**
  - La función `generatePrintHTML` en `index.js` inyecta las mismas reglas de escala de grises en el documento de impresión físico.

---

## 8. Esquema de Tarifas por Volumen Exclusivo para Blanco y Negro
* **Regla de Negocio Solicitada:**
  - **1 a 50 copias:** **$1.00** c/u.
  - **51 a 100 copias:** **$0.80** c/u.
  - **101 a 200 copias:** **$0.50** c/u.
  - **201+ copias:** **$0.40** c/u.
  - **Exclusividad B/N:** Las impresiones a color conservan su tarifa completa independiente calculada por cobertura y no son descontadas por el volumen de copias en blanco y negro.
* **Visualización Dinámica:**
  - Tarjeta en el panel de cobro que indica en tiempo real el escalón alcanzado (ej. *"Tier 2 (51-100 copias) — $0.80/u"*).

---

## 9. Motor Inteligente de Corrección de Precios con Aprendizaje Automático
* **Tablas en SQLite (`userData/yars_pro.db`):**
  - `correcciones_precios`: Registra fecha, precio estimado original, precio cobrado real, impresiones B/N y Color, escalón aplicado y archivo.
  - `modelo_aprendizaje`: Guarda las tarifas aprendidas (`tier1_rate`, `tier2_rate`, `tier3_rate`, `tier4_rate`, `color_rate`, `tuning_factor`, `total_corrections`).
* **Algoritmo de Aprendizaje Adaptativo:**
  - Utiliza suavizado exponencial con tasa de aprendizaje $\alpha = 0.25$:
    $$\text{Tarifa}_{\text{nueva}} = \text{Tarifa}_{\text{anterior}} + \alpha \cdot (\text{Tarifa Implícita} - \text{Tarifa}_{\text{anterior}})$$
  - Si el operador ajusta con frecuencia un cobro (por ejemplo cobrando $0.75 en vez de $0.80 en el rango 51-100), el modelo recalibra gradualmente el valor unitario para predecir precios más precisos en trabajos futuros.
* **Controles en Interfaz de Usuario:**
  - Botón **`✏️ Corregir`** junto al total para editar directamente el importe.
  - Botón **`✓ Guardar`** que ejecuta la calibración en SQLite e informa mediante una notificación flotante (toast).
  - Indicador de estado del aprendizaje IA en la barra lateral con número total de calibraciones aprendidas.
  - Botón **`↺ Restablecer Aprendizaje IA`** para devolver el modelo a los valores originales de fábrica.

---

## 10. Compilación, Binarios de Producción y Guía Operativa
* **Compilación Frontend & Desktop:**
  - Build de Vite completado con éxito (889 ms).
  - Empaquetado por `electron-builder` generando:
    - Instalador: `C:\Users\yahel\YARS_Smart_Printer_Pro\build\PrintStudio Pro Setup 1.0.0.exe`
    - Ejecutable Portable: `C:\Users\yahel\YARS_Smart_Printer_Pro\build\PrintStudio Pro 1.0.0.exe`
* **Notas de Entorno de Ejecución:**
  - La librería nativa `better-sqlite3` está compilada para el ABI de Electron 31 (`NODE_MODULE_VERSION 125`).
  - Para pruebas y ejecución directa en terminal, invocar siempre a través del binario de Electron (`npx electron .` o el `.exe` compilado), evitando `node index.js` directo que utiliza Node 25 (`NODE_MODULE_VERSION 141`).

