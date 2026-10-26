const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class GestorDB {
    constructor(userDataPath) {
        const dbDir = path.join(userDataPath, 'data');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        this.db = new Database(path.join(dbDir, 'yars_pro.db'));
        this._init();
    }

    _init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ventas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                archivo TEXT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                paginas INTEGER,
                copias INTEGER,
                costo_tinta REAL,
                costo_fijo REAL,
                total REAL,
                tipo_impresion TEXT, -- Tinta, Laser, BN
                detalles TEXT -- JSON con desglose por página
            );

            CREATE TABLE IF NOT EXISTS correcciones_precios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                archivo TEXT,
                total_paginas INTEGER,
                total_copias INTEGER,
                copias_bn INTEGER,
                copias_color INTEGER,
                cobertura_promedio REAL,
                precio_calculado REAL,
                precio_corregido REAL,
                diferencia REAL,
                ratio REAL,
                detalles TEXT
            );

            CREATE TABLE IF NOT EXISTS modelo_aprendizaje (
                clave TEXT PRIMARY KEY,
                valor REAL,
                actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Valores por defecto para el modelo de aprendizaje (Escalas solicitadas por el usuario)
        const defaults = {
            tier1_rate: 1.00, // 1 a 50 copias B/N: $1.00
            tier2_rate: 0.80, // 51 a 100 copias B/N: $0.80
            tier3_rate: 0.50, // 101 a 200 copias B/N: $0.50
            tier4_rate: 0.40, // 201+ copias B/N: $0.40
            color_rate: 3.00,
            color_high_rate: 5.00,
            cost_bw_high: 2.00,
            cost_base: 0.00,
            tuning_factor: 1.00,
            total_corrections: 0
        };

        const checkStmt = this.db.prepare('SELECT COUNT(*) as count FROM modelo_aprendizaje');
        if (checkStmt.get().count === 0) {
            const insertStmt = this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)');
            for (const [k, v] of Object.entries(defaults)) {
                insertStmt.run(k, v);
            }
        }
    }

    registrarVenta(datos) {
        const stmt = this.db.prepare(`
            INSERT INTO ventas (archivo, paginas, copias, costo_tinta, costo_fijo, total, tipo_impresion, detalles)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            datos.archivo || 'Sin archivo',
            datos.paginas || 1,
            datos.copias || 1,
            datos.costo_tinta || 0,
            datos.costo_fijo || 0,
            datos.total || 0,
            datos.tipo_impresion || 'Estándar',
            JSON.stringify(datos.detalles || [])
        );
    }

    obtenerCorteDiario() {
        const rows = this.db.prepare(`
            SELECT 
                SUM(costo_tinta) as total_tinta,
                SUM(total) as total_general,
                COUNT(*) as num_ventas
            FROM ventas 
            WHERE date(fecha, 'localtime') = date('now', 'localtime')
        `).get();
        return rows || { total_tinta: 0, total_general: 0, num_ventas: 0 };
    }

    obtenerDetalleVentasHoy() {
        return this.db.prepare(`
            SELECT id, archivo, fecha, paginas, copias, costo_tinta, costo_fijo, total, tipo_impresion, detalles
            FROM ventas
            WHERE date(fecha, 'localtime') = date('now', 'localtime')
            ORDER BY fecha DESC
        `).all();
    }

    obtenerModeloAprendizaje() {
        const rows = this.db.prepare('SELECT clave, valor FROM modelo_aprendizaje').all();
        const model = {};
        for (const row of rows) {
            model[row.clave] = row.valor;
        }
        return model;
    }

    guardarCorreccion(datos) {
        const precioCalculado = Math.max(0.01, parseFloat(datos.precio_calculado) || 0);
        const precioCorregido = Math.max(0, parseFloat(datos.precio_corregido) || 0);
        const diferencia = precioCorregido - precioCalculado;
        const ratio = precioCalculado > 0 ? (precioCorregido / precioCalculado) : 1;
        const copiasBn = parseInt(datos.copias_bn) || 0;
        const copiasColor = parseInt(datos.copias_color) || 0;
        const baseFee = parseFloat(datos.costo_fijo) || 0;

        // 1. Registrar corrección histórica
        const insertHist = this.db.prepare(`
            INSERT INTO correcciones_precios (
                archivo, total_paginas, total_copias, copias_bn, copias_color,
                cobertura_promedio, precio_calculado, precio_corregido, diferencia, ratio, detalles
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertHist.run(
            datos.archivo || 'Corrección manual',
            datos.total_paginas || 1,
            datos.total_copias || 1,
            copiasBn,
            copiasColor,
            datos.cobertura_promedio || 0,
            precioCalculado,
            precioCorregido,
            diferencia,
            ratio,
            JSON.stringify(datos.detalles || {})
        );

        // 2. Motor de aprendizaje adaptativo (Actualización Bayesiana / Suavizado Exponencial)
        const currentModel = this.obtenerModeloAprendizaje();
        const alpha = 0.18; // Suavizado conservador: evita que una corrección aislada distorsione las tarifas.
        let correctionDetails = {};
        try {
            correctionDetails = typeof datos.detalles === 'string' ? JSON.parse(datos.detalles) : (datos.detalles || {});
        } catch (e) {}
        const baseBwRate = Math.max(0.05, parseFloat(correctionDetails.costBW) || 1);
        const baseColorRate = Math.max(0.05, parseFloat(correctionDetails.costColor) || 3);

        const updateKey = (key, newVal) => {
            const rounded = Math.round(newVal * 100) / 100;
            this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)').run(key, rounded);
            currentModel[key] = rounded;
        };

        // Caso A: Solo copias en Blanco y Negro
        if (copiasBn > 0 && copiasColor === 0) {
            const observedUnitRate = Math.min(4, Math.max(0.05, ((precioCorregido - baseFee) / copiasBn) / baseBwRate));
            if (copiasBn <= 50) {
                const current = currentModel.tier1_rate ?? 1.00;
                updateKey('tier1_rate', (1 - alpha) * current + alpha * observedUnitRate);
            } else if (copiasBn <= 100) {
                const current = currentModel.tier2_rate ?? 0.80;
                updateKey('tier2_rate', (1 - alpha) * current + alpha * observedUnitRate);
            } else if (copiasBn <= 200) {
                const current = currentModel.tier3_rate ?? 0.50;
                updateKey('tier3_rate', (1 - alpha) * current + alpha * observedUnitRate);
            } else {
                const current = currentModel.tier4_rate ?? 0.40;
                updateKey('tier4_rate', (1 - alpha) * current + alpha * observedUnitRate);
            }
        }
        // Caso B: Solo Color
        else if (copiasColor > 0 && copiasBn === 0) {
            const observedColorRate = Math.min(4, Math.max(0.05, ((precioCorregido - baseFee) / copiasColor) / baseColorRate));
            const current = currentModel.color_rate ?? 3.00;
            updateKey('color_rate', (1 - alpha) * current + alpha * observedColorRate);
        }
        // Caso C: Mixto (B/N y Color)
        else if (copiasBn > 0 || copiasColor > 0) {
            const currentTuning = currentModel.tuning_factor ?? 1.00;
            const targetTuning = Math.max(0.5, Math.min(2.0, currentTuning * ratio));
            updateKey('tuning_factor', (1 - alpha) * currentTuning + alpha * targetTuning);
        }

        // Incrementar contador de correcciones aprendidas
        const totalCorr = (currentModel.total_corrections || 0) + 1;
        updateKey('total_corrections', totalCorr);

        return {
            success: true,
            model: currentModel,
            diferencia,
            ratio
        };
    }

    restablecerAprendizaje() {
        const defaults = {
            tier1_rate: 1.00,
            tier2_rate: 0.80,
            tier3_rate: 0.50,
            tier4_rate: 0.40,
            color_rate: 3.00,
            color_high_rate: 5.00,
            cost_bw_high: 2.00,
            cost_base: 0.00,
            tuning_factor: 1.00,
            total_corrections: 0
        };

        const insertStmt = this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)');
        for (const [k, v] of Object.entries(defaults)) {
            insertStmt.run(k, v);
        }
        return defaults;
    }
}

module.exports = GestorDB;
