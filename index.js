const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const qrcode = require('qrcode');
const { execFile } = require('child_process');
const { autoUpdater } = require('electron-updater');

// Configuración de actualizaciones automáticas
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

const GestorDB = require('./database');
const AnalizadorColor = require('./analysis');
const startRemoteServer = require('./server');
const localtunnel = require('localtunnel');
const crypto = require('crypto');
const generateTicketHTML = require('./ticket_generator');
const normalizeImageForAnalysis = require('./image_normalizer');

let hotspotManager;
try {
    hotspotManager = require('./hotspot_manager');
} catch (e) {
    console.error('No se pudo cargar hotspot_manager:', e);
    hotspotManager = {
        getHotspotInfo: async () => ({ supported: false, state: 'Off', error: e.message }),
        setHotspotState: async () => ({ success: false, error: e.message })
    };
}

let mainWindow;
let db;
let analizador = new AnalizadorColor();
let remoteServer;
let localUploadPath = '';
const SERVER_PORT = 3500;

function getNetworkDetails() {
    const interfaces = os.networkInterfaces();
    let hotspotIp = null;
    let wifiIp = null;
    let lanIp = null;
    let fallbackIp = null;

    for (const devName in interfaces) {
        const lowerName = devName.toLowerCase();
        // Excluir adaptadores virtuales, VPNs y túneles (Cloudflare WARP, Hyper-V, WSL, Docker, etc.)
        if (/warp|cloudflare|tailscale|zerotier|vpn|tap|tun|wireguard|vethernet|hyper-v|virtualbox|vmware|wsl|docker/i.test(lowerName)) {
            continue;
        }

        const iface = interfaces[devName];
        for (const alias of iface) {
            if (alias.family !== 'IPv4' || alias.internal || alias.address === '127.0.0.1' || alias.address.startsWith('169.254.')) continue;
            // Excluir máscaras de host único (/32) típicas de VPN
            if (alias.netmask === '255.255.255.255') continue;

            // Detectar si pertenece a la subred de Windows Hotspot (192.168.137.x)
            if (alias.address.startsWith('192.168.137.')) {
                hotspotIp = alias.address;
                continue;
            }

            // Adaptador Wi-Fi físico
            if (/wi-fi|wifi|wlan|wireless/i.test(lowerName)) {
                wifiIp = alias.address;
                continue;
            }

            // Adaptador Ethernet / Cable
            if (/ethernet|eth|en/i.test(lowerName)) {
                lanIp = alias.address;
                continue;
            }

            if (!fallbackIp) fallbackIp = alias.address;
        }
    }

    const preferred = wifiIp || lanIp || hotspotIp || fallbackIp || 'localhost';
    return {
        hotspotIp: hotspotIp || '192.168.137.1',
        hasActiveHotspotAdapter: Boolean(hotspotIp),
        wifiIp: wifiIp || lanIp || fallbackIp || 'localhost',
        preferredLocalIp: preferred
    };
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "PrintStudio Pro"
    });

    const isDev = !app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }
}

app.whenReady().then(() => {
    db = new GestorDB(app.getPath('userData'));
    createWindow();

    // Iniciar servidor remoto y directorios
    const uploadDir = path.join(app.getPath('userData'), 'uploads');
    const tempDir = path.join(app.getPath('userData'), 'temp');
    
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    // Limpieza de archivos temporales anteriores al iniciar
    try {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(filePath);
            }
        }
    } catch (e) {
        console.error("Error al limpiar temporal:", e);
    }
    
    // Generar token efímero para la subida
    const token = crypto.randomBytes(8).toString('hex');
    localUploadPath = `/upload/${token}`;

    remoteServer = startRemoteServer(SERVER_PORT, uploadDir, app.getPath('userData'), (filePath) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('file-received', filePath);
        }
    }, token, (id) => gestorDB.obtenerVentaPorId(id));

    // Iniciar túnel opcional para datos móviles
    (async () => {
        try {
            const tunnel = await localtunnel({ port: SERVER_PORT });
            const publicUrl = `${tunnel.url}${localUploadPath}`;
            
            // Obtener IP pública para informar contraseña del túnel si es necesario
            let externalIp = '';
            try {
                const https = require('https');
                https.get('https://api.ipify.org', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        externalIp = data.trim();
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('tunnel-info', { url: publicUrl, password: externalIp });
                        }
                    });
                }).on('error', () => {});
            } catch (err) {}

            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('tunnel-url', publicUrl);
                mainWindow.webContents.send('tunnel-info', { url: publicUrl, password: externalIp });
            }
            tunnel.on('close', () => console.log('Localtunnel cerrado'));
        } catch (e) {
            console.warn('No se pudo abrir túnel localtunnel (normal sin internet):', e.message);
        }
    })();

    if (app.isPackaged) {
        // Verificar actualizaciones 4 segundos después del arranque
        setTimeout(() => {
            autoUpdater.checkForUpdates().catch(err => {
                console.warn('No se pudo comprobar actualización inicial:', err.message);
            });
        }, 4000);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Eventos del Auto-Updater
autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Actualización disponible:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes
        });
    }
});

autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-download-progress', {
            percent: progressObj.percent,
            bytesPerSecond: progressObj.bytesPerSecond,
            transferred: progressObj.transferred,
            total: progressObj.total
        });
    }
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Actualización descargada con éxito:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-downloaded', {
            version: info.version
        });
    }
});

autoUpdater.on('error', (err) => {
    console.warn('[AutoUpdater] Error:', err ? err.message : err);
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-error', err ? err.message : 'Error al verificar actualizaciones');
    }
});

// Helper para encontrar Python en Windows
function getPythonCommand() {
    const candidates = [
        'C:\\Python314\\python.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Programs\\Python\\Python312\\python.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs\\Python\\Python313\\python.exe'),
        'python',
        'py'
    ];
    for (const candidate of candidates) {
        try {
            if (candidate.includes('\\') && fs.existsSync(candidate)) {
                return candidate;
            }
        } catch (e) {}
    }
    return 'python';
}

// IPC Handlers
ipcMain.handle('get-printers', async () => {
    try {
        if (mainWindow && mainWindow.webContents) {
            return await mainWindow.webContents.getPrintersAsync();
        }
        return [];
    } catch (err) {
        console.error("Error al obtener impresoras:", err);
        return [];
    }
});

ipcMain.handle('get-ip', async () => {
    return getNetworkDetails().preferredLocalIp;
});

ipcMain.handle('get-network-info', async () => {
    const net = getNetworkDetails();
    const hs = await hotspotManager.getHotspotInfo();
    return {
        ...net,
        hotspotInfo: hs,
        // Keep both names for renderer compatibility with older builds.
        hotspot: hs,
        uploadPath: localUploadPath,
        localUploadPath
    };
});

ipcMain.handle('get-hotspot-info', async () => {
    return await hotspotManager.getHotspotInfo();
});

ipcMain.handle('toggle-hotspot', async (event, enable) => {
    return await hotspotManager.setHotspotState(enable);
});

ipcMain.handle('get-upload-path', async () => localUploadPath);

ipcMain.handle('generate-qr', async (event, text) => {
    return await qrcode.toDataURL(text, {
        margin: 2,
        errorCorrectionLevel: 'M',
        width: 320
    });
});

