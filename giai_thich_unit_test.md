# 📋 Giải thích Chi tiết: Unit Test LW-132 → LW-177 & 7 File TC

> **Người tạo (Created By):** Nguyen Dang | **Người thực hiện (Executed By):** Nguyen Dang

---

## ✅ Kết quả Chạy Unit Test

Unit test được chạy bằng Maven trên project Spring Boot (backend Java).  
**Tất cả test case đều PASS (P) — không có FAIL.**

---

## 🔑 Giải thích Cấu trúc mỗi Sheet LW

Mỗi sheet có cấu trúc chuẩn:

| Hàng | Nội dung |
|------|---------|
| Row 1 | **Function Code** (mã hàm, VD: UTC-022-006) + **Function Name** (tên hàm) |
| Row 2 | **Created By** (người tạo) + **Executed By** (người thực hiện) |
| Row 3 | **Lines of code** (số dòng code) + **Lack of test cases** (thiếu bao nhiêu TC) |
| Row 4 | **Test requirement** = Yêu cầu kiểm thử (mô tả hàm cần test) |
| Row 5–6 | **Passed/Failed/Untested/N/A/B/Total** = Số lượng test đã qua/lỗi/chưa test |
| Row 8 | **UTCID01, UTCID02...** = ID của từng test case (cột) |
| Row 9+ | **Condition** = Điều kiện; **Precondition** = Điều kiện trước khi test |
| ... | **Input** = Dữ liệu đầu vào cho từng test case |
| ... | **Confirm > Return** = Giá trị trả về kỳ vọng |
| ... | **Exception** = Ngoại lệ có thể xảy ra |
| ... | **Log message** = Thông điệp log ghi lại |
| Result | **Type**: N=Bình thường, A=Bất thường, B=Biên (ranh giới) |
| Result | **Passed/Failed**: P=Qua, F=Lỗi; **#** = Ngày chưa điền |

---

## 📊 LW-132: `updateStatus` — Cập nhật trạng thái đặt xe máy

**Service:** `MotorbikeBookingService.java` | **FuncCode:** UTC-022-006  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Cập nhật trạng thái (status) của một booking xe máy dựa vào bookingId và chuỗi trạng thái mới.

| UTCID | Loại | Điều kiện (Precondition) | Đầu vào (Input) | Kết quả mong đợi | Exception |
|-------|------|--------------------------|-----------------|-----------------|-----------|
| UTCID01 | **N - Bình thường** | Booking tồn tại trong DB | bookingId="b1", status="COMPLETED" | Trả về MotorbikeBookingResponse với status=COMPLETED | Không có |
| UTCID02 | **A - Bất thường** | bookingId không tồn tại | bookingId=-1 hoặc null | Ném RuntimeException | RuntimeException |
| UTCID03 | **B - Biên** | bookingId hợp lệ nhưng không có quan hệ | bookingId=1 (số nguyên biên) | Trả về Response với dữ liệu biên | Không có |

---

## 📊 LW-133: `toResponse` — Chuyển đổi Booking → DTO

**Service:** `MotorbikeBookingService.java` | **FuncCode:** UTC-022-007  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Chuyển đổi đối tượng Booking thành MotorbikeBookingResponse DTO, ánh xạ tất cả các trường bao gồm thông tin xe, người thuê, chủ xe.

| UTCID | Loại | Precondition | Input | Return |
|-------|------|-------------|-------|--------|
| UTCID01 | **N** | Booking object tồn tại đầy đủ | Booking object có đầy đủ trường | MotorbikeBookingResponse với tất cả trường được ánh xạ đúng |
| UTCID02 | **A** | Dữ liệu không hợp lệ / thiếu | Giá trị null | IllegalArgumentException |
| UTCID03 | **B** | Trạng thái biên | Giá trị cực đại | MotorbikeBookingResponse với giá trị biên/cực đại |

---

## 📊 LW-134: `searchMotorbikes` — Tìm kiếm xe máy

**Service:** `MotorbikeService.java` | **FuncCode:** UTC-023-001  
**Tổng:** 4 test cases | **Passed:** 4 ✅

**Yêu cầu:** Tìm kiếm xe máy theo thành phố, dung tích động cơ, hộp số, và bộ lọc tùy chọn, trả về danh sách phân trang.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | Loại hộp số hợp lệ | city=Hanoi, transmission=MANUAL | Danh sách xe máy phù hợp |
| UTCID02 | **N** | Loại hộp số không hợp lệ | city=null, transmission=null | RuntimeException |
| UTCID03 | **A** | Phân trang âm | page=-1, size=0 | IllegalArgumentException |
| UTCID04 | **B** | Phân trang tối đa | page=Integer.MAX_VALUE, size=Integer.MAX_VALUE | Kết quả hoặc lỗi biên |

