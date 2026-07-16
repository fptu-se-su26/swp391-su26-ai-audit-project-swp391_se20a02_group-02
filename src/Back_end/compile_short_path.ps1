# Set JAVA_HOME and Path
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

$ShortBase = "C:\Users\nguye\OneDrive\TILIU~2\PROJEC~1\SWP391~1\src\Back_end"

# Check if the folder exists
if (Test-Path $ShortBase) {
    Write-Host "✅ Short path directory exists: $ShortBase"
    
    # Change location inside PowerShell to the short path!
    Set-Location $ShortBase
    Write-Host "Current Location is: $((Get-Location).Path)"
    
    # Run maven command from short path
    & "maven\apache-maven-3.9.6\bin\mvn.cmd" clean compile
} else {
    Write-Host "❌ Short path directory does NOT exist: $ShortBase"
}
