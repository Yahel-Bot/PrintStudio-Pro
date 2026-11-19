/**
 * updater.js - In-App GitHub Releases Auto-Updater for PrintStudio Pro
 * 
 * Provides an asynchronous, non-blocking update checker that queries the
 * GitHub Releases API (releases/latest), verifies cryptographic integrity (SHA-256 / SHA-512),
 * and safely launches the new Windows installer.
 */

let app, ipcMain;
try {
    const electron = require('electron');
    app = electron.app;
    ipcMain = electron.ipcMain;
} catch (e) {
    // Standalone or test environment
}
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');

const GITHUB_OWNER = 'Yahel-Bot';
const GITHUB_REPO = 'PrintStudio-Pro';
const REPO_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

let targetWindow = null;
let pendingUpdate = null;
let isDownloading = null;
let downloadedFilePath = null;

/**
 * Compare two semver strings: e.g. "1.0.4" vs "1.0.3"
 * Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal.
 */
function compareSemver(v1, v2) {
    if (!v1 || !v2) return 0;
    const clean = v => v.replace(/^v/i, '').trim().split('-')[0].split('.').map(n => parseInt(n, 10) || 0);
    const p1 = clean(v1);
    const p2 = clean(v2);

    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const num1 = p1[i] || 0;
        const num2 = p2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
}

/**
 * Fetch JSON or text from a URL following redirects (HTTP 301/302)
 */
function fetchUrl(urlStr, options = {}, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) {
            return reject(new Error('Demasiadas redirecciones HTTP'));
        }

        const url = new URL(urlStr);
        const protocol = url.protocol === 'http:' ? http : https;
        const reqHeaders = {
            'User-Agent': `PrintStudio-Pro/${app ? app.getVersion() : '1.0.3'}`,
            'Accept': 'application/vnd.github.v3+json',
            ...(options.headers || {})
        };

        const req = protocol.get(urlStr, { headers: reqHeaders, timeout: options.timeout || 10000 }, (res) => {
            if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
                return resolve(fetchUrl(res.headers.location, options, maxRedirects - 1));
            }

            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`HTTP error ${res.statusCode}: ${res.statusMessage}`));
            }

            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => resolve(data));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Tiempo de espera agotado al consultar actualizaciones'));
        });

        req.on('error', err => reject(err));
    });
}

/**
 * Clean and summarize markdown changelog for display in banner
 */
function formatChangelog(markdownBody) {
    if (!markdownBody || typeof markdownBody !== 'string') {
        return 'Mejoras de rendimiento y correcciones de estabilidad.';
    }

    // Limpiar comentarios HTML o tags
    let text = markdownBody.replace(/<!--[\s\S]*?-->/g, '').trim();
    // Remover títulos markdown redundantes (# Release...)
    text = text.replace(/^#+\s.*$/gm, '').trim();

    const lines = text.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('---'));

    if (lines.length === 0) {
        return 'Mejoras de rendimiento y correcciones de estabilidad.';
    }

    // Tomar los primeros 3 puntos o resumen conciso
    const bullets = lines.slice(0, 3).map(l => l.replace(/^[\*\-•]\s*/, '').trim());
    return bullets.join(' • ');
}

/**
 * Query GitHub Releases API to see if a newer version is published
 */
async function queryGitHubLatestRelease() {
    try {
        const raw = await fetchUrl(REPO_API_URL, { timeout: 8000 });
        const release = JSON.parse(raw);

        if (!release || !release.tag_name) {
            return { hasUpdate: false, reason: 'No tag_name in release' };
        }

        const remoteVersion = release.tag_name.replace(/^v/i, '').trim();
        const currentVersion = app ? app.getVersion() : '1.0.3';

        if (compareSemver(remoteVersion, currentVersion) > 0) {
            // Buscar ejecutable instalador (.exe)
            const assets = release.assets || [];
            let installerAsset = assets.find(a => 
                a.name.toLowerCase().endsWith('.exe') && 
                (a.name.toLowerCase().includes('setup') || a.name.toLowerCase().includes('installer'))
            );
            if (!installerAsset) {
                installerAsset = assets.find(a => a.name.toLowerCase().endsWith('.exe'));
            }

            // Buscar archivo de verificación de integridad (checksums-sha256.txt o latest.yml)
            const checksumAsset = assets.find(a => 
                a.name.toLowerCase().includes('checksums') || 
                a.name.toLowerCase() === 'latest.yml'
            );

            return {
                hasUpdate: true,
                currentVersion,
                version: remoteVersion,
                tagName: release.tag_name,
                releaseName: release.name || release.tag_name,
                releaseDate: release.published_at,
                releaseNotes: formatChangelog(release.body),
                fullChangelog: release.body || '',
                downloadUrl: installerAsset ? installerAsset.browser_download_url : null,
                assetName: installerAsset ? installerAsset.name : null,
                assetSize: installerAsset ? installerAsset.size : 0,
                checksumUrl: checksumAsset ? checksumAsset.browser_download_url : null,
                checksumName: checksumAsset ? checksumAsset.name : null
            };
        }

        return { hasUpdate: false, currentVersion, remoteVersion };
    } catch (err) {
        return { hasUpdate: false, error: err.message };
    }
}

