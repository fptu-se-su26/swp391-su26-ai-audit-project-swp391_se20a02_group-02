# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện dự án LuxeWay.

---

## 2. Thông tin project

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project (SWP391) |
| Mã môn học | SWP391 |
| Lớp | SE20A02 |
| Tên bài tập / Project | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Tên sinh viên / Nhóm | Nhóm 2 (Hồ Thành Trung) |
| MSSV / Danh sách MSSV | DE190928 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 2026-05-30 | Khởi tạo project, cấu trúc repo | Completed |
| Phase 02 | 2026-06-16 | Thiết kế Schema & eKYC feature | Completed |
| Phase 03 | 2026-06-21 | Gộp code main và sửa lỗi biên dịch | Completed |
| Phase 04 | 2026-06-28 | Nạp data motorbike & Fix lỗi cấu hình eKYC DB | Completed |

---

# [Phase 02] Thiết kế Schema Database & eKYC

## Ngày thực hiện

```text
2026-06-16
```

## Đã hoàn thành

- [x] Cập nhật bảng `eKYC_Verification` trong `data-sqlserver.sql`.
- [x] Tạo tài liệu AI Audit Log.
- [x] Sửa lỗi kích thước file lớn của Git.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Cập nhật cấu trúc thư mục báo cáo AI | Hồ Thành Trung | members/Hồ Thành Trung | 4 file docs |
| 2 | Lập trình module eKYC Database | Hồ Thành Trung | data-sqlserver.sql | File SQL |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI hỗ trợ định dạng form markdown, hướng dẫn thao tác lệnh git và đưa ra góp ý cho cấu trúc bảng SQL.
```

## Ghi chú

```text
Đã push thành công lên nhánh riêng để chờ Leader review.
```

---

# [Phase 03] Gộp code main và sửa lỗi biên dịch

## Ngày thực hiện

```text
2026-06-21
```

## Đã hoàn thành

- [x] Tạo nhánh merge phụ `merge/main-into-ekyc` và gộp code nhánh `main` về.
- [x] Giải quyết xung đột (conflict) cấu hình bảo mật (`SecurityConfig.java`, `application.yml`) và giao diện (`App.tsx`, `Navbar.tsx`).
- [x] Khắc phục lỗi biên dịch Backend (thêm phương thức repository, cập nhật Lombok lên `1.18.38` sửa lỗi tương thích JDK 21).
- [x] Khắc phục lỗi biên dịch Frontend (bổ sung public getter `getBaseURL()` trong `api.ts`).
- [x] Chạy kiểm tra khởi động dịch vụ Backend kết nối SQL Server và Frontend dev server thành công.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Merge code nhánh `main` vào nhánh eKYC | Hồ Thành Trung | Backend & Frontend Configs | Nhánh merge local |
| 2 | Khắc phục lỗi tương thích Lombok & JDK 21 | Hồ Thành Trung | src/Back_end/pom.xml | Build Backend thành công |
| 3 | Thêm phương thức repository hỗ trợ seed dữ liệu | Hồ Thành Trung | Car & Motorbike repositories | Code Java Repository |
| 4 | Thêm phương thức gửi mail tùy biến dạng HTML | Hồ Thành Trung | EmailService.java | Dịch vụ thông báo biên dịch thành công |
| 5 | Sửa đổi phân quyền accessor Base URL frontend | Hồ Thành Trung | api.ts & enterpriseService.ts | Build Frontend thành công |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI hỗ trợ chỉ ra các lỗi biên dịch, gợi ý nâng cấp thư viện Lombok, đề xuất giải pháp xử lý phân quyền thuộc tính api client ở frontend và gộp nhánh an toàn.
```

## Ghi chú

```text
Mã nguồn đã biên dịch sạch sẽ và khởi chạy thành công ở local.
```

---

# [Phase 04] Nạp data motorbike & Fix lỗi cấu hình eKYC DB

## Ngày thực hiện

```text
2026-06-28
```

## Đã hoàn thành

- [x] Nạp data cho phần motorbike.
- [x] Fix lỗi kết nối cơ sở dữ liệu eKYC (cấu hình lại `Car_rental_DB`).
- [x] Tắt file seed data bị lỗi.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Nạp data cho phần motorbike và sửa lỗi eKYC | Hồ Thành Trung | application-sqlserver.yml | Backend chạy OK |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI hỗ trợ cấu hình lại file yml để trỏ đúng vào Car_rental_DB và vô hiệu hóa script seed bị thiếu trường created_at giúp Spring Boot khởi động thành công.
```

## Ghi chú

```text
Hệ thống đã chạy ổn định cả Backend lẫn Frontend.
```
