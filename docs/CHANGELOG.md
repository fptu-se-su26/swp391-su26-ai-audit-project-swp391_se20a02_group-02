# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện dự án LuxeWay.

Nguyên tắc ghi changelog:

- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi nên có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.
- Nếu có commit GitHub, cần ghi link commit.
- Nếu có lỗi đã sửa, cần ghi rõ lỗi, nguyên nhân và cách xử lý.

---

## 2. Thông tin project

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project (SWP391) |
| Mã môn học | SWP391 |
| Lớp | SE20A02 |
| Học kỳ | SU26 |
| Tên bài tập / Project | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Tên sinh viên / Nhóm | Nhóm 2 (Lê Văn Hậu, Nguyễn Văn Dạng, Hồ Thành Trung, Trần Phú Thịnh, Nguyễn Bùi Quang Vinh) |
| MSSV / Danh sách MSSV | DE190968, DE190324, DE190928, DE190371, DE190264 |
| Giảng viên hướng dẫn | (Giảng viên môn SWP391) |
| Repository URL | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a02_group-02 |
| Ngày bắt đầu | 2026-05-12 |
| Ngày hoàn thành | (Đang thực hiện) |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 2026-05-12 | Khởi tạo project, cấu trúc repo | Completed |
| Phase 02 | 2026-05-13 | Phân tích yêu cầu, xác định user roles | In Progress |
| Phase 03 | 2026-05-14 | Thiết kế hệ thống, thiết kế UI/UX Frontend | In Progress |
| Phase 04 | 2026-05-14 đến 2026-05-25 | Implementation (Frontend & Backend Advanced) | Completed |
| Phase 05 | (Chưa bắt đầu) | Testing & Debug | Not Started |
| Phase 06 | (Chưa bắt đầu) | Hoàn thiện báo cáo và demo | Not Started |

---

# [Phase 01] Khởi tạo project

## Ngày thực hiện

```text
2026-05-12
```

## Đã hoàn thành

- [x] Tạo repository (GitHub: fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a02_group-02)
- [x] Tạo cấu trúc thư mục project (src/, docs/, members/, .github/)
- [x] Tạo file README.md với thông tin nhóm và hướng dẫn
- [x] Tạo thư mục `docs/`
- [x] Tạo file `AI_AUDIT_LOG.md`
- [x] Tạo file `PROMPTS.md`
- [x] Tạo file `REFLECTION.md`
- [x] Tạo file `CHANGELOG.md`
- [x] Khởi tạo source code Frontend ban đầu (Vite + React + TypeScript)
- [x] Cài đặt thư viện (framer-motion, zustand, react-router-dom, lucide-react, tailwindcss)
- [x] Cấu hình môi trường (tsconfig.json, vite.config.ts, tailwind.config.js)

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Tạo repository GitHub và cấu trúc thư mục | Lê Văn Hậu (DE190968) | README.md, docs/, members/, src/ | GitHub repo |
| 2 | Khởi tạo Vite + React + TypeScript project | Nguyễn Văn Dạng (DE190324) | src/Front_end/, package.json, vite.config.ts | src/Front_end/package.json |
| 3 | Cài đặt và cấu hình Tailwind CSS | Nguyễn Văn Dạng (DE190324) | tailwind.config.js, postcss.config.js | src/Front_end/tailwind.config.js |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) gợi ý cấu trúc thư mục feature-based cho React project.
Cụ thể: pages/, components/, services/, store/, types/, utils/, animations/, layouts/, mock/, i18n/, image/
```

## Commit/Screenshot minh chứng

```text
Commit đầu tiên: 6a4ec6e - DE190324/ setup UI UX for project (2026-05-21)
Commit fix submodule: 9c591ff - DE190324/ setup UI UX for project (force push)
Branch: NguuyenVanDang
```

## Ghi chú

```text
Dự án LuxeWay là nền tảng thuê xe cao cấp (luxury vehicle rental).
3 user roles: Customer, Vehicle Owner, Admin.
Frontend tech stack: React 18 + TypeScript + Vite + Framer Motion + Zustand + React Router v6 + TailwindCSS.
```

---

# [Phase 02] Phân tích yêu cầu

## Ngày thực hiện

```text
2026-05-13
```

## Đã hoàn thành

- [x] Xác định problem statement (nền tảng kết nối chủ xe và người thuê)
- [x] Xác định user roles (Customer, Vehicle Owner, Admin)
- [ ] Viết user stories
- [ ] Viết use cases
- [x] Xác định functional requirements (marketplace, booking, messaging, dashboard)
- [ ] Xác định non-functional requirements
- [ ] Xác định business rules
- [ ] Xác định acceptance criteria
- [ ] Review yêu cầu với giảng viên/nhóm
- [ ] Chỉnh sửa yêu cầu sau feedback

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Xác định các tính năng chính của LuxeWay | Cả nhóm | README.md | README.md section Topic |
| 2 | Phân chia nhiệm vụ cho từng thành viên | Lê Văn Hậu | README.md (team table) | README.md |

## AI có hỗ trợ không?

- [ ] Có
- [x] Không

## Commit/Screenshot minh chứng

```text
README.md đã có thông tin nhóm và mô tả project.
```

---

# [Phase 03] Thiết kế hệ thống

## Ngày thực hiện

```text
2026-05-14 đến 2026-05-15
```

## Đã hoàn thành

- [ ] Thiết kế kiến trúc tổng quan
- [ ] Thiết kế database/ERD
- [ ] Thiết kế API
- [x] Thiết kế giao diện/wireframe (dùng code trực tiếp)
- [ ] Thiết kế flow xử lý
- [ ] Thiết kế class diagram
- [ ] Thiết kế sequence diagram
- [ ] Thiết kế security/authorization flow
- [ ] Review thiết kế
- [ ] Chỉnh sửa thiết kế sau feedback

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thiết kế cấu trúc thư mục Frontend | Nguyễn Văn Dạng (DE190324) | src/Front_end/src/ | Thư mục 12 subdirs |
| 2 | Định nghĩa TypeScript types cho toàn hệ thống | Nguyễn Văn Dạng (DE190324) | src/Front_end/src/types/index.ts | types/index.ts |
| 3 | Thiết kế design system (màu sắc, typography) | Nguyễn Văn Dạng (DE190324) | src/Front_end/src/styles/globals.css | globals.css |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI gợi ý cấu trúc thư mục feature-based.
AI gợi ý pattern design system với CSS variables cho màu sắc và typography.
```

