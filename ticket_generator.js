const qrcode = require('qrcode');

async function generateTicketHTML(saleData, ticketUrl) {
    let finalUrl = ticketUrl || saleData?.ticketUrl;
    if (!finalUrl) {
        const ip = saleData?.serverIp || '192.168.137.1';
        const a = encodeURIComponent(saleData?.archivo || 'Trabajo');
        finalUrl = `http://${ip}:3500/ticket/${saleData?.id || ''}?a=${a}&p=${saleData?.paginas || 1}&c=${saleData?.copias || 1}&t=${saleData?.total || 0}&ti=${saleData?.costo_tinta || 0}&f=${saleData?.costo_fijo || 0}`;
    }

    const qrTicket = await qrcode.toDataURL(finalUrl);

    return `
        <html>
        <head>
            <style>
                body { font-family: monospace; width: 300px; padding: 10px; color: #000; }
                .center { text-align: center; }
                .line { border-bottom: 1px dashed black; margin: 10px 0; }
                .total { font-size: 1.2em; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="center">
                <h2>TICKET DE COMPRA</h2>
                <p>YARS Smart Printer</p>
                <p>${new Date().toLocaleString()}</p>
            </div>
            <div class="line"></div>
            <div>
                <p>Archivo: ${saleData.archivo}</p>
                <p>Páginas: ${saleData.paginas}</p>
                <p>Copias: ${saleData.copias}</p>
            </div>
            <div class="line"></div>
            <div>
                <p>Subtotal Tinta: $${Number(saleData.costo_tinta || 0).toFixed(2)}</p>
                <p>Cargo Servicio: $${Number(saleData.costo_fijo || 0).toFixed(2)}</p>
                <p class="total">TOTAL: $${Number(saleData.total || 0).toFixed(2)}</p>
            </div>
            <div class="line"></div>
            <div class="center">
                <p style="font-weight: bold; margin-bottom: 2px;">Copia Digital de tu Ticket</p>
                <p style="font-size: 0.85em; color: #555;">(Escanea con tu teléfono)</p>
                <img src="${qrTicket}" style="width: 140px; margin: 6px 0;">
                <p>¡Gracias por su preferencia!</p>
            </div>
        </body>
        </html>
    `;
}

module.exports = generateTicketHTML;
