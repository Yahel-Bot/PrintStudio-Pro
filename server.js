const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const uploadFormats = require('./upload_formats.json');

const allowedExtensions = new Set([...uploadFormats.documents, ...uploadFormats.images]);
const uploadAcceptValue = [...allowedExtensions].map(extension => `.${extension}`).join(',');

// File size limits (matching upload_client.html: 50MB per file, 10 files max)
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_FILE_COUNT = 50;

function startRemoteServer(port, uploadDir, userDataDir, onFileReceived, allowedToken, getSaleById) {
    const app = express();
    app.use(cors());

    // Request timeout middleware (120s matching client)
    app.use((req, res, next) => {
        req.setTimeout(120000, () => {
            res.status(408).send('Tiempo de espera agotado. Verifica la conexión con la PC.');
        });
        res.setTimeout(120000, () => {
            console.log('Response timeout');
        });
        next();
    });

    // Servir archivos locales con cabeceras permisivas para previsualización
    app.use('/local-files', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Type');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        next();
    }, express.static(userDataDir));

    // Almacenamiento seguro: sanitiza nombres para evitar caracteres problemáticos en URLs
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const base = path.basename(file.originalname, ext)
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .substring(0, 60);
            cb(null, `${Date.now()}-${base || 'archivo'}${ext}`);
        }
    });

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: MAX_FILE_SIZE,
            files: MAX_FILE_COUNT
        },
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase().slice(1);
            if (allowedExtensions.has(ext)) {
                cb(null, true);
            } else {
                cb(new Error(`Tipo de archivo no permitido: .${ext}. Formatos permitidos: ${[...allowedExtensions].join(', ')}`), false);
            }
        }
    });

    // Endpoint de verificación de conectividad para el móvil
    app.get('/ping', (req, res) => {
        res.json({ status: 'ok', server: 'PrintStudio Pro', timestamp: Date.now() });
    });

    // Helper to send the upload page
    const serveUploadPage = (req, res) => {
        const uploadRoute = allowedToken ? `/upload/${allowedToken}` : '/upload';
        const htmlPath = path.join(__dirname, 'upload_client.html');
        try {
            if (fs.existsSync(htmlPath)) {
                let html = fs.readFileSync(htmlPath, 'utf8');
                const configScript = `<script>window.__UPLOAD_ROUTE__ = "${uploadRoute}"; window.__SERVER_PORT__ = ${port}; window.__UPLOAD_ACCEPT__ = ${JSON.stringify(uploadAcceptValue)};</script>`;
                html = html.replace('</head>', `${configScript}</head>`);
                return res.send(html);
            }
        } catch (e) {
            console.error('Error reading upload_client.html:', e);
        }
        res.status(500).send('Error al cargar la página de subida de PrintStudio Pro.');
    };

    app.get('/', serveUploadPage);
    app.get('/upload', serveUploadPage);
    if (allowedToken) {
        app.get(`/upload/${allowedToken}`, serveUploadPage);
    }

    // Rutas para ver comprobante / ticket digital escaneado con QR desde el celular
    const handleTicketRequest = (req, res) => {
        const ticketId = req.params.id || req.query.id;
        let sale = null;
        if (typeof getSaleById === 'function' && ticketId) {
            try {
                sale = getSaleById(ticketId);
            } catch (e) {
                console.warn('Error al buscar venta por id:', e.message);
            }
        }
        // Si no se encuentra en DB o acceso sin id exacto, reconstruir de query params
        if (!sale) {
            sale = {
                id: ticketId || req.query.id || '---',
                archivo: req.query.archivo || req.query.a || 'Trabajo de Impresión',
                paginas: Number(req.query.paginas || req.query.p || 1),
                copias: Number(req.query.copias || req.query.c || 1),
                costo_tinta: Number(req.query.costo_tinta || req.query.ti || 0),
                costo_fijo: Number(req.query.costo_fijo || req.query.f || 0),
                total: Number(req.query.total || req.query.t || 0),
                fecha: req.query.fecha || req.query.d || new Date().toISOString()
            };
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(renderDigitalTicketHTML(sale));
    };

    app.get('/ticket', handleTicketRequest);
    app.get('/ticket/:id', handleTicketRequest);

    // Rutas de subida
    const uploadRoute = allowedToken ? `/upload/${allowedToken}` : '/upload';

    const handleUploadPost = (req, res) => {
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                onFileReceived(file.path);
            });
            res.status(200).send('Archivos enviados con éxito. La aplicación los está procesando.');
        } else {
            res.status(400).send('No se seleccionaron archivos válidos.');
        }
    };

    app.post(uploadRoute, upload.array('files'), handleUploadPost);
    if (allowedToken) {
        app.post('/upload', upload.array('files'), handleUploadPost);
    }

    // Manejo de errores para multer
    app.use((err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send(`El archivo es demasiado grande. Límite: ${MAX_FILE_SIZE / (1024 * 1024)} MB por archivo.`);
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).send(`Demasiados archivos. Límite: ${MAX_FILE_COUNT} archivos por envío.`);
            }
        }
        if (err.message) {
            return res.status(400).send(err.message);
        }
        next(err);
    });

    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Servidor remoto escuchando en el puerto ${port} (0.0.0.0)`);
    });
    server.on('error', (error) => {
        console.error(`Error iniciando servidor remoto en el puerto ${port}:`, error);
    });
    return server;
}

function renderDigitalTicketHTML(sale) {
    let detalles = [];
    try {
        if (sale.detalles) {
            detalles = typeof sale.detalles === 'string' ? JSON.parse(sale.detalles) : sale.detalles;
        }
    } catch (e) {}

    const fechaFormateada = sale.fecha ? new Date(sale.fecha).toLocaleString('es-MX', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    }) : new Date().toLocaleString('es-MX');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket #${sale.id || 'Digital'} - PrintStudio Pro</title>
    <style>
        :root {
            --bg: #0f172a;
            --card: #1e293b;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --border: rgba(255, 255, 255, 0.1);
            --primary: #6366f1;
            --success: #10b981;
        }
        @media (prefers-color-scheme: light) {
            :root {
                --bg: #f1f5f9;
                --card: #ffffff;
                --text: #0f172a;
                --text-muted: #64748b;
                --border: rgba(15, 23, 42, 0.1);
            }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
        }
        .ticket-wrapper {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 16px;
            width: 100%;
            max-width: 380px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.25);
            padding: 24px;
            position: relative;
            overflow: hidden;
        }
        .ticket-header {
            text-align: center;
            margin-bottom: 20px;
            position: relative;
        }
        .ticket-icon {
            font-size: 32px;
            margin-bottom: 6px;
        }
        .ticket-brand {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: var(--primary);
        }
        .ticket-subtitle {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
            margin-top: 2px;
        }
        .ticket-id-badge {
            display: inline-block;
            background: rgba(99, 102, 241, 0.15);
            color: var(--primary);
            font-weight: 700;
            font-size: 13px;
            padding: 4px 10px;
            border-radius: 20px;
            margin-top: 8px;
        }
        .ticket-divider {
            border-top: 2px dashed var(--border);
            margin: 16px 0;
            position: relative;
        }
        .ticket-divider::before, .ticket-divider::after {
            content: '';
            position: absolute;
            top: -9px;
            width: 16px;
            height: 16px;
            background: var(--bg);
            border-radius: 50%;
        }
        .ticket-divider::before { left: -32px; }
        .ticket-divider::after { right: -32px; }
        .ticket-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .ticket-label {
            color: var(--text-muted);
        }
        .ticket-val {
            font-weight: 600;
            text-align: right;
            max-width: 65%;
            word-break: break-word;
        }
        .ticket-total-box {
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 16px 0 12px;
        }
        .total-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--success);
        }
        .total-amount {
            font-size: 24px;
            font-weight: 900;
            color: var(--success);
        }
        .ticket-details {
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 10px;
        }
        .details-item {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            border-bottom: 1px dotted var(--border);
        }
        .ticket-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        .btn-action {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s ease;
        }
        .btn-print {
            background: var(--primary);
            color: #ffffff;
        }
        .btn-print:hover {
            filter: brightness(1.1);
        }
        .ticket-footer {
            text-align: center;
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 16px;
        }
        @media print {
            body { background: #fff !important; color: #000 !important; }
            .ticket-wrapper { box-shadow: none !important; border: 1px solid #ccc !important; max-width: 100% !important; }
            .ticket-actions { display: none !important; }
            .ticket-divider::before, .ticket-divider::after { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="ticket-wrapper">
        <div class="ticket-header">
            <div class="ticket-icon">🖨️</div>
            <div class="ticket-brand">PrintStudio Pro</div>
            <div class="ticket-subtitle">Comprobante de Impresión</div>
            <div class="ticket-id-badge">Ticket #${sale.id || '---'}</div>
        </div>

        <div class="ticket-row">
            <span class="ticket-label">Fecha y Hora:</span>
            <span class="ticket-val">${fechaFormateada}</span>
        </div>
        <div class="ticket-row">
            <span class="ticket-label">Archivo:</span>
            <span class="ticket-val" title="${sale.archivo || ''}">${sale.archivo || 'Varios archivos'}</span>
        </div>
        <div class="ticket-row">
            <span class="ticket-label">Páginas impresas:</span>
            <span class="ticket-val">${sale.paginas || 1}</span>
        </div>
        <div class="ticket-row">
            <span class="ticket-label">Copias / Juegos:</span>
            <span class="ticket-val">${sale.copias || 1} x</span>
        </div>

        <div class="ticket-divider"></div>

        <div class="ticket-row">
            <span class="ticket-label">Subtotal Tinta:</span>
            <span class="ticket-val">$${Number(sale.costo_tinta || 0).toFixed(2)}</span>
        </div>
        <div class="ticket-row">
            <span class="ticket-label">Cargo Base / Papel:</span>
            <span class="ticket-val">$${Number(sale.costo_fijo || 0).toFixed(2)}</span>
        </div>

        <div class="ticket-total-box">
            <div>
                <div class="total-title">Total Pagado</div>
                <div style="font-size: 10px; color: var(--text-muted);">IVA incluido</div>
            </div>
            <div class="total-amount">$${Number(sale.total || 0).toFixed(2)}</div>
        </div>

        ${detalles.length > 0 ? `
            <div class="ticket-details">
                <div style="font-weight: 700; margin-bottom: 4px;">Desglose de Páginas:</div>
                ${detalles.map((d, i) => `
                    <div class="details-item">
                        <span>Pág. ${d.pagina || (i+1)} (${d.tipo || (d.esColor ? 'Color' : 'B/N')})</span>
                        <span>$${Number(d.costo || 0).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div class="ticket-actions">
            <button class="btn-action btn-print" onclick="window.print()">
                <span>📄</span> Imprimir / Guardar PDF
            </button>
        </div>

        <div class="ticket-footer">
            <p>¡Gracias por su preferencia!</p>
            <p style="margin-top: 4px; font-size: 9.5px; opacity: 0.7;">Comprobante emitido automáticamente por PrintStudio Pro</p>
        </div>
    </div>
</body>
</html>`;
}

module.exports = startRemoteServer;
