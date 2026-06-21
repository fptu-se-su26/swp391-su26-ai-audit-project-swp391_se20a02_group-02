# Get 8.3 short path of current dir
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$ScriptDir) { $ScriptDir = "." }
$Root = (New-Object -ComObject Scripting.FileSystemObject).GetFolder($ScriptDir).ShortPath

# Load .env
$EnvFile = "$Root\.env"
if (Test-Path $EnvFile) {
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

# Run backend
$Jar = "$Root\src\Back_end\target\luxeway-backend-1.0.0.jar"
java -jar $Jar --spring.profiles.active=sqlserver