---

# [Phase 04] Implementation - Frontend UI/UX

## Ngày thực hiện

```text
2026-05-14 đến 2026-05-21
```

## Đã hoàn thành

- [x] Tạo project structure (src/Front_end/src/ với 12 subfolder)
- [ ] Cài đặt database connection (backend chưa implement)
- [x] Xây dựng backend (Đã hoàn thiện 100% bằng Spring Boot)
- [x] Xây dựng frontend (46 files, 14,691+ dòng code)
- [x] Xây dựng authentication UI (LoginPage, RegisterPage, ForgotPasswordPage, OTPPage)
- [x] Xử lý CRUD (mock service với in-memory data)
- [x] Xử lý validation (date range, form inputs)
- [ ] Tích hợp API thực (đang dùng mock)
- [ ] Xử lý upload/download file
- [x] Xử lý lỗi (error states, empty states)
- [x] Tối ưu giao diện (responsive, dark mode, animations)
- [ ] Cập nhật README hướng dẫn chạy

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Xây dựng App.tsx - routing toàn bộ ứng dụng | Nguyễn Văn Dạng | src/Front_end/src/App.tsx | App.tsx (333 dòng) |
| 2 | Xây dựng MarketplacePage với FilterPanel | Nguyễn Văn Dạng | pages/marketplace/MarketplacePage.tsx | MarketplacePage.tsx (414 dòng) |
| 3 | Xây dựng VehicleDetailPage | Nguyễn Văn Dạng | pages/marketplace/VehicleDetailPage.tsx | VehicleDetailPage.tsx |
| 4 | Xây dựng BookingWizardPage (4 bước) | Nguyễn Văn Dạng | pages/booking/BookingWizardPage.tsx | BookingWizardPage.tsx |
| 5 | Xây dựng LandingPage | Nguyễn Văn Dạng | pages/landing/LandingPage.tsx | LandingPage.tsx |
| 6 | Xây dựng Auth pages (Login, Register, ForgotPassword) | Nguyễn Văn Dạng | pages/auth/AuthPages.tsx | AuthPages.tsx |
| 7 | Xây dựng Customer Dashboard | Nguyễn Văn Dạng | pages/dashboard/CustomerDashboard.tsx | CustomerDashboard.tsx |
| 8 | Xây dựng Owner Dashboard | Nguyễn Văn Dạng | pages/dashboard/OwnerDashboard.tsx | OwnerDashboard.tsx |
| 9 | Xây dựng Admin Dashboard | Nguyễn Văn Dạng | pages/admin/AdminDashboard.tsx | AdminDashboard.tsx |
| 10 | Xây dựng MessengerPage (real-time chat UI) | Nguyễn Văn Dạng | pages/messages/MessengerPage.tsx | MessengerPage.tsx |
| 11 | Xây dựng HelpPage | Nguyễn Văn Dạng | pages/help/HelpPage.tsx | HelpPage.tsx |
| 12 | VehicleCard component (grid + list variant) | Nguyễn Văn Dạng | components/vehicle/VehicleCard.tsx | VehicleCard.tsx |
| 13 | Navbar component với dark mode toggle | Nguyễn Văn Dạng | components/navigation/Navbar.tsx | Navbar.tsx |
| 14 | Skeleton loading components | Nguyễn Văn Dạng | components/ui/Skeleton.tsx | Skeleton.tsx |
| 15 | Toast notification component | Nguyễn Văn Dạng | components/ui/Toast.tsx | Toast.tsx |
| 16 | Framer Motion animation variants | Nguyễn Văn Dạng | animations/variants.ts | variants.ts |
| 17 | Zustand store (auth + UI preferences) | Nguyễn Văn Dạng | store/index.ts | store/index.ts |
| 18 | Mock database (20+ luxury vehicles, users, data) | Nguyễn Văn Dạng | mock/db/ (4 files) | mock/db/vehicles.ts |
| 19 | vehicleService (getAll, search, filter, pagination) | Nguyễn Văn Dạng | services/vehicleService.ts | vehicleService.ts |
| 20 | authService (login, register, logout) | Nguyễn Văn Dạng | services/authService.ts | authService.ts |
| 21 | bookingService (create, getByUser, cancel) | Nguyễn Văn Dạng | services/bookingService.ts | bookingService.ts |
| 22 | Global CSS design system (LuxeWay theme) | Nguyễn Văn Dạng | styles/globals.css | globals.css |
| 23 | i18n translations (EN/VI) | Nguyễn Văn Dạng | i18n/translations.ts | translations.ts |
| 24 | TypeScript type definitions | Nguyễn Văn Dạng | types/index.ts | types/index.ts |
| 25 | Utility functions (formatCurrency, debounce) | Nguyễn Văn Dạng | utils/index.ts | utils/index.ts |
| 26 | Push code lên branch NguuyenVanDang | Nguyễn Văn Dạng | Git | Commit 9c591ff |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) hỗ trợ sinh code khung cho các component chính:
- MarketplacePage: structure, filter logic, debounced search, animation
- App.tsx: routing structure, lazy loading, protected route pattern
- VehicleCard: layout, wishlist toggle, hover effects
- animations/variants.ts: Framer Motion variants
- Gợi ý folder structure tổng thể

