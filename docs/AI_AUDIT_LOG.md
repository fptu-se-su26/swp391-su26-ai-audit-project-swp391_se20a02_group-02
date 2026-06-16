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
| Ngày hoàn thành | 2026-06-16 |

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

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu | ✅ | | | | Tự phân tích từ đề bài |
| Viết user story/use case | ✅ | | | | Nhóm tự viết |
| Thiết kế database | | | ✅ | | AI gợi ý bảng cho eKYC |
| Thiết kế kiến trúc hệ thống | ✅ | | | | |
| Thiết kế giao diện | ✅ | | | | Backend dev không làm UI |
| Code frontend | ✅ | | | | Backend dev không làm UI |
| Code backend | | ✅ | | | Viết các logic xử lý nghiệp vụ, AI hỗ trợ boilerplate |
| Debug lỗi | | | ✅ | | AI fix lỗi Git rất hiệu quả |
| Viết báo cáo | | | | ✅ | Nhờ AI cấu trúc form báo cáo theo chuẩn |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Quên không thiết lập khóa ngoại cho bảng eKYC | Đọc code SQL do AI sinh | Tự viết thêm câu lệnh `ALTER TABLE ADD CONSTRAINT` |
| 2 | Cố gắng push tất cả file bao gồm cả JDK | Git báo lỗi size limit > 100MB | Hủy commit và loại trừ các thư mục binary khỏi staging |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

### Nội dung kiểm chứng

```text
Đối với phần Database:
1. Đọc kỹ file SQL trước khi execute.
2. Kiểm tra trên SQL Server Management Studio xem bảng có ánh xạ đúng với Entity Java không.

Đối với phần Git:
1. Luôn chạy git status để xem AI định commit những file nào.
2. Đảm bảo nhánh hiện tại không phải là main.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

```text
Hồ Thành Trung (DE190928) phụ trách mảng Backend & Database.

Phần tự làm:
- Phân tích luồng nghiệp vụ của tính năng xác thực người dùng (eKYC).
- Cấu hình kết nối SQL Server trong Spring Boot.
- Viết các câu lệnh truy vấn phức tạp không dùng ORM.

Phần AI hỗ trợ:
- Gợi ý bảng và các trường cần thiết cho eKYC.
- Gỡ lỗi Git khi xử lý các thư mục môi trường nặng.
- Trình bày file tài liệu AI Audit Log.
```

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?
Giúp tiết kiệm thời gian gõ các câu lệnh DDL SQL lặp đi lặp lại và khắc phục nhanh chóng các sự cố với Git.

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?
Không sử dụng script SQL thiếu khóa ngoại của AI vì nó vi phạm tính toàn vẹn dữ liệu (Referential Integrity) của CSDL.

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?
Review kỹ trước khi chạy lệnh SQL, chạy `git status` trước khi commit.

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?
Tìm cách gỡ commit bị kẹt do vượt quá 100MB trên GitHub sẽ mất nhiều thời gian tra cứu Google hơn.

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:
- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Hồ Thành Trung - DE190928 | 2026-06-16 |
