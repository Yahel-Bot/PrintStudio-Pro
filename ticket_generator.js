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


async function generateDailyCutTicketHTML(corteData) {
    const { resumen, ventas } = corteData || {};
    const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
    
    let itemsHTML = '';
    if (Array.isArray(ventas) && ventas.length > 0) {
        for (const v of ventas.slice(0, 60)) {
            const hora = v.fecha ? new Date(v.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
            const nombre = String(v.archivo || 'Trabajo').substring(0, 16);
            itemsHTML += `
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                    <span>#${v.id} ${hora} ${nombre}</span>
                    <span>${Number(v.total || 0).toFixed(2)}</span>
                </div>
            `;
        }
    } else {
        itemsHTML = '<p style="font-size: 11px; text-align: center; color: #555;">Sin movimientos registrados hoy.</p>';
    }

    return `
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: monospace; width: 300px; padding: 10px; color: #000; }
                .center { text-align: center; }
                .line { border-bottom: 1px dashed black; margin: 8px 0; }
                .total { font-size: 1.15em; font-weight: bold; }
                .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="center">
                <h2>CORTE DE CAJA</h2>
                <p>PrintStudio Pro</p>
                <p>${fecha}</p>
            </div>
            <div class="line"></div>
            <div class="row">
                <span>Ventas Registradas:</span>
                <strong>${resumen?.num_ventas || 0}</strong>
            </div>
            <div class="row">
                <span>Subtotal Tinta/Hojas:</span>
                <span>${Number(resumen?.total_tinta || 0).toFixed(2)}</span>
            </div>
            <div class="row total">
                <span>TOTAL EN CAJA:</span>
                <span>${Number(resumen?.total_general || 0).toFixed(2)}</span>
            </div>
            <div class="line"></div>
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 6px;">DESGLOSE DE MOVIMIENTOS:</div>
            ${itemsHTML}
            <div class="line"></div>
            <div class="center" style="font-size: 10px;">
                <p>--- FIN DE REPORTE DIARIO ---</p>
            </div>
        </body>
        </html>
    `;
}

module.exports = generateTicketHTML;
module.exports.generateTicketHTML = generateTicketHTML;
module.exports.generateDailyCutTicketHTML = generateDailyCutTicketHTML;

