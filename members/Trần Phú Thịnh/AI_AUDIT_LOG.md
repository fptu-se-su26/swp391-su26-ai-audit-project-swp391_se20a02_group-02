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
| Ngày hoàn thành | 2026-06-22 |

---

## 2. Công cụ AI đã sử dụng

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [x] Codex
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Trần Phú Thịnh (DE190371) sử dụng AI (Codex) để:
- Phân tích luồng thanh toán booking bằng ví MoMo qua VNPay.
- Rà soát bảo mật khi tạo URL thanh toán và xử lý callback từ cổng thanh toán.
- Kết nối giao diện chọn MoMo với Payment API và trang nhận kết quả.
- Xây dựng checklist kiểm thử chức năng Payment MoMo.

---

## 4. Nhật ký sử dụng AI chi tiết

## Log #01

- **Date:** 2026-06-20
- **Author:** Trần Phú Thịnh (DE190371)
- **AI Tool:** Codex
- **Purpose:** Phân tích yêu cầu và thiết kế luồng Payment MoMo cho LuxeWay.
- **Prompt:** "Phân tích luồng thanh toán booking bằng ví MoMo qua VNPay cho hệ thống React và Spring Boot; xác định API, trạng thái giao dịch và các bước bảo mật cần thiết."
- **AI Output Summary:** Đề xuất luồng `PENDING → redirect gateway → callback → SUCCEEDED/FAILED`; sử dụng mã giao dịch duy nhất, lưu payment trước khi chuyển hướng và chỉ xác nhận booking sau khi callback hợp lệ.
- **Human Decision:** Chọn phương án MoMo thông qua VNPay để phù hợp kiến trúc Payment hiện có; không thêm SDK MoMo trực tiếp hoặc lưu thông tin ví của khách hàng.
- **Applied To:** Thiết kế luồng Payment, `PaymentService.java`, `PaymentController.java` và trang thanh toán frontend.
- **Verification:** Đối chiếu với entity `Payment`, trạng thái `PaymentStatus` và các endpoint Payment hiện có.

---

## Log #02

- **Date:** 2026-06-21
- **Author:** Trần Phú Thịnh (DE190371)
- **AI Tool:** Codex
- **Purpose:** Rà soát bảo mật khi tạo URL thanh toán và xử lý callback từ cổng thanh toán.
- **Prompt:** "Review logic tạo URL VNPay cho lựa chọn ví MoMo và callback; kiểm tra HMAC, amount, transaction reference, replay callback và quyền truy cập booking."
- **AI Output Summary:** Đề xuất sắp xếp tham số trước khi ký, không đưa secret key ra frontend, kiểm tra secure hash bằng HMAC, so khớp transaction reference/amount và xử lý callback theo hướng idempotent.
- **Human Decision:** Chỉ cập nhật giao dịch khi chữ ký hợp lệ; bỏ qua callback lặp nếu giao dịch đã `SUCCEEDED`; không ghi secret key hoặc toàn bộ dữ liệu nhạy cảm vào log.
- **Applied To:** `src/Back_end/src/main/java/com/luxeway/service/PaymentService.java`, `src/Back_end/src/main/java/com/luxeway/controller/PaymentController.java`, `src/Back_end/src/main/java/com/luxeway/config/SecurityConfig.java`.
- **Verification:** Kiểm tra thủ công callback thiếu chữ ký, sai chữ ký, giao dịch không tồn tại và callback gửi lại nhiều lần.

---

## Log #03

- **Date:** 2026-06-21
- **Author:** Trần Phú Thịnh (DE190371)
- **AI Tool:** Codex
- **Purpose:** Kết nối giao diện chọn MoMo với Payment API và trang nhận kết quả.
- **Prompt:** "Hướng dẫn nối lựa chọn MoMo trên React checkout với API tạo payment, redirect theo paymentUrl và xác minh kết quả khi quay về trang payment return."
- **AI Output Summary:** Gợi ý khóa nút trong lúc gửi yêu cầu, xử lý `paymentUrl`, hiển thị trạng thái đang xác minh và không tin tưởng query parameter trên trình duyệt như kết quả cuối cùng.
- **Human Decision:** Hiển thị MoMo như lựa chọn ví điện tử qua VNPay; kết quả thanh toán cuối cùng lấy từ backend sau khi callback được xác minh.
- **Applied To:** `src/Front_end/src/pages/booking/BookingWizardPage.tsx`, `src/Front_end/src/services/api.ts`, route `/payment/vnpay/return` trong `App.tsx`.
- **Verification:** Kiểm tra điều hướng thanh toán, trạng thái loading, trường hợp người dùng hủy giao dịch và tải lại trang return.

---

## Log #04

