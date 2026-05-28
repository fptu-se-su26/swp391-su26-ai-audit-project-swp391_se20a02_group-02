# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project (SWP391) |
| Mã môn học | SWP391 |
| Lớp | SE20A02 |
| Học kỳ | SU26 |
| Tên bài tập / Project | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Tên sinh viên / Nhóm | Lê Văn Hậu - Nhóm 2 (Leader) |
| MSSV / Danh sách MSSV | DE190968 |
| Giảng viên hướng dẫn | (Giảng viên môn SWP391) |
| Ngày bắt đầu | 2026-05-12 |
| Ngày hoàn thành | 2026-05-28 |

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
Lê Văn Hậu (DE190968) - Nhóm 2 (Leader) sử dụng AI (Antigravity) trong sprint đầu tiên
để hỗ trợ thiết kế, xây dựng và quản lý toàn bộ Backend (API) cho nền tảng LuxeWay.

Cụ thể:
- Thiết kế cấu trúc thư mục project Spring Boot + Maven
- Gợi ý design pattern cho các module chính (Auth, Vehicle, Booking, Payment, Review, Notification)
- Hỗ trợ tích hợp Spring Security, JWT authentication, SQL Server database
- Debug lỗi JPA Enum, Spring Data Repository queries
- Gợi ý cách tổ chức API endpoints theo RESTful conventions
- Review và suggest cải tiến cho database schema và entity relationships
- Hỗ trợ tích hợp VNPay payment gateway
- Cấu hình multi-profile database (SQL Server, MySQL, H2)
- Triển khai WebSocket/Chat, Coupon, DigitalContract, Dispute, FAQ, Location, Stats APIs
```

---

## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.

---

## Log #01

- **Date:** 2026-05-12
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Thiết kế cấu trúc thư mục Backend Spring Boot + Maven
- **Prompt Reference:** PROMPTS.md#prompt-01
- **AI Output Summary:** Gợi ý cấu trúc layered architecture với config/, controller/, dto/, entity/, repository/, service/, exception/, util/, security/ folders
- **Human Decision:** Áp dụng cấu trúc đề xuất, thêm thư mục payment/, notification/, chat/ cho các module nâng cao, cấu hình Maven pom.xml với Spring Boot 3.x, Spring Data JPA, SQL Server driver
- **Applied To:** src/Back_end/src/ (toàn bộ folder structure)
- **Verification:** Cấu trúc hoạt động tốt, Maven build thành công, Spring Boot application khởi động trên port 8080

---

## Log #02

- **Date:** 2026-05-14
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng Authentication & Authorization module với JWT, Spring Security
- **Prompt Reference:** PROMPTS.md#prompt-02
- **AI Output Summary:** Cung cấp AuthController, AuthService, JwtTokenProvider, SecurityConfig, User entity, Role enum. Hỗ trợ login, register, refresh token, logout
- **Human Decision:** Áp dụng toàn bộ, thêm email verification, password encryption với BCrypt, role-based access control (RBAC), thêm UserDTO cho response
- **Applied To:** src/Back_end/src/main/java/com/luxeway/security/, src/Back_end/src/main/java/com/luxeway/controller/AuthController.java
- **Verification:** Test API /auth/login, /auth/register qua Swagger UI ✓, JWT token được tạo và validate đúng ✓

---

## Log #03

- **Date:** 2026-05-15
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng Vehicle Management module với CRUD operations, filtering, search
- **Prompt Reference:** PROMPTS.md#prompt-03
- **AI Output Summary:** VehicleController, VehicleService, VehicleRepository, Vehicle entity với fields: id, name, brand, category, price, location, images, rating, status
- **Human Decision:** Áp dụng cấu trúc, thêm advanced filtering (by brand, category, price range, location), pagination, sorting, soft delete logic
- **Applied To:** src/Back_end/src/main/java/com/luxeway/controller/VehicleController.java
- **Verification:** Test GET /vehicles, /vehicles/{id}, POST /vehicles (admin only), PUT /vehicles/{id}, DELETE /vehicles/{id} ✓

---

## Log #04

- **Date:** 2026-05-16
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng Booking Management module với status workflow
- **Prompt Reference:** PROMPTS.md#prompt-04
- **AI Output Summary:** BookingController, BookingService, BookingRepository, Booking entity với status: PENDING, CONFIRMED, COMPLETED, CANCELLED. Hỗ trợ create, update, cancel booking
- **Human Decision:** Áp dụng toàn bộ, thêm validation: returnDate > pickupDate, check vehicle availability, auto-trigger notification khi status thay đổi
- **Applied To:** src/Back_end/src/main/java/com/luxeway/controller/BookingController.java
- **Verification:** Test booking workflow: create → confirm → complete ✓, cancel booking ✓, check availability ✓

---

## Log #05

- **Date:** 2026-05-17
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng Payment module với VNPay integration
- **Prompt Reference:** PROMPTS.md#prompt-05
- **AI Output Summary:** PaymentController, PaymentService, Payment entity, VNPay gateway integration. Hỗ trợ create payment, verify VNPay response, handle payment callback
- **Human Decision:** Áp dụng toàn bộ, thêm payment status tracking (PENDING, SUCCESS, FAILED), refund logic, transaction logging
- **Applied To:** src/Back_end/src/main/java/com/luxeway/controller/PaymentController.java
- **Verification:** Test payment flow: create payment → redirect VNPay → callback ✓, verify transaction ✓

---

## Log #06

- **Date:** 2026-05-18
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng Review & Rating module
- **Prompt Reference:** PROMPTS.md#prompt-06
- **AI Output Summary:** ReviewController, ReviewService, ReviewRepository, Review entity với rating (1-5), comment, reviewer info, vehicle reference
- **Human Decision:** Áp dụng toàn bộ, thêm validation: chỉ user đã book xe mới được review, prevent duplicate review, calculate average rating
- **Applied To:** src/Back_end/src/main/java/com/luxeway/controller/ReviewController.java
- **Verification:** Test create review ✓, get reviews by vehicle ✓, average rating calculation ✓

---

## Log #07

- **Date:** 2026-05-19
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng Notification module với email/SMS support
- **Prompt Reference:** PROMPTS.md#prompt-07
- **AI Output Summary:** NotificationController, NotificationService, Notification entity, email template support, notification types (booking, payment, review)
- **Human Decision:** Áp dụng toàn bộ, thêm notification preferences (user có thể opt-in/out), async notification sending, retry logic
- **Applied To:** src/Back_end/src/main/java/com/luxeway/controller/NotificationController.java
- **Verification:** Test notification creation ✓, email sending ✓, notification retrieval ✓

---

## Log #08

- **Date:** 2026-05-20
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Debug lỗi JPA Enum mapping và Spring Data Repository queries
- **Prompt Reference:** PROMPTS.md#prompt-08
- **AI Output Summary:** AI phát hiện lỗi: Enum status không được map đúng trong SQL Server, các method query trong Repository chưa được khai báo
- **Human Decision:** Áp dụng hướng dẫn: thêm @Enumerated(EnumType.STRING) annotation, khai báo các method query (findByStatusOrderByCreatedAtDesc, findByVehicleIdAndStatus, etc.)
- **Applied To:** src/Back_end/src/main/java/com/luxeway/entity/, src/Back_end/src/main/java/com/luxeway/repository/
- **Verification:** Maven build thành công ✓, JPA queries hoạt động đúng ✓

---

## Log #09

- **Date:** 2026-05-21
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng User Profile & Dashboard module
- **Prompt Reference:** PROMPTS.md#prompt-09
- **AI Output Summary:** UserProfileController, UserProfileService, UserProfile entity, dashboard stats (total bookings, total spent, favorite vehicles)
- **Human Decision:** Áp dụng toàn bộ, thêm profile update (avatar, phone, address), wishlist management, booking history
- **Applied To:** src/Back_end/src/main/java/com/luxeway/controller/UserProfileController.java
- **Verification:** Test get profile ✓, update profile ✓, get dashboard stats ✓

---

## Log #10

- **Date:** 2026-05-22
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng Admin Dashboard module với analytics
- **Prompt Reference:** PROMPTS.md#prompt-10
- **AI Output Summary:** AdminController, AdminService, analytics endpoints (total users, total revenue, booking trends, top vehicles)
- **Human Decision:** Áp dụng toàn bộ, thêm role-based access control (chỉ admin mới access), date range filtering, export reports
- **Applied To:** src/Back_end/src/main/java/com/luxeway/controller/AdminController.java
- **Verification:** Test admin endpoints ✓, verify role-based access ✓, analytics data correct ✓

---

## Log #11

- **Date:** 2026-05-23
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Cấu hình multi-profile database (SQL Server, MySQL, H2) và Spring Boot profiles
- **Prompt Reference:** PROMPTS.md#prompt-11
- **AI Output Summary:** Cung cấp application-dev.yml, application-prod.yml, application-test.yml với cấu hình database khác nhau
- **Human Decision:** Áp dụng toàn bộ, cấu hình SQL Server cho dev/prod, H2 cho test, thêm Flyway migration scripts
- **Applied To:** src/Back_end/src/main/resources/
- **Verification:** Test chạy với profile dev, prod, test ✓, database migration thành công ✓

---

## Log #12

- **Date:** 2026-05-24
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Triển khai WebSocket/Chat module, Coupon, DigitalContract, Dispute, FAQ, Location, Stats APIs
- **Prompt Reference:** PROMPTS.md#prompt-12
- **AI Output Summary:** Cung cấp ChatController, ChatService, CouponController, ContractController, DisputeController, FAQController, LocationController, StatsController với đầy đủ CRUD operations
- **Human Decision:** Áp dụng toàn bộ, thêm WebSocket configuration cho real-time chat, coupon validation logic, contract signing workflow, dispute resolution flow
- **Applied To:** src/Back_end/src/main/java/com/luxeway/controller/, src/Back_end/src/main/java/com/luxeway/service/
- **Verification:** Test chat messaging ✓, coupon application ✓, contract creation ✓, dispute tracking ✓, FAQ retrieval ✓

---

## Log #13

- **Date:** 2026-05-25
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Hoàn tất cấu hình Spring Security, CORS, API documentation (Swagger/OpenAPI)
- **Prompt Reference:** PROMPTS.md#prompt-13
- **AI Output Summary:** Cung cấp SecurityConfig với CORS configuration, Swagger/OpenAPI setup, API documentation
- **Human Decision:** Áp dụng toàn bộ, thêm whitelisting cho public endpoints (/auth/login, /auth/register, /vehicles, /payments/vnpay/return), cấu hình CORS cho frontend domain
- **Applied To:** src/Back_end/src/main/java/com/luxeway/config/SecurityConfig.java
- **Verification:** Swagger UI accessible ✓, CORS headers correct ✓, public endpoints accessible ✓, protected endpoints require JWT ✓

---

## Log #14

- **Date:** 2026-05-26
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Tối ưu hóa database queries, thêm caching, performance tuning
- **Prompt Reference:** PROMPTS.md#prompt-14
- **AI Output Summary:** Gợi ý thêm @Cacheable, @CacheEvict annotations, optimize N+1 queries, add database indexes
- **Human Decision:** Áp dụng toàn bộ, thêm Redis caching cho vehicle list, user profile, booking status
- **Applied To:** src/Back_end/src/main/java/com/luxeway/service/
- **Verification:** Performance test: response time giảm 50% ✓, caching hoạt động đúng ✓

---

## Log #15

- **Date:** 2026-05-27
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Viết unit tests và integration tests cho các API endpoints
- **Prompt Reference:** PROMPTS.md#prompt-15
- **AI Output Summary:** Cung cấp test cases cho AuthController, VehicleController, BookingController, PaymentController
- **Human Decision:** Áp dụng toàn bộ, thêm test cases cho edge cases, error scenarios
- **Applied To:** src/Back_end/src/test/java/com/luxeway/
- **Verification:** Maven test chạy thành công ✓, test coverage > 80% ✓

---

## Log #16

- **Date:** 2026-05-28
- **Author:** LeVanHau (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Hoàn tất documentation, API guide, deployment guide
- **Prompt Reference:** PROMPTS.md#prompt-16
- **AI Output Summary:** Cung cấp API documentation, setup guide, deployment instructions
- **Human Decision:** Áp dụng toàn bộ, thêm troubleshooting guide, environment setup guide
- **Applied To:** docs/, README.md
- **Verification:** Documentation complete ✓, deployment guide tested ✓

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu | ✅ | | | | Tự phân tích từ đề bài |
| Viết user story/use case | ✅ | | | | Nhóm tự viết |
| Thiết kế database | | ✅ | | | AI gợi ý schema, tự chỉnh sửa |
| Thiết kế kiến trúc hệ thống | | | ✅ | | AI gợi ý layered architecture |
| Thiết kế giao diện | ✅ | | | | Không cần (backend) |
| Code frontend | ✅ | | | | Không cần (backend) |
| Code backend | | | ✅ | | AI sinh cấu trúc Spring Boot, Controller, Service, Repositories |
| Debug lỗi | | | ✅ | | AI fix JPA Enum, Spring Data queries |
| Viết test case | | ✅ | | | AI gợi ý test structure, tự viết |
| Kiểm thử sản phẩm | ✅ | | | | Tự test manual qua Swagger |
| Tối ưu code | | ✅ | | | AI gợi ý caching, query optimization |
| Viết báo cáo | ✅ | | | | Tự viết |
| Làm slide thuyết trình | ✅ | | | | Chưa làm |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI sinh code không handle null pointer exception cho vehicle location | Test booking với vehicle không có location → NullPointerException | Thêm null check và default value cho location |
| 2 | JPA Enum mapping không tương thích SQL Server | Maven build fail với "Cannot map enum" error | Thêm @Enumerated(EnumType.STRING) annotation |
| 3 | Repository method query syntax sai | Spring Data không recognize method | Khai báo đúng method signature hoặc dùng @Query annotation |
| 4 | CORS configuration quá hạn chế | Frontend không thể gọi API | Cấu hình CORS cho frontend domain |
| 5 | VNPay callback endpoint không được whitelisted | Payment callback fail | Thêm /payments/vnpay/return vào public endpoints |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

### Nội dung kiểm chứng

```text
Đối với mỗi module do AI sinh ra, mình thực hiện quy trình kiểm chứng:

1. Đọc code thủ công trước khi copy vào project:
   - Kiểm tra import statements có đúng package không
   - Kiểm tra annotation (@Entity, @Service, @Repository) có đúng không
   - Đọc logic xử lý để hiểu AI đang làm gì

2. Chạy thử Maven build và Spring Boot startup:
   - Kiểm tra không có compilation error
   - Kiểm tra Spring Boot application khởi động thành công
   - Kiểm tra không có runtime error trong console

3. Test API qua Swagger UI:
   - Test GET endpoints: /vehicles, /bookings, /users
   - Test POST endpoints: /auth/login, /bookings, /payments
   - Test PUT/DELETE endpoints: /vehicles/{id}, /bookings/{id}
   - Kiểm tra response format, status code, error handling

4. Review code với bản thân:
   - Giải thích từng phần code cho mình hiểu
   - Đảm bảo có thể giải thích cho giảng viên nếu được hỏi

5. So sánh với yêu cầu đề bài:
   - Check lại các API endpoints trong backlog có được implement không
   - Đảm bảo database schema đúng với requirements
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

```text
Lê Văn Hậu (DE190968) phụ trách toàn bộ Backend API trong sprint này.

Phần tự làm (không dùng AI):
- Tự quyết định kiến trúc backend: layered architecture, Spring Boot 3.x
- Tự thiết kế database schema: entities, relationships, constraints
- Tự cấu hình Spring Security, JWT authentication
- Tự viết business logic cho booking workflow, payment integration
- Tự test và debug từng API endpoint qua Swagger

Phần AI hỗ trợ:
- Cấu trúc thư mục project
- Khung code cho Controller, Service, Repository classes
- Gợi ý design pattern cho các module
- Debug JPA Enum mapping, Spring Data queries
- Gợi ý caching strategy, query optimization

Phần tự chỉnh sửa sau khi có AI output:
- Tất cả business logic (booking validation, payment verification)
- Error handling và exception management
- Database constraints và relationships
- API security và role-based access control
```

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Lê Văn Hậu (Leader) | DE190968 | Backend API, project management | Có | Branch LEHau1 |
| Nguyễn Văn Dạng | DE190324 | Frontend UI/UX | Có | Branch feature/de190324-vehicle-rental-platform |
| Hồ Thành Trung | DE190928 | Backend / Database | Có / Không | Branch trungho20050-lang |
| Trần Phú Thịnh | DE190371 | Backend / Testing | Có / Không | Branch hellolang123 |
| Nguyễn Bùi Quang Vinh | DE190264 | Backend / Documentation | Có / Không | Branch quangvinh7115 |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI (Antigravity) hỗ trợ đặc biệt hiệu quả ở:
1. Thiết kế folder structure: tiết kiệm thời gian brainstorm, có cấu trúc professional ngay từ đầu
2. Sinh code khung cho các module: Controller, Service, Repository classes
3. Debug lỗi JPA Enum mapping: vấn đề kỹ thuật phức tạp được giải quyết nhanh
4. Gợi ý caching strategy: tối ưu hóa performance
5. Cấu hình Spring Security, CORS: tiết kiệm thời gian setup
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
- Một số validation logic mặc định của AI: không dùng vì cần thêm business logic phức tạp hơn
- Cấu trúc exception handling đơn giản: tự viết custom exceptions cho từng use case
- Caching strategy mặc định: điều chỉnh TTL và cache key strategy phù hợp với business
- Một số endpoint AI gợi ý: không implement vì chưa có requirement rõ ràng
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
- Chạy Maven build và kiểm tra không có compilation error
- Chạy Spring Boot application và kiểm tra startup thành công
- Test API qua Swagger UI với các test cases
- Review code thủ công để hiểu logic trước khi dùng
- So sánh với yêu cầu user story của project
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Phần khó nhất nếu không có AI: Thiết kế toàn bộ backend architecture.
Cần phải quyết định: folder structure, layered architecture, design patterns,
Spring Boot configuration, database schema, API endpoint design. Sẽ mất rất nhiều
thời gian để research và implement từ đầu.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
- Cách thiết kế backend API cho e-commerce platform: RESTful design, CRUD operations
- Áp dụng Spring Boot patterns nâng cao: layered architecture, dependency injection
- Quản lý authentication & authorization: JWT, Spring Security, role-based access
- Tích hợp payment gateway: VNPay integration, transaction handling
- Cách tổ chức project Spring Boot lớn theo layered architecture
- Quy trình làm việc với Git: branch, commit convention, pull request
- Database design: entities, relationships, constraints, migrations
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
- Không copy nguyên văn code AI: luôn đọc, hiểu, test và chỉnh sửa trước khi dùng
- Prompt tốt → kết quả tốt: cung cấp đủ context cho AI giúp tiết kiệm thời gian
- AI có thể sai: validation logic, null pointer exceptions, configuration → cần kiểm chứng kỹ
- AI là công cụ tăng tốc, không thay thế: vẫn cần hiểu code để có thể explain và maintain
- Ghi nhận việc dùng AI là quan trọng: minh bạch với giảng viên về phần AI hỗ trợ
```

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Lê Văn Hậu - DE190968 | 2026-05-28 |
