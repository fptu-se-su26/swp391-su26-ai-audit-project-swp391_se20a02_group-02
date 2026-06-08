# Test backend startup - uses 8.3 short path to bypass Unicode issue in folder name
$ShortRoot = "c:\Users\nguye\OneDrive\TILIU~1\PROJEC~1\SWP391~1"
$EnvFile   = "$ShortRoot\.env"
$Jar       = "$ShortRoot\src\Back_end\target\LUXEWA~1.JAR"

Write-Host "JAR path: $Jar"
Write-Host "ENV path: $EnvFile"
Write-Host ""

# Load .env
$javaArgs = @()
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
        $idx = $line.IndexOf('=')
        if ($idx -gt 0) {
            $k = $line.Substring(0, $idx).Trim()
            $v = $line.Substring($idx + 1).Trim()
            $javaArgs += "-D$k=$v"
        }
    }
}

$allArgs = $javaArgs + @("-jar", $Jar, "--spring.profiles.active=sqlserver")
Write-Host "Starting backend..." -ForegroundColor Cyan
Write-Host ""

$output = & java @allArgs 2>&1
$output | Select-Object -First 80 | ForEach-Object { Write-Host $_ }