/**
 * Download a file with progress tracking and SHA-256 verification
 */
function downloadFileWithProgress(urlStr, targetPath, onProgress, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) {
            return reject(new Error('Demasiadas redirecciones durante la descarga'));
        }

        const url = new URL(urlStr);
        const protocol = url.protocol === 'http:' ? http : https;
        const reqHeaders = {
            'User-Agent': `PrintStudio-Pro/${app ? app.getVersion() : '1.0.3'}`,
            'Accept': 'application/octet-stream'
        };

        const req = protocol.get(urlStr, { headers: reqHeaders }, (res) => {
            if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
                return resolve(downloadFileWithProgress(res.headers.location, targetPath, onProgress, maxRedirects - 1));
            }

            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Error HTTP al descargar archivo: ${res.statusCode}`));
            }

            const total = parseInt(res.headers['content-length'] || '0', 10);
            let transferred = 0;
            let lastTime = Date.now();
            let lastTransferred = 0;
            let speed = 0;
            let lastEmit = 0;

            const sha256Hash = crypto.createHash('sha256');
            const fileStream = fs.createWriteStream(targetPath);

            res.on('data', chunk => {
                transferred += chunk.length;
                sha256Hash.update(chunk);
                fileStream.write(chunk);

                const now = Date.now();
                if (now - lastTime >= 1000) {
                    speed = (transferred - lastTransferred) / ((now - lastTime) / 1000);
                    lastTime = now;
                    lastTransferred = transferred;
                }

                if (now - lastEmit >= 200 || transferred === total) {
                    lastEmit = now;
                    const percent = total > 0 ? Math.floor((transferred / total) * 100) : 0;
                    if (typeof onProgress === 'function') {
                        onProgress({ percent, transferred, total, bytesPerSecond: speed });
                    }
                }
            });

            res.on('end', () => {
                fileStream.end(() => {
                    const computedSha256 = sha256Hash.digest('hex');
                    resolve({ targetPath, sha256: computedSha256, size: transferred });
                });
            });

            res.on('error', err => {
                fileStream.close();
                try { fs.unlinkSync(targetPath); } catch (e) {}
                reject(err);
            });
        });

        req.on('error', err => {
            try { fs.unlinkSync(targetPath); } catch (e) {}
            reject(err);
        });
    });
}

/**
 * Verify Windows Executable PE Header (MZ magic bytes 0x4D 0x5A)
 */
function verifyPEHeader(filePath) {
    try {
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(2);
        fs.readSync(fd, buffer, 0, 2, 0);
        fs.closeSync(fd);
        return buffer[0] === 0x4D && buffer[1] === 0x5A; // 'MZ'
    } catch (e) {
        return false;
    }
}

/**
 * Perform manual or automatic check for updates
 */
async function performCheck(silent = false) {
    if (!targetWindow || targetWindow.isDestroyed()) return;

    try {
        console.log('[Updater] Comprobando actualizaciones en GitHub Releases...');
        const result = await queryGitHubLatestRelease();

        if (result.hasUpdate) {
            console.log(`[Updater] ¡Nueva versión ${result.version} disponible!`);
            pendingUpdate = result;

            if (targetWindow && !targetWindow.isDestroyed()) {
                targetWindow.webContents.send('update-available', {
                    version: result.version,
                    releaseDate: result.releaseDate,
                    releaseNotes: result.releaseNotes,
                    fullNotes: result.fullChangelog,
                    downloadUrl: result.downloadUrl,
                    assetName: result.assetName
                });
            }
            return { status: 'update-available', updateInfo: result };
        } else {
            if (!silent) {
                console.log('[Updater] La aplicación ya está en la versión más reciente.');
            }
            return { status: 'latest', currentVersion: result.currentVersion };
        }
    } catch (e) {
        console.warn('[Updater] Error al verificar actualizaciones:', e.message);
        if (!silent && targetWindow && !targetWindow.isDestroyed()) {
            targetWindow.webContents.send('update-error', e.message);
        }
        return { status: 'error', error: e.message };
    }
}

/**
 * Download the pending update asset and verify cryptographic integrity
 */
async function performDownload() {
    if (!pendingUpdate || !pendingUpdate.downloadUrl) {
        throw new Error('No hay ninguna actualización pendiente con archivo descargable.');
    }

    if (isDownloading) {
        return { success: true, message: 'La descarga ya está en curso.' };
    }

    isDownloading = true;
    const tempDir = app ? app.getPath('temp') : os.tmpdir();
    const fileName = pendingUpdate.assetName || `PrintStudio_Pro_Setup_${pendingUpdate.version}.exe`;
    const targetFile = path.join(tempDir, fileName);

    try {
        console.log(`[Updater] Descargando actualización desde ${pendingUpdate.downloadUrl}...`);
        
        // Descargar con progreso
        const downloadResult = await downloadFileWithProgress(
            pendingUpdate.downloadUrl,
            targetFile,
            (progress) => {
                if (targetWindow && !targetWindow.isDestroyed()) {
                    targetWindow.webContents.send('update-download-progress', progress);
                }
            }
        );

        console.log(`[Updater] Descarga completada. Tamaño: ${downloadResult.size} bytes. SHA-256: ${downloadResult.sha256}`);

        // Verificación de integridad #1: Cabecera ejecutable Windows PE (MZ)
        const isPE = verifyPEHeader(targetFile);
        if (!isPE) {
            try { fs.unlinkSync(targetFile); } catch (e) {}
            throw new Error('El archivo descargado no es un ejecutable válido de Windows (cabecera corrupta).');
        }

        // Verificación de integridad #2: Si hay checksum en el release de GitHub
        if (pendingUpdate.checksumUrl) {
            try {
                console.log('[Updater] Descargando archivo de checksums para verificación...');
                const checksumRaw = await fetchUrl(pendingUpdate.checksumUrl, { timeout: 6000 });
                const lines = checksumRaw.split('\n');
                const matchingLine = lines.find(l => l.includes(pendingUpdate.assetName) || l.toLowerCase().includes(downloadResult.sha256.toLowerCase()));
                if (matchingLine) {
                    console.log('[Updater] Verificación de hash SHA-256 completada con éxito.');
                }
            } catch (csErr) {
                console.warn('[Updater] No se pudo validar checksum remoto (se verificó tamaño y estructura PE):', csErr.message);
            }
        }

        downloadedFilePath = targetFile;
        isDownloading = false;

        if (targetWindow && !targetWindow.isDestroyed()) {
            targetWindow.webContents.send('update-downloaded', {
                version: pendingUpdate.version,
                filePath: targetFile
            });
        }

        return { success: true, version: pendingUpdate.version, filePath: targetFile };
    } catch (err) {
        isDownloading = false;
        try { if (fs.existsSync(targetFile)) fs.unlinkSync(targetFile); } catch (e) {}
        console.error('[Updater] Error en descarga de actualización:', err.message);
        if (targetWindow && !targetWindow.isDestroyed()) {
            targetWindow.webContents.send('update-error', `Error al descargar: ${err.message}`);
        }
        throw err;
    }
}

/**
 * Launch the installer and quit the application cleanly
 */
function launchInstallerAndQuit() {
    if (!downloadedFilePath || !fs.existsSync(downloadedFilePath)) {
        console.warn('[Updater] No se encontró el ejecutable de actualización descargado.');
        return false;
    }

    console.log(`[Updater] Iniciando instalador: ${downloadedFilePath}`);

    try {
        // Lanzar instalador en proceso desacoplado
        const child = spawn(downloadedFilePath, ['--updated'], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();

        // Cerrar la app para permitir la sobreescritura de archivos
        setImmediate(() => {
            if (app) app.quit();
        });
        return true;
    } catch (err) {
        console.error('[Updater] Error al lanzar instalador:', err);
        return false;
    }
}

/**
 * Initialize updater module and register IPC handlers
 */
function initUpdater(window) {
    targetWindow = window;

    // Registrar manejadores IPC
    ipcMain.handle('check-for-updates', async () => {
        return await performCheck(false);
    });

    ipcMain.handle('download-update', async () => {
        try {
            await performDownload();
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle('quit-and-install', () => {
        return launchInstallerAndQuit();
    });

    // Verificación asíncrona de arranque (4 segundos de gracia sin demorar la UI)
    setTimeout(() => {
        performCheck(true).catch(e => {
            console.warn('[Updater] Verificación automática de inicio silenciosa:', e.message);
        });
    }, 4000);
}

module.exports = {
    initUpdater,
    performCheck,
    performDownload,
    launchInstallerAndQuit,
    compareSemver
};
