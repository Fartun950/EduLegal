# MongoDB Installation Script
# Run this script as Administrator

Write-Host "🔍 Checking if MongoDB is already installed..." -ForegroundColor Cyan

# Check if MongoDB is already installed
$mongodPath = Get-Command mongod -ErrorAction SilentlyContinue
if ($mongodPath) {
    Write-Host "✅ MongoDB is already installed!" -ForegroundColor Green
    Write-Host "Location: $($mongodPath.Source)" -ForegroundColor Gray
    mongod --version
    exit 0
}

Write-Host "📦 Installing MongoDB using Chocolatey..." -ForegroundColor Cyan

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Install MongoDB
try {
    choco install mongodb -y
    Write-Host "✅ MongoDB installation completed!" -ForegroundColor Green
    Write-Host "🔄 Refreshing environment variables..." -ForegroundColor Cyan
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✅ Installation complete! Please close and reopen your terminal." -ForegroundColor Green
    Write-Host "Then run: mongod --version" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Installation failed: $_" -ForegroundColor Red
    Write-Host "Try manual installation from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}










