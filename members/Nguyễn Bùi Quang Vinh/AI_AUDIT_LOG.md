# AI Audit Log

## 1. Thông tin chung

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
| Thời gian ghi nhận | 2026-05-10 đến 2026-06-28 |

---

## 2. Công cụ AI đã sử dụng

- [x] ChatGPT / Codex
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Microsoft Copilot
- [ ] Perplexity

---

## 3. Mục tiêu sử dụng AI

```text
Em sử dụng AI để hỗ trợ đọc và đối chiếu code React/TypeScript với Spring Boot, tìm nguyên nhân
lỗi tích hợp, đề xuất cách sửa và rà soát tác động giữa frontend, backend, DTO, entity, database
và API contract.

Phạm vi ghi nhận trong file này là toàn bộ quá trình phát triển/fix bug từ lúc bắt đầu project
đến ngày 2026-06-28. Nội dung chỉ tập trung vào phát triển phần mềm: UI/UX, authentication,
OTP/OAuth, marketplace, booking, dashboard, merge frontend/backend, KYC/eKYC, WebSocket,
hợp đồng điện tử, payment/VNPay, invoice, dispute/refund và các lỗi còn đang xử lý.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-05-10 đến 2026-05-21 |
| Mục đích | Xây dựng nền tảng frontend và UI/UX |
| Phần việc | Landing page, marketplace, vehicle detail, dashboard layout |
| Mức độ sử dụng | Hỗ trợ vừa |

#### Yêu cầu đã dùng

```text
Hỗ trợ thiết kế cấu trúc giao diện LuxeWay, chia layout, tạo các màn hình nền tảng cho landing,
marketplace, trang chi tiết xe và dashboard theo vai trò người dùng.
```

#### Kết quả AI gợi ý và phần đã sử dụng

```text
AI hỗ trợ đề xuất cấu trúc component, cách chia trang và các khu vực giao diện chính. Em chọn
phần phù hợp với yêu cầu LuxeWay, điều chỉnh lại style, route và dữ liệu hiển thị để thống nhất
với project.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Frontend | `src/Front_end/src/pages`, `src/Front_end/src/components`, dashboard layouts |

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-05-24 đến 2026-05-31 |
| Mục đích | Tích hợp backend Spring Boot và các module nền |
| Phần việc | Vehicle API, marketplace filters, security, chat persistence, payment/invoice ban đầu, admin analytics |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Kết quả

```text
Project được bổ sung các phần backend/service/API để frontend có dữ liệu thật hơn, đồng thời
các module như chat, payment/invoice ban đầu, employee/admin analytics và OTP được rà soát
theo hướng có thể tích hợp với frontend.
```

#### Phần sinh viên kiểm tra/cải tiến

```text
Em đối chiếu controller/service/repository với frontend service, kiểm tra dữ liệu trả về và sửa
các điểm không khớp type hoặc luồng sử dụng thực tế.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Backend | `src/Back_end/src/main/java/com/luxeway` |
| Frontend | Marketplace service, dashboard service, payment/invoice screens |

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-04 đến 2026-06-08 |
| Mục đích | Review bảo mật và refactor domain xe |
| Phần việc | Security config, admin dashboard, Car/Motorbike split, cleanup credential |
| Mức độ sử dụng | Hỗ trợ phân tích |

#### Kết quả

```text
AI hỗ trợ rà soát cấu hình bảo mật, các điểm có nguy cơ lộ credential và cách tách domain xe
để frontend/backend xử lý Car và Motorbike rõ ràng hơn.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Backend | Security config, vehicle domain, OAuth/Gmail environment config |
| Frontend | Vehicle detail pages, admin dashboard |

---

### Lần sử dụng AI số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-09 |
| Mục đích | Tích hợp frontend authentication với backend |
| Phần việc | Login, register, token, user session |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Yêu cầu đã dùng

```text
Rà soát auth frontend đang dùng mock, chuyển sang API backend thật và chuẩn hóa việc lưu
access token, refresh token và thông tin user.
```

#### Kết quả AI gợi ý và phần đã sử dụng

