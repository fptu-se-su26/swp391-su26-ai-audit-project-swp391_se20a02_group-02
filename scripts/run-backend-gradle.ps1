# LuxeWay Backend - Run built JAR with Env variables loaded
# Get 8.3 short path of current dir
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$ScriptDir) { $ScriptDir = "." }
$Root = (New-Object -ComObject Scripting.FileSystemObject).GetFolder($ScriptDir).ShortPath

# Load .env
$EnvFile = "$Root\.env"
if (Test-Path $EnvFile) {
    Write-Host "Loading environment variables from $EnvFile..." -ForegroundColor Green
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $idx = $line.IndexOf('=')
            if ($idx -gt 0) {
                $k = $line.Substring(0, $idx).Trim()
                $v = $line.Substring($idx + 1).Trim()
                [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
            }
        }
    }
}

# Run backend JAR
$JarPath = "$Root\src\Back_end\build\libs\Back_end-1.0.0.jar"
Write-Host "Starting Spring Boot Backend from JAR: $JarPath" -ForegroundColor Cyan
java -jar "$JarPath" --spring.profiles.active=sqlserver