---

## 📊 LW-135: `getMotorbikeById` — Lấy xe máy theo ID

**Service:** `MotorbikeService.java` | **FuncCode:** UTC-023-002  
**Tổng:** 4 test cases | **Passed:** 4 ✅

**Yêu cầu:** Lấy thông tin xe máy theo ID, đảm bảo xe tồn tại và thuộc loại MOTORBIKE.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | Xe tồn tại và là MOTORBIKE | id="v1" | Thông tin xe máy đầy đủ |
| UTCID02 | **N** | Xe tồn tại nhưng KHÔNG phải MOTORBIKE | id="v1" | RuntimeException (sai loại) |
| UTCID03 | **A** | ID không tồn tại | id=-1 hoặc null | RuntimeException (không tìm thấy) |
| UTCID04 | **B** | ID hợp lệ nhưng không có quan hệ | id=1 | Kết quả biên |

---

## 📊 LW-136: `createMotorbike` — Tạo xe máy mới

**Service:** `MotorbikeService.java` | **FuncCode:** UTC-023-003  
**Tổng:** 4 test cases | **Passed:** 4 ✅

**Yêu cầu:** Tạo bản ghi xe máy mới liên kết với chủ xe và model hợp lệ, đảm bảo kiểm tra phụ thuộc.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | Chủ xe tồn tại trong DB | CreateMotorbikeRequest hợp lệ + modelId tồn tại | Motorbike object mới được tạo |
| UTCID02 | **N** | Chủ xe KHÔNG tồn tại | CreateMotorbikeRequest với ownerId không tìm thấy | RuntimeException |
| UTCID03 | **A** | ownerId không tồn tại | ownerId=-1 hoặc null | Ngoại lệ |
| UTCID04 | **B** | ownerId hợp lệ nhưng không có quan hệ | ownerId=1 | Kết quả đối tượng rỗng |

---

## 📊 LW-137: `deleteMotorbike` — Xóa xe máy

**Service:** `MotorbikeService.java` | **FuncCode:** UTC-023-004  
**Tổng:** 4 test cases | **Passed:** 4 ✅

**Yêu cầu:** Xóa xe máy theo ID, đảm bảo xe tồn tại hoặc ném ngoại lệ nếu không tìm thấy.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | vehicleRepository.findById("v1") → tìm thấy | id="v1" | Xóa thành công (void) |
| UTCID02 | **N** | vehicleRepository.findById("v1") → không tìm thấy | id="v1" | RuntimeException |
| UTCID03 | **A** | id không tồn tại | id=-1 hoặc null | RuntimeException |
| UTCID04 | **B** | id hợp lệ nhưng không có quan hệ | id=1 | Kết quả biên |

---

## 📊 LW-138: `seedTemplates` — Khởi tạo mẫu thông báo

**Service:** `NotificationHubService.java` | **FuncCode:** UTC-024-001  
**Tổng:** 5 test cases | **Passed:** 5 ✅

**Yêu cầu:** Khởi tạo các mẫu thông báo mặc định trong DB nếu chúng chưa tồn tại.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | Không có mẫu nào trong DB | Không có (void) | Các mẫu được tạo; Log: "Checking/seeding..." |
| UTCID02 | **N** | Đã có mẫu trong DB rồi | Không có (void) | Bỏ qua (không tạo lại) |
| UTCID03 | **N** | Trạng thái mặc định | Không có (void) | Xử lý bình thường |
| UTCID04 | **A** | Lỗi hệ thống (DB ngắt kết nối) | Không có | Ném ngoại lệ hệ thống |
| UTCID05 | **B** | DB không có bản ghi nào | Không có | Trả về rỗng/Optional.empty() |

---

## 📊 LW-139: `dispatchNotification` — Gửi thông báo

**Service:** `NotificationHubService.java` | **FuncCode:** UTC-024-003  
**Tổng:** 5 test cases | **Passed:** 5 ✅

**Yêu cầu:** Gửi thông báo tới người dùng bằng cách xử lý template và gửi qua kênh cấu hình sẵn, ghi log kết quả.

