const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getIP: () => ipcRenderer.invoke('get-ip'),
    getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),
    getHotspotInfo: () => ipcRenderer.invoke('get-hotspot-info'),
    toggleHotspot: (enable) => ipcRenderer.invoke('toggle-hotspot', enable),
    getUploadPath: () => ipcRenderer.invoke('get-upload-path'),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    generateQR: (text) => ipcRenderer.invoke('generate-qr', text),
    analyzeImage: (filePath) => ipcRenderer.invoke('analyze-image', filePath),
    saveSale: (saleData) => ipcRenderer.invoke('save-sale', saleData),
    getCorte: () => ipcRenderer.invoke('get-corte'),
    printCorteTicket: (printerName) => ipcRenderer.invoke('print-corte-ticket', printerName),
    exportCorteCSV: () => ipcRenderer.invoke('export-corte-csv'),
    selectFiles: () => ipcRenderer.invoke('select-files'),
    convertOffice: (filePath) => ipcRenderer.invoke('convert-office', filePath),
    printTicket: (saleData, printerName) => ipcRenderer.invoke('print-ticket', saleData, printerName),
    printDocument: (jobData) => ipcRenderer.invoke('print-document', jobData),
    getLearningModel: () => ipcRenderer.invoke('get-learning-model'),
    savePriceCorrection: (correctionData) => ipcRenderer.invoke('save-price-correction', correctionData),
    resetLearningModel: () => ipcRenderer.invoke('reset-learning-model'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getPathForFile: (file) => {
        try {
            if (webUtils && typeof webUtils.getPathForFile === 'function') {
                return webUtils.getPathForFile(file);
            }
        } catch (e) {
            console.warn('webUtils.getPathForFile error:', e);
        }
        return file.path || '';
    },
    onFileReceived: (callback) => {
        const handler = (event, filePath) => callback(filePath);
        ipcRenderer.on('file-received', handler);
        return () => ipcRenderer.removeListener('file-received', handler);
    },
    // Tunnel URL emitter from main (when localtunnel becomes available)
    onTunnelUrl: (callback) => {
        const handler = (event, url) => callback(url);
        ipcRenderer.on('tunnel-url', handler);
        return () => ipcRenderer.removeListener('tunnel-url', handler);
    },
    onTunnelInfo: (callback) => {
        const handler = (event, info) => callback(info);
        ipcRenderer.on('tunnel-info', handler);
        return () => ipcRenderer.removeListener('tunnel-info', handler);
    },
    // Sistema de Actualizaciones Automáticas
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    onUpdateAvailable: (callback) => {
        const handler = (event, info) => callback(info);
        ipcRenderer.on('update-available', handler);
        return () => ipcRenderer.removeListener('update-available', handler);
    },
    onUpdateProgress: (callback) => {
        const handler = (event, progress) => callback(progress);
        ipcRenderer.on('update-download-progress', handler);
        return () => ipcRenderer.removeListener('update-download-progress', handler);
    },
    onUpdateDownloaded: (callback) => {
        const handler = (event, info) => callback(info);
        ipcRenderer.on('update-downloaded', handler);
        return () => ipcRenderer.removeListener('update-downloaded', handler);
    },
    onUpdateError: (callback) => {
        const handler = (event, err) => callback(err);
        ipcRenderer.on('update-error', handler);
        return () => ipcRenderer.removeListener('update-error', handler);
    }
});
