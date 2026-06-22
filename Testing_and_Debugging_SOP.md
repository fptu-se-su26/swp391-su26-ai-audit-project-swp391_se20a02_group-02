# Quy trình Tiêu chuẩn (SOP): Testing & Debugging 

Quy trình này áp dụng cho toàn bộ 5 QA Engineers để đảm bảo việc kiểm thử và sửa lỗi diễn ra đồng bộ, không dẫm chân lên nhau và có tỷ lệ tái hiện lỗi (Reproducibility) đạt 100%.

---

## 🚀 Giai đoạn 1: Chuẩn bị (Preparation)

> [!IMPORTANT]
> Tuyệt đối không test trên code cũ của ngày hôm qua. Luôn bắt đầu ngày mới bằng việc đồng bộ mã nguồn.

1. **Daily Rebase:**
   * Mở Terminal, chạy `git pull --rebase origin develop`.
   * Xử lý conflict (nếu có) theo luật Protected Files.
2. **Khởi tạo Dữ liệu (Seed Data):**
   * Vào thư mục `/test-data/qa[X]`/ của bạn.
   * Xóa DB cũ, chạy file `seed-data.sql` để đưa DB về trạng thái chuẩn hóa.
   * Bật Docker / Redis (nếu có).
3. **Khởi động Môi trường:**
   * Run Backend (Spring Boot).
   * Run Frontend (React/Vite).

---

## 🔬 Giai đoạn 2: Thực thi Test (Execution)

1. **Mở tài sản kiểm thử:** Mở file Excel Test Case (VD: `TC_CM_Car_Management.xlsx`) mà AI MASTP đã sinh ra.
2. **Chạy kịch bản:** Thực hiện từng bước (Test Case Procedure) trên giao diện Web (Frontend) hoặc gọi thẳng API bằng Postman.
3. **Đối chiếu kết quả:** So sánh `Actual Result` (Kết quả thực tế) với `Expected Result` (Kết quả mong đợi).
   * Nếu **Khớp**: Ghi `Passed` vào cột *Round 1 Result*.
   * Nếu **Lệch**: Ghi `Failed` và bước ngay sang Giai đoạn 3 (Debugging).

---

## 🕵️ Giai đoạn 3: Phân tích & Gỡ lỗi (Debugging)

> [!CAUTION]
> Khi gặp Bug, cấm chỉ định đẩy thẳng cho người khác mà không có bằng chứng phân tích (Root Cause Analysis). Áp dụng triệt để chính sách **Bug Ownership**.

1. **Định vị tầng lỗi (Frontend hay Backend?):**
   * Mở **Chrome DevTools (F12) -> tab Network**.
   * Xem request gửi đi có đúng payload không? Nếu Frontend gửi sai Data -> Bug Frontend.
   * Nếu request gửi đúng, nhưng API trả về `400/500/403` -> Bug Backend.
2. **Đọc Log Backend:**
   * Mở Terminal của Spring Boot.
   * Tìm dòng chữ `ERROR` hoặc `Exception` gần nhất.
   * Chú ý kỹ dòng **Caused by: ...** để xem lỗi thực sự nằm ở dòng code số mấy.
3. **Phân tích chéo Domain (nếu có):**
   * Ví dụ: Lỗi ở API Booking, nhưng Log ghi `CouponExpiredException`.
   * **QA2 (Booking)** xác định nguyên nhân là do Pricing/Coupon.
   * QA2 copy toàn bộ Log và Payload, chuẩn bị bàn giao cho **QA3 (Finance)**.

---

## 📝 Giai đoạn 4: Báo cáo Bug (Reporting)

Mỗi Bug Ticket bắt buộc phải có đủ 4 yếu tố sau (Tôn chỉ: Bất kỳ ai đọc cũng có thể tái hiện được lỗi):

1. **Mô tả ngắn gọn:** `[API / UI] Lỗi 500 khi áp dụng Coupon hết hạn vào Booking`
2. **Tiền điều kiện (Pre-conditions):** Tài khoản là gì, Mã Coupon là gì, Trạng thái đơn hàng ra sao.
3. **Bằng chứng (Evidence):**
   * Screenshot màn hình lỗi.
   * Dòng cURL của Postman để gọi lại API đó.
   * Stacktrace Error Log của Backend.
4. **Gán nhãn (Assign):** 
   * Gán cho chính mình (nếu bug nằm trong Domain của mình).
   * Gán cho QA khác kèm lời giải thích theo chính sách Bug Ownership.

---

## 🔄 Giai đoạn 5: Fix Bug & Xác minh (Re-test)

1. **Tự Fix bằng AI (Tùy chọn):**
   * Nếu bạn hiểu rõ lỗi, hãy copy đoạn Code bị lỗi + Error Log vứt vào cho AI (Antigravity/Copilot) nhờ sửa.
   * AI đưa ra đoạn Code mới -> Paste vào -> Chạy lại API thấy mã 200 OK.
2. **Đóng gói (Commit):**
   * Lưu code lại theo luồng nhánh Domain của mình.
   * Commit message rõ ràng: `fix(coupon): handle expired coupon status on booking validation`.
3. **Cập nhật Test Case:**
   * Mở lại file Excel, đổi kết quả sang `Passed`.
   * Đóng Bug Ticket trên Jira.