| UTCID | Loại | Precondition | Input | Kết quả |
|-------|------|-------------|-------|---------|
| UTCID01 | **N** | User tồn tại + Template tồn tại | userId hợp lệ, templateName hợp lệ | void — gửi thành công, ghi log |
| UTCID02 | **N** | User KHÔNG tồn tại | userId không tìm thấy | void — trả về im lặng; Log: "User {} not found" |
| UTCID03 | **N** | Template KHÔNG tồn tại | userId hợp lệ, templateName không tồn tại | void — trả về im lặng; Log: "Template {} not found" |
| UTCID04 | **A** | userId không tồn tại | userId=-1 hoặc null | Ngoại lệ |
| UTCID05 | **B** | userId hợp lệ nhưng không có quan hệ | userId=1 | Đối tượng rỗng |

---

## 📊 LW-140: `processTemplate` — Xử lý mẫu nội dung

**Service:** `NotificationHubService.java` | **FuncCode:** UTC-024-004  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Xử lý chuỗi template bằng cách thay thế các placeholder bằng giá trị từ map được cung cấp.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | Không có điều kiện đặc biệt | Không có input cụ thể | Chuỗi kết quả sau khi thay thế placeholder |
| UTCID02 | **A** | src (chuỗi nguồn) là null | src=null | IllegalArgumentException |
| UTCID03 | **B** | src rỗng hoặc dài tối đa | src="" hoặc 255 ký tự | Chuỗi rỗng hoặc kết quả biên |

---

## 📊 LW-141: `stripHtml` — Loại bỏ thẻ HTML *(đã sửa)*

**Service:** `NotificationHubService.java` | **FuncCode:** UTC-024-005  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Loại bỏ tất cả thẻ HTML khỏi chuỗi đầu vào.  
**⚠️ Đã sửa:** UTCID01 (Normal) trước đây có precondition sai là "null" → đã đổi thành "chứa thẻ HTML hợp lệ"

| UTCID | Loại | Precondition | Input | Return |
|-------|------|-------------|-------|--------|
| UTCID01 | **N** | Chuỗi chứa thẻ HTML hợp lệ | html=`<p>Hello <b>World</b></p>` | `"Hello World"` (đã bỏ thẻ) |
| UTCID02 | **A** | html là null | html=null | IllegalArgumentException |
| UTCID03 | **B** | html rỗng hoặc rất dài | html="" hoặc 255 ký tự | Chuỗi rỗng hoặc kết quả biên |

---

## 📊 LW-142: `getMyNotifications` — Lấy danh sách thông báo

**Service:** `NotificationService.java` | **FuncCode:** UTC-025-001  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Lấy danh sách thông báo phân trang của người dùng, sắp xếp theo ngày tạo giảm dần.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | userId="u1", page=0, size=10 | Page<Notification> đã sắp xếp |
| UTCID02 | **A** | page=-1, size=0 | IllegalArgumentException |
| UTCID03 | **B** | page=Integer.MAX_VALUE, size=Integer.MAX_VALUE | Kết quả rỗng hoặc lỗi biên |

---

## 📊 LW-143: `getUnreadCount` — Đếm thông báo chưa đọc

**Service:** `NotificationService.java` | **FuncCode:** UTC-025-002  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Lấy số lượng thông báo chưa đọc của người dùng theo ID.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | userId="u1" (có 5 thông báo chưa đọc) | Trả về 5 |
| UTCID02 | **A** | userId=-1 hoặc null | IllegalArgumentException |
| UTCID03 | **B** | userId=1 (số biên) | Kết quả số biên |

---

## 📊 LW-144: `markAsRead` — Đánh dấu thông báo đã đọc

**Service:** `NotificationService.java` | **FuncCode:** UTC-025-003  
**Tổng:** 5 test cases | **Passed:** 5 ✅

**Yêu cầu:** Đánh dấu thông báo đã đọc nếu người dùng là chủ sở hữu, ném ngoại lệ nếu không phải.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | Thông báo tồn tại + thuộc về user | notifId="n1", userId="u1" | Notification đánh dấu đã đọc |
| UTCID02 | **N** | Thông báo tồn tại nhưng của user khác | notifId="n1", userId="hacker" | AccessDeniedException |
| UTCID03 | **N** | Thông báo không tồn tại | notifId="n1", userId="u1" | RuntimeException |
| UTCID04 | **A** | notifId không tồn tại | notifId=-1 hoặc null | Ngoại lệ |
| UTCID05 | **B** | notifId hợp lệ nhưng không có quan hệ | notifId=1 | Kết quả biên |

---

## 📊 LW-145: `markAllAsRead` — Đánh dấu tất cả đã đọc

**Service:** `NotificationService.java` | **FuncCode:** UTC-025-004  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Đánh dấu tất cả thông báo là đã đọc cho một user, trả về số lượng đã cập nhật.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | userId="u1" (có thông báo) | Số lượng thông báo đã cập nhật |
| UTCID02 | **A** | userId=-1 hoặc null | IllegalArgumentException |
| UTCID03 | **B** | userId=1 (biên) | Kết quả biên |

