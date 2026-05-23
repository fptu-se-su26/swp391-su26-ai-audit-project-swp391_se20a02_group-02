# LuxeWay Backend

## Hướng dẫn chạy dự án

### Yêu cầu hệ thống
- Java 17+ (hiện tại có Java 21 ✅)
- SQL Server đang chạy trên localhost:1433 ✅
- Database: `car_rental_platform` ✅

### Cách 1: Sử dụng Maven (nếu có Maven)
```bash
mvn spring-boot:run
```

### Cách 2: Sử dụng Gradle (nếu có Gradle)
```bash
./gradlew bootRun
```

### Cách 3: Import vào IDE
1. Mở IntelliJ IDEA hoặc Eclipse
2. Import project từ thư mục `src/Back_end`
3. Chọn Maven hoặc Gradle project
4. Chạy class `LuxewayBackendApplication.java`

### Kiểm tra kết nối
Sau khi chạy thành công, truy cập:

1. **Health Check**: http://localhost:8080/api/v1/test/health
2. **Database Info**: http://localhost:8080/api/v1/test/db-info
3. **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
4. **API Docs**: http://localhost:8080/api/v1/api-docs

### Import Sample Data
Chạy file SQL trong database:
```sql
-- Chạy file: src/Back_end/src/main/resources/data-sqlserver.sql
```

### API Endpoints
- `GET /api/v1/users` - Danh sách users
- `GET /api/v1/vehicles` - Danh sách vehicles
- `GET /api/v1/test/health` - Health check
- `GET /api/v1/test/db-info` - Database info

### Cấu hình Database
File: `src/main/resources/application.yml`
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=car_rental_platform
    username: sa
    password: 123456
```

### Troubleshooting
1. **Lỗi kết nối DB**: Kiểm tra SQL Server đang chạy
2. **Port 8080 bị chiếm**: Thay đổi port trong application.yml
3. **Java version**: Cần Java 17+

### Logs
Logs sẽ hiển thị trong console với format:
```
2024-05-24 10:00:00 - LuxeWay Backend is running on http://localhost:8080/api/v1
```