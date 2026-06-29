# Prompt Log

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
| Thời gian ghi nhận | 2026-05-10 đến 2026-06-28 |
| Ngày cập nhật gần nhất | 2026-06-28 |

---

## 2. Mục đích Prompt Log

```text
File này ghi lại các yêu cầu quan trọng đã dùng khi phát triển và sửa lỗi website LuxeWay với AI.
Nội dung tập trung vào phân tích code, tích hợp frontend/backend, sửa luồng xác thực, marketplace,
booking, dashboard, merge frontend/backend, KYC/eKYC, hợp đồng điện tử, payment/VNPay,
invoice và dispute/refund.
```

---

## 3. Công cụ AI đã sử dụng

- [x] ChatGPT / Codex
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Microsoft Copilot

---

## 4. Bảng tổng hợp prompt phát triển và sửa lỗi

> Các prompt được ghi ở dạng tóm tắt đúng mục tiêu kỹ thuật, chỉ tập trung vào phát triển và sửa lỗi dự án.

| STT | Ngày/Giai đoạn | Mục đích | Prompt tóm tắt | Kết quả đã áp dụng |
|---:|---|---|---|---|
| 1 | 2026-05-10 đến 2026-05-21 | Xây dựng UI/UX nền | Hỗ trợ chia cấu trúc giao diện LuxeWay, landing, marketplace, vehicle detail và dashboard layout | Có nền frontend, component/layout và các màn hình chính ban đầu |
| 2 | 2026-05-24 đến 2026-05-31 | Tích hợp backend/module nền | Rà soát Spring Boot API, marketplace filters, security, chat, payment/invoice ban đầu và analytics | Backend/frontend bắt đầu kết nối dữ liệu thật hơn, các module nền được mở rộng |
| 3 | 2026-06-04 đến 2026-06-08 | Refactor và bảo mật | Review project, tách Car/Motorbike, sửa admin dashboard, kiểm tra credential OAuth/Gmail | Domain xe rõ hơn, cấu hình bảo mật và credential được dọn |
| 4 | 2026-06-09 | Tích hợp authentication | Kiểm tra auth frontend đang dùng mock và chuyển sang gọi API Spring Boot thật | Hoàn thiện login, register, token storage, `/auth/me`, refresh token |
| 5 | 2026-06-14 | Sửa quên mật khẩu | Kiểm tra toàn bộ forgot-password/OTP/reset-password và nối frontend với backend | Gửi OTP thật, verify OTP, nhận reset token và đổi mật khẩu |
| 6 | 2026-06-15 | Phát triển xác minh email | Bổ sung OTP sau đăng ký, chặn đăng nhập khi chưa xác minh và xử lý gửi lại OTP | Có trang nhập OTP, OTP hết hạn, giới hạn thử và kích hoạt user |
| 7 | 2026-06-15 | Sửa Google OAuth | Tìm nguyên nhân đăng nhập Google không ổn định và sửa đồng bộ phiên người dùng | Kiểm tra audience, hiển thị lỗi cấu hình, fallback từ JWT |
| 8 | 2026-06-17 | Sửa marketplace | Kiểm tra vì sao danh sách xe/ảnh xe không hiển thị đúng giữa frontend và backend | Fallback xe `AVAILABLE`, chuẩn hóa gallery và thumbnail |
| 9 | 2026-06-17 | Cải tiến vehicle card | Làm thẻ xe rõ thông tin hơn và cho phép xem nhiều ảnh/đi tới đúng trang chi tiết | Slideshow ảnh, badge, specs, wishlist, routing car/motorbike |
| 10 | 2026-06-18 | Hoàn thiện booking | Rà soát booking wizard, tổng tiền, dịch vụ bổ sung, thanh toán và dữ liệu giao xe | Luồng nhiều bước, giá VND, extras, tọa độ và delivery fee |
| 11 | 2026-06-18 | Nâng cấp dashboard | Kết nối các dashboard với service/API và hoàn thiện thao tác theo vai trò | Customer/Owner/Admin Dashboard có dữ liệu và thao tác rõ hơn |
| 12 | 2026-06-22 | Merge frontend | Hợp nhất frontend theo kế hoạch, giữ chức năng ổn định và bổ sung phần thiếu từ các folder phụ | Auth/landing/i18n/eKYC/tracking/MapLibre/AI/KYC/documents/Google Maps được hợp nhất |
| 13 | 2026-06-22 | Merge backend | Hợp nhất backend theo module, không copy hàng loạt, bảo toàn Google Maps và đối chiếu các file khác nhau | Auth, KYC, booking, tracking, maps, AI, admin, payment, WebSocket, migration/seeding được merge |
| 14 | 2026-06-23 | Fix sau merge | Lên kế hoạch và sửa các lỗi H2, Vite advisory, ESLint, KYC submit/reset, STOMP và working tree cũ | H2 initializer, KYC contract, STOMP client, ESLint và dependency được xử lý |
| 15 | 2026-06-25 | Hợp đồng điện tử | Thiết kế và hiện thực workflow hợp đồng điện tử cho booking thuê xe | Có contract snapshot, xem/ký hợp đồng và lưu hash |
| 16 | 2026-06-25 | Payment/VNPay | Hoàn thiện thanh toán, ràng buộc ký hợp đồng trước checkout, xử lý callback/return và invoice | Có VNPay checkout, payment history, invoice và điều kiện hợp đồng |
| 17 | 2026-06-25 | Refund/dispute/admin ops | Bổ sung luồng dispute/refund và timeline vận hành cho admin | Admin có operation timeline, dispute/refund có service/API/UI |
| 18 | 2026-06-27 đến 2026-06-28 | Fix KYC sync | Kiểm tra lỗi admin verified nhưng customer chưa thấy verified | Đồng bộ trạng thái KYC trong auth response, store và documents UI |
| 19 | 2026-06-28 | Phân tích booking legacy | Kiểm tra lỗi booking confirmed nhưng contract/payment báo `Booking not found` và dashboard 0đ | Xác định nghi vấn ở luồng booking legacy/mapping chưa đồng bộ với contract/payment mới |

