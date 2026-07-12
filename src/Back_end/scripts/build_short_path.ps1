$fso = New-Object -ComObject Scripting.FileSystemObject

# Get parent directory of scripts, which is src\Back_end
$backEndDir = [System.IO.Path]::GetFullPath("$PSScriptRoot\..")
$backEndShort = ($fso.GetFolder($backEndDir)).ShortPath
Write-Host "Back-end Short Path: $backEndShort"

$mavenHome = [System.IO.Path]::GetFullPath("$backEndDir\maven\apache-maven-3.9.6")
$mavenHomeShort = ($fso.GetFolder($mavenHome)).ShortPath
Write-Host "Maven Home Short Path: $mavenHomeShort"

# Set Java
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

# Set Maven env
$env:M2_HOME = $mavenHomeShort
$env:MAVEN_HOME = $mavenHomeShort
$env:PATH = "$mavenHomeShort\bin;" + $env:PATH

# Navigate to backend short path
Set-Location $backEndShort
Write-Host "Current Location: $((Get-Location).Path)"

# Run Maven
& "$mavenHomeShort\bin\mvn.cmd" clean package -DskipTests
