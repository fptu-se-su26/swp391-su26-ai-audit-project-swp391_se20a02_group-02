# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project (SWP391) |
| Mã môn học | SWP391 |
| Lớp | SE20A02 |
| Học kỳ | SU26 |
| Tên bài tập / Project | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Tên sinh viên / Nhóm | Hồ Thành Trung - Nhóm 2 |
| MSSV / Danh sách MSSV | DE190928 |
| Giảng viên hướng dẫn | (Giảng viên môn SWP391) |
| Ngày bắt đầu | 2026-05-30 |
| Ngày hoàn thành | 2026-06-28 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.

### Mô tả mục tiêu sử dụng AI

```text
Hồ Thành Trung (DE190928) - Nhóm 2 sử dụng AI (Antigravity) 
để hỗ trợ mảng Backend và Database cho nền tảng LuxeWay.

Cụ thể:
- Hỗ trợ tạo các script cơ sở dữ liệu cho chức năng eKYC (Scan CCCD/CMT).
- Tích hợp và cập nhật file data-sqlserver.sql với các bảng liên quan đến chứng minh nhân dân.
- Xử lý các lỗi liên quan đến quản lý phiên bản Git (như việc vô tình track các thư mục binary lớn như jdk21 và maven-bin).
- Gộp code từ nhánh main của dự án vào nhánh tính năng eKYC, giải quyết tất cả xung đột (conflict).
- Sửa các lỗi biên dịch ở cả Backend (Java/Maven) và Frontend (TypeScript/Vite) sau khi gộp nhánh để hệ thống chạy ổn định.
- Tự động hóa quá trình sinh các file tài liệu AI Audit Log theo form chuẩn của dự án.
```

---

## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.

---

## Log #01

- **Date:** 2026-06-16
- **Author:** HoThanhTrung (DE190928)
- **AI Tool:** Antigravity
- **Purpose:** Phát triển schema Database cho tính năng eKYC CCCD/CMT
- **Prompt Reference:** PROMPTS.md#prompt-01
- **AI Output Summary:** Cung cấp script tạo bảng lưu trữ thông tin CCCD (eKYC_Verification) bao gồm các trường số CCCD, họ tên, ngày sinh, ngày cấp, và đường dẫn ảnh mặt trước/sau.
- **Human Decision:** Áp dụng schema vào file `src/Back_end/src/main/resources/data-sqlserver.sql`, bổ sung thêm các ràng buộc khóa ngoại (Foreign Key) nối với bảng User.
- **Applied To:** `data-sqlserver.sql`
- **Verification:** Chạy script trên SQL Server thành công, các bảng được tạo với đúng kiểu dữ liệu.

---

## Log #02

- **Date:** 2026-06-16
- **Author:** HoThanhTrung (DE190928)
- **AI Tool:** Antigravity
- **Purpose:** Quản lý Git và fix lỗi không push được code lên GitHub do file binary lớn
- **Prompt Reference:** PROMPTS.md#prompt-02
- **AI Output Summary:** Giải thích lỗi "this exceeds GitHub's file size limit of 100.00 MB", hướng dẫn dùng `git reset HEAD~1` để gỡ commit chứa thư mục `jdk21` và `maven-bin`, sau đó tạo branch mới để push.
- **Human Decision:** Thực hiện gỡ bỏ commit lỗi, kiểm tra lại untracked files và yêu cầu tạo branch `docs/de190928-update-ai-audit-log` để push các file documentation thay vì push thẳng lên main.
- **Applied To:** Quá trình Git workflow của nhánh `feature-de190928/eKYC-scan-CCCD-CMT`.
- **Verification:** Nhánh mới được tạo và push thành công lên remote.

---

## Log #03

- **Date:** 2026-06-21
- **Author:** HoThanhTrung (DE190928)
- **AI Tool:** Antigravity
- **Purpose:** Gộp nhánh main và sửa lỗi biên dịch (Compilation/Runtime Errors)
- **Prompt Reference:** PROMPTS.md#prompt-03
- **AI Output Summary:** Hướng dẫn tạo nhánh merge phụ `merge/main-into-ekyc`, merge nhánh `main` và giải quyết các conflict cấu hình. Gợi ý bổ sung các phương thức truy vấn `findByName(...)` trong các repo, tạo thêm phương thức mail `sendCustomHtmlEmail(...)` trong `EmailService`, nâng cấp Lombok trong `pom.xml` để thích ứng với JDK 21 và viết hàm `getBaseURL()` ở frontend.
- **Human Decision:** Làm theo các đề xuất giải quyết conflict, cập nhật code backend/frontend, chạy các lệnh kiểm tra và tiến hành khởi chạy thực tế hệ thống.
- **Applied To:** File cấu hình bảo mật, pom.xml, các file Repository xe, EmailService, api.ts, enterpriseService.ts.
- **Verification:** Lệnh `mvn compile` và `npm run build` hoàn thành không lỗi. Khi khởi chạy, backend tự động cập nhật schema DB eKYC và seed dữ liệu mẫu thành công.