---

## 5. Prompt chi tiết tiêu biểu

### Prompt số 1 - Tích hợp authentication thật

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-09 |
| Phần việc | Frontend/Backend Authentication |
| Mức độ sử dụng AI | Hỗ trợ phân tích và hiện thực |

#### Prompt tóm tắt

```text
Rà soát luồng đăng nhập và đăng ký của LuxeWay. Frontend hiện còn dùng dữ liệu mock.
Hãy kết nối với API backend thật, xử lý ApiResponse, lưu access token/refresh token,
chuẩn hóa dữ liệu user và giữ đúng trạng thái đăng nhập.
```

#### Kết quả AI gợi ý

```text
AI xác định authService cần thay các hàm mock bằng request tới /auth/login, /auth/register,
/auth/me và /auth/refresh; đồng thời tách logic unwrap response, chuyển đổi User và lưu token.
```

#### Phần đã áp dụng và tự kiểm tra

```text
Em áp dụng cấu trúc service thật, đối chiếu DTO backend với type frontend, kiểm tra các khóa
localStorage và điều chỉnh xử lý lỗi để lỗi mạng tạm thời không tự động xóa phiên.
```

---

### Prompt số 2 - OTP xác minh email và đặt lại mật khẩu

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-14 đến 2026-06-15 |
| Phần việc | Authentication Security |
| Mức độ sử dụng AI | Hỗ trợ nhiều |

#### Prompt tóm tắt

```text
Hoàn thiện hai luồng OTP: xác minh email sau đăng ký và quên mật khẩu.
OTP phải có 6 chữ số, thời hạn, giới hạn gửi lại, giới hạn nhập sai; OTP/reset token
không được tái sử dụng. Frontend cần có form nhập mã và thông báo lỗi rõ ràng.
```

#### Kết quả đã áp dụng

```text
Backend có endpoint gửi/xác minh email OTP, phát reset token sau khi xác minh OTP quên mật khẩu,
đánh dấu OTP dùng một lần và kích hoạt tài khoản. Frontend có trang verify email, forgot password
và gọi đúng endpoint thay vì dùng mã mock.
```

---

### Prompt số 3 - Marketplace và ảnh xe

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-17 |
| Phần việc | Vehicle Marketplace |
| Mức độ sử dụng AI | Hỗ trợ phân tích lỗi |

#### Prompt tóm tắt

```text
Kiểm tra lỗi marketplace đôi lúc trả danh sách rỗng và ảnh xe hiển thị sai thứ tự.
Sửa backend để truy vấn rộng vẫn trả xe AVAILABLE; chuẩn hóa thumbnail/gallery.
Frontend cần xem được nhiều ảnh và điều hướng đúng chi tiết ô tô hoặc xe máy.
```

#### Kết quả đã áp dụng

```text
VehicleService có fallback cho truy vấn không kèm bộ lọc, sắp xếp ảnh chính trước,
dùng thumbnail khi gallery trống. VehicleCard có slideshow và route theo vehicleType.
```

---

### Prompt số 4 - Booking và phí giao xe

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-18 |
| Phần việc | Booking Flow |
| Mức độ sử dụng AI | Hỗ trợ thiết kế và debug |

#### Prompt tóm tắt

```text
Rà soát booking wizard từ chọn ngày đến thanh toán. Đồng bộ điểm nhận/trả, tọa độ,
quãng đường, thời gian và phí giao xe với backend. Tính lại tổng tiền theo loại xe,
bảo hiểm, dịch vụ bổ sung, coupon và phí dịch vụ.
```

