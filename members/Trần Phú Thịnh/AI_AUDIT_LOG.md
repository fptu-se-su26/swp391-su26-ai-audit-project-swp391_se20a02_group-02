# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project (SWP391) |
| Mã môn học | SWP391 |
| Lớp | SE20A02 |
| Học kỳ | SU26 |
| Tên bài tập / Project | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Tên sinh viên / Nhóm | Trần Phú Thịnh - Nhóm 2 |
| MSSV / Danh sách MSSV | DE190371 |
| Giảng viên hướng dẫn | (Giảng viên môn SWP391) |
| Ngày bắt đầu | 2026-06-20 |
| Ngày hoàn thành | 2026-06-25 |

---

## 2. Công cụ AI đã sử dụng

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [x] Codex
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Trần Phú Thịnh (DE190371) sử dụng AI (Antigravity/Codex) để:
- Phân tích luồng thanh toán booking trực tiếp bằng cổng thanh toán ví điện tử MoMo (MoMo Payment Gateway API).
- Triển khai tạo yêu cầu thanh toán (payUrl), cấu hình chữ ký bảo mật signature với thuật toán HMAC-SHA256, xử lý callback IPN và Return từ MoMo.
- Kết nối giao diện chọn MoMo trên Frontend với Payment API ở Backend và thiết kế trang nhận kết quả thanh toán.
- Xây dựng checklist kiểm thử chức năng và bảo mật cho luồng Payment MoMo trực tiếp.

---

## 4. Nhật ký sử dụng AI chi tiết

## Log #01

- **Date:** 2026-06-25
- **Author:** Trần Phú Thịnh (DE190371)
- **AI Tool:** Antigravity
- **Purpose:** Phân tích API MoMo (Create Payment Request) và sinh chữ ký bảo mật signature.
- **Prompt:** "Hướng dẫn tạo request body và ký signature HMAC-SHA256 để tích hợp cổng thanh toán MoMo bằng Java HTTP Client cho API khởi tạo thanh toán."
- **AI Output Summary:** Hướng dẫn gom các trường bắt buộc (accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType) theo đúng thứ tự Alphabet, sau đó băm HMAC-SHA256 bằng secretKey. Sinh code Java để gọi API MoMo qua POST JSON.
- **Human Decision:** Áp dụng thuật toán HMAC-SHA256 sử dụng khóa bí mật cấu hình từ `application.yml`, tự đóng gói JSON bằng ObjectMapper và sử dụng Java `HttpClient` để gọi trực tiếp tới Endpoint Sandbox của MoMo.
- **Applied To:** `src/Back_end/src/main/java/com/luxeway/service/PaymentService.java` (phần method `buildMoMoPaymentUrl`).
- **Verification:** Giao dịch khởi tạo thành công và trả về đường dẫn `payUrl` của MoMo cho phép chuyển hướng sang trang thanh toán.

---

## Log #02

- **Date:** 2026-06-25
- **Author:** Trần Phú Thịnh (DE190371)
- **AI Tool:** Antigravity
- **Purpose:** Xử lý callback tự động Instant Payment Notification (IPN) từ MoMo để cập nhật database an toàn.
- **Prompt:** "Thiết kế endpoint POST `/payments/momo/ipn` trong Spring Boot để nhận thông báo thanh toán từ MoMo, xác thực chữ ký signature nhận được và xử lý cập nhật booking."
- **AI Output Summary:** Gợi ý tạo API nhận POST Request JSON, tính toán lại chữ ký HMAC-SHA256 từ các tham số nhận về và so khớp với `signature` MoMo gửi lên. Cập nhật booking status sang `CONFIRMED` và chặn lịch đặt xe (block availability calendar) nếu thành công.
- **Human Decision:** Triển khai xác thực signature nghiêm ngặt. Nếu thành công, cập nhật trạng thái `Payment` và `Booking` đồng thời gọi `bookingService.blockAvailabilityCalendarPublic` để khóa lịch xe, phòng tránh replay attacks bằng cách kiểm tra trạng thái trước đó. Trả về đúng format phản hồi JSON ack (`resultCode: 0`) để MoMo không gọi lại nữa.
- **Applied To:** `src/Back_end/src/main/java/com/luxeway/controller/PaymentController.java`, `src/Back_end/src/main/java/com/luxeway/service/PaymentService.java`.
- **Verification:** Giả lập IPN gửi từ MoMo, kiểm tra chữ ký hợp lệ cập nhật đúng database, chữ ký sai bị từ chối với HTTP 500 / error message.