- **Date:** 2026-06-22
- **Author:** Trần Phú Thịnh (DE190371)
- **AI Tool:** Codex
- **Purpose:** Xây dựng checklist kiểm thử chức năng Payment MoMo.
- **Prompt:** "Tạo test checklist cho thanh toán MoMo qua VNPay gồm happy path, lỗi gateway, callback giả mạo, callback lặp, sai amount và người dùng không sở hữu booking."
- **AI Output Summary:** Sinh danh sách kiểm thử chức năng và bảo mật cho luồng thanh toán.
- **Human Decision:** Giữ các ca kiểm thử có ảnh hưởng trực tiếp đến tính toàn vẹn giao dịch; bổ sung kiểm tra booking chỉ được xác nhận một lần.
- **Applied To:** Kiểm thử Payment backend và kiểm thử tích hợp frontend–backend.
- **Verification:** Rà soát theo checklist ở mục 7; không sử dụng giao dịch tiền thật trong môi trường phát triển.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Mức độ AI hỗ trợ | Phần do sinh viên quyết định/kiểm tra |
|---|---:|---|
| Phân tích luồng thanh toán | Cao | Chọn phạm vi MoMo qua VNPay |
| Thiết kế API và trạng thái | Trung bình | Đối chiếu kiến trúc và entity hiện có |
| Bảo mật callback/HMAC | Trung bình | Kiểm tra cấu hình, secret và hành vi thực tế |
| Kết nối frontend | Trung bình | Điều chỉnh UI/UX và luồng điều hướng |
| Kiểm thử | Cao | Chạy test, xác nhận kết quả và sửa lỗi |

AI được dùng như công cụ hỗ trợ phân tích và rà soát. Quyết định tích hợp, kiểm tra mã nguồn và trách nhiệm đối với kết quả cuối cùng thuộc về sinh viên.

---

## 6. Các lỗi hoặc hạn chế từ AI

- Ban đầu có thể hiểu "Payment MoMo" là tích hợp trực tiếp MoMo SDK/API, trong khi dự án hiện dùng VNPay làm cổng trung gian.
- Một số ví dụ cấu hình do AI đưa ra chỉ mang tính minh họa, không được đưa merchant secret thật vào repository.
- AI không thể xác nhận giao dịch sandbox/production nếu không có tài khoản merchant và thông tin cấu hình hợp lệ.
- Gợi ý callback cần được đối chiếu với tài liệu chính thức và hành vi thực tế của cổng thanh toán.

---

## 7. Kiểm chứng kết quả AI

Các nội dung AI hỗ trợ được kiểm chứng bằng cách:

- Đọc lại mã nguồn Payment backend và luồng gọi API từ frontend.
- Kiểm tra payment được lưu ở trạng thái `PENDING` trước khi redirect.
- Kiểm tra callback thiếu/sai chữ ký không được cập nhật giao dịch.
- Kiểm tra transaction reference và amount khớp dữ liệu đã lưu.
- Kiểm tra callback lặp không cộng tiền hoặc xác nhận booking lần thứ hai.
- Kiểm tra giao dịch thành công chuyển sang `SUCCEEDED`; giao dịch bị hủy/lỗi chuyển sang `FAILED`.
- Kiểm tra người dùng không thể tạo/xem thanh toán cho booking không thuộc quyền của mình.
- Kiểm tra frontend không hiển thị thành công chỉ dựa vào query parameter chưa được backend xác minh.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đóng góp cá nhân

Trần Phú Thịnh phụ trách phân tích luồng Payment MoMo, rà soát bảo mật callback, kết nối lựa chọn ví điện tử với luồng Payment hiện có và xây dựng checklist kiểm thử.

### 8.2. Đóng góp cho nhóm

- Chuẩn hóa cách mô tả MoMo là ví điện tử được xử lý thông qua VNPay trong phạm vi hiện tại.
- Hỗ trợ nhóm kiểm tra các tình huống callback giả mạo, callback lặp và sai số tiền.
- Ghi lại phạm vi tích hợp để tránh nhầm lẫn với tích hợp trực tiếp MoMo Payment Gateway.

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ ở điểm nào?

AI giúp hệ thống hóa nhanh luồng thanh toán, chỉ ra các điểm cần bảo vệ như chữ ký callback, mã giao dịch, số tiền và idempotency. AI cũng giúp tạo checklist kiểm thử đầy đủ hơn so với chỉ kiểm tra trường hợp thanh toán thành công.

### 9.2. Phần nào không sử dụng theo gợi ý của AI? Vì sao?

Không sử dụng phương án tích hợp SDK MoMo trực tiếp vì không phù hợp với kiến trúc và cấu hình hiện có của dự án. Nhóm giữ VNPay làm cổng thanh toán; MoMo là một lựa chọn ví điện tử bên trong luồng đó.

### 9.3. Đã kiểm tra tính đúng đắn như thế nào?

Đối chiếu gợi ý với mã nguồn, dữ liệu Payment đã lưu và các trường hợp callback thực tế/mô phỏng. Kết quả trên frontend chỉ được coi là hợp lệ sau khi backend kiểm tra chữ ký và trạng thái giao dịch.

### 9.4. Nếu không có AI, phần nào khó khăn nhất?

Khó khăn nhất là liệt kê đầy đủ các tình huống bảo mật và lỗi biên của callback thanh toán, đặc biệt callback lặp, sai amount và giả mạo chữ ký.

### 9.5. Học được gì về môn học?

Hiểu rõ hơn cách tách trách nhiệm giữa frontend, backend và payment gateway; cách quản lý vòng đời giao dịch; và lý do không được tin tưởng dữ liệu trả về trực tiếp trên trình duyệt.

### 9.6. Học được gì về sử dụng AI có trách nhiệm?

Không xem code hoặc cấu hình AI sinh ra là mặc định đúng. Cần xác định rõ phạm vi chức năng, không ghi nhận một tích hợp trực tiếp khi hệ thống chỉ hỗ trợ qua cổng trung gian, và luôn tự kiểm tra các phần liên quan đến tiền và bảo mật.

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
| Trần Phú Thịnh - DE190371 | 2026-06-22 |