```text
AI gợi ý tách hàm unwrap ApiResponse, ánh xạ User và thay các hàm mock bằng endpoint thật.
Em sử dụng cấu trúc này, đối chiếu với AuthDTOs/AuthController và điều chỉnh kiểu dữ liệu,
URL ảnh, role và khóa localStorage cho phù hợp LuxeWay.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Frontend | `src/Front_end/src/services/authService.ts` |
| Frontend | `src/Front_end/src/store/index.ts` |
| Backend | `src/Back_end/src/main/java/com/luxeway/controller/AuthController.java` |

---

### Lần sử dụng AI số 5

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-14 đến 2026-06-15 |
| Mục đích | Hoàn thiện OTP, quên mật khẩu và Google OAuth |
| Phần việc | Forgot password, verify OTP, reset password, email verification, OAuth session |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Kết quả

```text
Luồng frontend gọi backend để gửi OTP, xác minh mã, nhận reset token tạm thời và đổi mật khẩu.
Tài khoản đăng ký local cần xác minh email trước khi sử dụng. Google OAuth được kiểm tra
audience và frontend xử lý trạng thái phiên người dùng ổn định hơn.
```

#### Phần sinh viên kiểm tra/cải tiến

```text
Em kiểm tra payload giữa frontend và backend, bổ sung confirmPassword, xử lý lỗi OTP hết hạn,
giới hạn số lần thử/gửi lại và bảo đảm frontend không còn so sánh với mã OTP mock cố định.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Frontend | `AuthPages.tsx`, `authService.ts`, `OAuth2RedirectHandler.tsx` |
| Backend | `AuthController.java`, `AuthService.java`, `AuthDTOs.java` |

---

### Lần sử dụng AI số 6

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-17 đến 2026-06-18 |
| Mục đích | Sửa marketplace, ảnh xe, booking và dashboard |
| Phần việc | Vehicle search, filters, gallery, booking wizard, route data, delivery fee, dashboard data |
| Mức độ sử dụng | Hỗ trợ phân tích/debug |

#### Kết quả

```text
Backend có fallback cho truy vấn inventory rộng để không trả danh sách rỗng ngoài ý muốn.
Ảnh xe được sắp xếp theo ảnh chính và sortOrder; thumbnail được dùng khi gallery trống.
Booking wizard được mở rộng thành nhiều bước, có route data, extras, delivery fee và tổng tiền VND.
Dashboard customer/owner/admin được kết nối dữ liệu và thao tác theo vai trò rõ hơn.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Backend | `VehicleService.java`, `VehicleRepository.java`, `BookingService.java`, `BookingDTOs.java` |
| Frontend | `VehicleCard.tsx`, marketplace/detail pages, `BookingWizardPage.tsx`, dashboard pages |

---

### Lần sử dụng AI số 7

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-22 đến 2026-06-24 |
| Mục đích | Merge frontend/backend và sửa lỗi sau merge |
| Phần việc | Merge module, H2 test, KYC submit/reset, STOMP, ESLint, Vite advisory |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Kết quả

```text
Frontend và backend được hợp nhất theo module thay vì copy hàng loạt. Các nhóm chức năng được
rà lại gồm auth, documents/eKYC, booking/tracking, map/delivery, AI, admin, payment, WebSocket
và database migration/seeding. Sau merge, các lỗi quan trọng như H2 initializer, thiếu endpoint
KYC submit/reset, STOMP handshake, thiếu ESLint và Vite advisory được xử lý theo từng nhóm.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Frontend | `src/Front_end`, package/config, documents/tracking/messaging modules |
| Backend | `src/Back_end`, test config, H2 migration, KYC/WebSocket controllers/services |

---

### Lần sử dụng AI số 8

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-25 đến 2026-06-28 |
| Mục đích | Hợp đồng điện tử, payment/VNPay và bug KYC/booking |
| Phần việc | Digital contract, VNPay checkout, invoice, refund/dispute, admin timeline, KYC sync, booking legacy issue |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Kết quả

