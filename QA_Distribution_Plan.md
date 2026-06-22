# Kế hoạch Phân bổ QA & Release Management (v2.0)

Dưới vai trò QA Lead & Release Manager, tài liệu này quy định chiến lược phân bổ công việc cho 5 QA Engineers theo nguyên tắc Domain-Driven Design (DDD), kết hợp với quản trị rủi ro xung đột (Conflict Management) ở mức độ Entity và File để đảm bảo luồng làm việc song song hiệu quả nhất.

---

## 1. Domain Ownership (Bảng Phân Công Module)

| QA | Nhóm Nghiệp vụ (Domain) | Modules phụ trách | Branch Cốt lõi |
| :--- | :--- | :--- | :--- |
| **QA 1** | **Inventory & Core Profiles** | CM, MM, VEH, LOC, UPL, USE, EMP | `qa1-inventory-domain` |
| **QA 2** | **Booking & Post-Booking** | BL, DC, ID, DIS, REV, ST, HEL | `qa2-booking-domain` |
| **QA 3** | **Finance, Pricing & Promo** | PGI, INV, PM, PR, COU, REW, COR | `qa3-finance-domain` |
| **QA 4** | **Platform, Auth & Admin** | AA, ADM, AS, AUD, NOT, NH, FAQ, TES | `qa4-platform-domain` |
| **QA 5** | **AI, Analytics & Discovery** | AC, AP, REC, OA, STA, CHA, HOM | `qa5-ai-analytics-domain` |

> [!NOTE]
> AI Domain (QA 5) không chỉ READ. QA 5 có quyền thao tác trực tiếp lên các bảng phục vụ báo cáo, ghi logs tracking, sinh dữ liệu AI, tạo aggregation tables. Tuyệt đối không được phép sửa đổi logic ghi/xóa của Booking, Vehicle, Payment.

---

## 2. Shared Entity Ownership Matrix

Các Domain không hoạt động độc lập mà chia sẻ rất nhiều Entity chung. Để tránh Conflict khi sửa Data Model, quy định về Ownership đối với các Entity cốt lõi như sau:

| Shared Component | Owner Độc Quyền | Quyền của các QA khác (Non-Owners) |
| :--- | :--- | :--- |
| **User Entity** | **QA 1** | Chỉ được dùng DTO, Adapter, ViewModel, Projection |
| **Vehicle Entity** | **QA 1** | Không được thêm/sửa/xóa trường trong Entity gốc |
| **Booking Entity** | **QA 2** | Ví dụ: QA3 muốn gắn Invoice vào Booking thì dùng cột `invoice_id` và tạo DTO riêng |
| **Payment Entity** | **QA 3** | Trích xuất thông tin qua View hoặc DTO chuyên biệt |
| **Auth & Security** | **QA 4** | Yêu cầu QA4 mở API Endpoint nếu cần |
| **Analytics Models**| **QA 5** | Gọi qua các Service Analytics, không sửa Schema trực tiếp |

---

## 3. Test Assets Ownership (Dữ liệu Kiểm thử)

Xung đột lớn nhất thường đến từ dữ liệu Test dùng chung. Bắt buộc tách biệt quyền sở hữu Test Assets:

* Môi trường chứa Dữ liệu Mock, SQL Seed, Postman Collections, Excel Test Cases phải được chia thư mục riêng biệt:
  * `/test-data/qa1`
  * `/test-data/qa2`
  * `/test-data/qa3`
  * `/test-data/qa4`
  * `/test-data/qa5`
* Nghiêm cấm dùng chung 1 file `test-data.sql` khổng lồ. Merge sẽ vỡ ngay lập tức.

---

## 4. Protected Files List (Các Điểm Nóng Conflict)

> [!WARNING]
> Bất kỳ ai muốn sửa các file trong danh sách dưới đây đều KHÔNG ĐƯỢC COMMIT TRỰC TIẾP vào nhánh chung.

1. `SecurityConfig.java` / `AuthController.java`
2. `User.java`, `Booking.java`, `Vehicle.java`
3. `application.yml` / `application-sqlserver.yml`
4. `docker-compose.yml`
5. `Flyway Migration Scripts` (Thư mục db/migration)
6. `GlobalExceptionHandler.java`

**Quy trình sửa Protected File:**
1. Tạo Change Request (Mô tả lý do sửa).
2. QA Lead (hoặc Owner của File đó) duyệt.
3. Commit/Merge dưới sự chứng kiến của Owner.

---

## 5. Daily Rebase & Integration Policy

Để tránh "bom hẹn giờ" Integration Conflict xuất hiện vào cuối tuần, chúng ta chuyển từ Weekly Merge sang **Daily Integration**:

* **Quy trình Hàng ngày:** `Feature Branch` → `Domain Branch` → `Develop`.
* **Bắt buộc:** Tất cả QA phải chạy lệnh `git pull --rebase origin develop` vào đầu mỗi buổi sáng.
* Việc rebase hàng ngày giúp phát hiện ngay lập tức nếu QA1 đổi cấu trúc User Entity khiến code của QA2 biên dịch lỗi. Giải quyết conflict nhỏ mỗi ngày thay vì 1 cục conflict khổng lồ.

---

## 6. Integration Test Ownership

> [!IMPORTANT]
> Ai là người chịu trách nhiệm test luồng End-to-End băng qua nhiều Domain?

**QA 2 (Booking Owner)** được chỉ định làm **Integration Test Coordinator** (dưới sự hỗ trợ của QA Lead).
QA 2 sẽ chịu trách nhiệm chính thiết kế và chạy kịch bản tích hợp bao trùm các luồng:
* Khách hàng Đăng ký -> Đăng nhập (QA4)
* Tìm kiếm xe, lọc xe (QA1, QA5)
* Tiến hành Thuê xe (QA2)
* Thanh toán Tiền & Khuyến mãi (QA3)
* Ký Hợp đồng, Nhận thông báo (QA2, QA4)
* Trả xe và Đánh giá (QA2)

---

## 7. Bug Ownership Policy

Khi Bug xuất hiện trên luồng Integration, để tránh tình trạng "đá bóng trách nhiệm":

* **Quy tắc gốc:** **Bug xuất hiện ở module nào, QA của module đó phải chịu trách nhiệm phân tích Root Cause đầu tiên.**
* *Ví dụ:* Ở màn hình Booking (QA2), API trả về giá thuê sai. Mặc dù giá thuê do Pricing (QA3) quyết định, nhưng **QA2 phải là người điều tra**.
* Nếu QA2 xác định input truyền vào đúng nhưng Pricing Engine tính sai, QA2 sẽ tạo Defect Ticket và chính thức **Transfer** (Bàn giao) sang cho QA3 xử lý.
* Tuyệt đối không phán đoán và đẩy lỗi mà không có Log/Bằng chứng (Root Cause Analysis).
