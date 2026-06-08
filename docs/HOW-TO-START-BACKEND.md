# 🚀 HƯỚNG DẪN START BACKEND - LUXEWAY

## ❌ LỖI: Backend Offline

Bạn đang thấy lỗi **"Backend Offline"** vì backend chưa được start.

---

## ✅ CÁCH FIX - 3 PHƯƠNG PHÁP

### **PHƯƠNG PHÁP 1: IntelliJ IDEA (KHUYẾN NGHỊ)** ⭐

#### Bước 1: Mở Project
1. Mở **IntelliJ IDEA**
2. Click **File** → **Open**
3. Chọn thư mục: `src/Back_end`
4. Click **OK**

#### Bước 2: Đợi Maven Import
- IntelliJ sẽ tự động import dependencies
- Đợi thanh progress bar ở dưới hoàn thành
- Có thể mất 2-5 phút lần đầu

#### Bước 3: Run Application
1. Tìm file: `src/main/java/com/luxeway/LuxewayBackendApplication.java`
2. Click chuột phải vào file
3. Chọn **Run 'LuxewayBackendApplication'**
4. Hoặc click nút ▶️ màu xanh bên cạnh `public static void main`

#### Bước 4: Kiểm Tra
- Console sẽ hiển thị logs
- Đợi đến khi thấy: `Started LuxewayBackendApplication`
- Mở browser: http://localhost:8080/api/v1/test/health
- Nếu thấy JSON response → **SUCCESS!** ✅

---

### **PHƯƠNG PHÁP 2: Script Tự Động** 🤖

#### Bước 1: Chạy Script
1. Mở thư mục: `src/Back_end`
2. Double-click file: **`check-and-start.bat`**
3. Script sẽ tự động:
   - Check Java
   - Check SQL Server
   - Check Database
   - Start Backend

#### Bước 2: Đợi Backend Start
- Cửa sổ CMD sẽ hiển thị logs
- Đợi đến khi thấy: `Started LuxewayBackendApplication`
- **KHÔNG ĐÓNG** cửa sổ CMD này!

#### Bước 3: Test
- Mở browser: http://localhost:8080/api/v1/test/health
- Refresh trang frontend: http://localhost:5173/test-backend
- Backend status sẽ chuyển sang **"Connected"** ✅

---

### **PHƯƠNG PHÁP 3: Command Line** 💻

#### Nếu có Maven:
```bash
cd src/Back_end
mvn clean install
mvn spring-boot:run
```

#### Nếu có Gradle:
```bash
cd src/Back_end
gradlew clean build
gradlew bootRun
```

---

## 🔍 TROUBLESHOOTING

### Lỗi 1: "Port 8080 already in use"
**Nguyên nhân:** Backend đã chạy rồi hoặc app khác đang dùng port 8080

**Fix:**
```bash
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process (thay PID bằng số thực tế)
taskkill /F /PID <PID>
```

Hoặc dùng script:
```bash
cd src/Back_end
check-and-start.bat
# Chọn Y khi được hỏi kill process
```

---

### Lỗi 2: "Cannot connect to SQL Server"
**Nguyên nhân:** SQL Server chưa chạy hoặc sai credentials

**Fix:**
1. Mở **SQL Server Management Studio (SSMS)**
2. Connect với:
   - Server: `localhost`
   - Authentication: `SQL Server Authentication`
   - Login: `sa`
   - Password: `123456`
3. Nếu connect được → SQL Server OK
4. Nếu không connect được:
   - Mở **SQL Server Configuration Manager**
   - Enable **TCP/IP** protocol
   - Restart SQL Server service

---

### Lỗi 3: "Database 'car_rental_platform' not found"
**Nguyên nhân:** Database chưa được tạo

**Fix:**
1. Mở **SSMS**
2. Connect to `localhost`
3. Click **New Query**
4. Chạy:
   ```sql
   CREATE DATABASE car_rental_platform;
   GO
   ```
5. Mở file: `src/Back_end/src/main/resources/schema.sql`
6. Execute (F5)
7. Mở file: `src/Back_end/import-data.sql`
8. Execute (F5)

---

### Lỗi 4: "Java not found"
**Nguyên nhân:** Java chưa cài hoặc chưa add vào PATH

