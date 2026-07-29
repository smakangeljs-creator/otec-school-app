# =============================================================
#  OTEC Academy School System - Full Dependency Installer
#  Run this script as Administrator for best results.
#  PowerShell 5.0+ required (built into Windows 10/11)
# =============================================================

$Host.UI.RawUI.WindowTitle = "OTEC - Full Dependency Installer"

function Write-Header($text) {
    Write-Host ""
    Write-Host "  =============================================" -ForegroundColor Cyan
    Write-Host "   $text" -ForegroundColor White
    Write-Host "  =============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step($step, $text) {
    Write-Host "[$step]" -ForegroundColor Yellow -NoNewline
    Write-Host " $text" -ForegroundColor White
}

function Write-OK($text)   { Write-Host "  [OK]   $text" -ForegroundColor Green }
function Write-Info($text) { Write-Host "  [INFO] $text" -ForegroundColor Cyan }
function Write-Warn($text) { Write-Host "  [WARN] $text" -ForegroundColor Yellow }
function Write-Fail($text) { Write-Host "  [FAIL] $text" -ForegroundColor Red }

# Set working directory to script location
Set-Location -Path $PSScriptRoot

Write-Header "OTEC Academy - Smart Installer & Launcher"

# =============================================================
# HELPER: Refresh PATH without restarting PowerShell
# =============================================================
function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path","User")
}

# =============================================================
# STEP 1: Install Node.js if missing
# =============================================================
Write-Step "1/5" "Checking for Node.js..."

$nodeInstalled = $null
try { $nodeInstalled = & node -v 2>$null } catch {}

if (-not $nodeInstalled) {
    Write-Info "Node.js not found. Downloading and installing Node.js LTS..."

    $nodeVersion  = "20.14.0"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    $nodeUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"

    Write-Info "Downloading from: $nodeUrl"
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
    } catch {
        # Fallback: try winget
        Write-Warn "Direct download failed. Trying winget..."
        try {
            winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
        } catch {
            Write-Fail "Could not install Node.js automatically."
            Write-Fail "Please install manually from: https://nodejs.org"
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    if (Test-Path $nodeInstaller) {
        Write-Info "Installing Node.js silently (this may take a minute)..."
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /qn /norestart" -Wait -NoNewWindow
        Remove-Item $nodeInstaller -Force -ErrorAction SilentlyContinue
    }

    Refresh-Path

    try { $nodeInstalled = & node -v 2>$null } catch {}
    if (-not $nodeInstalled) {
        Write-Fail "Node.js installation failed. Please install manually."
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-OK "Node.js installed: $nodeInstalled"
} else {
    Write-OK "Node.js already installed: $nodeInstalled"
}

# =============================================================
# STEP 2: Install Git if missing
# =============================================================
Write-Step "2/5" "Checking for Git..."

$gitInstalled = $null
try { $gitInstalled = & git --version 2>$null } catch {}

if (-not $gitInstalled) {
    Write-Info "Git not found. Downloading and installing Git for Windows..."

    $gitVersion   = "2.45.2"
    $gitInstaller = "$env:TEMP\git-installer.exe"
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v$gitVersion.windows.1/Git-$gitVersion-64-bit.exe"

    Write-Info "Downloading Git from GitHub releases..."
    try {
        Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller -UseBasicParsing
    } catch {
        Write-Warn "Direct download failed. Trying winget..."
        try {
            winget install --id Git.Git -e --silent --accept-package-agreements --accept-source-agreements
        } catch {
            Write-Warn "Could not install Git automatically. GitHub sync will be skipped."
        }
    }

    if (Test-Path $gitInstaller) {
        Write-Info "Installing Git silently..."
        Start-Process $gitInstaller -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS=icons,ext\reg\shellhere,assoc,assoc_sh" -Wait -NoNewWindow
        Remove-Item $gitInstaller -Force -ErrorAction SilentlyContinue
    }

    Refresh-Path
    try { $gitInstalled = & git --version 2>$null } catch {}

    if ($gitInstalled) {
        Write-OK "Git installed: $gitInstalled"
    } else {
        Write-Warn "Git installation could not be confirmed. GitHub sync will be skipped."
    }
} else {
    Write-OK "Git already installed: $gitInstalled"
}

# =============================================================
# STEP 3: Pull latest code from GitHub
# =============================================================
Write-Host ""
Write-Step "3/5" "Fetching latest code from GitHub..."

try {
    $gitCheck = & git status 2>$null
    if ($gitCheck) {
        $pullResult = & git pull origin main 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-OK "Code is up to date from GitHub."
        } else {
            Write-Warn "GitHub pull failed. Continuing with local version."
        }
    }
} catch {
    Write-Warn "Git not available. Skipping GitHub sync."
}

# =============================================================
# STEP 4: Install / Update npm packages
# =============================================================
Write-Host ""
Write-Step "4/5" "Managing npm project dependencies..."

if (-not (Test-Path "node_modules")) {
    Write-Info "node_modules not found. Running full install..."
    & npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "npm install failed! Check your internet connection."
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-OK "All project dependencies installed!"
} else {
    Write-OK "node_modules exists. Checking for outdated packages..."
    $outdated = & npm outdated --depth=0 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Info "Outdated packages found. Updating..."
        & npm update --no-audit --no-fund
        if ($LASTEXITCODE -eq 0) {
            Write-OK "Packages updated successfully!"
        } else {
            Write-Warn "Some packages could not be updated. Continuing anyway..."
        }
    } else {
        Write-OK "All packages are already up to date!"
    }
}

# =============================================================
# STEP 5: Launch the Application
# =============================================================
Write-Host ""
Write-Step "5/5" "Launching OTEC School System..."
Write-Host ""
Write-Host "  The app will be available at: " -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

& npm run desktop:dev

Write-Host ""
Write-Host "  Server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to close"
