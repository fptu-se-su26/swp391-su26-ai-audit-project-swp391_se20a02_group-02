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
| Thời gian cập nhật | 2026-05-10 đến 2026-06-28 |

---

## 2. Tổng quan các giai đoạn

| Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 2026-05-10 đến 2026-05-21 | Khởi tạo project, xây dựng UI/UX nền tảng, landing page, marketplace, vehicle details và dashboard layout | Completed |
| Phase 02 | 2026-05-24 đến 2026-05-31 | Tích hợp Spring Boot, bảo mật, chat persistence, payment/invoice ban đầu, employee/admin analytics và OTP | Completed |
| Phase 03 | 2026-06-04 đến 2026-06-08 | Hoàn thiện security, admin dashboard, tách Car/Motorbike, cleanup credential và cấu hình OAuth/Gmail an toàn hơn | Completed |
| Phase 04 | 2026-06-09 đến 2026-06-18 | Tích hợp auth thật, OTP, Google OAuth, marketplace, ảnh xe, booking wizard, phí giao xe và dashboard | Completed |
| Phase 05 | 2026-06-22 đến 2026-06-24 | Merge frontend/backend theo module, sửa lỗi H2, KYC submit/reset, STOMP WebSocket, ESLint và security advisory frontend | Completed |
| Phase 06 | 2026-06-25 đến 2026-06-28 | Bổ sung hợp đồng điện tử, payment/VNPay, invoice, refund/dispute, admin operation timeline và sửa đồng bộ KYC admin/customer | In progress |

---

## 3. Thay đổi chi tiết

| STT | Ngày/Giai đoạn | Loại | Nội dung thay đổi | File/Module liên quan | AI hỗ trợ |
|---:|---|---|---|---|---|
| 1 | 2026-05-10 đến 2026-05-21 | Feature | Xây dựng nền tảng giao diện LuxeWay: landing page, marketplace, vehicle detail, dashboard layout và các component dùng lại | `src/Front_end`, pages, components, layouts | Có |
| 2 | 2026-05-24 đến 2026-05-25 | Feature | Tích hợp Spring Boot backend với frontend, bổ sung marketplace filters, thống kê và API dữ liệu xe | `src/Back_end`, vehicle API, marketplace service | Có |
| 3 | 2026-05-28 | Feature/Bug fix | Cải tiến dashboard UI, sửa TypeScript, bổ sung owner image uploader và tài liệu hóa thay đổi | Dashboard pages, uploader, frontend types | Có |
| 4 | 2026-05-31 | Feature/Security | Hardening bảo mật, chat persistence, payment/invoice ban đầu, employee management, OTP và analytics | Security config, chat, payment, invoice, admin analytics | Có |
| 5 | 2026-06-04 đến 2026-06-08 | Refactor/Security | Review toàn dự án, sửa cấu hình bảo mật, tách Vehicle thành Car/Motorbike, dọn credential OAuth/Gmail bị lộ | Security config, vehicle domain, environment config | Có |
| 6 | 2026-06-09 | Feature | Tích hợp module xác thực frontend với API backend thật, thay dữ liệu mock bằng login/register/profile/refresh token | `authService.ts`, auth store, `AuthController.java` | Có |
| 7 | 2026-06-14 đến 2026-06-15 | Feature | Hoàn thiện forgot password bằng OTP, reset token tạm thời, xác minh email sau đăng ký và giới hạn thử/gửi lại OTP | `AuthPages.tsx`, `AuthService.java`, `AuthDTOs.java` | Có |
| 8 | 2026-06-15 | Bug fix | Sửa Google OAuth: kiểm tra audience, xử lý lỗi cấu hình và duy trì phiên từ JWT khi profile API lỗi tạm thời | `AuthService.java`, `OAuth2RedirectHandler.tsx` | Có |
| 9 | 2026-06-17 | Bug fix | Sửa marketplace trả danh sách rỗng ở truy vấn rộng bằng fallback xe `AVAILABLE`, chuẩn hóa gallery/thumbnail | `VehicleService.java`, `VehicleRepository.java`, `VehicleCard.tsx` | Có |
| 10 | 2026-06-17 đến 2026-06-18 | Feature | Cải tiến trang marketplace/vehicle detail, routing Car/Motorbike, specs, badge, wishlist, ảnh và trạng thái xe | Marketplace pages, detail pages, vehicle types | Có |
| 11 | 2026-06-18 | Feature/Bug fix | Mở rộng booking wizard nhiều bước, đồng bộ pickup/dropoff, tọa độ, route distance, delivery fee, extras và tổng tiền VND | `BookingWizardPage.tsx`, `BookingService.java`, `BookingDTOs.java` | Có |
| 12 | 2026-06-18 | Feature | Nâng cấp Customer/Owner/Admin Dashboard, kết nối dữ liệu API và thao tác theo vai trò | Customer/Owner/Admin dashboard modules | Có |
| 13 | 2026-06-22 | Refactor/Merge | Merge frontend theo module: auth, landing/i18n, eKYC, tracking, MapLibre, AI admin, KYC review, documents dashboard và Google Maps marketplace | `src/Front_end` | Có |
| 14 | 2026-06-22 | Refactor/Merge | Merge backend theo module: auth/JWT/OTP/OAuth, documents/eKYC, booking/tracking, maps/delivery, AI, admin, payment, WebSocket, migration/seeding | `src/Back_end` | Có |
| 15 | 2026-06-23 | Bug fix | Sửa test infrastructure: H2 database initialization, schema tương thích test, cấu hình JWT test và conditional bean cho module phụ thuộc ngoài | Backend test config, H2 migration | Có |
| 16 | 2026-06-23 | Bug fix | Bổ sung/sửa contract API KYC submit/reset để frontend và backend dùng cùng endpoint | KYC/eKYC controller, user document service, frontend documents | Có |
| 17 | 2026-06-23 | Bug fix | Sửa Messenger và Delivery Tracker dùng STOMP client đúng handshake WebSocket | Messaging service, tracking service, STOMP client | Có |
| 18 | 2026-06-23 đến 2026-06-24 | Quality/Security | Khôi phục ESLint frontend và nâng cấp dependency để xử lý Vite security advisory | Frontend package, ESLint config | Có |
| 19 | 2026-06-25 | Feature | Bổ sung workflow hợp đồng điện tử thuê xe: tạo hợp đồng từ booking snapshot, ký hợp đồng, lưu hash và xem hợp đồng từ dashboard | Digital contract backend/frontend | Có |
| 20 | 2026-06-25 | Feature | Hoàn thiện payment flow với VNPay, ràng buộc phải ký hợp đồng trước checkout, xử lý return/callback, invoice và payment history | Payment controller/service, VNPay, invoice, frontend checkout | Có |
| 21 | 2026-06-25 | Feature | Bổ sung refund/dispute operation flow và admin booking operation timeline để theo dõi xử lý sau thanh toán | Dispute/refund modules, admin timeline drawer | Có |
| 22 | 2026-06-27 đến 2026-06-28 | Bug fix | Sửa lỗi admin đã verification KYC nhưng customer chưa hiển thị verified bằng cách đồng bộ trạng thái KYC trong auth response/store/documents UI | `AuthDTOs.java`, `AuthService.java`, `AdminService.java`, `authService.ts`, `MyDocuments.tsx` | Có |
| 23 | 2026-06-28 | Investigation | Phân tích lỗi booking legacy motorbike tạo booking confirmed nhưng contract/payment báo `Booking not found`, dashboard hiển thị tổng tiền/deposit bằng 0 | Booking mapper, digital contract lookup, legacy motorbike booking flow | Có |

