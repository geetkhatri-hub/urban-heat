Write-Host "Starting Node.js portable environment setup..."
$nodeUrl = "https://nodejs.org/dist/v20.12.2/node-v20.12.2-win-x64.zip"
$zipPath = Join-Path $pwd "node-portable.zip"
$extractPath = Join-Path $pwd ".node_temp"
$destPath = Join-Path $pwd ".node"

if (Test-Path $destPath) {
    Write-Host "Local .node folder already exists, skipping download."
    exit 0
}

Write-Host "Downloading Node.js from $nodeUrl..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath

Write-Host "Extracting Node.js archive..."
Expand-Archive -Path $zipPath -DestinationPath $extractPath

# Move the inner folder to .node
$innerFolder = Get-ChildItem -Path $extractPath -Directory | Select-Object -First 1
Move-Item -Path $innerFolder.FullName -Destination $destPath

# Clean up
Remove-Item -Path $zipPath -Force
Remove-Item -Path $extractPath -Recurse -Force

# Create convenient cmd/ps1 scripts to execute node/npm locally
$nodeBin = Join-Path $destPath "node.exe"
$npmCmd = Join-Path $destPath "npm.cmd"

if (Test-Path $nodeBin) {
    Write-Host "Node.js successfully installed at: $nodeBin"
    & $nodeBin -v
} else {
    Write-Error "Failed to install Node.js."
    exit 1
}
