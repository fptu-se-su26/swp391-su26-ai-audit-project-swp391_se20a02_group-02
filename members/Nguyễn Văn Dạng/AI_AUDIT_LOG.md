# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project (SWP391) |
| Mã môn học | SWP391 |
| Lớp | SE20A02 |
| Học kỳ | SU26 |
| Tên bài tập / Project | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Tên sinh viên / Nhóm | Nguyễn Văn Dạng - Nhóm 2 |
| MSSV / Danh sách MSSV | DE190324 |
| Giảng viên hướng dẫn | (Giảng viên môn SWP391) |
| Ngày bắt đầu | 2026-05-12 |
| Ngày hoàn thành | 2026-05-25 |

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
Nguyễn Văn Dạng (DE190324) - Nhóm 2 sử dụng AI (Antigravity) trong sprint đầu tiên
để hỗ trợ thiết kế và xây dựng toàn bộ giao diện Frontend (UI/UX) cho nền tảng LuxeWay.

Cụ thể:
- Thiết kế cấu trúc thư mục project React + TypeScript + Vite
- Gợi ý design pattern cho các component chính (MarketplacePage, FilterPanel, VehicleCard, App.tsx)
- Hỗ trợ tích hợp Framer Motion animation (stagger, AnimatePresence)
- Debug lỗi git submodule khi push src/Front_end lên GitHub
- Gợi ý cách tổ chức mock database cho development
- Review và suggest cải tiến cho routing với React Router v6
```

---

## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.

---

## Log #01

- **Date:** 2026-05-12
- **Author:** NguyenVanDang (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Thiết kế cấu trúc thư mục Frontend React + TypeScript + Vite
- **Prompt Reference:** PROMPTS.md#prompt-01
- **AI Output Summary:** Gợi ý cấu trúc feature-based với pages/, components/, services/, store/, types/, utils/, animations/, i18n/, layouts/, mock/
- **Human Decision:** Áp dụng cấu trúc đề xuất, thêm thư mục mock/db/ tách thành 4 file riêng (data.ts, users.ts, vehicles.ts, index.ts), thêm thư mục image/ cho assets
- **Applied To:** src/Front_end/src/ (toàn bộ 12 subfolder)
- **Verification:** Cấu trúc hoạt động tốt, import alias @/ được cấu hình trong tsconfig.json và vite.config.ts

---

## Log #02

- **Date:** 2026-05-14
- **Author:** NguyenVanDang (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng MarketplacePage với FilterPanel, debounced search, pagination
- **Prompt Reference:** PROMPTS.md#prompt-02
- **AI Output Summary:** Component MarketplacePage 400+ dòng với FilterPanel sidebar, search debounce 400ms, sort dropdown, grid/list toggle, Framer Motion animation cho sidebar AnimatePresence, skeleton loading, pagination
- **Human Decision:** Giữ nguyên structure chính, chỉnh sửa: màu sắc theo design system LuxeWay, thêm activeFilterCount badge, fix hasFilters logic, thêm quick filters (instantBook, verified, deliveryAvailable), chỉnh pagination tối đa 8 trang
- **Applied To:** src/Front_end/src/pages/marketplace/MarketplacePage.tsx
- **Verification:** Chạy npm run dev, test manual: search debounce ✓, filter toggle ✓, URL sync ✓, responsive ✓

---

## Log #03

- **Date:** 2026-05-15
- **Author:** NguyenVanDang (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Thiết lập Framer Motion animation variants cho toàn bộ project
- **Prompt Reference:** PROMPTS.md#prompt-03
- **AI Output Summary:** File animations/variants.ts với fadeUp, fadeIn, staggerContainer, staggerItem, slideInLeft, slideInRight, scaleIn variants
- **Human Decision:** Áp dụng tất cả variants, điều chỉnh duration và delay cho phù hợp với feel luxury (0.6s thay vì 0.3s default)
- **Applied To:** src/Front_end/src/animations/variants.ts
- **Verification:** Import và dùng trong MarketplacePage, LandingPage - animation smooth, không bị lag

---

## Log #04

- **Date:** 2026-05-16
- **Author:** NguyenVanDang (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Cấu hình React Router v6 với lazy loading, protected routes, nested routes
- **Prompt Reference:** PROMPTS.md#prompt-04
- **AI Output Summary:** App.tsx với BrowserRouter, lazy import cho các trang heavy (Dashboard, Admin), ProtectedRoute HOC check isAuthenticated và role, Suspense với PageLoader fallback
- **Human Decision:** Áp dụng pattern lazy loading và ProtectedRoute, thêm requiredRole prop cho admin route, tự viết thêm WishlistPage và NotificationsPage inline trong App.tsx, thêm OTPPage component
- **Applied To:** src/Front_end/src/App.tsx (333 dòng)
- **Verification:** Test route navigation: / → /marketplace → /vehicles/:id → /booking/:vehicleId (redirect login khi chưa auth) ✓

---

## Log #05

- **Date:** 2026-05-17
- **Author:** NguyenVanDang (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Debug và fix lỗi src/Front_end bị track như git submodule, code không hiện trên GitHub
- **Prompt Reference:** PROMPTS.md#prompt-05 (debug prompt)
- **AI Output Summary:** Giải thích nguyên nhân (embedded .git folder), hướng dẫn từng bước: git rm --cached → xóa .git bên trong → git add lại → force push
- **Human Decision:** Thực hiện đúng theo hướng dẫn. Phát hiện .git bên trong đã không còn → bỏ qua bước xóa, trực tiếp git add src/Front_end/ → commit → push --force
- **Applied To:** Git repository tracking (branch NguuyenVanDang)
- **Verification:** Kiểm tra GitHub: thư mục src/Front_end/ hiển thị đúng 46 files, có thể browse code ✓

---

## Log #06

- **Date:** 2026-05-19
- **Author:** NguyenVanDang (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng VehicleCard component với hover effect, wishlist toggle, rating display
- **Prompt Reference:** PROMPTS.md#prompt-06
- **AI Output Summary:** VehicleCard component với variants grid/list, wishlist heart button với toggle animation, star rating display, price per day, badge cho instant book/verified, hover scale effect
- **Human Decision:** Thêm skeleton loading variant (VehicleCardSkeleton), điều chỉnh border radius theo design system (rounded-3xl), thêm gradient overlay cho thumbnail, thêm totalRentals display
- **Applied To:** src/Front_end/src/components/vehicle/VehicleCard.tsx
- **Verification:** Dùng trong MarketplacePage - hiển thị đúng, hover effect smooth, wishlist toggle hoạt động ✓

---

## Log #07

- **Date:** 2026-05-20
- **Author:** NguyenVanDang (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Tạo mock vehicleService với in-memory database cho development
- **Prompt Reference:** PROMPTS.md#prompt-07
- **AI Output Summary:** vehicleService với getAll (pagination + filter), search (fuzzy), getBrands, getById, getWishlist, toggleWishlist - tất cả trả về Promise để simulate async
- **Human Decision:** Áp dụng toàn bộ, thêm mock data 20+ xe cao cấp vào mock/db/vehicles.ts (Ferrari, Lamborghini, Rolls-Royce, Porsche, Mercedes...), thêm filter logic cho category, brand, price range, rating
- **Applied To:** src/Front_end/src/services/vehicleService.ts, src/Front_end/src/mock/db/vehicles.ts
- **Verification:** MarketplacePage load được 12 xe mỗi trang, filter hoạt động đúng, search tìm được theo tên và brand ✓

---

## Log #08

- **Date:** 2026-05-23
- **Author:** Nguyễn Văn Dạng (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Hoàn thiện 100% chức năng Backend (Review, Notification, Payment, User Profile, Admin) bằng Spring Boot.
- **Prompt Reference:** PROMPTS.md#prompt-08
- **AI Output Summary:** AI đã sinh toàn bộ các lớp Controller, Service, Repository, và DTO. Đồng thời sửa lỗi truy vấn JPA Enum để tương thích với SQL Server.
- **Human Decision:** Đã review toàn bộ mã nguồn AI tạo, xác nhận các module đã được tích hợp chặt chẽ (ví dụ: tự động bắn Notification khi cập nhật Booking).
- **Applied To:** src/Back_end/
- **Verification:** Code compile thành công bằng Maven, đã test API qua Swagger UI.

---

## Log #09

- **Date:** 2026-05-24
- **Author:** Nguyễn Văn Dạng (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Tích hợp 100% Backend thực tế (Spring Boot) với Frontend (React), thay thế mock data.
- **Prompt Reference:** PROMPTS.md#prompt-09
- **AI Output Summary:** Tạo `apiClient` hỗ trợ JWT interceptor; refactor toàn bộ service layer (`authService`, `vehicleService`, `bookingService`, `otherServices`) để gọi REST API; loại bỏ hoàn toàn module `mock/db`.
- **Human Decision:** Review và đảm bảo `apiClient` handle lỗi 401 Unauthorized đúng (clear session). Kiểm tra và fallback một số component trên dashboard để không crash khi API chưa đầy đủ dữ liệu thống kê.
- **Applied To:** `src/Front_end/src/services/` và `src/Front_end/src/pages/`
- **Verification:** Kiểm tra gọi API `/auth/login`, `/vehicles`, `/bookings` thành công, không còn import `mock/db`.

---

## Log #10

- **Date:** 2026-05-24
- **Author:** Nguyễn Văn Dạng (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Debug lỗi biên dịch Spring Data JPA và lỗi kẹt thư mục `build` của Gradle trên Windows.
- **Prompt Reference:** PROMPTS.md#prompt-10
- **AI Output Summary:** AI phát hiện các method truy vấn (`findByStatusOrderByCreatedAtDesc`, `filterVehicles`...) chưa được khai báo trong `VehicleRepository`. Đồng thời, AI hướng dẫn dùng PowerShell để kill process Java chạy ngầm và xóa ép (force delete) thư mục `build` bị kẹt.
- **Human Decision:** Áp dụng code khai báo các method Repository do AI cung cấp. Thực hiện các lệnh PowerShell để giải phóng bộ nhớ và Rebuild lại project trên IDE.
- **Applied To:** `VehicleRepository.java` và môi trường IDE.
- **Verification:** Ứng dụng Backend compile thành công và chạy mượt mà trên port 8080.

---

## Log #11

- **Date:** 2026-05-25
- **Author:** Nguyễn Văn Dạng (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Triển khai các API backend nâng cao (WebSocket/Chat, Coupon, DigitalContract, Dispute, FAQ, Location, Stats), cấu hình multi-profile DB (SQL Server, MySQL, H2), và nâng cấp Frontend với adminService, i18n đa ngôn ngữ.
- **Prompt Reference:** PROMPTS.md#prompt-11
- **AI Output Summary:** Sinh mã nguồn cho các Controller, Service, Repository cho Chat, Coupon, Contract, Dispute, FAQ, Location, Stats; cấu hình profiles trong Spring Boot; sinh service `adminService.ts`, component `LanguageSwitcher`, `ThemeToggle` và cấu hình i18n bằng `react-i18next` ở Frontend.
- **Human Decision:** Áp dụng code backend, điều chỉnh cấu hình database config trong các file yaml và yml tương thích với cấu hình SQL Server local; chỉnh sửa giao diện AdminDashboard sử dụng các endpoints thực tế; tích hợp các component switcher vào header/navbar.
- **Applied To:** Toàn bộ project (src/Back_end/, src/Front_end/).
- **Verification:** Chạy thành công ứng dụng với các profile khác nhau, kiểm tra API qua Swagger; kiểm tra Frontend chuyển đổi ngôn ngữ EN/VI hoạt động đúng, giao diện AdminDashboard hiển thị dữ liệu thực từ database.

---

## Log #12

- **Date:** 2026-05-28
- **Author:** Nguyễn Văn Dạng (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Tích hợp ImageUploader vào VehicleFormPage ở dashboard, thực hiện lưu trữ/đồng bộ dữ liệu thực tế với Backend REST API và khôi phục các trang BusinessPage/ComparePage bị thiếu.
- **Prompt Reference:** PROMPTS.md#prompt-12
- **AI Output Summary:** Cung cấp giải pháp tích hợp ImageUploader component, cập nhật edit/create submit calls để lưu vào backend REST API, và khôi phục files.
- **Human Decision:** Áp dụng toàn bộ, chỉnh sửa: ép kiểu `vehicle.location` sang `any` để giải quyết lỗi build TypeScript liên quan đến truy cập trường `state` và `zip`.
- **Applied To:** `src/Front_end/src/pages/dashboard/OwnerDashboard.tsx`, `src/Front_end/src/pages/compare/ComparePage.tsx`, `src/Front_end/src/pages/static/BusinessPage.tsx`
- **Verification:** Chạy `npm run type-check` compile 100% thành công với 0 lỗi.

---

## Log #13

- **Date:** 2026-05-28
- **Author:** Nguyễn Văn Dạng (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Hoàn tất bản dịch tiếng Việt/Anh song ngữ toàn diện, khai báo an toàn VNPay return endpoint ở SecurityConfig, và khắc phục toàn bộ lỗi biên dịch TypeScript để đóng gói sản phẩm Front-end (build production).
- **Prompt Reference:** PROMPTS.md#prompt-13
- **AI Output Summary:** Cung cấp giải pháp import `Loader2` thiếu, chuẩn hóa Settings sidebar link trong `customerLinks`, thêm guard null-safety cho `vehicle` trong Case 4 của `canProceed()`, và cấu hình whitelisting trong `SecurityConfig.java`.
- **Human Decision:** Áp dụng toàn bộ hướng dẫn sửa lỗi import và logic guard. Thêm endpoint `/payments/vnpay/return` vào danh sách cho phép GET công khai trên backend Spring Security.
- **Applied To:** `src/Front_end/src/pages/dashboard/CustomerDashboard.tsx`, `src/Front_end/src/pages/booking/BookingWizardPage.tsx`, `src/Back_end/src/main/java/com/luxeway/config/SecurityConfig.java`
- **Verification:** Chạy thành công lệnh biên dịch `npm run build` của Vite với **0 lỗi và 0 cảnh báo**, tạo ra bundle tĩnh sẵn sàng cho production.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu | ✅ | | | | Tự phân tích từ đề bài |
| Viết user story/use case | ✅ | | | | Nhóm tự viết |
| Thiết kế database | ✅ | | | | Chưa implement |
| Thiết kế kiến trúc hệ thống | | ✅ | | | AI gợi ý folder structure |
| Thiết kế giao diện | | | ✅ | | AI hỗ trợ nhiều layout |
| Code frontend | | | ✅ | | AI sinh code khung, tự chỉnh sửa |
| Code backend | | | ✅ | | AI sinh cấu trúc Spring Boot, Controller, Service, Repositories |
| Debug lỗi | | | ✅ | | AI fix git submodule và TS compile errors |
| Viết test case | ✅ | | | | Chưa viết test |
| Kiểm thử sản phẩm | ✅ | | | | Tự test manual |
| Tối ưu code | | ✅ | | | AI gợi ý debounce, lazy loading |
| Viết báo cáo | ✅ | | | | Tự viết |
| Làm slide thuyết trình | ✅ | | | | Chưa làm |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI sinh code màu sắc không đúng với design system LuxeWay (dùng blue-500 thay vì accent #3B82F6) | Review code thủ công, compare với globals.css | Tự thay thế tất cả màu mặc định bằng CSS variables của LuxeWay |
| 2 | BookingWizardPage ban đầu thiếu validation cho date range (cho phép pickup = return) | Test manual: chọn cùng ngày → không có error message | Thêm validation: returnDate > pickupDate, tối thiểu 1 ngày |
| 3 | AI sinh hasFilters logic đếm cả key có giá trị undefined → count sai | Debug console.log, thấy badge hiện sai số | Fix: filter ra undefined và array rỗng trước khi đếm |
| 4 | Sidebar link Settings thiếu icon và label khi refactor i18n | Trình biên dịch Vite báo lỗi JSX element type 'link.icon' does not have construct signatures | Khôi phục thuộc tính Settings: `{ href: '/dashboard/settings', icon: Settings, label: t.dashboard.settings }` |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

### Nội dung kiểm chứng

```text
Đối với mỗi component do AI sinh ra, mình thực hiện quy trình kiểm chứng:

1. Đọc code thủ công trước khi copy vào project:
   - Kiểm tra import statements có đúng path không
   - Kiểm tra TypeScript types có khớp với types đã định nghĩa không
   - Đọc logic xử lý để hiểu AI đang làm gì

2. Chạy thử npm run dev và npm run build:
   - Kiểm tra không có TypeScript error
   - Kiểm tra không có runtime error trong console
   - Đảm bảo biên dịch static bundle (Vite build) thành công không lỗi

3. Test manual các edge cases:
   - MarketplacePage: search empty string → fallback về getAll ✓
   - Filter: chọn nhiều categories → badge count đúng ✓
   - Pagination: trang 1 → trang 2 → load đúng data ✓

4. Review code với bản thân:
   - Giải thích từng phần code cho mình hiểu
   - Đảm bảo có thể giải thích cho giảng viên nếu được hỏi

5. So sánh với yêu cầu đề bài:
   - Check lại các tính năng trong backlog có được implement không
   - Đảm bảo UI đáp ứng các user story đã viết
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

```text
Nguyễn Văn Dạng (DE190324) phụ trách toàn bộ Frontend UI/UX trong sprint này.

Phần tự làm (không dùng AI):
- Tự quyết định design language: luxury dark theme, màu #0F172A, accent blue, gold
- Tự thiết lập mock data cho 20+ xe (tên, giá, hình, brand, category)
- Tự viết CSS globals.css với design tokens, utility classes
- Tự implement Zustand store logic (authStore, uiStore)
- Tự test và debug từng component sau khi AI sinh code

Phần AI hỗ trợ:
- Cấu trúc thư mục project
- Khung code cho MarketplacePage, FilterPanel, VehicleCard, App.tsx
- Animation variants (framer-motion)
- Debug git submodule issue và các lỗi TS compile lúc build

Phần tự chỉnh sửa sau khi có AI output:
- Tất cả màu sắc (thay bằng design system LuxeWay)
- Validation logic (thêm edge cases)
- Responsive breakpoints (điều chỉnh cho mobile)
- TypeScript types (thêm properties còn thiếu)
```

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Lê Văn Hậu (Leader) | DE190968 | Quản lý project, phân công task, backend API | Có / Không | Branch LEHau1 |
| Nguyễn Văn Dạng | DE190324 | Frontend UI/UX (toàn bộ React app) | Có | Branch feature/de190324-vehicle-rental-platform |
| Hồ Thành Trung | DE190928 | Backend / Database | Có / Không | Branch trungho20050-lang |
| Trần Phú Thịnh | DE190371 | Backend / Testing | Có / Không | Branch hellolang123 |
| Nguyễn Bùi Quang Vinh | DE190264 | Backend / Documentation | Có / Không | Branch quangvinh7115 |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI (Antigravity) hỗ trợ đặc biệt hiệu quả ở:
1. Thiết kế folder structure: tiết kiệm nhiều thời gian brainstorm, có cấu trúc professional ngay từ đầu
2. Sinh code khung cho MarketplacePage: component phức tạp 400+ dòng với nhiều tính năng
3. Debug lỗi git submodule: vấn đề kỹ thuật phức tạp được giải quyết trong vài phút
4. Gợi ý animation patterns với Framer Motion: tạo được UX mượt mà hơn
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
- Màu sắc mặc định của AI (blue-500, gray-100): không dùng vì cần đúng design system LuxeWay (#0F172A, accent)
- Cấu trúc hooks/ riêng biệt: AI gợi ý tách hooks nhưng mình để logic trong component vì project chưa đủ lớn
- Pagination AI sinh ra hiển thị tất cả trang: mình giới hạn tối đa 8 trang vì UX tốt hơn
- Form validation cơ bản của AI: thêm nhiều edge cases hơn (date validation, promo code logic)
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
- Chạy npm run dev và kiểm tra không có TypeScript error
- Test manual từng tính năng theo checklist
- Review code thủ công để hiểu logic trước khi dùng
- So sánh với yêu cầu user story của project
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Phần khó nhất nếu không có AI: MarketplacePage với FilterPanel.
Component này có nhiều tính năng phức tạp: debounced search, animated sidebar, 
URL persist, multiple filter types, pagination. Sẽ mất rất nhiều thời gian để 
viết từ đầu và có thể bỏ sót nhiều edge case.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
- Cách thiết kế UI/UX cho e-commerce platform: filter, search, listing, detail, booking flow
- Áp dụng React patterns nâng cao: lazy loading, code splitting, protected routes
- Quản lý state với Zustand (auth state, UI preferences)
- Animation với Framer Motion tạo ra UX chuyên nghiệp
- Cách tổ chức project React lớn theo feature-based structure
- Quy trình làm việc với Git: branch, commit convention, pull request
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
- Không copy nguyên văn code AI: luôn đọc, hiểu, test và chỉnh sửa trước khi dùng
- Prompt tốt → kết quả tốt: cung cấp đủ context cho AI giúp tiết kiệm thời gian
- AI có thể sai: màu sắc, validation logic, edge cases → cần kiểm chứng kỹ
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
| Nguyễn Văn Dạng - DE190324 | 2026-05-31 |

---

## Lần sử dụng AI #8 — Phase 3A: Security Hardening

### Thông tin

| Trường | Nội dung |
|---|---|
| Ngày | 2026-05-30 |
| Công cụ AI | Antigravity |
| Mục tiêu | Patch lỗ hổng phân quyền DisputeController và audit toàn bộ endpoint admin |
| Phần bài tập | Backend Security — DisputeController, SecurityConfig |

### Prompt chính

```text
Audit all admin-only endpoints. Patch DisputeController authorization vulnerability.
Add @PreAuthorize("hasRole('ADMIN')") where required. Verify SecurityConfig supports method security.
```

### Kết quả AI sinh ra

```text
- Thêm @EnableMethodSecurity vào SecurityConfig
- Bổ sung @PreAuthorize("hasRole('ADMIN')") cho toàn bộ endpoint trong DisputeController, AdminController, EmployeeController
- Danh sách đầy đủ các endpoint còn thiếu role check
```

### Kiểm tra và chỉnh sửa

```text
- Đọc từng annotation được thêm vào, đảm bảo chỉ endpoint admin-only bị ảnh hưởng
- Không sửa business logic, chỉ thêm security annotation
- Build Maven thành công sau khi patch
```

### Đánh giá

| Tiêu chí | Kết quả |
|---|---|
| Chính xác | Đúng — đúng endpoint, đúng role |
| Cần chỉnh sửa | Ít — review từng endpoint thủ công |
| Bài học | Spring Method Security cần @EnableMethodSecurity mới có tác dụng |

---

## Lần sử dụng AI #9 — Phase 3B: OTP Forgot Password

### Thông tin

| Trường | Nội dung |
|---|---|
| Ngày | 2026-05-30 |
| Công cụ AI | Antigravity |
| Mục tiêu | Triển khai full OTP workflow: forgot-password → verify-otp → reset-password |
| Phần bài tập | Backend Auth — AuthController, AuthService, PasswordResetToken entity |

### Prompt chính

```text
Implement POST /auth/forgot-password, POST /auth/verify-otp, POST /auth/reset-password.
OTP: 6 digits random, 5 minutes TTL, one-time use only. Log OTP to console (no SMTP).
```

### Kết quả AI sinh ra

```text
- Entity PasswordResetToken với trường otp, expiresAt, used
- ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest DTOs
- AuthService: generateOtp(), verifyOtp(), resetPassword()
- AuthController: 3 endpoint mới
```

### Kiểm tra và chỉnh sửa

```text
- Kiểm tra logic expiry: Instant.now().isAfter(token.getExpiresAt())
- Kiểm tra one-time: token.isUsed() flag được set sau khi verify
- Build thành công, log OTP hiển thị đúng trong console
```

---

## Lần sử dụng AI #10 — Phase 3B: Chat Persistence, PaymentMethod, Employee

### Thông tin

| Trường | Nội dung |
|---|---|
| Ngày | 2026-05-30 |
| Công cụ AI | Antigravity |
| Mục tiêu | Thay thế localStorage chat bằng DB; triển khai PaymentMethod và Employee CRUD |
| Phần bài tập | Backend + Frontend REQ-CHAT, REQ-PAYMENT |

### Prompt chính

```text
MODULE 1: CHAT — Conversation, Message entities, ChatService, ChatController REST API.
MODULE 2: EMPLOYEE — Employee entity, CRUD /employees, assign-vehicle.
MODULE 3: PAYMENT METHOD — PaymentMethod entity, CRUD /payment-methods.
Frontend: xoá localStorage.getItem(CONV_KEY), thay bằng api.get('/chat/conversations').
```

### Kết quả AI sinh ra

```text
- Conversation.java, Message.java, ConversationRepository, MessageRepository
- ChatService (getConversations, getMessages, sendMessage, createConversation)
- ChatController REST
- Employee.java, EmployeeController.java
- PaymentMethod.java, PaymentMethodController.java
- MessengerPage.tsx: xoá toàn bộ localStorage, gọi API thực
```

### Kiểm tra và chỉnh sửa

```text
- Đọc MessengerPage.tsx để đảm bảo không còn localStorage key nào liên quan đến chat
- Build Frontend thành công: 2979 modules, 0 lỗi
- Build Backend thành công: 105 files
```

---

## Lần sử dụng AI #11 — Phase 3 Build Optimisation

### Thông tin

| Trường | Nội dung |
|---|---|
| Ngày | 2026-05-31 |
| Công cụ AI | Antigravity |
| Mục tiêu | Fix 3 non-blocking build warnings: chunk size, Sass deprecation, mixed import |
| Phần bài tập | Frontend — vite.config.ts, main.tsx |

### Prompt chính

```text
Fix: (1) chunk size 3.2MB → manualChunks; (2) Sass legacy-js-api warning from stompjs;
(3) mixed static/dynamic import: otherServices.ts and i18n/config.ts.
Commit theo convention. Update members/CHANGELOG, AI_AUDIT_LOG, REFLECTION, PROMPTS.
```

### Kết quả AI sinh ra

```text
vite.config.ts:
- manualChunks: vendor-react, vendor-state, vendor-motion, vendor-charts, vendor-i18n, vendor-http, vendor-ws, vendor-ui
- css.preprocessorOptions.scss.api = 'modern-compiler'
- chunkSizeWarningLimit: 1000

main.tsx:
- Xoá dynamic import('./i18n/config').then(...)
- Dùng thẳng import i18n from './i18n/config' (đã có static import)
- Xoá useUIStore không dùng
```

### Kiểm tra và chỉnh sửa

```text
- Chạy npm run build: ✓ built in 7.15s — 0 errors, 0 warnings (chunk/Sass/mixed import đã biến mất)
- Kiểm tra các chunk được tạo ra đúng tên trong dist/assets/
- Verify main.tsx không còn dynamic import i18n
```

### Đánh giá

| Tiêu chí | Kết quả |
|---|---|
| Chính xác | Đúng — tất cả 3 warnings đều được fix |
| Cần chỉnh sửa | Không — build sạch hoàn toàn |
| Bài học | manualChunks giúp browser cache hiệu quả hơn; static import luôn ưu tiên hơn dynamic cùng module |

---

## Lần sử dụng AI #12 — Phase 4: E2E Verification & Database Startup Fix

### Thông tin

| Trường | Nội dung |
|---|---|
| Ngày | 2026-05-31 |
| Công cụ AI | Antigravity |
| Mục tiêu | Khắc phục lỗi khởi động SQL Server (Invalid column name 'record_date') và thực hiện E2E Audit |
| Phần bài tập | Database Startup & E2E Verification — DatabaseMigration, AnalyticsService, E2E Routes |

### Prompt chính

```text
Audit LuxeWay Car Rental Platform:
1. Verify frontend (http://localhost:5173) and backend health check (http://localhost:8080/api/v1/test/health).
2. Fix SQL Server startup database migration / analytics service boot issue.
3. Automatically discover routes and audit for common UX flaws: Loading States, Error UI, Empty States, Responsive Mobile, Form Validation, Role-Based Menu.
```

### Kết quả AI sinh ra

```text
- DatabaseMigration.java: Thêm câu lệnh DROP TABLE IF EXISTS cho bảng analytics cũ thiếu cột record_date để đảm bảo khởi động ứng dụng trơn tru trên SQL Server.
- Startup Ordering Fix: Cấu hình annotation @Order(1) trên DatabaseMigration và @Order(2) trên AnalyticsService để đảm bảo các migration tùy chỉnh chạy trước khi dịch vụ truy vấn kiểm tra dữ liệu.
- E2E Verification Report: Thực hiện E2E audit, lập bản đồ chi tiết 40+ routes của hệ thống và đánh giá đầy đủ 6 lỗ hổng UX phổ biến.
```

### Kiểm tra và chỉnh sửa

```text
- Biên dịch lại backend thành công (mvn package). Khởi động ứng dụng bằng file JAR trên môi trường SQL Server.
- Kiểm tra endpoint Health Check: database_connected = true, total_users = 8.
- Kiểm tra giao diện Frontend hoạt động mượt mà tại cổng 5173.
```

### Đánh giá

| Tiêu chí | Kết quả |
|---|---|
| Chính xác | Xuất sắc — Hệ thống khởi động trơn tru trên SQL Server và hoàn tất E2E audit |
| Cần chỉnh sửa | Không — Mọi lỗi startup được giải quyết triệt để |
| Bài học | Quản lý thứ tự khởi động (Startup ordering) trong Spring Boot cực kỳ quan trọng khi khởi tạo dữ liệu ban đầu. |

---

## Log #13

- **Date:** 2026-06-03 đến 2026-06-04
- **Author:** NguyenVanDang (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Nâng cấp Help Center lên cấp Enterprise và sửa lỗi hiển thị statistics Landing Page
- **Prompt Reference:** PROMPTS.md#prompt-14
- **AI Output Summary:** Gợi ý DDL schema và dữ liệu seed SQL Server cho help center; code khung cho các entities, repositories, services, controllers; layout React HelpPage mới; API client `helpService.ts`; cách đổi tên JPA query method thành findByUser_Id để fix lỗi Spring Boot startup; và logic kiểm tra vehicle count hiển thị statistics.
- **Human Decision:** Áp dụng toàn bộ mô hình dữ liệu (DDL, entities, services). Tự viết classpath launcher để chạy Maven compiler bypass lỗi Unicode path. Sửa query JPA method thành `findByUser_Id` và thay đổi filter làm tròn stats card thành `${stats.totalVehicles < 100 ? stats.totalVehicles : ...}`.
- **Applied To:** Back_end (HelpCategory, HelpArticle, SupportTicket, SupportTicketMessage và config bảo mật), Front_end (helpService.ts, HelpPage.tsx, LandingPage.tsx).
- **Verification:** PowerShell `Invoke-RestMethod` và kiểm tra trực quan tự động bằng browser subagents.

---

## Log #14

- **Date:** 2026-06-06
- **Author:** Nguyễn Văn Dạng (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Tách thực thể Vehicle thành Car và Motorbike chuyên biệt (Entities, Services, Controllers, DTOs và Frontend Pages)
- **Prompt Reference:** PROMPTS.md#prompt-15
- **AI Output Summary:** Gợi ý các class Entity cho Car và Motorbike, DTOs, Repositories, REST Controllers Spring Boot, và các frontend pages (CarsMarketplace, CarDetails, MotorbikeMarketplace, MotorbikeDetails).
- **Human Decision:** Áp dụng toàn bộ cấu trúc Entity và API Controllers. Tự cấu hình whitelisting trong SecurityConfig và liên kết routes trong App.tsx.
- **Applied To:** `src/Back_end/` (Entities, DTOs, Controllers, Services, Repositories) và `src/Front_end/` (Marketplace pages, services).
- **Verification:** Compile backend Maven thành công, npm run build thành công 0 warning.

---

## Log #15

- **Date:** 2026-06-07
- **Author:** Nguyễn Văn Dạng (DE190324)
- **AI Tool:** Antigravity
- **Purpose:** Redesign Landing Page Premium, thêm promotions DB table, và translate notifications song ngữ.
- **Prompt Reference:** PROMPTS.md#prompt-16
- **AI Output Summary:** Cung cấp code LiveActivitySection, RevenueCalculator và VehicleTypeShowcase cho LandingPage.tsx, DDL schema cho promotions table, và hàm translateNotification trong translations.ts.
- **Human Decision:** Custom style calculator và LiveActivitySection khớp với Glassmorphism theme, update translations.ts với các label dịch chi tiết cho notification body và titles.
- **Applied To:** `LandingPage.tsx`, `translations.ts`, `App.tsx`, `DatabaseMigration.java`, `schema.sql`.
- **Verification:** Chạy runtime, Landing page hiển thị live activity và calculator tính toán chính xác, switch language dịch đúng notifications.

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
| Nguyễn Văn Dạng - DE190324 | 2026-06-07 |

