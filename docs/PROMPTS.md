# Prompt Log

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
| Ngày cập nhật gần nhất | 2026-06-28 |

---

## 2. Mục đích của file Prompt Log

File này ghi lại các prompt quan trọng đã sử dụng trong quá trình xây dựng Backend và Database cho dự án LuxeWay.

---

## 3. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 2026-06-16 | Antigravity | Push code lên nhánh | "cập nhật code lên nhánh, chỉ làm trong nhánh của tôi, không được push lên main" | Gỡ lỗi push file binary, tạo commit chuẩn | Có | Lịch sử Git |
| 2 | 2026-06-16 | Antigravity | Format tài liệu AI Audit Log | "dựa theo form làm AI Auditlog cho tôi" | 4 file docs theo chuẩn form | Có | Thư mục members/Hồ Thành Trung |
| 3 | 2026-06-21 | Antigravity | Gộp code main và sửa lỗi biên dịch | "lấy code từ nhánh main về rồi gộp code hiện tại vào code vừa lấy về fix lại tất cả..." | Gộp code thành công, sửa toàn bộ lỗi compile của BE/FE | Có | Lịch sử Git nhánh `merge/main-into-ekyc` |
| 4 | 2026-06-28 | Antigravity | Nạp data motorbike và fix lỗi khởi động backend eKYC | "cập nhật lại 4 file audit log trên ... tuần này đã nạp data cho phần motorbike và fix lỗi eKYC" | Cấu hình lại `Car_rental_DB`, tắt file SQL lỗi `created_at`, backend boot thành công | Có | File `application-sqlserver.yml` |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-16 |
| Công cụ AI | Antigravity |
| Mục đích | Commit và đẩy mã nguồn lên GitHub an toàn |
| Phần việc liên quan | Version Control (Git) |
| Mức độ sử dụng | Hỏi thao tác / Debug |

#### 5.1. Prompt nguyên văn

```text
cập nhật code lên nhánh 
ok nhưng chỉ làm trong nhánh của tôi, không được push lên main
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần lưu lại các file đã làm việc (data-sqlserver.sql) nhưng sơ ý làm thư mục JDK và Maven bị untracked. Cần AI giúp push an toàn lên nhánh feature riêng.
```

#### 5.3. Kết quả AI trả về

```text
AI thử push nhưng bị GitHub từ chối do file > 100MB. AI giải thích lỗi, hướng dẫn dùng `git reset HEAD~1` để undo commit và loại bỏ các file rác ra khỏi staging area.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Đã reset commit lỗi và làm sạch thư mục làm việc, đảm bảo repo không bị phình to bởi rác.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Đảm bảo thêm các file môi trường vào .gitignore để sau này không bị lặp lại lỗi.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-16 |
| Công cụ AI | Antigravity |
| Mục đích | Tạo file báo cáo AI Audit Log |
| Phần việc liên quan | Báo cáo môn học |
| Mức độ sử dụng | Sinh code / Soạn thảo văn bản |

#### 5.1. Prompt nguyên văn

```text
làm lại đi, dựa theo form của https://github.com/FUSU26SWR302/project-course-swr302_se20a02_group-02/tree/main/members/Lê Văn Hậu Này
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần chuẩn hóa lại cấu trúc tệp tin báo cáo AI Audit Log cho Hồ Thành Trung đồng bộ với các thành viên khác trong nhóm.
```

#### 5.3. Kết quả AI trả về

```text
AI phân tích liên kết mẫu của Leader nhóm và sinh ra cấu trúc 4 file markdown chuẩn form, điền đầy đủ các thông tin của Hồ Thành Trung.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Tạo thành công 4 file tài liệu chất lượng cao trong thư mục `members/Hồ Thành Trung`.
```

#### 5.5. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

### Prompt số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-21 |
| Công cụ AI | Antigravity |
| Mục đích | Gộp code từ main và sửa lỗi biên dịch phát sinh |
| Phần việc liên quan | Git Integration & Bug Fixing |
| Mức độ sử dụng | Hướng dẫn / Sinh code / Debug |

#### 5.1. Prompt nguyên văn

```text
lấy code từ nhánh main về rồi gộp code hiện tại vào code vừa lấy về fix lại tất cả để chạy mượt mà. Lưu ý: Không push lên nhánh main mà chỉ được clone về rồi connect với code hiện tại để chạy
```

#### 5.2. Bối cảnh khi viết prompt

```text
Nhánh `main` của dự án đã có nhiều thay đổi lớn từ các thành viên khác (tách Vehicle thành Car/Motorbike, thêm chức năng Payment, Employee, v.v.). Nhánh tính năng eKYC cần được gộp các tính năng mới này và khắc phục các lỗi biên dịch phát sinh do cấu trúc dữ liệu và API thay đổi.
```

#### 5.3. Kết quả AI trả về

```text
AI thực hiện tạo nhánh local phụ `merge/main-into-ekyc` để merge an toàn, đưa ra giải pháp sửa đổi xung đột, bổ sung các phương thức repository/service bị thiếu ở backend và giải quyết các lỗi kiểu dữ liệu ở frontend để hoàn thành kiểm thử.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Dự án được gộp thành công, biên dịch thành công ở cả Frontend và Backend, chạy thực tế kết nối cơ sở dữ liệu SQL Server ổn định.
```

#### 5.5. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

### Prompt số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 2026-06-28 |
| Công cụ AI | Antigravity |
| Mục đích | Fix lỗi eKYC Database và viết AI Audit Log |
| Phần việc liên quan | Backend Configuration & Báo cáo |
| Mức độ sử dụng | Hỏi thao tác / Sinh báo cáo |

#### 5.1. Prompt nguyên văn

```text
ok cập nhật lại 4 file audit log trên https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a02_group-02/tree/feature-de190928/eKYC-scan-CCCD-CMT
 Tuần này đã làm gì thì cập nhật vào, tuần này đã nạp data cho phần motorbike và fix lỗi eKYC
```

#### 5.2. Bối cảnh khi viết prompt

```text
Gặp lỗi backend không khởi động được do script SQL chèn dữ liệu motorbike/brands bị thiếu trường `created_at`. Ngoài ra, cần đẩy các báo cáo AI Audit Log lên Github nhánh eKYC.
```

#### 5.3. Kết quả AI trả về

```text
AI giúp phát hiện ra nguyên nhân sập backend (thiếu cột timestamp ở file SQL mẫu), vô hiệu hóa file SQL này trong `application-sqlserver.yml` và cấu hình lại tên database thành `Car_rental_DB` để backend tự tạo bảng trơn tru. AI tự động ghi nhật ký vào 4 file markdown AI Audit Log và Changelog theo form chuẩn.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Spring Boot kết nối SQL Server hoàn tất, backend lên port 8080 thành công, frontend gọi API ổn định.
```

#### 5.5. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
lấy code từ nhánh main về rồi gộp code hiện tại vào code vừa lấy về fix lại tất cả để chạy mượt mà. Lưu ý: Không push lên nhánh main mà chỉ được clone về rồi connect với code hiện tại để chạy
```

### 6.2. Vì sao prompt này quan trọng?

Giúp đồng bộ hóa toàn bộ công sức phát triển của các thành viên khác trên nhánh `main` vào nhánh eKYC cục bộ mà vẫn bảo toàn tính năng eKYC hiện tại và tránh làm hỏng lịch sử git trên repository chính.
