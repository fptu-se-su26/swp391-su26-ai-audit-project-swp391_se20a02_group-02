# Changelog

## 1. Thông tin project

| Thông tin | Nội dung |
|---|---|
| Môn học | SWP212 |
| Mã môn học | SWP212 |
| Lớp | SE20A02 |
| Học kỳ | SU26 |
| Tên bài tập / Project | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Tên sinh viên | Nguyễn Bùi Quang Vinh |
| MSSV | DE190264 |
| Vai trò | Member - Frontend/Backend Integration |
| Ngày cập nhật | 2026-06-22 |

---

## 2. Tổng quan các giai đoạn

| Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 2026-06-09 | Tích hợp frontend xác thực với backend thật | Completed |
| Phase 02 | 2026-06-14 đến 2026-06-15 | Hoàn thiện đăng nhập, đăng ký, Google OAuth và luồng OTP | Completed |
| Phase 03 | 2026-06-17 | Sửa dữ liệu marketplace, ảnh xe, bộ lọc và trang chi tiết | Completed |
| Phase 04 | 2026-06-18 | Hoàn thiện luồng booking, phí giao xe và các dashboard | Completed |

---

## 3. Thay đổi chi tiết

| STT | Ngày | Loại | Nội dung thay đổi | File/Module liên quan | AI hỗ trợ |
|---:|---|---|---|---|---|
| 1 | 2026-06-09 | Feature | Tích hợp module xác thực frontend với API backend, thay dữ liệu mock bằng các endpoint đăng nhập, đăng ký, lấy hồ sơ và làm mới token | `services/authService.ts`, auth store, auth API | Có |
| 2 | 2026-06-14 | Feature | Hoàn thiện luồng quên mật khẩu: gửi OTP, xác minh OTP, nhận reset token tạm thời và đặt mật khẩu mới | `AuthPages.tsx`, `authService.ts`, `AuthController.java`, `AuthService.java` | Có |
| 3 | 2026-06-15 | Feature | Bổ sung xác minh email sau đăng ký bằng OTP 6 chữ số; thêm thời hạn OTP, giới hạn gửi lại, giới hạn số lần nhập sai và kích hoạt tài khoản sau xác minh | `AuthController.java`, `AuthService.java`, `AuthDTOs.java`, `AuthPages.tsx` | Có |
| 4 | 2026-06-15 | Bug fix | Sửa Google OAuth: kiểm tra audience của Google token, xử lý lỗi cấu hình và duy trì phiên bằng dữ liệu JWT khi API hồ sơ tạm thời không phản hồi | `AuthService.java`, `OAuth2RedirectHandler.tsx`, `AuthPages.tsx` | Có |
| 5 | 2026-06-17 | Bug fix | Sửa lỗi phiên đăng nhập bị mất khi `/auth/me` lỗi tạm thời; chuẩn hóa cấu trúc user và URL ảnh đại diện từ backend | `authService.ts`, auth store | Có |
| 6 | 2026-06-17 | Bug fix | Sửa API marketplace trả danh sách rỗng ở truy vấn rộng bằng cơ chế fallback lấy xe `AVAILABLE` theo loại xe | `VehicleService.java`, `VehicleRepository.java` | Có |
| 7 | 2026-06-17 | Feature/Bug fix | Chuẩn hóa danh sách ảnh xe: ưu tiên ảnh chính, sắp xếp theo thứ tự, dùng thumbnail khi không có gallery; bổ sung slideshow trên thẻ xe | `VehicleService.java`, `VehicleCard.tsx`, `vehicleService.ts` | Có |
| 8 | 2026-06-17 | Feature | Cải tiến marketplace và trang chi tiết: điều hướng theo loại xe, hiển thị thông số, badge, wishlist, giá và trạng thái rõ ràng hơn | `MarketplacePage.tsx`, `VehicleCard.tsx`, `CarDetails.tsx`, `MotorbikeDetails.tsx` | Có |
| 9 | 2026-06-18 | Feature | Mở rộng booking wizard thành luồng nhiều bước; bổ sung bảo hiểm, dịch vụ xe, mã giảm giá, phương thức thanh toán và bảng tổng tiền VND | `BookingWizardPage.tsx`, `bookingService.ts` | Có |
| 10 | 2026-06-18 | Feature/Bug fix | Đồng bộ tọa độ điểm nhận/trả, quãng đường, thời gian và phí giao xe từ frontend xuống backend; backend tự tính fallback khi thiếu phí ước tính | `BookingDTOs.java`, `Booking.java`, `BookingService.java`, Google Maps service | Có |
| 11 | 2026-06-18 | Feature | Nâng cấp Customer/Owner/Admin Dashboard, liên kết dữ liệu API, trạng thái booking/xe/người dùng và các thao tác quản trị | `CustomerDashboard.tsx`, `OwnerDashboard.tsx`, `AdminDashboard.tsx` | Có |
| 12 | 2026-06-18 | Bug fix | Mở rộng CORS cho frontend cấu hình qua môi trường, Firebase và miền ngrok; bổ sung public mapping cần thiết cho API bản đồ | `SecurityConfig.java`, `application.yml` | Có |

---

## 4. Kết quả phát triển đã hoàn thành

| STT | Chức năng | Kết quả |
|---:|---|---|
| 1 | Đăng nhập/đăng ký dùng backend thật | Frontend gửi request thật, lưu access token, refresh token và user |
| 2 | Xác minh email bằng OTP | Tài khoản mới phải xác minh trước khi đăng nhập |
| 3 | Quên và đặt lại mật khẩu | Có OTP dùng một lần và reset token có thời hạn |
| 4 | Google OAuth | Có kiểm tra token, xử lý lỗi và đồng bộ trạng thái đăng nhập |
| 5 | Marketplace | Dữ liệu xe, ảnh, bộ lọc và điều hướng trang chi tiết ổn định hơn |
| 6 | Booking | Có nhiều bước, dịch vụ bổ sung, phí giao xe và tổng tiền |
| 7 | Dashboard | Các màn hình khách hàng, chủ xe và quản trị được mở rộng |

---

## 5. Bài học rút ra

```text
Khi tích hợp frontend và backend, cần kiểm tra đồng thời endpoint, cấu trúc ApiResponse, kiểu dữ liệu,
trạng thái lưu trên trình duyệt và tình huống API lỗi tạm thời. Với OTP và OAuth, ngoài việc làm cho
chức năng chạy được còn phải xử lý thời hạn, giới hạn thử, xác minh token và không để lỗi mạng làm
mất phiên người dùng. Đối với booking và marketplace, dữ liệu hiển thị cần thống nhất với entity/DTO
backend để tránh sai ảnh, sai giá, thiếu tọa độ hoặc danh sách xe rỗng.
```

---

## 6. Cam kết cập nhật Changelog

Em cam kết các nội dung trên phản ánh những thay đổi phát triển và sửa lỗi có thể đối chiếu trong mã nguồn LuxeWay.

| Đại diện sinh viên | Ngày xác nhận |
|---|---|
| Nguyễn Bùi Quang Vinh - DE190264 | 2026-06-22 |
