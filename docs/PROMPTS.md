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
| Ngày cập nhật gần nhất | 2026-06-16 |

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

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
làm lại đi, dựa theo form của https://github.com/FUSU26SWR302/project-course-swr302_se20a02_group-02/tree/main/members/Lê Văn Hậu Này
```

### 6.2. Vì sao prompt này quan trọng?

Giúp quy chuẩn hóa toàn bộ file tài liệu Audit Log của mình đồng bộ với Leader của dự án.