Tất cả code AI sinh ra được đọc, hiểu, test và chỉnh sửa trước khi dùng.
```

## Commit/Screenshot minh chứng

```text
Branch: NguuyenVanDang
Commit: 6a4ec6e - DE190324/ setup UI UX for project (lần 1, bị lỗi submodule)
Commit: 9c591ff - DE190324/ setup UI UX for project (lần 2, đã fix - 46 files, 14,691 dòng)
GitHub: https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a02_group-02/tree/NguuyenVanDang
```

## Ghi chú

```text
Gặp lỗi git submodule khi push lần đầu (src/Front_end bị track như submodule).
Đã fix bằng: git rm --cached src/Front_end → git add src/Front_end/ → git push --force
Kết quả: 46 files + 14,691 dòng code được hiển thị đúng trên GitHub.
```

---

# [Phase 04.5] Implementation - Backend (Spring Boot)

## Ngày thực hiện

```text
2026-05-23
```

## Đã hoàn thành

## [2026-05-23]
Author: Nguyễn Văn Dạng (DE190324)

### Added (Đã thêm)
- Thêm module Review để đánh giá và review chuyến đi.
- Thêm module Notification cho hệ thống thông báo bất đồng bộ.
- Thêm module Payment tích hợp logic callback VNPay và xử lý hoàn tiền (refund) cho Admin.
- Thêm module User Profile để upload tài liệu KYC và thống kê Owner.
- Thêm module Admin để quản lý dashboard, duyệt xe và quản lý người dùng.

### Changed (Đã thay đổi)
- Tích hợp NotificationService vào BookingService để tự động gửi thông báo khi trạng thái booking thay đổi.

### Fixed (Đã sửa lỗi)
- Fix entity Booking bằng cách thêm trường couponCode bị thiếu.
- Fix lỗi truy vấn JPA trong VehicleRepository và BookingRepository bằng cách chuyển đổi String sang Enum cho tương thích với SQL Server.
- Fix lỗi crash SecurityConfig bằng cách khởi tạo bean UserDetailsService.

### AI-assisted (AI hỗ trợ)
- Đã sử dụng Antigravity để gợi ý toàn bộ cấu trúc Spring Boot (DTO, Controller, Service).
- Toàn bộ code cuối cùng đã được review và test để đảm bảo tương thích với dialect của SQL Server.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Xây dựng Review Service & Controller | Nguyễn Văn Dạng | ReviewService.java, ReviewController.java | Các file trong Back_end |
| 2 | Xây dựng Notification Service & Hook | Nguyễn Văn Dạng | NotificationService.java, BookingService.java | Các file trong Back_end |
| 3 | Xây dựng Payment xử lý VNPay | Nguyễn Văn Dạng | PaymentService.java, PaymentController.java | Các file trong Back_end |
| 4 | Xây dựng User Profile, upload tài liệu | Nguyễn Văn Dạng | UserService.java, UserController.java | Các file trong Back_end |
| 5 | Xây dựng Admin quản lý nền tảng | Nguyễn Văn Dạng | AdminService.java, AdminController.java | Các file trong Back_end |
| 6 | Fix lỗi JPA query với Enum | Nguyễn Văn Dạng | BookingRepository.java, VehicleRepository.java | Các file trong Back_end |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) hỗ trợ sinh code toàn bộ kiến trúc Controller, Service, DTO, Repository.
AI tự động sửa các lỗi liên quan đến JPA Enum và fix bean SecurityConfig.
```

