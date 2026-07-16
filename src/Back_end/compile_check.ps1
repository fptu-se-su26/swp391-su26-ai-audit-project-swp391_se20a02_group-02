$fso = New-Object -ComObject Scripting.FileSystemObject
$shortBackend = $fso.GetFolder($PSScriptRoot).ShortPath
$gradlewPath = "$shortBackend\gradlew.bat"

Write-Host "gradlew Path: $gradlewPath"
Set-Location $shortBackend

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

Write-Host "Starting Gradle bootJar packaging..."
cmd.exe /c "`"$gradlewPath`" bootJar -x test"
