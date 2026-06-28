# AI Learning Reflection

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
| Ngày hoàn thành reflection | 2026-06-28 |

---

## 2. Mục đích Reflection

File này dùng để Hồ Thành Trung (DE190928) tự đánh giá quá trình sử dụng AI (Antigravity) trong việc xây dựng Backend/Database cho dự án LuxeWay.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Mình sử dụng AI chủ yếu trong mảng hỗ trợ sinh code SQL boilerplate, quản trị phiên bản Git và giải quyết các lỗi biên dịch hệ thống phức tạp.
Trong các tình huống quan trọng như lỗi push file lớn (vượt giới hạn 100MB của GitHub) hay khi gộp nhánh main có sự thay đổi lớn về cấu trúc (hơn 170 tệp tin thay đổi), AI đã giúp mình nhanh chóng phát hiện các thiếu sót về logic biên dịch, đề xuất nâng cấp dependency và phân quyền api client phù hợp.
```

---

## 4. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Công cụ khác: ....................................

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [ ] Hiểu yêu cầu đề bài
- [x] Tìm ý tưởng giải pháp
- [x] Thiết kế database
- [x] Viết code mẫu
- [x] Debug lỗi
- [x] Viết báo cáo

---

## 6. AI có giúp em/nhóm học tốt hơn không?

### 6.1. Những điểm AI giúp em/nhóm học tốt hơn

```text
Giúp tiết kiệm thời gian xử lý các lỗi DevOps/Git và lỗi biên dịch hệ thống. Học cách tổ chức cấu trúc của một ứng dụng Spring Boot + React lớn và quản trị xung đột mã nguồn. Đồng thời giúp việc soạn thảo văn bản markdown báo cáo nhanh chóng và chuyên nghiệp hơn.
```

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

```text
Đôi khi AI đề xuất các đoạn code SQL hoặc Java quá chung chung hoặc bỏ qua cấu hình chi tiết (như lỗi không khớp phiên bản Lombok tương thích với JDK 21). Cần phải kiểm tra và cấu hình chỉnh chu bằng tay.
```

### 6.3. Em/nhóm có bị phụ thuộc vào AI không?

- [ ] Không phụ thuộc
- [x] Phụ thuộc ít
- [ ] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

---

## 7. Em/nhóm đã kiểm tra kết quả AI như thế nào?

- [x] Chạy thử chương trình
- [x] Kiểm tra output
- [x] So sánh với yêu cầu đề bài
- [x] Review code

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Cung cấp SQL seeding và cấu trúc bảng ban đầu không dùng khóa ngoại |
| Vì sao gợi ý đó sai/chưa phù hợp? | Vi phạm tính toàn vẹn cơ sở dữ liệu và cấu trúc dữ liệu chung của nhóm |
| Em/nhóm đã sửa như thế nào? | Tự bổ sung thêm các constraint khóa ngoại kết nối bảng và chỉ định rõ kiểu dữ liệu trong SQL Server |

---

## 9. Phần đóng góp thật sự của sinh viên/nhóm

```text
- Tự thiết kế kiểu dữ liệu chi tiết cho cơ sở dữ liệu SQL Server eKYC.
- Rà soát code xung đột merge, đảm bảo cấu hình Spring Security và CORS hoạt động chính xác.
- Triển khai chạy thực tế dự án local kết nối trực tiếp đến hệ quản trị CSDL SQL Server của máy cá nhân.
```

---

## 10. So sánh trước và sau khi dùng AI

Tốc độ giải quyết lỗi biên dịch và gộp nhánh tăng gấp 5 lần so với việc xử lý hoàn toàn thủ công. Quá trình viết tài liệu báo cáo nhanh hơn 10 lần nhờ form mẫu chuẩn.

---

## 11. Bài học về môn học

```text
Thiết kế CSDL chi tiết là cốt lõi của một hệ thống thương mại điện tử, và quản lý các nhánh Git tốt giúp lập trình viên tránh được tối đa sự cố mất mát mã nguồn trong quá trình làm việc nhóm.
```

---

## 12. Bài học về sử dụng AI có trách nhiệm

```text
Luôn rà soát kỹ lưỡng mọi câu lệnh hệ thống và mã nguồn do AI tạo ra, không phó thác hoàn toàn cho AI để tránh làm hỏng cấu trúc hoạt động của ứng dụng.
```

---

## 13. Điều em/nhóm sẽ không làm khi sử dụng AI

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.

---

## 14. Kế hoạch cải thiện lần sau

Cung cấp đầy đủ thông tin về môi trường chạy (như phiên bản JDK, hệ quản trị cơ sở dữ liệu) ngay từ đầu để AI đưa ra các giải pháp chuẩn xác nhất.

---

## 15. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Sử dụng AI có trách nhiệm | 5 | Đọc hiểu kỹ code trước khi dùng, tự viết thêm phần cấu trúc chính xác |

---

## 16. Cam kết Reflection

Em/nhóm cam kết rằng nội dung reflection này phản ánh trung thực quá trình sử dụng AI.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Hồ Thành Trung - DE190928 | 2026-06-28 |