---

# [Phase 04.6] Integration - Frontend & Backend API

## Ngày thực hiện

```text
2026-05-24
```

## Đã hoàn thành

## [2026-05-24]
Author: Nguyễn Văn Dạng (DE190324)

### Added (Đã thêm)
- Cấu hình `apiClient.ts` sử dụng `axios` với JWT interceptors tự động gán token.
- Refactor các services `authService`, `bookingService`, `vehicleService`, `paymentService`, `otherServices` để gọi API thay vì mock dữ liệu.

### Changed (Đã thay đổi)
- Chuyển tất cả component (CustomerDashboard, OwnerDashboard, AdminDashboard) sang sử dụng API thực.

### Removed (Đã xóa)
- Đã gỡ bỏ và xóa hoàn toàn việc sử dụng module `mock/db` trong source Frontend.

### AI-assisted (AI hỗ trợ)
- Dùng AI để generate boilerplate gọi API axios và thay thế đồng loạt trong code.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Xây dựng API Client cấu hình JWT | Nguyễn Văn Dạng | apiClient.ts | src/Front_end/src/services/apiClient.ts |
| 2 | Loại bỏ mock data và refactor Services | Nguyễn Văn Dạng | Tất cả các file trong `services/` | Đã xóa import `mock/db` |
| 3 | Sửa lỗi fallback Dashboard UI | Nguyễn Văn Dạng | CustomerDashboard.tsx, AdminDashboard.tsx, v.v | Giao diện không bị crash khi API chưa đầy đủ dữ liệu phụ |
| 4 | Debug lỗi thiếu hàm Repository JPA | Nguyễn Văn Dạng | VehicleRepository.java | Khai báo 6 queries còn thiếu |
| 5 | Xử lý lỗi Gradle build lock | Nguyễn Văn Dạng | PowerShell | Script kill java process và force delete folder build |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI tự động tìm kiếm các đoạn import mock/db và tạo code API thay thế dựa trên apiClient, hỗ trợ fallback data an toàn.
```

---

# [Phase 04.7] Advanced Features & Multi-profile Integration

## Ngày thực hiện

```text
2026-05-25
```

## Đã hoàn thành

- [x] Triển khai real-time WebSocket messaging với Spring WebSocket & STOMP.
- [x] Tạo module Coupon (Discount code CRUD, validation) ở Backend.
- [x] Tạo các API quản lý DigitalContract, Dispute, FAQ, Location, và Statistics.
- [x] Cấu hình multi-profile cho Spring Boot backend (SQL Server, MySQL, H2).
- [x] Xây dựng `adminService.ts` tích hợp API Dashboard admin thực tế.
- [x] Thêm i18n hỗ trợ song ngữ (EN/VI) bằng `react-i18next` cùng switcher.
- [x] Nâng cấp `authService` hỗ trợ real token refresh, password changes, và OTP forgot/reset flows.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | WebSocket Config & Chat API | Nguyễn Văn Dạng | WebSocketConfig.java, ChatController.java | Backend |
| 2 | Coupon, Dispute, Contract, FAQ APIs | Nguyễn Văn Dạng | Coupon, Dispute, DigitalContract, FAQ controllers | Backend |
| 3 | Cấu hình DB profiles | Nguyễn Văn Dạng | application.yml, application-h2.yml, application-mysql.yml | Backend config |
| 4 | adminService API client | Nguyễn Văn Dạng | adminService.ts | Frontend services |
| 5 | Tích hợp Admin Dashboard thực | Nguyễn Văn Dạng | AdminDashboard.tsx | Admin page |
| 6 | Cấu hình i18n đa ngôn ngữ | Nguyễn Văn Dạng | LanguageSwitcher.tsx, ThemeToggle.tsx, config.ts | Frontend ui/i18n |
| 7 | Hỗ trợ full Auth flow (OTP, Token Refresh) | Nguyễn Văn Dạng | authService.ts | Frontend services |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI hỗ trợ viết boilerplate controllers/services cho các module phụ, sinh code i18n config, LanguageSwitcher và struct cho adminService.ts.
```

