# Load .env file
$envFile = "..\..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Foreach-Object {
        if ($_ -match '^\s*([^#\s=]+)\s*=\s*(.*)$') {
            $key = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
    Write-Host "Loaded environment variables from .env" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found at $envFile" -ForegroundColor Yellow
}

# Run backend
java -jar target\luxeway-backend-1.0.0.jar
