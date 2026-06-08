# ✅ QUICK CHECKLIST - LUXEWAY

## 🎯 MỤC TIÊU
Chạy được cả Frontend và Backend, test kết nối thành công

---

## 📋 CHECKLIST

### ✅ Đã Hoàn Thành
- [x] Database schema (35 tables)
- [x] Backend code (Spring Boot)
- [x] Frontend code (React + TypeScript)
- [x] API integration layer
- [x] Test page
- [x] Documentation
- [x] Sample data script

### ⚠️ Cần Làm Ngay

#### 1. Frontend (5 phút)
```bash
cd src/Front_end
npm run dev
```
- [ ] Terminal hiển thị: `Local: http://localhost:5173/`
- [ ] Mở browser: http://localhost:5173/
- [ ] Trang chủ hiển thị đúng
- [ ] Click "Backend Test" trong navbar

#### 2. Backend (10 phút)
**Cách A - IntelliJ IDEA**
- [ ] Mở IntelliJ IDEA
- [ ] File → Open → Chọn `src/Back_end`
- [ ] Đợi Maven import (thanh progress bar dưới)
- [ ] Tìm `LuxewayBackendApplication.java`
- [ ] Click ▶️ Run
- [ ] Console hiển thị: "LuxeWay Backend is running"

**Cách B - Eclipse**
- [ ] Mở Eclipse
- [ ] File → Import → Maven → Existing Maven Projects
- [ ] Chọn `src/Back_end`
- [ ] Right-click project → Run As → Java Application
- [ ] Chọn `LuxewayBackendApplication`

**Cách C - Maven (nếu đã cài)**
```bash
cd src/Back_end
mvn spring-boot:run
```

#### 3. Import Data (2 phút)
- [ ] Mở SQL Server Management Studio
- [ ] Connect: localhost (sa/123456)
- [ ] Database: car_rental_platform
- [ ] File → Open → `src/Back_end/import-data.sql`
- [ ] Execute (F5)
- [ ] Thấy message: "Sample data imported successfully!"

#### 4. Test Kết Nối (1 phút)
- [ ] Mở: http://localhost:5173/test-backend
- [ ] Thấy "Backend Connected" (màu xanh)
- [ ] Click "Health Check" → Thấy JSON response
- [ ] Click "Test Users API" → Thấy danh sách users
- [ ] Click "Test Vehicles API" → Thấy danh sách vehicles

---

## 🎉 THÀNH CÔNG KHI

### Frontend
```
✅ Trang chủ load được
✅ Navbar hiển thị
✅ Dark mode toggle hoạt động
✅ Backend Test link có trong menu
```

### Backend
```
✅ Console log: "LuxeWay Backend is running"
✅ Không có error màu đỏ
✅ Port 8080 đang listen
✅ Health check trả về JSON
```

### Integration
```
✅ Backend status: "Connected" (màu xanh)
✅ Health check button hoạt động
✅ Users API trả về data
✅ Vehicles API trả về data
```

---

## 🔗 QUICK LINKS

### Kiểm Tra Frontend
- Homepage: http://localhost:5173/
- Test Page: http://localhost:5173/test-backend

### Kiểm Tra Backend
- Health: http://localhost:8080/api/v1/test/health
- Swagger: http://localhost:8080/api/v1/swagger-ui.html

---

## ⏱️ THỜI GIAN DỰ KIẾN

| Task | Time |
|------|------|
| Start Frontend | 2 phút |
| Start Backend | 5-10 phút |
| Import Data | 2 phút |
| Test | 1 phút |
| **TOTAL** | **10-15 phút** |

---

## 🐛 NẾU GẶP LỖI

### Frontend không chạy
```bash
cd src/Front_end
npm install
npm run dev
```

### Backend không chạy
1. Check Java: `java -version` (cần 17+)
2. Dùng IDE thay vì Maven
3. Check SQL Server đang chạy

### Backend Test page báo "Offline"
1. Backend chưa chạy → Start backend
2. Port 8080 bị chiếm → Đổi port trong application.yml
3. CORS issue → Check browser console (F12)

---

## 📞 CẦN TRỢ GIÚP?

1. Đọc: [START-PROJECT.md](START-PROJECT.md)
2. Đọc: [SUMMARY.md](SUMMARY.md)
3. Check: Browser console (F12)
4. Check: Backend logs trong IDE

---

## 🎯 MỤC TIÊU CUỐI CÙNG

Khi hoàn thành checklist này, bạn sẽ có:

✅ Frontend chạy trên http://localhost:5173/
✅ Backend chạy trên http://localhost:8080/api/v1
✅ Database có sample data
✅ Frontend kết nối được Backend
✅ Test page hiển thị data từ database

**→ DỰ ÁN CHẠY HOÀN CHỈNH! 🎉**

---

**Good luck! 🚀**