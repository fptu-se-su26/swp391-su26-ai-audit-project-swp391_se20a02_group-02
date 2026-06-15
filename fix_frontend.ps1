$files = Get-ChildItem -Path "src\Front_end\src" -Recurse -Include *.ts,*.tsx
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $modified = $content -replace 'http://localhost:8080/api/v1', 'http://localhost:8080'
    $modified = $modified -replace '/api/v1', ''
    # Only write if changed to avoid breaking file watchers or modified dates unnecessarily
    if ($content -ne $modified) {
        Set-Content $file.FullName $modified
    }
}
Write-Host "Replaced all /api/v1 occurrences in frontend."