---

## 📊 LW-146: `createNotification` — Tạo thông báo

**Service:** `NotificationService.java` | **FuncCode:** UTC-025-005  
**Tổng:** 4 test cases | **Passed:** 4 ✅

**Yêu cầu:** Tạo thông báo cho user, lưu vào DB, và phát qua WebSocket nếu user tồn tại.

| UTCID | Loại | Precondition | Input | Return |
|-------|------|-------------|-------|--------|
| UTCID01 | **N** | User tồn tại | userId="u1", type, title, body, link | Thông báo lưu thành công + WebSocket broadcast |
| UTCID02 | **N** | User KHÔNG tồn tại | userId="u1" (không tồn tại) | Không làm gì (no action) |
| UTCID03 | **A** | userId không tồn tại | userId=-1 hoặc null | Ngoại lệ |
| UTCID04 | **B** | userId hợp lệ nhưng không có quan hệ | userId=1 | Đối tượng rỗng |

> **Log message:** "Notification created for user u1: Title", "Broadcasted realtime notification..."

---

## 📊 LW-147: `toResponse` — Chuyển Notification → DTO *(đã sửa)*

**Service:** `NotificationService.java` | **FuncCode:** UTC-025-006  
**Tổng:** 3 test cases | **Passed:** 3 ✅

| UTCID | Loại | Input | Return |
|-------|------|-------|--------|
| UTCID01 | **N** | Notification object đầy đủ | NotificationResponse với tất cả trường ánh xạ đúng |
| UTCID02 | **A** | Giá trị null | IllegalArgumentException |
| UTCID03 | **B** | Giá trị cực đại | NotificationResponse với giá trị biên |

---

## 📊 LW-148: `getOwnerDashboardStats` — Thống kê dashboard chủ xe

**Service:** `OwnerAnalyticsService.java` | **FuncCode:** UTC-026-001  
**Tổng:** 4 test cases | **Passed:** 4 ✅

**Yêu cầu:** Tính toán và tổng hợp thống kê dashboard chủ xe: số lượng booking, doanh thu, số xe, hiệu suất.

| UTCID | Loại | Precondition | Input | Return |
|-------|------|-------------|-------|--------|
| UTCID01 | **N** | Chủ xe có booking hoàn thành và đang chờ | ownerId="o1" | Map chứa doanh thu + thống kê booking |
| UTCID02 | **N** | Chủ xe không có booking, không có xe | ownerId="EMPTY-OWNER" | Map rỗng/mặc định |
| UTCID03 | **A** | ownerId không tồn tại | ownerId=-1 hoặc null | Ngoại lệ |
| UTCID04 | **B** | ownerId hợp lệ nhưng không có quan hệ | ownerId=1 | Đối tượng rỗng |

> **Log:** "Compiling owner analytics for ownerId: {}"

---

## 📊 LW-149: `exportOwnerReportPdf` — Xuất báo cáo PDF

**Service:** `OwnerAnalyticsService.java` | **FuncCode:** UTC-026-002  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Tạo file PDF chứa thống kê doanh thu xe và hiệu suất hàng tháng của chủ xe.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | ownerId="o1" (có dữ liệu) | File PDF được tạo thành công |
| UTCID02 | **A** | ownerId không tồn tại | IllegalArgumentException |
| UTCID03 | **B** | ownerId hợp lệ nhưng không có quan hệ | Kết quả biên |

---

## 📊 LW-150: `exportOwnerReportExcel` — Xuất báo cáo Excel

**Service:** `OwnerAnalyticsService.java` | **FuncCode:** UTC-026-003  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Tạo file Excel chứa thống kê booking hàng tháng và doanh thu của chủ xe.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | ownerId="o1" | File Excel được tạo thành công |
| UTCID02 | **A** | ownerId không tồn tại | IllegalArgumentException |
| UTCID03 | **B** | ownerId hợp lệ biên | Kết quả biên |

---

## 📊 LW-151: `addCellSummary` — Thêm ô tóm tắt vào PDF table

**Service:** `OwnerAnalyticsService.java` | **FuncCode:** UTC-026-004  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Thêm ô tóm tắt có style (label + value) vào bảng PdfPTable.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | table, label, val, font đầy đủ | Ô được thêm vào table thành công |
| UTCID02 | **A** | label=null | IllegalArgumentException |
| UTCID03 | **B** | label="" hoặc 255 ký tự | Kết quả biên |

---

