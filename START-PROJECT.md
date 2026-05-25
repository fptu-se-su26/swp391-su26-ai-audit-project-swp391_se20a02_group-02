# 🚗 HƯỚNG DẪN CHẠY DỰ ÁN LUXEWAY

## 📋 TÓM TẮT TRẠNG THÁI

### ✅ ĐÃ HOÀN THÀNH
- ✅ Database Schema: 35 bảng SQL Server
- ✅ Backend: Spring Boot với REST API
- ✅ Frontend: React + TypeScript + Vite
- ✅ API Integration: Frontend kết nối Backend
- ✅ Test Page: Trang test backend tích hợp

### 🎯 CẦN LÀM
1. Cài Maven (hoặc dùng IDE)
2. Chạy Backend
3. Import Sample Data
4. Chạy Frontend
5. Test kết nối

---

## 🚀 BƯỚC 1: CHẠY FRONTEND (ĐÃ SẴN SÀNG)

### Cách 1: Chạy trực tiếp (KHUYẾN NGHỊ)
```bash
cd src/Front_end
npm install  # Đã cài rồi, có thể bỏ qua
npm run dev
```

### Kết quả
```
VITE v5.4.21  ready in 4200 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Truy cập Frontend
- **Trang chủ**: http://localhost:5173/
- **Marketplace**: http://localhost:5173/marketplace
- **Backend Test**: http://localhost:5173/test-backend ⭐

---

## 🔧 BƯỚC 2: CHẠY BACKEND

### Yêu cầu
- ✅ Java 21 (đã có)
- ⚠️ Maven (cần cài) HOẶC IDE (IntelliJ/Eclipse)
- ✅ SQL Server (localhost:1433)
- ✅ Database: car_rental_platform

### Cách 1: Sử dụng IDE (DỄ NHẤT)

#### IntelliJ IDEA
1. Mở IntelliJ IDEA
2. File → Open → Chọn thư mục `src/Back_end`
3. Chờ Maven import dependencies
4. Tìm file `LuxewayBackendApplication.java`
5. Click nút ▶️ Run bên cạnh `public static void main`

#### Eclipse
1. Mở Eclipse
2. File → Import → Maven → Existing Maven Projects
3. Chọn thư mục `src/Back_end`
4. Right-click project → Run As → Java Application
5. Chọn `LuxewayBackendApplication`

### Cách 2: Cài Maven và chạy

#### Cài Maven
1. Download: https://maven.apache.org/download.cgi
2. Giải nén vào `C:\Program Files\Apache\maven`
3. Thêm vào PATH:
   - System Properties → Environment Variables
   - Path → New → `C:\Program Files\Apache\maven\bin`
4. Test: `mvn -version`

#### Chạy Backend
```bash
cd src/Back_end
mvn spring-boot:run
```

### Kết quả Backend chạy thành công
```
🚗 LuxeWay Backend is running on http://localhost:8080/api/v1
📚 Swagger UI: http://localhost:8080/api/v1/swagger-ui.html
🔧 API Docs: http://localhost:8080/api/v1/api-docs
```

---

## 📊 BƯỚC 3: IMPORT SAMPLE DATA

### Mở SQL Server Management Studio
1. Connect to: `localhost` (sa/123456)
2. Database: `car_rental_platform`
3. Mở file: `src/Back_end/import-data.sql`
4. Execute (F5)

### Kết quả
```sql
✅ Sample data imported successfully!
Total Users: 3
Total Vehicles: 2
```

---

## 🧪 BƯỚC 4: TEST KẾT NỐI

### Test Backend API trực tiếp
Mở trình duyệt và truy cập:

1. **Health Check**
   ```
   http://localhost:8080/api/v1/test/health
   ```
   Kết quả mong đợi:
   ```json
   {
     "status": "SUCCESS",
     "message": "LuxeWay Backend is running!",
     "database_connected": true,
     "total_users": 3
   }
   ```

2. **Users API**
   ```
   http://localhost:8080/api/v1/users
   ```

3. **Vehicles API**
   ```
   http://localhost:8080/api/v1/vehicles
   ```

4. **Swagger UI** (Xem tất cả API)
   ```
   http://localhost:8080/api/v1/swagger-ui.html
   ```

### Test Frontend với Backend
1. Mở: http://localhost:5173/test-backend
2. Click các nút test:
   - ✅ Health Check
   - ✅ Database Info
   - ✅ Test Users API
   - ✅ Test Vehicles API

---

## 📱 BƯỚC 5: XEM GIAO DIỆN WEB

### Các trang có sẵn

#### 🏠 Trang chủ
```
http://localhost:5173/
```
- Hero section với animation
- Featured vehicles
- Categories
- Reviews

#### 🛒 Marketplace
```
http://localhost:5173/marketplace
```
- Danh sách xe
- Filter theo category, price, brand
- Search
- Pagination

#### 🔧 Backend Test (MỚI)
```
http://localhost:5173/test-backend
```
- Test kết nối backend
- Hiển thị users từ database
- Hiển thị vehicles từ database
- Backend status indicator

#### 🔐 Authentication
```
http://localhost:5173/auth/login
http://localhost:5173/auth/register
```

#### 📊 Dashboard (sau khi login)
```
http://localhost:5173/dashboard
```

---

## 🎨 TÍNH NĂNG FRONTEND

### Đã có sẵn
- ✅ Dark Mode (toggle ở navbar)
- ✅ Multi-language (EN/VI)
- ✅ Responsive design
- ✅ Animation với Framer Motion
- ✅ Mock data (localStorage)
- ✅ **Backend API integration** (MỚI)
- ✅ **Backend status indicator** (MỚI)
- ✅ **Test page** (MỚI)

### Sẽ kết nối Backend
- 🔄 Authentication (JWT)
- 🔄 Real vehicle data
- 🔄 Real booking system
- 🔄 Real payment integration

---

## 🔗 DANH SÁCH ENDPOINTS

### Frontend URLs
| Page | URL |
|------|-----|
| Home | http://localhost:5173/ |
| Marketplace | http://localhost:5173/marketplace |
| **Backend Test** | http://localhost:5173/test-backend |
| Login | http://localhost:5173/auth/login |
| Register | http://localhost:5173/auth/register |

### Backend APIs
| Endpoint | URL |
|----------|-----|
| Health Check | http://localhost:8080/api/v1/test/health |
| Database Info | http://localhost:8080/api/v1/test/db-info |
| Users | http://localhost:8080/api/v1/users |
| Vehicles | http://localhost:8080/api/v1/vehicles |
| Swagger UI | http://localhost:8080/api/v1/swagger-ui.html |

---

## 🐛 TROUBLESHOOTING

### Frontend không chạy
```bash
cd src/Front_end
npm install
npm run dev
```

### Backend không chạy
1. Kiểm tra Java: `java -version` (cần 17+)
2. Kiểm tra SQL Server đang chạy
3. Kiểm tra database `car_rental_platform` tồn tại
4. Dùng IDE thay vì Maven

### Backend Test page báo lỗi
1. Đảm bảo backend đang chạy (port 8080)
2. Check CORS settings trong backend
3. Xem console log trong browser (F12)

### Database connection failed
1. SQL Server đang chạy?
2. Username/password đúng? (sa/123456)
3. Database `car_rental_platform` đã tạo?
4. Port 1433 không bị block?

---

## 📸 SCREENSHOTS MẪU

### Frontend Homepage
- Modern hero section
- Vehicle categories
- Featured vehicles
- Customer reviews

### Backend Test Page
- Connection status indicator
- Health check results
- Users list from database
- Vehicles list from database
- API endpoint links

### Swagger UI
- Complete API documentation
- Try out endpoints
- Request/Response examples

---

## 🎯 NEXT STEPS

### Ngay bây giờ
1. ✅ Chạy Frontend: `npm run dev` trong `src/Front_end`
2. ⚠️ Chạy Backend: Dùng IDE hoặc cài Maven
3. ✅ Import data: Chạy `import-data.sql`
4. ✅ Test: Truy cập http://localhost:5173/test-backend

### Sau này
1. Implement JWT Authentication
2. Connect real vehicle data
3. Implement booking flow với backend
4. Payment integration (VNPay/Stripe)
5. Real-time messaging
6. File upload cho vehicle images

---

## 📞 SUPPORT

### Test Accounts (sau khi import data)
```
Admin:    admin@luxeway.vn / password
Customer: nguyen.van.a@gmail.com / password
Owner:    pham.minh.d@gmail.com / password
```

### Ports
- Frontend: 5173
- Backend: 8080
- SQL Server: 1433

### Files quan trọng
- Backend config: `src/Back_end/src/main/resources/application.yml`
- Frontend API: `src/Front_end/src/services/api.ts`
- Test page: `src/Front_end/src/pages/TestBackend.tsx`
- Sample data: `src/Back_end/import-data.sql`

---

## ✨ SUMMARY

**Frontend**: ✅ Đã chạy thành công trên http://localhost:5173/
**Backend**: ⚠️ Cần chạy bằng IDE hoặc Maven
**Database**: ✅ Schema đã có, cần import sample data
**Integration**: ✅ Frontend đã sẵn sàng kết nối Backend

**Trang test**: http://localhost:5173/test-backend 🎉

Chúc bạn code vui vẻ! 🚗✨