const { exec } = require('child_process');

/**
 * Gestor de Zona con cobertura inalámbrica móvil (Windows Mobile Hotspot)
 * Utiliza WinRT (Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager)
 * para consultar el estado, SSID, contraseña y clientes conectados, así como
 * para encender o apagar la zona móvil sin requerir software adicional ni router Wi-Fi.
 */

// Script de PowerShell para consultar el estado del Hotspot
const GET_HOTSPOT_PS = `
$ErrorActionPreference = 'Stop'
[Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime] | Out-Null
[Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime] | Out-Null
$icp = [Windows.Networking.Connectivity.NetworkInformation]::GetInternetConnectionProfile()
if (-not $icp) {
    # Buscar cualquier perfil de conexión válido
    $profiles = [Windows.Networking.Connectivity.NetworkInformation]::GetConnectionProfiles()
    if ($profiles.Count -gt 0) { $icp = $profiles[0] }
}

if ($icp) {
    try {
        $tm = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager]::CreateFromConnectionProfile($icp)
        $cfg = $tm.GetCurrentAccessPointConfiguration()
        $res = @{
            supported = $true
            state = $tm.TetheringOperationalState.ToString()
            ssid = $cfg.Ssid
            password = $cfg.Passphrase
            clients = $tm.ClientCount
            ip = "192.168.137.1"
        }
        Write-Output ($res | ConvertTo-Json -Compress)
    } catch {
        Write-Output ("{\`"supported\`":false,\`"error\`":\`"" + $_.Exception.Message.Replace('\`"', '') + "\`"}")
    }
} else {
    Write-Output '{"supported":false,"error":"No connection profile available"}'
}
`.trim();

// Script de PowerShell para encender o apagar el Hotspot
function getSetHotspotPs(enable) {
    const action = enable ? '$tm.StartTetheringAsync()' : '$tm.StopTetheringAsync()';
    return `
$ErrorActionPreference = 'Stop'
[Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime] | Out-Null
[Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime] | Out-Null
$icp = [Windows.Networking.Connectivity.NetworkInformation]::GetInternetConnectionProfile()
if (-not $icp) {
    $profiles = [Windows.Networking.Connectivity.NetworkInformation]::GetConnectionProfiles()
    if ($profiles.Count -gt 0) { $icp = $profiles[0] }
}

if ($icp) {
    try {
        $tm = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager]::CreateFromConnectionProfile($icp)
        $null = ${action}
        Start-Sleep -Milliseconds 1000
        $cfg = $tm.GetCurrentAccessPointConfiguration()
        $res = @{
            supported = $true
            state = $tm.TetheringOperationalState.ToString()
            ssid = $cfg.Ssid
            password = $cfg.Passphrase
            clients = $tm.ClientCount
            ip = "192.168.137.1"
        }
        Write-Output ($res | ConvertTo-Json -Compress)
    } catch {
        Write-Output ("{\`"supported\`":false,\`"error\`":\`"" + $_.Exception.Message.Replace('\`"', '') + "\`"}")
    }
} else {
    Write-Output '{"supported":false,"error":"No connection profile available"}'
}
`.trim();
}

function getHotspotInfo() {
    return new Promise((resolve) => {
        const encodedCommand = Buffer.from(GET_HOTSPOT_PS, 'utf16le').toString('base64');
        exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`, { timeout: 15000 }, (error, stdout, stderr) => {
            if (error) {
                console.warn('Error al consultar Hotspot:', error.message);
                return resolve({ supported: false, state: 'Off', error: error.message });
            }
            try {
                const match = stdout.trim().match(/\{[\s\S]*\}/);
                if (match) {
                    const data = JSON.parse(match[0]);
                    return resolve(data);
                }
            } catch (e) {
                console.warn('Error al parsear salida de Hotspot:', e);
            }
            resolve({ supported: false, state: 'Off', error: stdout });
        });
    });
}

function setHotspotState(enable) {
    return new Promise((resolve) => {
        const script = getSetHotspotPs(Boolean(enable));
        const encodedCommand = Buffer.from(script, 'utf16le').toString('base64');
        exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`, { timeout: 20000 }, (error, stdout, stderr) => {
            if (error) {
                console.warn(`Error al ${enable ? 'activar' : 'desactivar'} Hotspot:`, error.message);
                return resolve({ success: false, error: error.message });
            }
            try {
                const match = stdout.trim().match(/\{[\s\S]*\}/);
                if (match) {
                    const data = JSON.parse(match[0]);
                    return resolve({ success: true, ...data });
                }
            } catch (e) {
                console.warn('Error al parsear salida al cambiar estado de Hotspot:', e);
            }
            resolve({ success: false, error: stdout });
        });
    });
}

module.exports = {
    getHotspotInfo,
    setHotspotState
};