**Fix:**
1. Download Java 17 hoặc 21: https://adoptium.net/
2. Install
3. Add to PATH:
   - System Properties → Environment Variables
   - Path → New → `C:\Program Files\Eclipse Adoptium\jdk-21.0.x\bin`
4. Test: `java -version`

---

### Lỗi 5: "Maven not found"
**Nguyên nhân:** Maven chưa cài

**Fix Option 1 - Dùng IDE:**
- Dùng IntelliJ IDEA (có Maven built-in)

**Fix Option 2 - Cài Maven:**
1. Download: https://maven.apache.org/download.cgi
2. Extract to: `C:\Program Files\Apache\maven`
3. Add to PATH: `C:\Program Files\Apache\maven\bin`
4. Test: `mvn -version`

---

## ✅ KIỂM TRA BACKEND ĐÃ CHẠY

### Test 1: Health Check
```
http://localhost:8080/api/v1/test/health
```
**Expected Response:**
```json
{
  "status": "SUCCESS",
  "message": "LuxeWay Backend is running!",
  "database_connected": true,
  "total_users": 8
}
```

### Test 2: Swagger UI
```
http://localhost:8080/api/v1/swagger-ui.html
```
**Expected:** Swagger documentation page

### Test 3: Frontend Test Page
```
http://localhost:5173/test-backend
```
**Expected:** Backend status shows **"Connected"** (green)

---

## 📊 BACKEND LOGS

### Logs Thành Công:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.x.x)

2024-05-24 10:28:15 - Starting LuxewayBackendApplication
2024-05-24 10:28:16 - Tomcat started on port(s): 8080 (http)
2024-05-24 10:28:16 - Started LuxewayBackendApplication in 4.5 seconds
```

### Logs Lỗi:
```
Error starting ApplicationContext
...
Caused by: java.net.BindException: Address already in use: bind
```
→ Port 8080 đã được dùng, kill process hoặc đổi port

```
Error creating bean with name 'dataSource'
...
Caused by: com.microsoft.sqlserver.jdbc.SQLServerException
```
→ Không connect được SQL Server, check credentials

---

## 🎯 QUICK START CHECKLIST

- [ ] SQL Server đang chạy
- [ ] Database `car_rental_platform` đã tạo
- [ ] Sample data đã import
- [ ] Java 17+ đã cài
- [ ] Port 8080 available
- [ ] Backend started (IntelliJ hoặc script)
- [ ] Health check returns 200 OK
- [ ] Frontend shows "Backend Connected"

---

## 📞 CẦN TRỢ GIÚP?

### Check Console Logs
- IntelliJ: Tab **Run** ở dưới
- CMD: Cửa sổ đen đang chạy backend
- Tìm dòng có chữ **ERROR** hoặc **Exception**

### Common Error Keywords:
- `BindException` → Port đã được dùng
- `SQLServerException` → Database connection failed
- `ClassNotFoundException` → Dependencies chưa download
- `BeanCreationException` → Configuration error

### Debug Steps:
1. Copy error message
2. Google: "Spring Boot [error message]"
3. Check Stack Overflow
4. Check application.yml config
5. Restart IntelliJ IDEA
6. Clean and rebuild: `mvn clean install`

---

## 🚀 AFTER BACKEND STARTS

### 1. Test Backend
```
http://localhost:5173/test-backend
```
- Click "Health Check" → Should return JSON
- Click "Test Users API" → Should show users
- Click "Test Vehicles API" → Should show vehicles

### 2. Test Login
```
http://localhost:5173/auth/login
```
- Email: `nguyen.van.a@gmail.com`
- Password: `password`
- Click "Sign In"
- Should redirect to dashboard

### 3. Test Admin
```
http://localhost:5173/auth/login
```
- Email: `admin@luxeway.vn`
- Password: `password`
- Navigate to: http://localhost:5173/admin

---

## ✨ SUCCESS!

Khi backend chạy thành công, bạn sẽ thấy:
- ✅ Console log: "Started LuxewayBackendApplication"
- ✅ Health check returns JSON
- ✅ Frontend shows "Backend Connected"
- ✅ Login works
- ✅ Dashboard loads

**Chúc mừng! Backend đã chạy! 🎉**

---

**LuxeWay - Drive Your Dreams** 🚗✨