## 📊 LW-152: `addHeaderCell` — Thêm ô tiêu đề vào PDF table

**Service:** `OwnerAnalyticsService.java` | **FuncCode:** UTC-026-005  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Thêm ô tiêu đề có style (màu nền, border, padding, căn lề) vào PdfPTable.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | table, text, font đầy đủ | Ô tiêu đề được thêm thành công |
| UTCID02 | **A** | text=null | IllegalArgumentException |
| UTCID03 | **B** | text="" hoặc 255 ký tự | Kết quả biên |

---

## 📊 LW-153: `formatVnd` — Định dạng tiền VND

**Service:** `OwnerAnalyticsService.java` | **FuncCode:** UTC-026-006  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Định dạng giá trị BigDecimal thành chuỗi tiền VND, mặc định "0 VND" nếu input null.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | Input null → "0 VND"; Input hợp lệ → định dạng | val=null; val=BigDecimal dương | "0 VND"; "1.200.000 đ" |
| UTCID02 | **A** | Dữ liệu không hợp lệ | Giá trị null | IllegalArgumentException |
| UTCID03 | **B** | Giá trị cực biên | Giá trị cực đại | Chuỗi biên |

---

## 📊 LW-154: `getUserPaymentMethods` — Lấy phương thức thanh toán

**Service:** `PaymentMethodService.java` | **FuncCode:** UTC-027-001  
**Tổng:** 3 test cases | **Passed:** 3 ✅

**Yêu cầu:** Lấy danh sách phương thức thanh toán đang hoạt động của user.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | userId="u1" (có phương thức) | Danh sách PaymentMethod đang hoạt động |
| UTCID02 | **A** | userId=-1 hoặc null | IllegalArgumentException |
| UTCID03 | **B** | userId=1 (biên) | Kết quả biên |

---

## 📊 LW-155: `savePaymentMethod` — Lưu phương thức thanh toán *(đã sửa)*

**Service:** `PaymentMethodService.java` | **FuncCode:** UTC-027-002  
**Tổng:** 5 test cases | **Passed:** 5 ✅

**Yêu cầu:** Lưu phương thức thanh toán mới, tự động đặt làm mặc định nếu là phương thức đầu tiên.

| UTCID | Loại | Precondition | Input | Return |
|-------|------|-------------|-------|--------|
| UTCID01 | **N** | User KHÔNG tồn tại | userId="unknown" | RuntimeException |
| UTCID02 | **N** | User tồn tại, chưa có phương thức nào | userId="u1", isDefault=false | PaymentMethod với isDefault=true (tự động) |
| UTCID03 | **N** | User tồn tại, đã có phương thức khác | userId="u1", isDefault=true | Cập nhật phương thức cũ → false, mới → true |
| UTCID04 | **A** | userId không tồn tại | userId=-1 hoặc null | Ngoại lệ |
| UTCID05 | **B** | userId hợp lệ biên | userId=1 | Kết quả biên |

> **Log:** "Saved new payment method: {} for user: {}"

---

## 📊 LW-156: `setDefault` — Đặt phương thức thanh toán mặc định

**Service:** `PaymentMethodService.java` | **FuncCode:** UTC-027-003  
**Tổng:** 4 test cases | **Passed:** 4 ✅

**Yêu cầu:** Đặt phương thức thanh toán cụ thể làm mặc định, kiểm tra quyền truy cập.

| UTCID | Loại | Input | Return/Exception |
|-------|------|-------|-----------------|
| UTCID01 | **N** | userId="u2", id="pm1" (không phải chủ) | Không có quyền, bỏ qua hoặc lỗi |
| UTCID02 | **N** | userId="u1", id="pm1" (đúng chủ) | PaymentMethod cập nhật isDefault=true |
| UTCID03 | **A** | userId=-1 hoặc null | Ngoại lệ |
| UTCID04 | **B** | userId hợp lệ biên | Kết quả biên |

> **Log:** "Set default payment method: {} for user: {}"

---

## 📊 LW-157: `deletePaymentMethod` — Xóa phương thức thanh toán

**Service:** `PaymentMethodService.java` | **FuncCode:** UTC-027-004  
**Tổng:** 4 test cases | **Passed:** 4 ✅

**Yêu cầu:** Xóa mềm phương thức thanh toán và tự động đặt phương thức khác làm mặc định nếu cần.

| UTCID | Loại | Input | Return |
|-------|------|-------|--------|
| UTCID01 | **N** | userId="u1", id="pm1" (đúng chủ) | void — xóa + tự động đổi mặc định |
| UTCID02 | **N** | userId="hacker", id="pm1" | void — không có quyền |
| UTCID03 | **A** | userId=-1 | Ngoại lệ |
| UTCID04 | **B** | userId biên | Kết quả biên |