---

## 4. Kết quả phát triển đã hoàn thành

| STT | Chức năng | Kết quả |
|---:|---|---|
| 1 | UI/UX nền tảng | Có landing, marketplace, chi tiết xe, dashboard và layout dùng lại |
| 2 | Authentication | Đăng nhập/đăng ký dùng API thật, lưu token, refresh token và user session |
| 3 | OTP và email verification | Có xác minh email, quên mật khẩu, reset password, OTP có thời hạn và giới hạn thử |
| 4 | Google OAuth | Có kiểm tra token, xử lý lỗi cấu hình và đồng bộ trạng thái đăng nhập |
| 5 | Marketplace | Dữ liệu xe, ảnh, bộ lọc, route Car/Motorbike và fallback truy vấn ổn định hơn |
| 6 | Booking | Có booking wizard nhiều bước, extras, phí giao xe, route data và tổng tiền VND |
| 7 | Dashboard | Customer/Owner/Admin dashboard được mở rộng và kết nối API tốt hơn |
| 8 | Merge frontend/backend | Đã hợp nhất phần chính theo module, giữ các chức năng ổn định và bổ sung phần thiếu |
| 9 | KYC/eKYC | Có upload/submit/reset/review và đã sửa lỗi đồng bộ trạng thái admin/customer |
| 10 | WebSocket/STOMP | Messenger và tracking được chuyển sang STOMP client phù hợp hơn |
| 11 | Hợp đồng điện tử | Có workflow xem/ký hợp đồng từ booking, lưu snapshot/hash |
| 12 | Payment/VNPay | Có checkout VNPay, return/callback, invoice, payment history và ràng buộc ký hợp đồng |
| 13 | Refund/Dispute | Có module xử lý dispute/refund và timeline vận hành cho admin |

---

## 5. Vấn đề còn đang xử lý

| STT | Vấn đề | Trạng thái |
|---:|---|---|
| 1 | Một số booking legacy của motorbike có thể tạo confirmed booking nhưng contract/payment không tìm thấy booking trong luồng hợp nhất | Đang phân tích/sửa tiếp |
| 2 | Một số mapper booking cũ chưa trả đúng total amount/deposit nên dashboard có thể hiển thị 0đ | Đang phân tích/sửa tiếp |
| 3 | Cần tiếp tục smoke test toàn bộ flow booking -> ký hợp đồng -> thanh toán -> invoice -> dispute/refund trên dữ liệu thật | Cần kiểm thử thêm |

---

## 6. Bài học rút ra

```text
Khi phát triển một hệ thống thuê xe có nhiều module liên quan, việc sửa một chức năng không thể
chỉ nhìn ở giao diện. Cần đối chiếu từ UI, service frontend, API contract, controller, DTO,
service backend, entity và dữ liệu trả về. Các lỗi như KYC đã duyệt nhưng customer chưa thấy
verified, booking tạo được nhưng hợp đồng/payment không tìm thấy booking, hoặc tổng tiền bị 0đ
đều xuất phát từ việc các luồng cũ và luồng mới chưa dùng cùng contract dữ liệu.

Sau quá trình hợp nhất frontend/backend, bài học quan trọng nhất là phải chia module nhỏ,
kiểm tra checkpoint sau từng nhóm chức năng và giữ lại các luồng đã chạy ổn trong lúc bổ sung
phần mới như hợp đồng điện tử, VNPay, invoice và dispute/refund.
```

---

## 7. Cam kết cập nhật Changelog

Em cam kết các nội dung trên phản ánh những thay đổi phát triển và sửa lỗi có thể đối chiếu trong mã nguồn LuxeWay.

| Đại diện sinh viên | Ngày xác nhận |
|---|---|
| Nguyễn Bùi Quang Vinh - DE190264 | 2026-06-28 |
