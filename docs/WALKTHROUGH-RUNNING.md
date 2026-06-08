# 🚗 LUXEWAY - DỰ ÁN ĐÃ KHỞI CHẠY & SỬA LỖI THÀNH CÔNG

Hệ thống LuxeWay (bao gồm Frontend, Backend, và Database) đã được khởi chạy thành công và lỗi treo trang chi tiết xe máy/ô tô (ví dụ: `VM-15`) đã được khắc phục triệt để.

---

## 📊 THÔNG TIN CÁC DỊCH VỤ

| Thành phần | Công nghệ | Địa chỉ truy cập / Cấu hình | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Frontend** | React + TypeScript + Vite | [http://localhost:5173/](http://localhost:5173/) | **ĐANG CHẠY** (Port 5173) |
| **Backend** | Spring Boot 3 + Java 21 | [http://localhost:8080/api/v1](http://localhost:8080/api/v1) | **ĐANG CHẠY** (Port 8080) |
| **Database** | MS SQL Server | `localhost:1433` (DB: `car_rental_platform`) | **ĐANG CHẠY** (Port 1433) |
| **Swagger UI** | OpenAPI 3 | [http://localhost:8080/api/v1/swagger-ui.html](http://localhost:8080/api/v1/swagger-ui.html) | **ĐANG CHẠY** |

---

## 🛠️ CHI TIẾT SỬA LỖI HỆ THỐNG (BUG FIX)

### 1. Nguyên nhân gây treo trang chi tiết xe (Ví dụ: `VM-15`)
- Dự án LuxeWay có hai luồng dữ liệu song song cho xe máy:
  1. Luồng xe chung (`vehicles` table / API `/api/v1/vehicles/...`): Lưu trữ các xe từ dữ liệu gốc (ID có tiền tố `VM-` cho xe máy và `VC-` cho ô tô).
  2. Luồng xe thuộc phân hệ riêng biệt (`motorbikes` table / API `/api/v1/motorbikes/...`): Chứa các xe máy thuộc phân hệ riêng (`BIKE-1`, `BIKE-2`, v.v.).
- Khi người dùng bấm vào xe `VM-15` từ trang chủ/marketplace, Frontend định tuyến đến `/motorbikes/VM-15` và gọi trực tiếp `motorbikeService.getById('VM-15')`.
- API gọi đến `/api/v1/motorbikes/VM-15` trả về lỗi `404 Not Found` do xe `VM-15` nằm trong bảng `vehicles` chứ không nằm trong bảng `motorbikes`.
- Frontend bắt lỗi này nhưng không xử lý giao diện lỗi, dẫn đến việc giao diện bị treo vô hạn ở trạng thái tải ("Đang tải thông tin xe máy...").

### 2. Các tệp đã sửa đổi để khắc phục lỗi:
1. **[motorbikeService.ts](file:///c:/Users/nguye/OneDrive/Tài%20liệu/Project_ALL_Mon/swp391-su26-ai-audit-project-swp391_se20a02_group-02/src/Front_end/src/services/motorbikeService.ts)**:
   - Cập nhật hàm `getById(id)`: Nếu ID bắt đầu bằng tiền tố `VM-` (xe máy thuộc bảng dùng chung), hàm sẽ tự động định tuyến yêu cầu API đến `/vehicles/${id}` thay vì `/motorbikes/${id}`.
2. **[carService.ts](file:///c:/Users/nguye/OneDrive/Tài%20li%E1%BB%87u/Project_ALL_Mon/swp391-su26-ai-audit-project-swp391_se20a02_group-02/src/Front_end/src/services/carService.ts)**:
   - Cập nhật hàm `getById(id)`: Nếu ID bắt đầu bằng tiền tố `VC-` (ô tô thuộc bảng dùng chung), tự động định tuyến đến `/vehicles/${id}`.
3. **[bookingService.ts](file:///c:/Users/nguye/OneDrive/Tài%20li%E1%BB%87u/Project_ALL_Mon/swp391-su26-ai-audit-project-swp391_se20a02_group-02/src/Front_end/src/services/bookingService.ts)**:
   - Hàm `create`: Nếu ID xe thuộc dạng dùng chung (`VM-` hoặc `VC-`), chuyển hướng yêu cầu tạo booking đến API chung `/bookings` thay vì `/motorbikes/bookings` hay `/cars/bookings` để tránh lỗi 404 từ backend.
   - Hàm `getByUser` & `getByOwner`: Thêm truy vấn song song đến `/bookings` và `/bookings/owner` để đảm bảo hiển thị cả các đơn đặt xe thuộc phân hệ chung trên bảng điều khiển của người dùng và chủ xe.

---

## 🚀 HƯỚNG DẪN DÀNH CHO BẠN
- Trải nghiệm đặt xe trực tiếp tại: [http://localhost:5173/motorbikes/VM-15](http://localhost:5173/motorbikes/VM-15)
- Bạn đã có thể duyệt qua toàn bộ xe khác trên Marketplace và tiến hành đặt xe mà không gặp lỗi treo.
- Dự án vẫn đang hoạt động ngầm. Nếu muốn tắt hoặc khởi động lại, bạn có thể yêu cầu tôi.
