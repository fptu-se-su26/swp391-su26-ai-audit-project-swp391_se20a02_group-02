$connectionString = "Server=localhost,1433;Database=car_rental_platform;User Id=sa;Password=123456;Encrypt=False;TrustServerCertificate=True;"
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $cmd = $connection.CreateCommand()
    
    Write-Host "--- BOOKINGS ---" -ForegroundColor Yellow
    $cmd.CommandText = "SELECT id, vehicle_id, renter_id, owner_id, status FROM bookings"
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        Write-Host ($reader.GetValue(0).ToString() + " | " + $reader.GetValue(1) + " | " + $reader.GetValue(2) + " | " + $reader.GetValue(3) + " | " + $reader.GetValue(4))
    }
    $reader.Close()

    Write-Host "--- CAR BOOKINGS ---" -ForegroundColor Yellow
    $cmd.CommandText = "SELECT id, car_id, renter_id, owner_id, status FROM car_bookings"
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        Write-Host ($reader.GetValue(0).ToString() + " | " + $reader.GetValue(1) + " | " + $reader.GetValue(2) + " | " + $reader.GetValue(3) + " | " + $reader.GetValue(4))
    }
    $reader.Close()

    $connection.Close()
} catch {
    Write-Host "Failed: $_"
}