> **Log:** "Soft deleted: pm1", "Auto-promoted new default: pm2"

---

## 📊 LW-158→LW-166: Các hàm PaymentService

**Service:** `PaymentService.java` | **FuncCode:** UTC-028-001 đến UTC-028-009

| Sheet | Hàm | Tóm tắt |
|-------|-----|---------|
| LW-158 | `createPayment` | Tạo payment cho booking (ví, Stripe, thẻ) |
| LW-159 | `topUpWallet` | Nạp tiền ví qua Stripe/VNPay |
| LW-160 | `getPaymentsByBooking` | Lấy danh sách payment theo bookingId |
| LW-161 | `getMyPayments` | Lấy payment của user phân trang |
| LW-162 | `processVNPayCallback` | Xử lý callback từ VNPay |
| LW-163 | `refundPayment` | Hoàn tiền cho payment SUCCEEDED |
| LW-164 | `buildVNPayUrl` | Tạo URL thanh toán VNPay |
| LW-165 | `hmacSHA512` | Tạo hash HMAC-SHA512 từ key+data |
| LW-166 | `toResponse` | Chuyển Payment entity → PaymentResponse DTO |

---

## 📊 LW-167→LW-170: PricingEngine & PricingEngineService

| Sheet | Hàm | Tóm tắt |
|-------|-----|---------|
| LW-167 | `calculateBasePriceForPeriod` | Tính giá thuê cơ bản cho khoảng thời gian |
| LW-168 | `calculatePrice` | Tính tổng giá thuê có chiết khấu, quy tắc giá |
| LW-169 | `isRuleApplicable` | Kiểm tra quy tắc giá áp dụng được không (WEEKEND/ngày) |
| LW-170 | `isVehicleRuleApplicable` | Kiểm tra quy tắc giá xe có áp dụng không |

---

## 📊 LW-171→LW-176: RecommendationService

**Service:** `RecommendationService.java` | **FuncCode:** UTC-031-001 đến UTC-031-006

| Sheet | Hàm | Mô tả tiếng Việt |
|-------|-----|-----------------|
| LW-171 | `getSimilarCars` | Lấy danh sách ô tô tương tự theo category/brand |
| LW-172 | `getSimilarMotorbikes` | Lấy danh sách xe máy tương tự theo category/brand |
| LW-173 | `getPopularCars` | Lấy ô tô phổ biến, lọc theo thành phố, sắp xếp theo tổng booking |
| LW-174 | `getPopularMotorbikes` | Lấy xe máy phổ biến lọc theo thành phố |
| LW-175 | `getRecommendedCarsForUser` | Gợi ý ô tô cho user theo rating |
| LW-176 | `getRecommendedMotorbikesForUser` | Gợi ý xe máy cho user theo rating |

**Ví dụ chi tiết LW-173 `getPopularCars`:**

| UTCID | Loại | Input | Return |
|-------|------|-------|--------|
| UTCID01 | **N** | city="London", limit=5 | Danh sách ô tô lọc theo London |
| UTCID02 | **N** | city=null, limit=5 | Tất cả ô tô sắp xếp theo booking |
| UTCID03 | **A** | city=null | Ngoại lệ hoặc kết quả rỗng |
| UTCID04 | **B** | city="" hoặc 255 ký tự | Kết quả biên |

---

## 📊 LW-177: `createReview` — Tạo đánh giá *(đã sửa Created By)*

**Service:** `ReviewService.java` | **FuncCode:** UTC-032-001  
**Tổng:** 7 test cases | **Passed:** 7 ✅

**Yêu cầu:** Tạo đánh giá cho booking đã hoàn thành, chỉ người thuê mới có quyền, và booking chưa có đánh giá.

| UTCID | Loại | Precondition | Input | Return/Exception |
|-------|------|-------------|-------|-----------------|
| UTCID01 | **N** | Booking tồn tại + đã COMPLETED | bookingId hợp lệ + nội dung đánh giá | Review được tạo |
| UTCID02 | **N** | Booking KHÔNG tồn tại | bookingId không tồn tại | RuntimeException |
| UTCID03 | **N** | Người đánh giá KHÔNG phải người thuê | reviewerId ≠ renterId | RuntimeException (từ chối quyền) |
| UTCID04 | **N** | Booking chưa hoàn thành (status ≠ COMPLETED) | booking status=PENDING | RuntimeException |
| UTCID05 | **N** | Booking đã có review rồi | Review đã tồn tại | RuntimeException (trùng lặp) |
| UTCID06 | **A** | reviewerId không tồn tại | reviewerId=-1 hoặc null | Ngoại lệ |
| UTCID07 | **B** | reviewerId hợp lệ nhưng không có quan hệ | reviewerId=1 | Kết quả biên |

