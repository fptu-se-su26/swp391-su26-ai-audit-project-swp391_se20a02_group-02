$fso = New-Object -ComObject Scripting.FileSystemObject
$shortRoot = $fso.GetFolder($PSScriptRoot).ShortPath
$shortJar = "$shortRoot\src\Back_end\gradle\wrapper\gradle-wrapper.jar"
$shortBe = "$shortRoot\src\Back_end"

Write-Host "Changing directory to: $shortBe" -ForegroundColor Cyan
Set-Location $shortBe

Write-Host "Running Gradle build directly via Java..." -ForegroundColor Cyan
java -classpath $shortJar org.gradle.wrapper.GradleWrapperMain bootJar -x test
