#!/usr/bin/env node
/**
 * scripts/publish_release.js
 * 
 * Controlled Release Publisher for PrintStudio Pro.
 * Ensures that ONLY explicitly approved releases trigger the GitHub Actions
 * release workflow via semantic git tags (e.g. v1.0.4).
 * 
 * Usage:
 *   node scripts/publish_release.js                 (Interactive mode)
 *   node scripts/publish_release.js patch           (Increment patch: 1.0.3 -> 1.0.4)
 *   node scripts/publish_release.js minor           (Increment minor: 1.0.3 -> 1.1.0)
 *   node scripts/publish_release.js 1.0.5           (Explicit version)
 *   node scripts/publish_release.js --dry-run       (Simulate without changes)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_PATH = path.join(ROOT_DIR, 'package.json');
const PACKAGE_LOCK_PATH = path.join(ROOT_DIR, 'package-lock.json');
const VERSION_JSON_PATH = path.join(ROOT_DIR, 'version.json');

function runCmd(cmd, options = {}) {
    return execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf8', stdio: options.silent ? 'pipe' : 'inherit' });
}

function runCmdOutput(cmd) {
    try {
        return execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
    } catch (e) {
        return '';
    }
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.trim());
    }));
}

function parseSemver(v) {
    const clean = v.replace(/^v/i, '').trim();
    const parts = clean.split('.').map(n => parseInt(n, 10) || 0);
    return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0,
        toString: () => `${parts[0] || 0}.${parts[1] || 0}.${parts[2] || 0}`
    };
}

function bumpVersion(current, type) {
    const parsed = parseSemver(current);
    if (type === 'major') {
        return `${parsed.major + 1}.0.0`;
    } else if (type === 'minor') {
        return `${parsed.major}.${parsed.minor + 1}.0`;
    } else if (type === 'patch') {
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    }
    // Si pasaron una versión explícita (ej. "1.0.5")
    if (/^\d+\.\d+\.\d+$/.test(type.replace(/^v/i, ''))) {
        return type.replace(/^v/i, '');
    }
    throw new Error(`Tipo de versión desconocido: ${type}`);
}

async function main() {
    console.log('\n========================================================================');
    console.log('  🚀 PRINTSTUDIO PRO — CONTROLLED GITHUB RELEASE PUBLISHER');
    console.log('========================================================================\n');

    // 1. Leer versión actual
    if (!fs.existsSync(PACKAGE_PATH)) {
        console.error('❌ Error: No se encontró package.json en el directorio raíz.');
        process.exit(1);
    }

    const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
    const currentVersion = pkg.version || '1.0.0';
    console.log(`📌 Versión actual del proyecto: v${currentVersion}`);

    // Parsear argumentos CLI
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const autoConfirm = args.includes('--yes') || args.includes('-y');
    let releaseNotesArg = '';
    const notesIdx = args.indexOf('--notes');
    if (notesIdx !== -1 && args[notesIdx + 1]) {
        releaseNotesArg = args[notesIdx + 1];
    }

    let bumpArg = args.find(a => !a.startsWith('--') && a !== 'patch' && a !== 'minor' && a !== 'major' ? /^\d+\.\d+\.\d+$/.test(a.replace(/^v/i, '')) : ['patch', 'minor', 'major'].includes(a));

    // 2. Determinar la nueva versión
    let targetVersion = '';
    if (bumpArg) {
        targetVersion = bumpVersion(currentVersion, bumpArg);
    } else {
        console.log('\nSelecciona el incremento de versión:');
        console.log(`  [1] Patch : ${bumpVersion(currentVersion, 'patch')} (Correcciones y mejoras menores)`);
        console.log(`  [2] Minor : ${bumpVersion(currentVersion, 'minor')} (Nuevas funciones compatibles)`);
        console.log(`  [3] Major : ${bumpVersion(currentVersion, 'major')} (Cambios mayores o incompatibles)`);
        console.log(`  [4] Manual: Especificar versión personalizada`);

        const choice = await askQuestion('\nIngresa una opción (1-4) [default: 1]: ') || '1';
        if (choice === '1') targetVersion = bumpVersion(currentVersion, 'patch');
        else if (choice === '2') targetVersion = bumpVersion(currentVersion, 'minor');
        else if (choice === '3') targetVersion = bumpVersion(currentVersion, 'major');
        else if (choice === '4') {
            const manual = await askQuestion('Ingresa la versión exacta (ej. 1.0.4): ');
            if (!/^\d+\.\d+\.\d+$/.test(manual.replace(/^v/i, ''))) {
                console.error('❌ Formato de versión inválido. Debe ser X.Y.Z');
                process.exit(1);
            }
            targetVersion = manual.replace(/^v/i, '');
        } else {
            targetVersion = bumpVersion(currentVersion, 'patch');
        }
    }

    const tagName = `v${targetVersion}`;

    // 3. Notas del lanzamiento (Changelog)
    let releaseNotes = releaseNotesArg;
    if (!releaseNotes) {
        // Obtener commits recientes como sugerencia
        const lastTag = runCmdOutput('git describe --tags --abbrev=0 2>nul') || '';
        let recentCommits = '';
        if (lastTag) {
            recentCommits = runCmdOutput(`git log ${lastTag}..HEAD --oneline 2>nul`);
        } else {
            recentCommits = runCmdOutput('git log -n 5 --oneline 2>nul');
        }

        console.log('\nNotas de la versión (changelog):');
        if (recentCommits) {
            console.log('Commits recientes detectados:\n' + recentCommits.split('\n').map(l => '  • ' + l).join('\n'));
        }
        releaseNotes = await askQuestion(`\nDescribe brevemente las novedades de la v${targetVersion}: `);
        if (!releaseNotes) {
            releaseNotes = `Actualización y mejoras en PrintStudio Pro v${targetVersion}`;
        }
    }

    // 4. Verificación de estado Git
    const gitStatus = runCmdOutput('git status --porcelain');
    const currentBranch = runCmdOutput('git rev-parse --abbrev-ref HEAD') || 'main';
    const remoteUrl = runCmdOutput('git remote get-url origin') || 'origin';

    // 5. Resumen de aprobación
    console.log('\n========================================================================');
    console.log('                  RESUMEN DE PUBLICACIÓN DE RELEASE');
    console.log('========================================================================');
    console.log(`  Versión Anterior:     ${currentVersion}`);
    console.log(`  Nueva Versión:        ${targetVersion}`);
    console.log(`  Tag Git a crear:      ${tagName}`);
    console.log(`  Rama Git destino:     ${currentBranch}`);
    console.log(`  Remoto GitHub:        ${remoteUrl}`);
    console.log(`  Notas del Release:    ${releaseNotes}`);
    console.log(`  Disparador CI/CD:     GitHub Actions (.github/workflows/release.yml)`);
    console.log(`  Modo Simulación:      ${isDryRun ? 'ACTIVADO (--dry-run)' : 'DESACTIVADO (Real)'}`);
    console.log('========================================================================');

    if (gitStatus) {
        console.log('\n⚠️  Hay cambios locales sin commitear en el repositorio:');
        console.log(gitStatus.split('\n').slice(0, 10).map(s => '   ' + s).join('\n'));
    }

    if (isDryRun) {
        console.log('\n🔍 [DRY-RUN] Simulación completa. No se modificó ningún archivo ni se ejecutó git push.');
        process.exit(0);
    }

    // 6. Confirmación explícita del desarrollador
    if (!autoConfirm) {
        const confirm = await askQuestion('\n⚠️  ¿Autorizas crear el tag y hacer push a GitHub para iniciar la compilación? (s/n): ');
        if (!['s', 'si', 'y', 'yes'].includes(confirm.toLowerCase())) {
            console.log('\n❌ Publicación CANCELADA por el desarrollador. No se realizaron cambios ni envíos a GitHub.\n');
            process.exit(0);
        }
    }

    console.log('\n🚀 Procediendo con el lanzamiento autorizado...');

    // 7. Actualizar package.json
    pkg.version = targetVersion;
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`  ✔ Actualizado package.json a ${targetVersion}`);

    // Actualizar package-lock.json si existe
    if (fs.existsSync(PACKAGE_LOCK_PATH)) {
        try {
            const pkgLock = JSON.parse(fs.readFileSync(PACKAGE_LOCK_PATH, 'utf8'));
            pkgLock.version = targetVersion;
            if (pkgLock.packages && pkgLock.packages['']) {
                pkgLock.packages[''].version = targetVersion;
            }
            fs.writeFileSync(PACKAGE_LOCK_PATH, JSON.stringify(pkgLock, null, 2) + '\n', 'utf8');
            console.log(`  ✔ Actualizado package-lock.json a ${targetVersion}`);
        } catch (e) {
            console.warn('  ⚠ No se pudo actualizar package-lock.json automáticamente:', e.message);
        }
    }

    // Actualizar version.json si existe
    if (fs.existsSync(VERSION_JSON_PATH)) {
        try {
            const vJson = JSON.parse(fs.readFileSync(VERSION_JSON_PATH, 'utf8'));
            vJson.version = targetVersion;
            vJson.releaseDate = new Date().toISOString().split('T')[0];
            fs.writeFileSync(VERSION_JSON_PATH, JSON.stringify(vJson, null, 2) + '\n', 'utf8');
            console.log(`  ✔ Actualizado version.json a ${targetVersion}`);
        } catch (e) {
            console.warn('  ⚠ No se pudo actualizar version.json:', e.message);
        }
    }

    // 8. Git Commit, Tag y Push
    try {
        console.log('\n📦 Registrando versión en Git...');
        runCmd('git add package.json package-lock.json version.json 2>nul || git add package.json');
        
        // Verificar si hay algo que commitear
        const staged = runCmdOutput('git diff --staged --name-only');
        if (staged) {
            runCmd(`git commit -m "chore(release): ${tagName}"`);
            console.log(`  ✔ Commit de versión creado: "chore(release): ${tagName}"`);
        }

        // Crear tag anotado
        console.log(`🏷️ Creando tag anotado ${tagName}...`);
        runCmd(`git tag -a ${tagName} -m "Release ${tagName}: ${releaseNotes.replace(/"/g, '\\"')}"`);
        console.log(`  ✔ Tag ${tagName} creado`);

        // Push a GitHub
        console.log(`\n📤 Enviando commit y tag a GitHub (${remoteUrl})...`);
        runCmd(`git push origin ${currentBranch}`);
        runCmd(`git push origin ${tagName}`);

        console.log('\n========================================================================');
        console.log(`  ✨ ¡Lanzamiento de ${tagName} iniciado exitosamente!`);
        console.log('========================================================================');
        console.log(`  • Tag publicado:        ${tagName}`);
        console.log(`  • GitHub Actions:       https://github.com/Yahel-Bot/PrintStudio-Pro/actions`);
        console.log(`  • GitHub Releases:      https://github.com/Yahel-Bot/PrintStudio-Pro/releases`);
        console.log('========================================================================\n');
    } catch (err) {
        console.error('\n❌ Error durante las operaciones de Git:', err.message);
        console.log('Revisa la conexión de red o las credenciales de GitHub con: git push');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
