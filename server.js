const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const uploadFormats = require('./upload_formats.json');

const allowedExtensions = new Set([...uploadFormats.documents, ...uploadFormats.images]);
const uploadAcceptValue = [...allowedExtensions].map(extension => `.${extension}`).join(',');

function startRemoteServer(port, uploadDir, userDataDir, onFileReceived, allowedToken) {
    const app = express();
    app.use(cors());

    // Servir archivos locales con cabeceras permisivas para previsualización
    app.use('/local-files', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
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
            fileSize: 100 * 1024 * 1024, // Ampliado a 100MB por archivo
            files: 20 // Hasta 20 archivos por lote
        },
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase().slice(1);
            if (allowedExtensions.has(ext)) {
                cb(null, true);
            } else {
                cb(new Error(`Tipo de archivo no permitido (${ext || file.mimetype}).`), false);
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
                return res.status(400).send('El archivo es demasiado grande. Límite: 100 MB por archivo.');
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).send('Demasiados archivos. Límite: 20 archivos por envío.');
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

module.exports = startRemoteServer;
