# Get 8.3 short path of the script's own directory (avoids Unicode issues in Java/Maven)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = (New-Object -ComObject Scripting.FileSystemObject).GetFolder($ScriptDir).ShortPath

$BackendDir = "$Root\src\Back_end"
$LocalMvn = "$BackendDir\maven\apache-maven-3.9.6\bin\mvn.cmd"

# Detect JDK and set JAVA_HOME
if (Test-Path "C:\Program Files\Java\jdk-22") {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
} elseif (Test-Path "C:\Program Files\Java\jdk-21") {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
} elseif (Test-Path "C:\Program Files\Java\jdk-17") {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
}

if ($env:JAVA_HOME) {
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
}

Write-Host "Java Version check:"
java -version

Write-Host "Building project from path: $BackendDir using local Maven: $LocalMvn"
Set-Location $BackendDir

# Execute Local Maven package
& $LocalMvn clean package -DskipTests
