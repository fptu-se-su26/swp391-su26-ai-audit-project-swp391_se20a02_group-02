# Get 8.3 short path of the script's own directory (avoids Unicode issues in Java/Maven)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = (New-Object -ComObject Scripting.FileSystemObject).GetFolder($ScriptDir).ShortPath

$BackendDir = "$Root\src\Back_end"
$MavenBin   = "$Root\src\Back_end\maven\apache-maven-3.9.6\bin"

# Set environment
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;$MavenBin;$env:PATH"

Write-Host "Java Version check:"
java -version

Write-Host "Maven Version check:"
mvn -version

Write-Host "Building project from path: $BackendDir"
Set-Location $BackendDir

# Execute Maven
mvn clean package -DskipTests