---

## Log #03

- **Date:** 2026-06-25
- **Author:** Trần Phú Thịnh (DE190371)
- **AI Tool:** Antigravity
- **Purpose:** Phát triển trang phản hồi kết quả thanh toán trên Frontend (MoMo Return Page).
- **Prompt:** "Viết component React `MoMoReturnPage` để hứng các tham số redirect từ MoMo (như resultCode, orderId, signature), gọi backend xác thực và hiển thị giao diện thành công/thất bại sinh động."
- **AI Output Summary:** Hướng dẫn sử dụng `useSearchParams` để lấy query parameters từ URL, gửi request verify lên backend, hiển thị trạng thái đang xử lý và trang trí màn hình thông báo trực quan.
- **Human Decision:** Viết component `MoMoReturnPage.tsx` tích hợp hiệu ứng hiển thị trạng thái thanh toán (đang xác thực, thành công, thất bại) với các nút quay lại trang quản lý lịch trình, đồng thời loại bỏ các query parameters nhạy cảm sau khi tải trang.
- **Applied To:** `src/Front_end/src/pages/booking/MoMoReturnPage.tsx`, cấu hình định tuyến trong `src/Front_end/src/App.tsx`.
- **Verification:** Chạy thử luồng thanh toán thực tế, redirect về frontend xử lý chính xác trạng thái thành công/thất bại tương ứng với resultCode từ MoMo.

---

## Log #04

- **Date:** 2026-06-25
- **Author:** Trần Phú Thịnh (DE190371)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng checklist kiểm thử luồng MoMo API tích hợp trực tiếp.
- **Prompt:** "Tạo danh sách các test case cần thiết để kiểm thử tích hợp MoMo Payment bao gồm: tạo signature sai, số tiền không khớp, lặp IPN, hết hạn thanh toán, hủy giao dịch."
- **AI Output Summary:** Đề xuất checklist chi tiết cho cả frontend và backend.
- **Human Decision:** Tập trung vào kiểm tra bảo mật (chữ ký giả mạo) và tính toàn vẹn (booking chỉ được cập nhật 1 lần). Bổ sung kiểm tra đồng bộ cập nhật ví LuxeWallet khi nạp tiền thông qua cổng MoMo.
- **Applied To:** Checklist kiểm thử tại Mục 7 trong file audit log.
- **Verification:** Chạy thử E2E E-commerce flow trên môi trường local, giao dịch được xác thực chuẩn xác 100%.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Mức độ AI hỗ trợ | Phần do sinh viên quyết định/kiểm tra |
|---|---:|---|
| Phân tích luồng thanh toán | Cao | Tích hợp trực tiếp cổng MoMo thay vì qua trung gian VNPay |
| Thiết kế API và trạng thái | Trung bình | Định nghĩa các endpoint `/ipn` và `/return` tương thích tài liệu MoMo |
| Bảo mật callback/HMAC | Trung bình | Tự tính toán lại chữ ký HMAC-SHA256 để so sánh thủ công |
| Kết nối frontend | Trung bình | Thiết kế giao diện `MoMoReturnPage` và quản lý routing |
| Kiểm thử | Cao | Giả lập IPN request để kiểm tra xử lý trùng lặp (Idempotency) |

AI được dùng như công cụ hỗ trợ phân tích và rà soát cấu trúc request/response. Quyết định tích hợp, kiểm tra mã nguồn và bảo mật khóa bí mật thuộc về sinh viên.

---

## 6. Các lỗi hoặc hạn chế từ AI

- AI ban đầu đề xuất cấu trúc chữ ký của phiên bản MoMo API cũ, cần đối chiếu với tài liệu API mới nhất (v2) để sửa lại thứ tự các trường ghép chữ ký.
- Một số ví dụ cấu hình do AI đưa ra chỉ mang tính minh họa, sinh viên cần chuyển các thông số access key/secret key vào file cấu hình an toàn, tránh để lộ thông tin nhạy cảm.
- AI không thể tự chạy thử nghiệm kết nối mạng thực tế với MoMo Sandbox, sinh viên phải tự đăng ký tài khoản doanh nghiệp thử nghiệm để lấy thông số kết nối.