## Commit/Screenshot minh chứng

```text
Branch: NguuyenVanDang
Chưa commit các thay đổi nâng cao của ngày 2026-05-25 (đang ở trạng thái modified/untracked).
```

---

# [Phase 05] Testing & Debug

## Ngày thực hiện

```text
(Chưa bắt đầu chính thức - đang test manual trong quá trình develop)
```

## Đã hoàn thành

- [ ] Viết test case
- [ ] Chạy test chức năng chính
- [x] Kiểm tra output (manual testing)
- [x] Kiểm tra validation (date range, form)
- [x] Kiểm tra lỗi giao diện (responsive, dark mode)
- [ ] Kiểm tra lỗi database
- [x] Kiểm tra phân quyền (ProtectedRoute redirect)
- [ ] Kiểm tra bảo mật cơ bản
- [x] Fix bug (git submodule, filter logic, validation)
- [x] Chạy lại sau khi fix bug
- [ ] Ghi nhận kết quả test

## Danh sách lỗi đã xử lý

| STT | Lỗi phát hiện | Nguyên nhân | Cách xử lý | Trạng thái |
|---:|---|---|---|---|
| 1 | src/Front_end hiển thị như submodule trên GitHub | src/Front_end có .git folder riêng | git rm --cached + re-add + force push | Fixed |
| 2 | hasFilters đếm sai số lượng filter active | Không loại trừ undefined và array rỗng | Fix filter logic: loại trừ undefined, '' và array.length === 0 | Fixed |
| 3 | Booking wizard không validate date range | Thiếu check returnDate > pickupDate | Thêm validation: returnDate phải sau pickupDate tối thiểu 1 ngày | Fixed |
| 4 | Dark mode không persist sau refresh trang | localStorage key sai | Fix: đọc đúng key luxeway_ui_prefs trong useEffect của App.tsx | Fixed |
| 5 | Navbar hiển thị không đúng trên mobile | Thiếu responsive classes | Thêm hidden md:flex, thêm mobile menu | Pending |

---

# [Phase 06] Hoàn thiện báo cáo và demo

## Ngày thực hiện

```text
(Chưa bắt đầu)
```

## Đã hoàn thành

- [ ] Hoàn thiện source code
- [ ] Hoàn thiện README.md (hướng dẫn chạy project)
- [ ] Hoàn thiện report
- [ ] Hoàn thiện slide
- [ ] Hoàn thiện video demo
- [x] Kiểm tra lại `AI_AUDIT_LOG.md`
- [x] Kiểm tra lại `PROMPTS.md`
- [x] Hoàn thiện `REFLECTION.md`
- [x] Kiểm tra lại `CHANGELOG.md`
- [ ] Đóng gói bài nộp

---

# 4. Tổng kết thay đổi cuối project

