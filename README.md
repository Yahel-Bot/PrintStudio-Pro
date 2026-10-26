# 🖨️ PrintStudio Pro (YARS Smart Printer Pro)

Sistema inteligente de gestión de impresiones, análisis de cobertura de color en tiempo real, cálculo automatizado de costos y servidor de carga móvil local para centros de impresión y papelerías.

---

## 🌟 Características Principales

- **🎨 Análisis Inteligente de Cobertura de Color:**
  - Estimación precisa de consumo de tinta CMYK/Color vs. Monocromático (B/N) con previsualización en vivo.
  - Escalas de precios escalonadas por volumen B/N y tarifas personalizadas por nivel de cobertura.

- **📐 Cuadrículas y Formatos de Papel:**
  - 10 esquemas de cuadrícula fotográfica (1, 2, 3, 4, 5, 7, 8, 9, 10 y 35 fotos por página).
  - Orientación Vertical (*Portrait*) y Horizontal (*Landscape*).
  - Tamaños soportados: Carta (*Letter*), Oficio México (8.5" x 13.4"), Legal, A4 y Tabloide (11" x 17").
  - Rotación multi-ángulo (0°, 90°, 180°, 270°) y paginador interactivo multipágina.

- **📲 Servidor de Carga Móvil Offline (QR Directo):**
  - Servidor Express integrado que permite a los clientes escanear un código QR desde su teléfono para subir archivos directamente a la PC.
  - Soporte para Hotspot / Zona con cobertura móvil de Windows (SoftAP `192.168.137.1`), funcionando **sin necesidad de router ni conexión a Internet externa**.
  - Interfaz web táctil con estética glassmorphism moderna.

- **🧠 Motor de Aprendizaje Adaptativo (SQLite):**
  - Calibración automática de precios basada en correcciones históricas del operador mediante suavizado exponencial ($\alpha = 0.25$).

- **🧾 Generador de Tickets de Venta:**
  - Emisión de comprobantes térmicos detallados con desglose de páginas, copias y costos.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite.
- **Backend de Escritorio:** Electron 31, Node.js.
- **Base de Datos:** SQLite vía `better-sqlite3`.
- **Servidor Móvil:** Express, Multer, QRCode, Localtunnel.
- **Procesamiento de Imágenes y Documentos:** Sharp, PyMuPDF / OpenCV (`office_bridge.py`), `pdf-to-printer`.

---

## 📁 Estructura del Proyecto

```text
YARS_Smart_Printer_Pro/
├── assets/                 # Iconos y logotipos de la aplicación
├── data/                   # Base de datos SQLite (yars_pro.db)
├── docs/                   # Documentación técnica, diseño y registros
│   ├── backups/            # Copias de respaldo de desarrollo
│   └── sessions/           # Bitácoras de sesión y arquitectura
├── samples/                # Archivos e imágenes de muestra para pruebas
├── src/                    # Código fuente Frontend (React + TypeScript)
│   ├── assets/             # Recursos estáticos de la interfaz
│   ├── domain/             # Lógica de negocio (layout, precios)
│   ├── App.tsx             # Componente raíz interactivo
│   ├── index.css           # Estilos globales y utilidades
│   └── main.tsx            # Punto de montaje Vite
├── analysis.js             # Motor de análisis de color y cobertura
├── database.js             # Mapeo y aprendizaje adaptativo SQLite
├── hotspot_manager.js      # Gestión de zona Wi-Fi local de Windows
├── index.html              # Entrada HTML principal de Vite
├── index.js                # Proceso principal de Electron (Main Process)
├── office_bridge.py        # Conversor de formatos de documentos (Office/PDF)
├── package.json            # Manifiesto y scripts npm
├── preload.js              # Puente IPC seguro (ContextBridge)
├── server.js               # Servidor Express de transferencia móvil
├── setup-dependencies.bat  # Script instalador de dependencias Python
├── ticket_generator.js     # Plantilla HTML/CSS para tickets térmicos
├── upload_client.html      # Interfaz web móvil para clientes
└── vite.config.ts          # Configuración de compilación Vite
```

---

## 🚀 Guía de Instalación en Cualquier Dispositivo

Sigue estos pasos para clonar y ejecutar el proyecto en una computadora nueva:

### 1. Requisitos Previos

- **Node.js**: Versión 20 LTS o superior ([Descargar Node.js](https://nodejs.org/)).
- **Python**: Versión 3.10 o superior ([Descargar Python](https://www.python.org/downloads/)) - *Opcional pero recomendado para conversión de documentos Office*. Asegurarse de marcar la casilla **"Add Python to PATH"**.
- **Git**: Para clonar el repositorio ([Descargar Git](https://git-scm.com/)).

---

### 2. Clonar el Repositorio

Abre una terminal o consola de comandos y ejecuta:

```bash
git clone https://github.com/Yahel-Bot/PrintStudio-Pro.git
cd PrintStudio-Pro
```

---

### 3. Instalar Dependencias de Node.js

Instala los paquetes necesarios del proyecto:

```bash
npm install
```

> [!IMPORTANT]
> **Compatibilidad de Módulos Nativos (`better-sqlite3`):**
> Si al ejecutar la aplicación aparece un error relacionado con `NODE_MODULE_VERSION`, reconstruye las dependencias nativas para la versión de Electron utilizada (v31):
> ```bash
> npx @electron/rebuild -v 31.0.0
> ```

---

### 4. Instalar Dependencias de Python (Opcional)

Si requieres la conversión automatizada de documentos de Office a PDF, ejecuta el script automatizado:

```cmd
setup-dependencies.bat
```

O instala manualmente los paquetes vía pip:
```bash
pip install comtypes PyMuPDF opencv-python numpy
```

---

## 💻 Ejecución en Modo Desarrollo

Para iniciar tanto el servidor de desarrollo de Vite como la ventana interactiva de Electron en caliente:

```bash
npm run dev
```

---

## 📦 Compilación y Generación de Instaladores (.exe)

Para crear el paquete de distribución instalable (NSIS) y la versión portable para Windows:

```bash
npm run build
```

Los instaladores generados se guardarán automáticamente en la carpeta `build/`.

---

## 🔒 Reglas de Mantenimiento

1. **Integridad Visual:** No alterar la paleta de colores, diseño de cuadrículas ni distribución establecida.
2. **Escala de Precios B/N:** Mantener los bloques tarifarios por volumen (1-50, 51-100, 101-200, 201+ copias).
3. **Módulos Nativos:** Siempre probar la ejecución dentro del entorno Electron (`npm run dev`), nunca ejecutar `node index.js` de forma aislada.

---

Desarrollado con ❤️ por **Yahel**.