> **Log:** "Review created: {} for booking {}"

---

# 📁 Giải thích 7 File TC (Test Case)

## 🔑 Cấu trúc chung mỗi file TC

| Cột | Tên | Ý nghĩa |
|-----|-----|---------|
| 1 | **Mã Test Case** | VD: TC-BL-001 |
| 2 | **Mô tả Test Case** | Mô tả ngắn gọn mục đích test |
| 3 | **Phân loại** | Chức năng tích cực / Bảo mật / Kiểm tra hợp lệ / Edge Case / Ranh giới |
| 4 | **Các bước thực hiện** | Cách thực hiện test (gọi API nào, body gì) |
| 5 | **Kết quả mong đợi** | HTTP code mong đợi + response body |
| 6 | **Kết quả thực tế** | Đã test xong: "Hoạt động đúng như mong đợi" |
| 7 | **Linked BR** | Business Requirement liên quan |
| 9 | **Linked Function** | Hàm Java xử lý *(đã điền đầy đủ)* |
| 11 | **Lần 1** | Kết quả lần test 1 (PASS/FAIL) |
| 12 | **Ngày Test** | Ngày chạy test |
| 13 | **Người Test** | Người thực hiện test |

---

## 📁 File 1: TC_BL_Booking_Lifecycle.xlsx (33 TCs)

**Mục đích:** Test toàn bộ vòng đời đặt xe (Booking Lifecycle)  
**Service:** `BookingService.java`, `CarBookingService.java`

| Phân loại | Số lượng |
|-----------|---------|
| Chức năng tích cực | 25 TCs |
| Bảo mật | nhiều |
| Edge Case | 2 TCs |
| Ranh giới | 1 TC |

**Ví dụ các TC quan trọng:**

| Mã | Mô tả | Kết quả mong đợi |
|----|-------|-----------------|
| TC-BL-001 | Tạo booking thành công với thông tin hợp lệ | HTTP 200, booking được tạo |
| TC-BL-002 | Ngày kết thúc trước ngày bắt đầu → lỗi | HTTP 400/500, RuntimeException |
| TC-BL-003 | Ngày bắt đầu ở quá khứ → lỗi | HTTP 400/500 |
| TC-BL-004 | Xe không tồn tại → lỗi | RuntimeException: "Vehicle not found" |
| TC-BL-005 | Xe không ở trạng thái AVAILABLE → lỗi | RuntimeException |

---

## 📁 File 2: TC_DC_Digital_Contract_1782145189.xlsx (30 TCs)

**Mục đích:** Test hợp đồng điện tử (Digital Contract)  
**Service:** `DigitalContractService.java`

| Mã | Mô tả | Kết quả mong đợi |
|----|-------|-----------------|
| TC-DC-001 | Admin tạo hợp đồng thành công | HTTP 200, contract được tạo |
| TC-DC-002 | Người thuê tạo hợp đồng (isAdmin=false) | HTTP 200 hoặc phân quyền phù hợp |
| TC-DC-003 | Lấy hợp đồng theo bookingId thành công | HTTP 200, trả về contract |
| TC-DC-004 | Lấy hợp đồng không tồn tại | HTTP 404 |
| TC-DC-005 | Người thuê ký hợp đồng thành công | HTTP 200, contract signed |

---

## 📁 File 3: TC_DIS_Dispute_1782145786.xlsx (33 TCs)

**Mục đích:** Test tranh chấp (Dispute)  
**Service:** `DisputeService.java`

| Mã | Mô tả | Kết quả |
|----|-------|---------|
| TC-DIS-001 | Người thuê tạo tranh chấp thành công | HTTP 200 |
| TC-DIS-002 | Chủ xe tạo tranh chấp thành công | HTTP 200 |
| TC-DIS-003 | Người không liên quan tạo tranh chấp → lỗi | RuntimeException (không có quyền) |
| TC-DIS-004 | bookingId không tồn tại | RuntimeException |
| TC-DIS-005 | Không có JWT → 401 | HTTP 401 |

---

## 📁 File 4: TC_HEL_Help_1782145920.xlsx (30 TCs)

**Mục đích:** Test trung tâm trợ giúp (Help Center/FAQ)  
**Service:** `HelpService.java`, `FAQService.java`

