$fso = New-Object -ComObject Scripting.FileSystemObject
$baseDir = "c:\Users\nguye\OneDrive\Tài liệu\Project_ALL_Mon\swp391-su26-ai-audit-project-swp391_se20a02_group-02\src\Back_end"

function Get-ShortPath($path) {
    if ([System.IO.Directory]::Exists($path)) {
        $folder = $fso.GetFolder($path)
        return $folder.ShortPath
    }
    return "Not found"
}

function Get-FileShortPath($path) {
    if ([System.IO.File]::Exists($path)) {
        $file = $fso.GetFile($path)
        return $file.ShortPath
    }
    return "Not found"
}

Write-Host "Base: $(Get-ShortPath $baseDir)"
Write-Host "Maven: $(Get-ShortPath "$baseDir\maven")"
Write-Host "Maven Home: $(Get-ShortPath "$baseDir\maven\apache-maven-3.9.6")"
Write-Host "Maven Bin: $(Get-ShortPath "$baseDir\maven\apache-maven-3.9.6\bin")"
Write-Host "Mvn.cmd: $(Get-FileShortPath "$baseDir\maven\apache-maven-3.9.6\bin\mvn.cmd")"