---

## 7. Kiểm chứng kết quả AI

Các nội dung AI hỗ trợ được kiểm chứng bằng cách:

- Đọc lại mã nguồn Payment backend và luồng gọi API từ frontend.
- Kiểm tra payment được lưu ở trạng thái `PENDING` trước khi redirect.
- Kiểm tra callback IPN thiếu/sai chữ ký không được cập nhật giao dịch.
- Kiểm tra transaction reference (orderId) và amount khớp dữ liệu đã lưu.
- Kiểm tra callback lặp không cộng tiền hoặc xác nhận booking lần thứ hai.
- Kiểm tra giao dịch thành công chuyển sang `SUCCEEDED`; giao dịch bị hủy/lỗi chuyển sang `FAILED`.
- Kiểm tra người dùng không thể tạo/xem thanh toán cho booking không thuộc quyền của mình.
- Kiểm tra frontend không hiển thị thành công chỉ dựa vào query parameter chưa được backend xác minh.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đóng góp cá nhân

Trần Phú Thịnh phụ trách tích hợp trực tiếp MoMo Payment Gateway API, mã hóa chữ ký HMAC-SHA256, xây dựng API xử lý IPN/Return ở Backend và thiết kế trang trí MoMoReturnPage ở Frontend.

### 8.2. Đóng góp cho nhóm

- Triển khai tích hợp trực tiếp ví điện tử MoMo làm một kênh thanh toán chính thức song song với VNPay và LuxeWallet.
- Hỗ trợ nhóm kiểm tra các tình huống callback giả mạo, callback lặp và sai số tiền.
- Thiết lập cấu hình các tham số bảo mật MoMo an toàn trong file cấu hình Spring Boot.

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ ở điểm nào?

AI giúp hệ thống hóa nhanh luồng thanh toán, chỉ ra các điểm cần bảo vệ như chữ ký callback, mã giao dịch, số tiền và tính không trùng lặp (idempotency). AI cũng giúp tạo mã khung khởi tạo HTTP POST JSON nhanh chóng.

### 9.2. Phần nào không sử dụng theo gợi ý của AI? Vì sao?

Không sử dụng thư viện SDK MoMo có sẵn do AI đề xuất vì muốn tự viết client gọi API để tối ưu hóa dung lượng ứng dụng và kiểm soát luồng chữ ký HMAC-SHA256 linh hoạt hơn.

### 9.3. Đã kiểm tra tính đúng đắn như thế nào?

Đối chiếu mã nguồn tính chữ ký với kết quả mẫu từ tài liệu của MoMo. Thử nghiệm thanh toán thực tế trên Sandbox MoMo và kiểm tra trạng thái booking cập nhật tự động trong cơ sở dữ liệu sau khi nhận IPN.

### 9.4. Nếu không có AI, phần nào khó khăn nhất?

Khó khăn nhất là tìm hiểu quy tắc ghép chuỗi tham số để tạo chữ ký HMAC-SHA256 chính xác của MoMo, vì sai lệch bất kỳ khoảng trắng hay thứ tự tham số nào cũng sẽ dẫn đến lỗi xác thực từ phía cổng thanh toán.

### 9.5. Học được gì về môn học?

Hiểu rõ cách hoạt động của mô hình thanh toán bất đồng bộ (Asynchronous Payment Flow), tầm quan trọng của cơ chế Webhook (IPN) trong việc đảm bảo tính toàn vẹn dữ liệu ngay cả khi người dùng đóng trình duyệt đột ngột.

### 9.6. Học được gì về sử dụng AI có trách nhiệm?

Cần liên tục đối chiếu thông tin AI cung cấp với tài liệu kỹ thuật chính thức của nhà cung cấp dịch vụ (MoMo API Docs) để phát hiện sớm các thông tin cũ hoặc không chính xác.

---

## 10. Cam kết học thuật

Sinh viên cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã thực hiện.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Không đưa API key, secret key hoặc dữ liệu giao dịch nhạy cảm vào tài liệu audit.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Trần Phú Thịnh - DE190371 | 2026-06-25 |
