param(
    [Parameter(Mandatory = $true)]
    [string]$Url
)

$ErrorActionPreference = 'Stop'
$debugPort = 9223
$devToolsBaseUrl = "http://127.0.0.1:$debugPort"

$edgePath = @(
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\Application\msedge.exe')
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $edgePath) {
    throw 'Microsoft Edge was not found in its standard installation locations.'
}

$devToolsVersion = $null
try {
    $devToolsVersion = Invoke-RestMethod -Uri "$devToolsBaseUrl/json/version" -TimeoutSec 1
} catch [System.Net.WebException] {
    $devToolsVersion = $null
}

if ($devToolsVersion) {
    if ($devToolsVersion.Browser -notlike 'Edg/*' -or -not $devToolsVersion.webSocketDebuggerUrl) {
        throw "Port $debugPort is in use by a service that is not a debuggable Microsoft Edge instance."
    }

    $encodedUrl = [System.Uri]::EscapeDataString($Url)
    Invoke-RestMethod -Method Put -Uri "$devToolsBaseUrl/json/new?$encodedUrl" -TimeoutSec 5 | Out-Null
    Write-Output "Reusing $($devToolsVersion.Browser) on debug port $debugPort."
    exit 0
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $debugPort)
try {
    $listener.Start()
    $listener.Stop()
} catch [System.Net.Sockets.SocketException] {
    $listener.Stop()
    throw "Debug port $debugPort is already in use. Close the other Edge debug session and try again."
}

$profilePath = Join-Path $env:TEMP 'minesweeper-vscode-edge-debug'
$arguments = @(
    "--remote-debugging-port=$debugPort",
    "--user-data-dir=`"$profilePath`"",
    $Url
)
$edgeProcess = Start-Process -FilePath $edgePath -ArgumentList $arguments -PassThru

$deadline = (Get-Date).AddSeconds(20)
$devToolsVersion = $null
while ((Get-Date) -lt $deadline) {
    try {
        $devToolsVersion = Invoke-RestMethod -Uri "$devToolsBaseUrl/json/version" -TimeoutSec 1
        if ($devToolsVersion.webSocketDebuggerUrl) {
            break
        }
    } catch [System.Net.WebException] {
        Start-Sleep -Milliseconds 250
    }
}

if (-not $devToolsVersion.webSocketDebuggerUrl) {
    $edgeProcess.Refresh()
    if ($edgeProcess.HasExited) {
        throw "Microsoft Edge exited before opening its debug port. Exit code: $($edgeProcess.ExitCode)"
    }
    throw "Microsoft Edge did not open its debug port at 127.0.0.1:$debugPort within 20 seconds."
}

Write-Output "Edge debug endpoint is ready: $($devToolsVersion.Browser)"