```text
Project được bổ sung workflow hợp đồng điện tử từ booking snapshot, ký hợp đồng và xem hợp đồng
từ dashboard. Payment được mở rộng với VNPay, return/callback, invoice, payment history và ràng
buộc phải ký hợp đồng trước khi checkout. Refund/dispute và admin operation timeline được thêm
để quản trị luồng sau thanh toán. Lỗi admin đã verification KYC nhưng customer chưa hiển thị
verified được sửa bằng cách đồng bộ trạng thái KYC trong auth response, store và documents UI.
```

#### Vấn đề còn đang xử lý

```text
Một số booking legacy của motorbike có thể tạo booking confirmed nhưng contract/payment báo
Booking not found; dashboard có thể hiển thị tổng tiền/deposit bằng 0đ do luồng booking cũ
chưa đồng bộ với mapper/contract/payment mới.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Backend | Digital contract, payment/VNPay, invoice, dispute/refund, admin operation timeline, auth/KYC services |
| Frontend | Contract pages, payment checkout, payment history, documents/KYC UI |

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  | x |  |  | Em xác định phạm vi và tiêu chí |
| Code frontend |  |  | x |  | AI hỗ trợ đọc luồng và đề xuất sửa |
| Code backend |  |  | x |  | AI hỗ trợ DTO/service/security |
| Debug tích hợp |  |  | x |  | Đối chiếu request/response, state và database |
| Thiết kế UI |  | x |  |  | AI gợi ý cấu trúc, em điều chỉnh |
| Viết báo cáo |  |  | x |  | Tổng hợp từ minh chứng mã nguồn |

---

## 6. Lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế | Cách phát hiện | Cách xử lý |
|---:|---|---|---|
| 1 | Có thể suy đoán sai cấu trúc `ApiResponse` | So với controller và dữ liệu trả về | Viết hàm unwrap và kiểm tra từng endpoint |
| 2 | Có thể đề xuất field không tồn tại trong DTO/entity | TypeScript/Java báo lỗi hoặc đọc model | Đồng bộ type, DTO và entity trước khi dùng |
| 3 | Có thể làm mất phiên khi API hồ sơ lỗi | Kiểm tra luồng khởi tạo auth | Giữ cached session và chỉ logout khi token thật sự không hợp lệ |
| 4 | Có thể dùng giải pháp OTP đơn giản chưa đủ an toàn | Review bảo mật | Thêm thời hạn, rate limit, số lần thử, hash và one-time use |
| 5 | Có thể đề xuất merge quá rộng | Đối chiếu module và build/test | Chia theo nhóm frontend/backend và checkpoint |
| 6 | Có thể bỏ sót luồng cũ sau khi thêm contract/payment mới | Test browser và so sánh API | Ghi nhận booking legacy issue để sửa mapper/lookup |

---

## 7. Kiểm chứng kết quả AI

```text
Em kiểm chứng bằng cách đọc diff và mã nguồn của các module liên quan, đối chiếu frontend service
với backend controller/service/DTO, kiểm tra dữ liệu lưu trong store, kiểm tra các trường mới có
được ánh xạ đầy đủ hay không và chạy các checkpoint build/test phù hợp với từng giai đoạn.
```

---

## 8. Đóng góp cá nhân

```text
Nguyễn Bùi Quang Vinh - DE190264 tham gia tích hợp và hoàn thiện các luồng frontend/backend,
đặc biệt là authentication, OTP, OAuth, marketplace, booking, merge frontend/backend, KYC/eKYC,
hợp đồng điện tử và payment. Em chịu trách nhiệm đọc lại thay đổi, điều chỉnh theo cấu trúc
LuxeWay và ghi nhận minh bạch phạm vi AI đã hỗ trợ.
```

---

## 9. Cam kết học thuật

Em cam kết nội dung AI hỗ trợ được ghi nhận trung thực; có khả năng giải thích các thay đổi và chịu trách nhiệm với sản phẩm cuối cùng.

| Đại diện sinh viên | Ngày xác nhận |
|---|---|
| Nguyễn Bùi Quang Vinh - DE190264 | 2026-06-28 |
