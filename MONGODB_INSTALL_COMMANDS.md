# Exact MongoDB Installation Commands

## Step 1: Open PowerShell as Administrator
- Press `Win + X`
- Select "Windows PowerShell (Admin)" or "Terminal (Admin)"
- Click "Yes" when prompted

## Step 2: Install MongoDB (Copy and paste these commands one by one)

```powershell
# Check if Chocolatey is available
choco --version

# Install MongoDB Community Server
choco install mongodb -y

# Wait for installation to complete (2-5 minutes)
```

## Step 3: Verify Installation

```powershell
# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check MongoDB version
mongod --version

# Check if MongoDB service is running
Get-Service -Name MongoDB
```

## Step 4: Start MongoDB Service (if not running)

```powershell
# Start MongoDB service
Start-Service -Name MongoDB

# Verify it's running
Get-Service -Name MongoDB
```

## Step 5: Test MongoDB Connection

```powershell
# Test MongoDB connection (this should connect)
mongosh
# If connected, type: exit
```

## Step 6: Update Your Project Configuration

After MongoDB is installed, run these commands in your project directory:

```powershell
# Navigate to your project
cd C:\Users\HP\Desktop\Education-legal-sys\backend

# Update .env file to use local MongoDB
(Get-Content .env) -replace 'MONGODB_URI=.*', 'MONGODB_URI=mongodb://localhost:27017/edulegal' | Set-Content .env

# Verify the change
Get-Content .env | Select-String "MONGODB_URI"
```

## Step 7: Test Your Backend Connection

```powershell
# Go to project root
cd C:\Users\HP\Desktop\Education-legal-sys

# Start both servers
npm run dev
```

## Alternative: If Chocolatey Installation Fails

If Chocolatey doesn't work, use these manual installation commands:

```powershell
# Download MongoDB installer
$url = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.11-signed.msi"
$output = "$env:TEMP\mongodb-installer.msi"
Invoke-WebRequest -Uri $url -OutFile $output

# Install MongoDB (this will open installer GUI)
Start-Process msiexec.exe -ArgumentList "/i `"$output`" /quiet /norestart" -Wait

# Add MongoDB to PATH (if not auto-added)
$mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$mongoPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$mongoPath", "Machine")
}
```

## Troubleshooting Commands

```powershell
# Check if MongoDB port is in use
netstat -ano | findstr :27017

# Check MongoDB logs
Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 20

# Restart MongoDB service
Restart-Service -Name MongoDB

# Check MongoDB service status
Get-Service -Name MongoDB | Format-List *
```







