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
    selectFiles: () => ipcRenderer.invoke('select-files'),
    convertOffice: (filePath) => ipcRenderer.invoke('convert-office', filePath),
    printTicket: (saleData, printerName) => ipcRenderer.invoke('print-ticket', saleData, printerName),
    printDocument: (jobData) => ipcRenderer.invoke('print-document', jobData),
    getLearningModel: () => ipcRenderer.invoke('get-learning-model'),
    savePriceCorrection: (correctionData) => ipcRenderer.invoke('save-price-correction', correctionData),
    resetLearningModel: () => ipcRenderer.invoke('reset-learning-model'),
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
    onFileReceived: (callback) => ipcRenderer.on('file-received', (event, filePath) => callback(filePath)),
    // Tunnel URL emitter from main (when localtunnel becomes available)
    onTunnelUrl: (callback) => ipcRenderer.on('tunnel-url', (event, url) => callback(url)),
    onTunnelInfo: (callback) => ipcRenderer.on('tunnel-info', (event, info) => callback(info))
});