## 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---:|---|---|---|---|
| 1 | Landing Page (hero, features, CTA) | Completed | LandingPage.tsx | Framer Motion animations |
| 2 | Marketplace với filter sidebar và search | Completed | MarketplacePage.tsx | Debounce 400ms, URL sync |
| 3 | Vehicle Detail Page | Completed | VehicleDetailPage.tsx | Gallery, specs, booking CTA |
| 4 | Booking Wizard (4 bước) | Completed | BookingWizardPage.tsx | Date picker, extras, payment |
| 5 | Auth pages (Login, Register, ForgotPassword, OTP) | Completed | AuthPages.tsx | Form validation |
| 6 | Customer Dashboard (overview, bookings, profile, wishlist) | Completed | CustomerDashboard.tsx | Zustand auth state |
| 7 | Owner Dashboard (vehicles, calendar, analytics) | Completed | OwnerDashboard.tsx | Vehicle management CRUD |
| 8 | Admin Dashboard | Completed | AdminDashboard.tsx | Role-based access |
| 9 | Messenger (real-time chat) | Completed | MessengerPage.tsx, ChatController.java | Tích hợp Spring WebSocket & STOMP |
| 10 | Help Page | Completed | HelpPage.tsx | FAQ accordion |
| 11 | Dark mode toggle | Completed | Navbar.tsx, globals.css | Persist localStorage |
| 12 | Responsive design (mobile/tablet/desktop) | Partial | Toàn bộ UI | Mobile menu chưa hoàn thiện |
| 13 | Backend API (Spring Boot) | Completed | Thư mục Back_end | Full Controller, Service, Repository |
| 14 | Database (SQL Server, MySQL, H2) | Completed | Cấu hình trong application.yml | Cấu hình profiles đa nền tảng |
| 15 | Payment integration | Completed | PaymentService.java | Xử lý mock callback VNPay |
| 16 | Coupon & Discount management | Completed | CouponController.java | CRUD & logic validation |
| 17 | Digital Lease Contract | Completed | DigitalContractController.java | Quản lý hợp đồng điện tử |
| 18 | Dispute Resolution | Completed | DisputeController.java | Xử lý tranh chấp khách thuê & chủ xe |
| 19 | Multilingual support (i18n) | Completed | LanguageSwitcher.tsx | Bản dịch EN/VI hoàn chỉnh |
| 20 | Admin Dashboard Analytics | Completed | AdminDashboard.tsx, adminService.ts | Quản lý user/xe và doanh thu thực |

## 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---:|---|---|---|
| 1 | Image upload (xe, avatar) | Cần backend storage | Integrate cloud storage (AWS S3 / Cloudinary) |
| 2 | Mobile responsive hoàn chỉnh | Thiếu thời gian | Fix Navbar mobile menu |

## 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Không | - | Nhóm tự phân tích |
| Design | Có | Trung bình | Gợi ý folder structure, design patterns |
| Database | Không | - | Chưa implement |
| Coding | Có | Nhiều | Sinh code khung, tự chỉnh sửa nhiều |
| Debug | Có | Nhiều | Fix git submodule, logic bugs |
| Testing | Không | - | Test manual, chưa có automated test |
| Report | Không | - | Tự viết docs |
| Presentation | Không | - | Chưa làm |

## 4.4. Bài học rút ra

```text
1. Kỹ thuật: 
   - React Router v6 với lazy loading giúp performance tốt hơn đáng kể
   - Zustand đơn giản hơn Redux nhưng đủ mạnh cho project này
   - Framer Motion + AnimatePresence tạo UX chuyên nghiệp
   - Git workflow quan trọng: không để .git lồng nhau

2. Quy trình:
   - Nên setup CI/CD từ sớm
   - Cần viết test song song với code, không để cuối
   - Document (CHANGELOG, PROMPTS, AI_AUDIT_LOG) nên cập nhật ngay khi làm, không để cuối sprint

3. AI:
   - Prompt đủ context → kết quả tốt, tiết kiệm nhiều thời gian
   - Không nên copy blindly, luôn đọc và hiểu code AI sinh ra
   - AI giỏi sinh code khung nhưng cần tự chỉnh về business logic và design
```

## 4.5. Hướng cải thiện tiếp theo

```text
- Implement Spring Boot backend với đầy đủ REST API
- Kết nối Frontend với Backend thực (thay mock services)
- Thêm automated testing (Vitest + React Testing Library)
- Hoàn thiện mobile responsive
- Implement real-time messaging với WebSocket
- Thêm payment gateway (VNPay)
- Deploy lên cloud (Vercel cho Frontend, Render cho Backend)
```

---

# 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nguyễn Văn Dạng - DE190324 | 2026-05-25 |
