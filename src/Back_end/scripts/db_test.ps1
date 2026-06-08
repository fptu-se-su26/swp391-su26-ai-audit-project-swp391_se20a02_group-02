$connectionString = "Server=localhost,1433;Database=car_rental_platform;User Id=sa;Password=123456;Encrypt=False;TrustServerCertificate=True;"
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    $cmd = $connection.CreateCommand()
    
    # Query tables and their row counts
    $cmd.CommandText = @"
        SELECT 
            t.NAME AS TableName,
            p.rows AS RowCounts
        FROM 
            sys.tables t
        INNER JOIN      
            sys.indexes i ON t.OBJECT_ID = i.object_id
        INNER JOIN 
            sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
        WHERE 
            t.is_ms_shipped = 0 AND i.index_id <= 1
        ORDER BY 
            p.rows DESC, t.NAME
"@
    
    $reader = $cmd.ExecuteReader()
    Write-Host "Table row counts:" -ForegroundColor Yellow
    $totalRows = 0
    while ($reader.Read()) {
        $name = $reader.GetValue(0)
        $rows = $reader.GetValue(1)
        $totalRows += $rows
        if ($rows -gt 0) {
            Write-Host " - $name : $rows rows" -ForegroundColor Green
        } else {
            # Write-Host " - $name : 0 rows" -ForegroundColor Gray
        }
    }
    Write-Host "Total rows across all tables: $totalRows" -ForegroundColor Yellow
    $reader.Close()
    
    # Check if there are active transactions or blockings
    $cmd.CommandText = "SELECT COUNT(*) FROM sys.dm_exec_requests WHERE blocking_session_id <> 0"
    $blocked = $cmd.ExecuteScalar()
    Write-Host "Blocked sessions count: $blocked" -ForegroundColor Cyan
    
    $connection.Close()
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
