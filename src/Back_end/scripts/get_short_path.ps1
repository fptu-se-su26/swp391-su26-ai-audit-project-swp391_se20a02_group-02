$fso = New-Object -ComObject Scripting.FileSystemObject
$folder = $fso.GetFolder('c:\Users\nguye\OneDrive\Tài liệu\Project_ALL_Mon\swp391-su26-ai-audit-project-swp391_se20a02_group-02\src\Back_end')
Write-Host "Short Path: $($folder.ShortPath)"