// Puente de conversión y análisis para documentos Office y PDF
ipcMain.handle('convert-office', async (event, filePath) => {
    return new Promise((resolve) => {
        try {
            const pythonPath = getPythonCommand();
            let scriptPath = path.join(__dirname, 'office_bridge.py');
            if (app.isPackaged) {
                const unpackedPath = path.join(__dirname, 'office_bridge.py').replace('app.asar', 'app.asar.unpacked');
                if (fs.existsSync(unpackedPath)) {
                    scriptPath = unpackedPath;
                }
            }
            const userDataPath = app.getPath('userData');
            const tempDir = path.join(userDataPath, 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            execFile(pythonPath, [scriptPath, filePath, tempDir], {
                timeout: 180000,
                maxBuffer: 50 * 1024 * 1024,
                windowsHide: true
            }, (error, stdout, stderr) => {
                if (error && !stdout) {
                    console.error(`Error de ejecución en convert-office: ${error.message}`);
                    return resolve({ status: 'error', message: error.message || stderr });
                }
                try {
                    const match = stdout.match(/\{[\s\S]*\}/);
                    if (match) {
                        const result = JSON.parse(match[0]);
                        if (result.status === 'success' && Array.isArray(result.pages)) {
                            result.pages = result.pages.map(page => {
                                let targetImg = page.image_path;
                                if (!targetImg.startsWith(userDataPath)) {
                                    const fallbackName = `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;
                                    const dest = path.join(tempDir, fallbackName);
                                    try {
                                        fs.copyFileSync(targetImg, dest);
                                        targetImg = dest;
                                    } catch (e) {}
                                }
                                let rel = path.relative(userDataPath, targetImg).replace(/\\/g, '/');
                                const encoded = rel.split('/').map(encodeURIComponent).join('/');
                                return {
                                    ...page,
                                    image_path: `http://localhost:${SERVER_PORT}/local-files/${encoded}`
                                };
                            });
                        }
                        return resolve(result);
                    } else {
                        return resolve({
                            status: 'error',
                            message: 'No se obtuvo respuesta JSON del procesador de documentos. ' + (stdout || stderr || '')
                        });
                    }
                } catch (e) {
                    console.error('Error al procesar salida JSON en convert-office:', e);
                    return resolve({ status: 'error', message: e.message });
                }
            });
        } catch (err) {
            console.error('Error inesperado en convert-office:', err);
            return resolve({ status: 'error', message: err.message });
        }
    });
});

ipcMain.handle('analyze-image', async (event, filePath) => {
    try {
        const userDataPath = app.getPath('userData');
        const tempDir = path.join(userDataPath, 'temp');
        
        let targetPath = filePath;
        
        if (!filePath.startsWith(userDataPath)) {
            const ext = path.extname(filePath);
            const safeBase = path.basename(filePath, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
            const fileName = `img_${Date.now()}_${safeBase}${ext}`;
            targetPath = path.join(tempDir, fileName);
            fs.copyFileSync(filePath, targetPath);
        }

        targetPath = await normalizeImageForAnalysis(targetPath, tempDir);
        
        const result = await analizador.analizar(targetPath);
        
        let relativePath = path.relative(userDataPath, targetPath).replace(/\\/g, '/');
        const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
        const localUrl = `http://localhost:${SERVER_PORT}/local-files/${encodedPath}`;
        
        return {
            ...result,
            image_path: localUrl
        };
    } catch (err) {
        console.error("Error en analyze-image handler:", err);
        throw err;
    }
});

ipcMain.handle('save-sale', async (event, saleData) => {
    return db.registrarVenta(saleData);
});

// IPC Handlers para el Sistema de Aprendizaje de Tarifas
ipcMain.handle('get-learning-model', async () => {
    return db.obtenerModeloAprendizaje();
});

ipcMain.handle('save-price-correction', async (event, correctionData) => {
    return db.guardarCorreccion(correctionData);
});

ipcMain.handle('reset-learning-model', async () => {
    return db.restablecerAprendizaje();
});

ipcMain.handle('get-corte', async () => {
    const resumen = db.obtenerCorteDiario();
    const ventas = db.obtenerDetalleVentasHoy();
    return { resumen, ventas };
});

ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Imágenes y Documentos', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'] }
        ]
    });
    return result.filePaths;
});

