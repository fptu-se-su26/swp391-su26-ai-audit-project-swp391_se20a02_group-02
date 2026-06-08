# Set JAVA_HOME and Path
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

# Check if mvn.cmd exists
$mvnCmd = "maven\apache-maven-3.9.6\bin\mvn.cmd"
if (Test-Path $mvnCmd) {
    Write-Host "✅ mvn.cmd found at $mvnCmd"
    # Execute directly
    & $mvnCmd clean compile
} else {
    Write-Host "❌ mvn.cmd not found at $mvnCmd"
}
