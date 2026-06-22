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
| Thời gian ghi nhận | 2026-06-09 đến 2026-06-22 |

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
các lỗi tích hợp, đề xuất cách sửa và rà soát tác động giữa frontend, backend, DTO, entity và API.

Các phần chính gồm authentication, OTP, Google OAuth, marketplace, dữ liệu ảnh xe, booking,
phí giao xe và dashboard. AI không thay thế việc quyết định yêu cầu, kiểm tra code và chịu trách
nhiệm với kết quả cuối cùng của sinh viên.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

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

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-14 |
| Mục đích | Hoàn thiện quên mật khẩu bằng OTP |
| Phần việc | Forgot password, verify OTP, reset password |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Kết quả

```text
Luồng frontend gọi backend để gửi OTP, xác minh mã và nhận reset token tạm thời.
Mật khẩu chỉ được đổi bằng token còn hạn; OTP bị hủy sau khi xác minh thành công.
```

#### Phần sinh viên kiểm tra/cải tiến

```text
Em kiểm tra payload giữa frontend và backend, bổ sung confirmPassword, xử lý lỗi OTP hết hạn
và bảo đảm frontend không còn so sánh với mã OTP mock cố định.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Frontend | `AuthPages.tsx`, `authService.ts` |
| Backend | `AuthController.java`, `AuthService.java`, `AuthDTOs.java` |

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-15 |
| Mục đích | Xác minh email và sửa Google OAuth |
| Phần việc | Email OTP, account activation, OAuth session |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Kết quả

```text
Tài khoản đăng ký local được tạo với verified=false và nhận OTP 6 chữ số.
OTP được hash, hết hạn sau 5 phút, giới hạn gửi lại và số lần nhập sai. Google OAuth
được kiểm tra audience; frontend có thông báo khi chưa cấu hình và fallback phiên từ JWT.
```

#### Phần sinh viên kiểm tra/cải tiến

```text
Em điều chỉnh luồng điều hướng sau đăng ký, dữ liệu UserInfo trả về sau xác minh,
cách cập nhật user trong store và thông báo lỗi cho người dùng.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Frontend | `AuthPages.tsx`, `OAuth2RedirectHandler.tsx` |
| Backend | `AuthService.java`, `AuthController.java` |

---

### Lần sử dụng AI số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-17 |
| Mục đích | Sửa marketplace và dữ liệu ảnh xe |
| Phần việc | Vehicle search, filters, gallery, vehicle card |
| Mức độ sử dụng | Hỗ trợ phân tích/debug |

#### Kết quả

```text
Backend có fallback cho truy vấn inventory rộng để không trả danh sách rỗng ngoài ý muốn.
Ảnh xe được sắp xếp theo ảnh chính và sortOrder; thumbnail được dùng khi gallery trống.
Frontend hiển thị slideshow ảnh và điều hướng đúng trang chi tiết theo loại xe.
```

#### Phần sinh viên kiểm tra/cải tiến

```text
Em đối chiếu Vehicle entity, DTO response và type Vehicle frontend; kiểm tra trường images,
thumbnailUrl, vehicleType, specs, rating và location trước khi hiển thị.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Backend | `VehicleService.java`, `VehicleRepository.java` |
| Frontend | `vehicleService.ts`, `VehicleCard.tsx`, `MarketplacePage.tsx` |

---

### Lần sử dụng AI số 5

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-18 |
| Mục đích | Hoàn thiện booking và phí giao xe |
| Phần việc | Booking wizard, route data, delivery fee, extras |
| Mức độ sử dụng | Hỗ trợ thiết kế/debug |

#### Kết quả

```text
Booking wizard được mở rộng thành nhiều bước và có bảng tổng tiền. Request booking lưu
điểm nhận/trả, tọa độ, quãng đường, thời gian và nhà cung cấp bản đồ. Backend ưu tiên phí
ước tính hợp lệ, tự tính theo bản đồ khi có tọa độ hoặc dùng deliveryFee của xe làm fallback.
```

#### Phần sinh viên kiểm tra/cải tiến

```text
Em kiểm tra công thức tổng tiền, đơn vị VND, dịch vụ riêng cho ô tô/xe máy, dữ liệu truyền
qua route state và ánh xạ các trường mới trong BookingDTO/Booking entity.
```

#### Minh chứng

| Loại | Nội dung |
|---|---|
| Frontend | `BookingWizardPage.tsx`, `bookingService.ts` |
| Backend | `BookingService.java`, `BookingDTOs.java`, `Booking.java` |

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  | x |  |  | Em xác định phạm vi và tiêu chí |
| Code frontend |  |  | x |  | AI hỗ trợ đọc luồng và đề xuất sửa |
| Code backend |  |  | x |  | AI hỗ trợ DTO/service/security |
| Debug tích hợp |  |  | x |  | Đối chiếu request/response và state |
| Thiết kế UI |  | x |  |  | AI gợi ý cấu trúc, em điều chỉnh |
| Viết báo cáo |  |  | x |  | Tổng hợp từ minh chứng mã nguồn |

---

## 6. Lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế | Cách phát hiện | Cách xử lý |
|---:|---|---|---|
| 1 | Có thể suy đoán sai cấu trúc `ApiResponse` | So với controller và dữ liệu trả về | Viết hàm unwrap và kiểm tra từng endpoint |
| 2 | Có thể đề xuất field không tồn tại trong DTO/entity | TypeScript/Java báo lỗi hoặc đọc model | Đồng bộ type, DTO và entity trước khi dùng |
| 3 | Có thể làm mất phiên khi API hồ sơ lỗi | Kiểm tra luồng khởi tạo auth | Giữ cached session và chỉ logout khi token thật sự không hợp lệ |
| 4 | Có thể dùng giải pháp OTP đơn giản chưa đủ production | Review bảo mật | Thêm thời hạn, rate limit, số lần thử, hash và one-time use |
| 5 | Có thể ghi nhận quá rộng so với đóng góp thật | Đối chiếu diff và file | Chỉ ghi các thay đổi có minh chứng trong source |

---

## 7. Kiểm chứng kết quả AI

```text
Em kiểm chứng bằng cách đọc diff và mã nguồn của các module liên quan, đối chiếu frontend
service với backend controller/service/DTO, kiểm tra dữ liệu lưu trong store và xem các
trường mới có được ánh xạ đầy đủ hay không. Em không sử dụng nguyên văn đề xuất nếu chưa
hiểu tác động tới luồng đăng nhập, marketplace hoặc booking.
```

---

## 8. Đóng góp cá nhân

```text
Nguyễn Bùi Quang Vinh - DE190264 tham gia tích hợp và hoàn thiện các luồng frontend/backend,
đặc biệt là authentication, OTP, OAuth và các phần liên quan đến dữ liệu hiển thị/đặt xe.
Em chịu trách nhiệm đọc lại thay đổi, điều chỉnh theo cấu trúc LuxeWay và ghi nhận minh bạch
phạm vi AI đã hỗ trợ.
```

---

## 9. Cam kết học thuật

Em cam kết nội dung AI hỗ trợ được ghi nhận trung thực; có khả năng giải thích các thay đổi và chịu trách nhiệm với sản phẩm cuối cùng.

| Đại diện sinh viên | Ngày xác nhận |
|---|---|
| Nguyễn Bùi Quang Vinh - DE190264 | 2026-06-22 |
