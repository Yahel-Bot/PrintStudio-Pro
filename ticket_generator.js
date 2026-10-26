const qrcode = require('qrcode');

async function generateTicketHTML(saleData) {
    const qrTicket = await qrcode.toDataURL(JSON.stringify({
        id: saleData.id,
        total: saleData.total,
        date: new Date().toLocaleString()
    }));

    return `
        <html>
        <head>
            <style>
                body { font-family: monospace; width: 300px; padding: 10px; }
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
                <p>Subtotal Tinta: $${saleData.costo_tinta.toFixed(2)}</p>
                <p>Cargo Servicio: $${saleData.costo_fijo.toFixed(2)}</p>
                <p class="total">TOTAL: $${saleData.total.toFixed(2)}</p>
            </div>
            <div class="line"></div>
            <div class="center">
                <p>Escanea para ver detalles</p>
                <img src="${qrTicket}" style="width: 150px;">
                <p>¡Gracias por su preferencia!</p>
            </div>
        </body>
        </html>
    `;
}

module.exports = generateTicketHTML;
