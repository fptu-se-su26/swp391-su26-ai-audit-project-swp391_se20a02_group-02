# LuxeWay Backend Setup and Run Script
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "LUXEWAY BACKEND SETUP & RUN" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Java
Write-Host "[1/4] Checking Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found! Please install Java 17+" -ForegroundColor Red
    exit 1
}

# Check if Maven exists
Write-Host "[2/4] Checking Maven..." -ForegroundColor Yellow
$mavenExists = Get-Command mvn -ErrorAction SilentlyContinue
if ($mavenExists) {
    Write-Host "✅ Maven found" -ForegroundColor Green
    $useMaven = $true
} else {
    Write-Host "⚠️ Maven not found. Will try to download..." -ForegroundColor Yellow
    
    # Download Maven
    $mavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
    $mavenZip = "maven.zip"
    $mavenDir = "maven"
    
    if (!(Test-Path $mavenDir)) {
        Write-Host "Downloading Maven..." -ForegroundColor Yellow
        try {
            Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip
            Expand-Archive -Path $mavenZip -DestinationPath $mavenDir -Force
            Remove-Item $mavenZip
            Write-Host "✅ Maven downloaded successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to download Maven" -ForegroundColor Red
            Write-Host "Please install Maven manually or use an IDE" -ForegroundColor Yellow
            exit 1
        }
    }
    
    $env:PATH += ";$(Get-Location)\maven\apache-maven-3.9.6\bin"
    $useMaven = $true
}

# Check Database Connection
Write-Host "[3/4] Checking Database Connection..." -ForegroundColor Yellow
try {
    # Simple TCP connection test
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("localhost", 1433)
    $tcpClient.Close()
    Write-Host "✅ SQL Server connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to SQL Server on localhost:1433" -ForegroundColor Red
    Write-Host "Please make sure SQL Server is running and database 'car_rental_platform' exists" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

# Run the application
Write-Host "[4/4] Starting LuxeWay Backend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🚗 Starting LuxeWay Backend Server..." -ForegroundColor Cyan
Write-Host "📍 URL: http://localhost:8080/api/v1" -ForegroundColor Cyan
Write-Host "📚 Swagger: http://localhost:8080/api/v1/swagger-ui.html" -ForegroundColor Cyan
Write-Host "🔍 Health Check: http://localhost:8080/api/v1/test/health" -ForegroundColor Cyan
Write-Host ""

if ($useMaven) {
    Write-Host "Using Maven to run the application..." -ForegroundColor Green
    mvn spring-boot:run
} else {
    Write-Host "❌ No build tool available. Please use an IDE to run the project." -ForegroundColor Red
    Write-Host "1. Open IntelliJ IDEA or Eclipse" -ForegroundColor Yellow
    Write-Host "2. Import Maven project from this directory" -ForegroundColor Yellow
    Write-Host "3. Run LuxewayBackendApplication.java" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done" -ForegroundColor Gray