---

## Log #04

- **Date:** 2026-06-28
- **Author:** HoThanhTrung (DE190928)
- **AI Tool:** Antigravity
- **Purpose:** Nạp data cho phần motorbike và fix lỗi eKYC
- **Prompt Reference:** PROMPTS.md#prompt-04
- **AI Output Summary:** Hỗ trợ nạp dữ liệu phần motorbike, sửa lỗi eKYC. Cấu hình lại kết nối database SQL Server (chọn đúng `Car_rental_DB`), vô hiệu hóa script seed dữ liệu bị thiếu cột timestamp để backend chạy thành công trên cổng 8080. Khởi động lại Frontend.
- **Human Decision:** Xác nhận thông tin server, kết nối SSMS và cung cấp yêu cầu cấu hình.
- **Applied To:** `application-sqlserver.yml`
- **Verification:** Backend kết nối SQL Server thành công. Frontend hoạt động bình thường.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu | ✅ | | | | Tự phân tích từ đề bài |
| Viết user story/use case | ✅ | | | | Nhóm tự viết |
| Thiết kế database | | | ✅ | | AI gợi ý bảng cho eKYC |
| Thiết kế kiến trúc hệ thống | ✅ | | | | |
| Thiết kế giao diện | ✅ | | | | Backend dev không làm UI |
| Code frontend | | ✅ | | | AI sửa các lỗi TypeScript liên kết API |
| Code backend | | | ✅ | | Viết các logic xử lý nghiệp vụ, AI sửa lỗi biên dịch và conflict |
| Debug lỗi | | | | ✅ | AI fix lỗi compile và cấu hình Git/DevOps rất hiệu quả |
| Viết báo cáo | | | | ✅ | Nhờ AI cấu trúc form báo cáo theo chuẩn |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Quên không thiết lập khóa ngoại cho bảng eKYC | Đọc code SQL do AI sinh | Tự viết thêm câu lệnh `ALTER TABLE ADD CONSTRAINT` |
| 2 | Cố gắng push tất cả file bao gồm cả JDK | Git báo lỗi size limit > 100MB | Hủy commit và loại trừ các thư mục binary khỏi staging |
| 3 | Lombok bị lỗi cảnh báo/biên dịch lỗi trên JDK 21 | Chạy `mvn compile` nhận thông báo lỗi annotation processor | AI gợi ý nâng cấp `lombok.version` lên `1.18.38` trong `pom.xml` |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

### Nội dung kiểm chứng

```text
Đối với phần Database & Build:
1. Thực hiện lệnh `mvn compile` và `tsc --noEmit` để xác thực code không còn lỗi cú pháp/kiểu dữ liệu.
2. Kiểm tra log khởi chạy Spring Boot xem có xảy ra lỗi kết nối SQL Server hay lỗi tự động tạo bảng/cột không.

Đối với phần Git:
1. Tạo nhánh an toàn trước khi gộp để tránh làm hỏng code hiện tại.
2. Luôn chạy `git status` và `git diff` để kiểm soát các tệp tin thay đổi trước khi commit.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

```text
Hồ Thành Trung (DE190928) phụ trách mảng Backend & Database.

Phần tự làm:
- Phân tích luồng nghiệp vụ của tính năng xác thực người dùng (eKYC).
- Cấu hình kết nối SQL Server trong Spring Boot và khởi tạo dữ liệu.
- Viết các câu lệnh truy vấn phức tạp và tích hợp giao diện quét tài liệu.

Phần AI hỗ trợ:
- Gợi ý cấu trúc bảng eKYC và các trường dữ liệu thích hợp.
- Hỗ trợ merge code từ main, giải quyết conflicts phức tạp.
- Khắc phục các lỗi compile phát sinh sau khi gộp nhánh.
- Trình bày file tài liệu AI Audit Log.
```

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?
Giúp tiết kiệm tối đa thời gian giải quyết các lỗi xung đột git và lỗi biên dịch hệ thống, đồng thời hỗ trợ soạn thảo báo cáo nhanh chóng.

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?
Không dùng script SQL ban đầu của AI vì chưa có khóa ngoại, cần tự viết thêm để đảm bảo tính toàn vẹn cơ sở dữ liệu.

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?
Thực hiện biên dịch dự án thực tế (`mvn compile`, `npm run build`), quan sát log khởi động ứng dụng và kiểm tra dữ liệu thực tế trên SQL Server.

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?
Quá trình resolve conflicts thủ công cho hơn 170 tệp tin thay đổi và fix các lỗi import chéo giữa hai nhánh phát triển song song sẽ mất rất nhiều thời gian.

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:
- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Hồ Thành Trung - DE190928 | 2026-06-21 |
