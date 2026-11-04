const { exec } = require('child_process');

/**
 * Gestor de Zona con cobertura inalámbrica móvil (Windows Mobile Hotspot)
 * Utiliza WinRT (Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager)
 * para consultar el estado, SSID, contraseña y clientes conectados, así como
 * para encender o apagar la zona móvil sin requerir software adicional ni router Wi-Fi.
 */

function runPowerShellScript(script) {
    return new Promise((resolve) => {
        const encodedCommand = Buffer.from(script, 'utf16le').toString('base64');
        exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`, { 
            timeout: 25000,
            maxBuffer: 1024 * 1024 // 1MB buffer
        }, (error, stdout, stderr) => {
            if (error) {
                console.warn('PowerShell execution error:', error.message);
                return resolve({ success: false, error: error.message, stderr: stderr?.toString() });
            }
            try {
                const output = stdout.trim();
                if (!output) {
                    return resolve({ success: false, error: 'Empty output from PowerShell' });
                }
                const data = JSON.parse(output);
                return resolve({ success: true, ...data });
            } catch (e) {
                console.warn('Error parsing PowerShell JSON output:', e.message);
                console.warn('Raw output:', stdout);
                return resolve({ success: false, error: `JSON parse error: ${e.message}`, raw: stdout });
            }
        });
    });
}

function getHotspotInfo() {
    const script = `
$ErrorActionPreference = 'Stop'
try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $profiles = [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]::GetConnectionProfiles()
    
    if (-not $profiles -or $profiles.Count -eq 0) {
        Write-Output (@{ supported=$false; state='Off'; error='No network profiles found' } | ConvertTo-Json -Compress)
        return
    }
    
    # Priorizar adaptador WLAN físico para tethering
    $profile = $profiles | Where-Object { $_.IsWlanConnectionProfile -and $_.GetNetworkConnectivityLevel().ToString() -ne 'None' } | Select-Object -First 1
    if (-not $profile) {
        $profile = $profiles | Where-Object { $_.IsWlanConnectionProfile } | Select-Object -First 1
    }
    if (-not $profile) {
        $profile = [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]::GetInternetConnectionProfile()
    }
    if (-not $profile) {
        $profile = $profiles[0]
    }
    
    $tm = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime]::CreateFromConnectionProfile($profile)
    
    if (-not $tm) {
        Write-Output (@{ supported=$false; state='Off'; error='Tethering manager not available' } | ConvertTo-Json -Compress)
        return
    }
    
    $state = $tm.TetheringOperationalState.ToString()
    $cfg = $null
    $clients = 0
    
    try {
        $cfg = $tm.GetCurrentAccessPointConfiguration()
    } catch {}
    
    try {
        if ($state -eq 'On') {
            $clients = $tm.ClientCount
        }
    } catch {}
    
    $result = @{
        supported = $true
        state = $state
        ssid = if ($cfg) { $cfg.Ssid } else { 'PrintStudio-Pro' }
        password = if ($cfg) { $cfg.Passphrase } else { 'printstudio123' }
        clients = $clients
        ip = '192.168.137.1'
        error = $null
    }
    
    Write-Output ($result | ConvertTo-Json -Compress)
} catch {
    Write-Output (@{ supported=$false; state='Off'; error=$_.Exception.Message } | ConvertTo-Json -Compress)
}
`;
    return runPowerShellScript(script);
}

function setHotspotState(enable) {
    const script = `
$ErrorActionPreference = 'Stop'
try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $profiles = [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]::GetConnectionProfiles()
    
    if (-not $profiles -or $profiles.Count -eq 0) {
        Write-Output (@{ success=$false; error='No network profiles found' } | ConvertTo-Json -Compress)
        return
    }
    
    $profile = $profiles | Where-Object { $_.IsWlanConnectionProfile -and $_.GetNetworkConnectivityLevel().ToString() -ne 'None' } | Select-Object -First 1
    if (-not $profile) {
        $profile = $profiles | Where-Object { $_.IsWlanConnectionProfile } | Select-Object -First 1
    }
    if (-not $profile) {
        $profile = [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]::GetInternetConnectionProfile()
    }
    if (-not $profile) {
        $profile = $profiles[0]
    }
    
    $tm = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime]::CreateFromConnectionProfile($profile)
    
    if (-not $tm) {
        Write-Output (@{ success=$false; error='Tethering manager not available' } | ConvertTo-Json -Compress)
        return
    }
    
    $currentState = $tm.TetheringOperationalState.ToString()
    
    if ($enable) {
        if ($currentState -ne 'On') {
            $null = $tm.StartTetheringAsync()
            $waitCount = 0
            while ($tm.TetheringOperationalState.ToString() -eq 'InTransition' -and $waitCount -lt 20) {
                Start-Sleep -Milliseconds 500
                $waitCount++
            }
        }
    } else {
        if ($currentState -ne 'Off') {
            $null = $tm.StopTetheringAsync()
            $waitCount = 0
            while ($tm.TetheringOperationalState.ToString() -eq 'InTransition' -and $waitCount -lt 20) {
                Start-Sleep -Milliseconds 500
                $waitCount++
            }
        }
    }
    
    $finalState = $tm.TetheringOperationalState.ToString()
    $cfg = $null
    $clients = 0
    try {
        $cfg = $tm.GetCurrentAccessPointConfiguration()
    } catch {}
    try {
        if ($finalState -eq 'On') {
            $clients = $tm.ClientCount
        }
    } catch {}
    
    $result = @{
        success = $true
        supported = $true
        state = $finalState
        ssid = if ($cfg) { $cfg.Ssid } else { 'PrintStudio-Pro' }
        password = if ($cfg) { $cfg.Passphrase } else { 'printstudio123' }
        clients = $clients
        ip = '192.168.137.1'
        message = if ($finalState -eq 'On') { 'Zona Móvil iniciada con éxito' } else { 'Zona Móvil detenida' }
    }
    Write-Output ($result | ConvertTo-Json -Compress)
} catch {
    Write-Output (@{ success=$false; state='Off'; error=$_.Exception.Message } | ConvertTo-Json -Compress)
}
`;
    return runPowerShellScript(script);
}

module.exports = {
    getHotspotInfo,
    setHotspotState
};