| Mã | Mô tả | Kết quả |
|----|-------|---------|
| TC-HEL-001 | Lấy danh sách danh mục Help Center | HTTP 200, danh sách categories |
| TC-HEL-002 | Lấy bài viết theo category slug | HTTP 200 |
| TC-HEL-003 | Lấy chi tiết bài viết theo ID | HTTP 200 |
| TC-HEL-004 | Tìm kiếm với từ khóa hợp lệ | HTTP 200, kết quả liên quan |
| TC-HEL-005 | Tìm kiếm từ khóa rỗng → tất cả bài viết | HTTP 200, toàn bộ danh sách |

---

## 📁 File 5: TC_ID_Insurance_and_Deposit_1782145043.xlsx (30 TCs)

**Mục đích:** Test bảo hiểm & tiền cọc  
**Service:** `BookingService.java` (phần insurance), `PaymentService.java`

| Mã | Mô tả | Kết quả |
|----|-------|---------|
| TC-ID-001 | Lấy bảo hiểm xe ô tô theo carId hợp lệ | HTTP 200, danh sách gói bảo hiểm |
| TC-ID-002 | Fallback sang gói bảo hiểm toàn cầu | HTTP 200, dùng global package |
| TC-ID-003 | Không có gói bảo hiểm nào → mảng rỗng | HTTP 200, data=[] |
| TC-ID-004 | Tất cả gói bảo hiểm isActive=false | HTTP 200, data=[] |
| TC-ID-005 | Kiểm tra cấu trúc JSON response | HTTP 200, đúng cấu trúc |

---

## 📁 File 6: TC_REV_Review_1782146901.xlsx (36 TCs)

**Mục đích:** Test chức năng đánh giá (Review)  
**Service:** `ReviewService.java`

| Mã | Mô tả | Kết quả |
|----|-------|---------|
| TC-REV-001 | Người thuê tạo đánh giá cho booking COMPLETED | HTTP 200, review được lưu |
| TC-REV-002 | Đánh giá với rating tối thiểu (rating=1) | HTTP 200, hợp lệ |
| TC-REV-003 | Booking chưa COMPLETED → lỗi | HTTP 400/500 |
| TC-REV-004 | Booking đã có review → lỗi trùng lặp | RuntimeException |
| TC-REV-005 | Không phải người thuê → từ chối | HTTP 403 |
| TC-REV-014 | Featured reviews với limit=3 mặc định | HTTP 200, tối đa 3 reviews |
| TC-REV-015 | Lấy tất cả review có phân trang | HTTP 200, Page<ReviewResponse> |
| TC-REV-016 | Lọc review theo rating=5 | HTTP 200, chỉ rating=5 |

---

## 📁 File 7: TC_ST_Support_Ticket_1782147036.xlsx (33 TCs)

**Mục đích:** Test hệ thống Support Ticket (hỗ trợ khách hàng)  
**Service:** `SupportTicketService.java`

| Mã | Mô tả | Kết quả |
|----|-------|---------|
| TC-ST-001 | Tạo ticket với đầy đủ thông tin | HTTP 200, ticket được tạo |
| TC-ST-002 | Không có bookingId → bookingId=null | HTTP 200 |
| TC-ST-003 | Không truyền priority → mặc định NORMAL | HTTP 200, priority=NORMAL |
| TC-ST-005 | Không có JWT → 401 | HTTP 401 |
| TC-ST-006 | Thiếu subject → lỗi DB NOT NULL | HTTP 500 |
| TC-ST-009 | Lấy danh sách ticket của chính mình | HTTP 200, danh sách ticket |
| TC-ST-015 | Customer xem ticket của người khác → 403 | HTTP 403 |
| TC-ST-019 | Admin reply → senderType=AGENT, OPEN→IN_PROGRESS | HTTP 200, chuyển trạng thái |
| TC-ST-023 | Admin cập nhật status → CLOSED | HTTP 200 |

---

## ⚠️ Các vấn đề đã sửa

| File | Vấn đề | Đã sửa |
|------|--------|--------|
| LW-141 | Precondition Normal là "null" — sai logic | ✅ Sửa thành "chứa thẻ HTML hợp lệ" |
| LW-141 | Input Normal là "html=null" — sai | ✅ Sửa thành `<p>Hello <b>World</b></p>` |
| LW-177 | Created By/Executed By vẫn là "LHau" | ✅ Đổi thành "Nguyen Dang" |
| 7 TC files | Cột "Linked Function" trống toàn bộ | ✅ Điền đủ 225 TCs |
| LW-132/133/147/166 | Mô tả return value thiếu | ✅ Thêm mô tả cụ thể |