#### Kết quả đã áp dụng

```text
Booking request lưu thêm dữ liệu tuyến đường; backend có logic xác định delivery fee;
frontend hiển thị bảng giá VND, dịch vụ riêng cho ô tô/xe máy và luồng nhiều bước.
```

---

### Prompt số 5 - Merge frontend/backend

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-22 đến 2026-06-24 |
| Phần việc | Consolidate Frontend/Backend |
| Mức độ sử dụng AI | Hỗ trợ nhiều |

#### Prompt tóm tắt

```text
Rà soát các folder frontend/backend phụ, xác định chức năng đang thiếu, merge theo từng module
và giữ các chức năng đã chạy ổn. Sau merge phải kiểm tra build/test, API contract, KYC,
WebSocket, H2 test, ESLint và dependency security.
```

#### Kết quả đã áp dụng

```text
Các module frontend/backend chính được hợp nhất. Các lỗi sau merge như H2 initializer,
KYC submit/reset, STOMP handshake, thiếu ESLint và Vite advisory được xử lý theo từng nhóm.
```

---

### Prompt số 6 - Hợp đồng điện tử và payment

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-25 |
| Phần việc | Digital Contract, Payment, Invoice, Refund/Dispute |
| Mức độ sử dụng AI | Hỗ trợ thiết kế và hiện thực |

#### Prompt tóm tắt

```text
Bổ sung hợp đồng điện tử cho booking thuê xe, điều khoản cho người thuê và chủ xe.
Hoàn thiện payment với VNPay, yêu cầu ký hợp đồng trước thanh toán, tạo invoice,
payment history và bổ sung dispute/refund.
```

#### Kết quả đã áp dụng

```text
Có workflow contract snapshot, ký hợp đồng, payment checkout VNPay, return/callback,
invoice, payment history, dispute/refund và timeline vận hành phía admin.
```

---

### Prompt số 7 - KYC sync và booking legacy issue

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-27 đến 2026-06-28 |
| Phần việc | KYC status, booking/contract/payment consistency |
| Mức độ sử dụng AI | Hỗ trợ debug |

#### Prompt tóm tắt

```text
Kiểm tra lỗi admin đã verification KYC nhưng customer chưa hiển thị verified.
Sau đó kiểm tra lỗi booking confirmed nhưng contract/payment báo Booking not found,
dashboard hiển thị total/deposit bằng 0.
```

#### Kết quả đã áp dụng/ghi nhận

```text
KYC status được đồng bộ lại từ backend auth response sang frontend store và Documents UI.
Booking legacy issue được ghi nhận là lỗi cần sửa tiếp ở phần lookup/mapping giữa luồng booking
cũ và contract/payment mới.
```

---

## 6. Prompt chưa hiệu quả và cách cải thiện

```text
Prompt chưa hiệu quả: "Sửa auth giúp tôi", "Sửa marketplace", "Sửa payment".

Vấn đề: thiếu triệu chứng, phạm vi frontend/backend, endpoint, dữ liệu mong đợi và điều kiện hoàn thành.

Prompt cải thiện:
"Rà soát AuthPages.tsx, authService.ts, AuthController.java và AuthService.java. Kiểm tra luồng
đăng ký -> gửi OTP -> xác minh email -> đăng nhập. Không dùng dữ liệu mock. Hãy nêu nguyên nhân,
sửa đồng bộ DTO/API và bảo đảm OTP có thời hạn, giới hạn thử và chỉ dùng một lần."
```

---

## 7. Checklist chất lượng prompt

| Tiêu chí | Đã đạt? | Ghi chú |
|---|:---:|---|
| Nêu rõ module/file cần kiểm tra | x | Có frontend và backend |
| Mô tả triệu chứng hoặc kết quả mong muốn | x | Nêu rõ luồng và lỗi |
| Yêu cầu không dùng dữ liệu mock | x | Áp dụng cho auth và service |
| Có tiêu chí bảo mật/logic | x | OTP, token, trạng thái verified, payment |
| Có tiêu chí không phá chức năng cũ | x | Đặc biệt trong merge frontend/backend |
| Kết quả AI được đọc và đối chiếu lại | x | So sánh DTO, entity, controller và UI |

---

## 8. Cam kết sử dụng prompt minh bạch

Em cam kết các prompt được ghi theo đúng mục đích đã sử dụng. AI hỗ trợ phân tích và đề xuất; em vẫn đọc, điều chỉnh và chịu trách nhiệm với phần mã nguồn được áp dụng.

| Đại diện sinh viên | Ngày xác nhận |
|---|---|
| Nguyễn Bùi Quang Vinh - DE190264 | 2026-06-28 |
