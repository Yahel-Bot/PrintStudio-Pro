const sharp = require('sharp');

class AnalizadorColor {
    /**
     * Analiza una imagen para determinar cobertura de tinta y si es color.
     * @param {string|Buffer} imagePath 
     */
    async analizar(imagePath) {
        const image = sharp(imagePath);
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        let totalPixels = info.width * info.height;
        let inkCoverage = 0;
        let colorCoverage = 0;
        let highDensityBlackCoverage = 0;

        // Iterar sobre los pixeles (RGBA o RGB)
        const channels = info.channels;
        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = channels >= 4 ? data[i + 3] / 255 : 1;
            const compositeR = r * alpha + 255 * (1 - alpha);
            const compositeG = g * alpha + 255 * (1 - alpha);
            const compositeB = b * alpha + 255 * (1 - alpha);

            // Ignorar pixeles casi blancos (fondo)
            const darkness = 1 - (compositeR + compositeG + compositeB) / (255 * 3);
            if (darkness <= 0.04) continue;

            inkCoverage += darkness;

            // Detectar si es color (diferencia significativa entre canales)
            const max = Math.max(compositeR, compositeG, compositeB);
            const min = Math.min(compositeR, compositeG, compositeB);
            const diff = max - min;

            if (diff > 20) { // Umbral de saturación para considerar "color"
                colorCoverage += darkness;
            } else {
                // Es gris/negro. Ver densidad.
                if (max < 100) { // Negro oscuro
                    highDensityBlackCoverage += darkness;
                }
            }
        }

        if (inkCoverage === 0) {
            return {
                cobertura: 0,
                esColor: false,
                pctColor: 0,
                esAltaDensidadBN: false
            };
        }

        const cobertura = (inkCoverage / totalPixels) * 100;
        const pctColor = (colorCoverage / inkCoverage) * 100 || 0;
        const esColor = pctColor > 2; // Más del 2% de los pixeles no blancos son color

        return {
            cobertura: parseFloat(cobertura.toFixed(2)),
            esColor: esColor,
            pctColor: parseFloat(pctColor.toFixed(2)),
            esAltaDensidadBN: !esColor && (cobertura > 40 || (highDensityBlackCoverage / inkCoverage) > 0.6)
        };
    }

    calcularCosto(analisis, config) {
        // config: { modo: 'tinta' | 'laser', precios: { colorMin: 2, colorMax: 9, bn: 1, bnAlta: 2 } }
        let costo = 0;

        if (analisis.esColor) {
            const min = config.modo === 'laser' ? config.laserMin : config.colorMin;
            const max = config.modo === 'laser' ? config.laserMax : config.colorMax;
            
            // Mapeo lineal de cobertura (0-100%) al rango de precio
            // Ajustamos: cobertura de 0% a 80% (típicamente una hoja llena no es 100% tinta)
            const factor = Math.min(analisis.cobertura / 80, 1);
            costo = min + (max - min) * factor;
        } else {
            costo = analisis.esAltaDensidadBN ? config.bnAlta : config.bn;
        }

        return parseFloat(costo.toFixed(2));
    }
}

module.exports = AnalizadorColor;