// Print Ticket Handler
ipcMain.handle('print-ticket', async (event, saleData, printerName) => {
    return new Promise(async (resolve, reject) => {
        let workerWindow = null;
        let printTimeout = null;
        try {
            const net = getNetworkDetails();
            const serverHost = net.preferredLocalIp;
            const a = encodeURIComponent(saleData.archivo || 'Trabajo');
            const ticketUrl = saleData.ticketUrl || `http://${serverHost}:${SERVER_PORT}/ticket/${saleData.id || ''}?a=${a}&p=${saleData.paginas || 1}&c=${saleData.copias || 1}&t=${saleData.total || 0}&ti=${saleData.costo_tinta || 0}&f=${saleData.costo_fijo || 0}`;
            const html = await generateTicketHTML(saleData, ticketUrl);

            workerWindow = new BrowserWindow({
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            const cleanup = () => {
                if (printTimeout) clearTimeout(printTimeout);
                if (workerWindow) {
                    try { workerWindow.close(); } catch (e) {}
                    workerWindow = null;
                }
            };

            printTimeout = setTimeout(() => {
                cleanup();
                resolve({ success: false, reason: 'Tiempo de espera agotado al imprimir ticket' });
            }, 30000);

            workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

            workerWindow.webContents.on('did-finish-load', () => {
                const printOptions = {
                    silent: true,
                    printBackground: true
                };
                if (printerName) {
                    printOptions.deviceName = printerName;
                }
                workerWindow.webContents.print(printOptions, (success, failureReason) => {
                    cleanup();
                    if (success) {
                        resolve({ success: true });
                    } else {
                        console.warn("Fallo impresión silenciosa de ticket:", failureReason);
                        resolve({ success: false, reason: failureReason });
                    }
                });
            });
        } catch (err) {
            if (printTimeout) clearTimeout(printTimeout);
            if (workerWindow) {
                try { workerWindow.close(); } catch (e) {}
            }
            console.error("Error printing ticket:", err);
            reject(err);
        }
    });
});

// Print Document Handler
ipcMain.handle('print-document', async (event, jobData) => {
    return new Promise(async (resolve, reject) => {
        let workerWindow = null;
        let printTimeout = null;
        try {
            const html = generatePrintHTML(jobData);

            workerWindow = new BrowserWindow({
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            const cleanup = () => {
                if (printTimeout) clearTimeout(printTimeout);
                if (workerWindow) {
                    try { workerWindow.close(); } catch (e) {}
                    workerWindow = null;
                }
            };

            printTimeout = setTimeout(() => {
                cleanup();
                resolve({ success: false, reason: 'Tiempo de espera agotado al imprimir documento' });
            }, 60000);

            workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

            workerWindow.webContents.on('did-finish-load', () => {
                const printOptions = {
                    silent: true,
                    printBackground: true,
                    color: jobData.isColorPrint !== false,
                    pageSize: getPaperSizeMicrons(jobData.paperSize, jobData.orientation)
                };
                if (jobData.printer) {
                    printOptions.deviceName = jobData.printer;
                }
                workerWindow.webContents.print(printOptions, (success, failureReason) => {
                    cleanup();
                    if (success) {
                        resolve({ success: true });
                    } else {
                        console.warn("Silent printing failed, trying standard dialog:", failureReason);
                        resolve({ success: false, reason: failureReason });
                    }
                });
            });
        } catch (err) {
            if (printTimeout) clearTimeout(printTimeout);
            if (workerWindow) {
                try { workerWindow.close(); } catch (e) {}
            }
            console.error("Error printing document:", err);
            reject(err);
        }
    });
});

// Auto-Updater IPC Handlers
ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
        return { status: 'dev-mode', message: 'Las actualizaciones automáticas solo funcionan en la app empaquetada.' };
    }
    try {
        const result = await autoUpdater.checkForUpdates();
        return { status: 'checked', updateInfo: result ? result.updateInfo : null };
    } catch (e) {
        console.warn('Error manual check-for-updates:', e.message);
        return { status: 'error', error: e.message };
    }
});

ipcMain.handle('download-update', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (e) {
        console.error('Error al descargar actualización:', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('quit-and-install', () => {
    setImmediate(() => {
        autoUpdater.quitAndInstall(false, true);
    });
    return true;
});

function generatePrintHTML(jobData) {
    const { copies, paperSize, imageLayout, fitOption, orientation } = jobData;
    const pages = Array.isArray(jobData.pages) ? jobData.pages : [];
    let widthPt, heightPt;
    switch (paperSize) {
        case 'Carta': // US Letter: 8.5 x 11 inches
            widthPt = 8.5 * 72;
            heightPt = 11 * 72;
            break;
        case 'Oficio': // US Legal: 8.5 x 14 inches
            widthPt = 8.5 * 72;
            heightPt = 14 * 72;
            break;
        case 'Oficio México': // Oficio México: 8.5 x 13.4 inches
            widthPt = 8.5 * 72;
            heightPt = 13.4 * 72;
            break;
        case 'A4': // ISO A4: 8.27 x 11.69 inches (210 x 297 mm)
            widthPt = 8.27 * 72;
            heightPt = 11.69 * 72;
            break;
        case 'Doble Carta / Tabloide': // Tabloid: 11 x 17 inches
            widthPt = 11 * 72;
            heightPt = 17 * 72;
            break;
        default:
            widthPt = 8.5 * 72;
            heightPt = 11 * 72;
    }

    if (orientation === 'landscape') {
        const temp = widthPt;
        widthPt = heightPt;
        heightPt = temp;
    }

    const widthIn = widthPt / 72;
    const heightIn = heightPt / 72;

    const { rows, cols } = getLayoutDimensions(imageLayout, orientation);

    const marginIn = 0.25;
    const usableWidthIn = widthIn - 2 * marginIn;
    const usableHeightIn = heightIn - 2 * marginIn;

    const cellWidthIn = usableWidthIn / cols;
    const cellHeightIn = usableHeightIn / rows;

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @page {
                    size: ${widthIn}in ${heightIn}in;
                    margin: 0;
                }
                * {
                    box-sizing: border-box;
                }
                body {
                    margin: 0;
                    padding: 0;
                    width: ${widthIn}in;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .page {
                    position: relative;
                    width: ${widthIn}in;
                    height: ${heightIn}in;
                    padding: ${marginIn}in;
                    page-break-after: always;
                    break-after: page;
                    overflow: hidden;
                }
                .page:last-child {
                    page-break-after: avoid;
                    break-after: avoid;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(${cols}, 1fr);
                    grid-template-rows: repeat(${rows}, 1fr);
                    gap: 4px;
                    width: 100%;
                    height: 100%;
                }
                .cell {
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>
        </head>
        <body>
    `;

    const photosPerPage = rows * cols;
    const totalPages = Math.max(1, Math.ceil(pages.length / photosPerPage));
    const numCopies = Math.max(1, parseInt(copies) || 1);

    for (let c = 0; c < numCopies; c++) {
        for (let p = 0; p < totalPages; p++) {
            html += `<div class="page"><div class="grid">`;

            for (let i = 0; i < photosPerPage; i++) {
                const index = p * photosPerPage + i;
                if (index < pages.length) {
                    const page = pages[index];
                    const rot = (page.rotation || 0) % 360;
                    const isRot90 = (rot === 90 || rot === 270);
                    // Determinar si esta página se imprime en B/N para aplicar filtro idéntico al renderizado en pantalla
                    const isPageBw = page.isBW === true || jobData.isColorPrint === false || (jobData.isColorPrint === 'auto' && !page.esColor);
                    const filterStyle = isPageBw ? 'filter: grayscale(100%) contrast(105%); -webkit-filter: grayscale(100%) contrast(105%);' : '';
                    html += `
                        <div class="cell">
                            <div style="${isRot90 ? `width: ${cellHeightIn}in; height: ${cellWidthIn}in;` : 'width: 100%; height: 100%;'} display: flex; align-items: center; justify-content: center; transform: rotate(${rot}deg); transform-origin: center center; flex-shrink: 0;">
                                <img src="${page.imagePath}" alt="Page ${index}" style="max-width: 100%; max-height: 100%; width: 100%; height: 100%; object-fit: ${fitOption === 'fill' ? 'cover' : 'contain'}; ${filterStyle}" />
                            </div>
                        </div>
                    `;
                } else {
                    html += `<div class="cell"></div>`;
                }
            }

            html += `</div></div>`;
        }
    }

    html += `
        </body>
        </html>
    `;

    return html;
}

function getPaperSizeMicrons(paperSize, orientation) {
    const sizes = {
        'Carta': [215900, 279400],
        'Oficio': [215900, 355600],
        'Oficio México': [215900, 340360],
        'A4': [210000, 297000],
        'A4': [210000, 297000],
        'Doble Carta / Tabloide': [279400, 431800]
    };
    const [width, height] = sizes[paperSize] || sizes['Carta'];
    return orientation === 'landscape'
        ? { width: height, height: width }
        : { width, height };
}

function getLayoutDimensions(imageLayout, orientation) {
    const isLandscape = orientation === 'landscape';
    switch (Number(imageLayout)) {
        case 1:
            return { rows: 1, cols: 1 };
        case 2:
            return isLandscape ? { rows: 1, cols: 2 } : { rows: 2, cols: 1 };
        case 3:
            return isLandscape ? { rows: 1, cols: 3 } : { rows: 3, cols: 1 };
        case 4:
            return { rows: 2, cols: 2 };
        case 5:
            return isLandscape ? { rows: 2, cols: 3 } : { rows: 3, cols: 2 };
        case 6:
            return isLandscape ? { rows: 2, cols: 3 } : { rows: 3, cols: 2 };
        case 7:
            return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
        case 8:
            return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
        case 9:
            return { rows: 3, cols: 3 };
        case 10:
            return isLandscape ? { rows: 2, cols: 5 } : { rows: 5, cols: 2 };
        case 35:
            return isLandscape ? { rows: 5, cols: 7 } : { rows: 7, cols: 5 };
        default:
            const count = Number(imageLayout) || 1;
            if (count <= 1) return { rows: 1, cols: 1 };
            const cols = isLandscape ? Math.ceil(Math.sqrt(count * 1.3)) : Math.floor(Math.sqrt(count * 0.77)) || 1;
            const rows = Math.ceil(count / cols);
            return { rows, cols };
    }
}
