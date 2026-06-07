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

# [Phase 04.8] Refactoring & Form API Integration

## Ngày thực hiện

```text
2026-05-28
```

## Đã hoàn thành

- [x] Tích hợp component `ImageUploader` kéo-thả ảnh xe vào `VehicleFormPage` trên Owner Dashboard.
- [x] Triển khai gọi APIs thực tế từ frontend `VehicleFormPage` sang Spring Boot backend (`vehicleService.create` / `vehicleService.update`).
- [x] Thêm logic load dữ liệu xe cũ động từ REST API khi truy cập trang chỉnh sửa xe.
- [x] Đổi tên nhánh sang `feature/de190324-vehicle-rental-platform` và đồng bộ commit messages theo convention.
- [x] Khôi phục các trang `ComparePage.tsx` và `BusinessPage.tsx` bị mất từ stash, giải quyết hoàn toàn lỗi build frontend.
- [x] Xử lý untrack và bỏ qua thư mục cache Gradle (`.gradle/`) cùng config `.idea/`.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Tích hợp ImageUploader & REST API vào VehicleFormPage | Nguyễn Văn Dạng | OwnerDashboard.tsx | OwnerDashboard.tsx |
| 2 | Khôi phục các file page bị thiếu | Nguyễn Văn Dạng | ComparePage.tsx, BusinessPage.tsx | Các file được checkout lại |
| 3 | Cấu hình .gitignore & dọn dẹp Git tracking | Nguyễn Văn Dạng | .gitignore, compiler.xml, .gradle/ | Git status clean |
| 4 | Đổi tên nhánh & rewriting commits | Nguyễn Văn Dạng | Git | feature/de190324-vehicle-rental-platform |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) cung cấp mã tích hợp ImageUploader, cấu trúc load/save REST API ở VehicleFormPage, hướng dẫn workaround đổi tên nhánh trên Windows và dọn dẹp Git tracking.
```

## Commit/Screenshot minh chứng

```text
Branch: feature/de190324-vehicle-rental-platform
Commit: 01aec85 - [DE190324] feat: integrate image uploader and edit/create functionality in OwnerDashboard
```

---

# [Phase 04.9] Bilingual Translations, Security Whitelisting & TypeScript Compilation Fixes

## Ngày thực hiện

```text
2026-05-28
```

## Đã hoàn thành

- [x] Hoàn tất và chuẩn hóa bản dịch song ngữ Anh-Việt (i18n) cho Landing page, Booking wizard, và Customer dashboard.
- [x] Nhận diện và sửa lỗi import Lucide icon `Loader2` trong `CustomerDashboard.tsx`.
- [x] Khắc phục cú pháp cấu hình sidebar link Settings trong Customer dashboard (đầy đủ icon và label).
- [x] Thêm khối kiểm tra an toàn dữ liệu `!vehicle` (null-safety) ở Case 4 của `canProceed()` trong `BookingWizardPage.tsx` để vượt qua bộ lọc biên dịch TypeScript.
- [x] Khai báo cho phép công khai VNPay checkout return callback (`/payments/vnpay/return`) tại Spring Security configuration `SecurityConfig.java`.
- [x] Biên dịch thành công 100% dự án tĩnh (`npm run build`) không có lỗi.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Sửa lỗi biên dịch Settings sidebar link & import Loader2 | Nguyễn Văn Dạng | CustomerDashboard.tsx | CustomerDashboard.tsx |
| 2 | Sửa lỗi null check an toàn vehicle trong canProceed() | Nguyễn Văn Dạng | BookingWizardPage.tsx | BookingWizardPage.tsx |
| 3 | Thêm whitelist endpoint VNPay return vào permitAll() | Nguyễn Văn Dạng | SecurityConfig.java | SecurityConfig.java |
| 4 | Chạy biên dịch tĩnh thành công toàn bộ website | Nguyễn Văn Dạng | Front-end | tsc -b && vite build (0 errors) |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) phát hiện lỗi syntax Settings sidebar, gợi ý import Loader2 còn thiếu, gợi ý null safety guard check cho vehicle, và cấu hình an toàn Spring Security.
```

## Commit/Screenshot minh chứng

```text
Branch: feature/de190324-vehicle-rental-platform
Commit: [DE190324] fix: resolve typescript compiler errors, clean settings sidebar, and whitelist vnpay return redirect
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
| Nguyễn Văn Dạng - DE190324 | 2026-05-31 |

---

# [Phase 03] Production Readiness & Build Optimisation

## Ngày thực hiện

```text
2026-05-31
```

## Đã hoàn thành

- [x] Audit toàn bộ hệ thống: Backend (Spring Boot) + Frontend (React/TypeScript) — 0 lỗi biên dịch.
- [x] Patch lỗ hổng bảo mật `DisputeController`: bổ sung `@PreAuthorize("hasRole('ADMIN')")` trên tất cả endpoint admin-only.
- [x] Triển khai OTP Workflow: `POST /auth/forgot-password`, `POST /auth/verify-otp`, `POST /auth/reset-password` với mã OTP 6 chữ số, TTL 5 phút, one-time use.
- [x] Chat Persistence (REQ-CHAT): Thay thế toàn bộ `localStorage` bằng REST API (`/chat/conversations`, `/chat/messages`). Entities `Conversation` + `Message` + repositories + service.
- [x] Payment Method CRUD: Entity `PaymentMethod`, Repository, Service, Controller (`GET/POST/PUT/DELETE /payment-methods`).
- [x] Invoice PDF: `InvoiceController` + `InvoiceService` sinh PDF hoá đơn thực tế.
- [x] Employee / Fleet Management: Entity `Employee`, CRUD API (`/employees`), assign-vehicle (`/employees/{id}/assign-vehicle`), xoá mock `MOCK_EMPLOYEES` ở Frontend.
- [x] Email Service: `EmailService.java` sử dụng `JavaMailSender` (log fallback khi không có SMTP).
- [x] Upload Security: whitelist MIME-type, giới hạn 10 MB, rename ngẫu nhiên.
- [x] Platform Analytics (Phase 3C): `GET /admin/analytics/revenue`, `/bookings`, `/users`, `/vehicles` — tích hợp vào `AdminDashboard`.
- [x] System Settings CRUD: `GET/PUT /admin/settings`.
- [x] FAQ CRUD: `GET/POST/PUT/DELETE /admin/faqs`.
- [x] **Fix chunk size warning**: Thêm `manualChunks` trong `vite.config.ts` → split vendor bundle thành 8 chunk riêng (react, state, motion, charts, i18n, http, ws, ui).
- [x] **Fix Sass deprecation**: Cấu hình `css.preprocessorOptions.scss.api = 'modern-compiler'` để dừng cảnh báo `legacy-js-api` từ `stompjs`.
- [x] **Fix mixed static/dynamic import**: `main.tsx` — xoá `import('./i18n/config')` động, dùng thẳng instance `i18n` đã import tĩnh.
- [x] Build Backend thành công: `105 Java source files`, `luxeway-backend-1.0.0.jar` — **0 lỗi**.
- [x] Build Frontend thành công: `2,979 modules`, `dist/index.html` — **0 lỗi**.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Patch DisputeController authorization | Nguyễn Văn Dạng | DisputeController.java | `@PreAuthorize("hasRole('ADMIN')")` |
| 2 | OTP Workflow Backend | Nguyễn Văn Dạng | AuthController.java, AuthService.java, PasswordResetToken.java | 3 endpoints mới |
| 3 | Chat Persistence — xoá localStorage | Nguyễn Văn Dạng | Conversation.java, Message.java, ChatService.java, MessengerPage.tsx | REQ-CHAT 100% |
| 4 | PaymentMethod CRUD | Nguyễn Văn Dạng | PaymentMethod.java, PaymentMethodController.java | 4 endpoints |
| 5 | Invoice PDF service | Nguyễn Văn Dạng | InvoiceController.java, InvoiceService.java | GET /invoices/{id}/pdf |
| 6 | Employee Management | Nguyễn Văn Dạng | Employee.java, EmployeeController.java, OwnerDashboard.tsx | Xoá MOCK_EMPLOYEES |
| 7 | Email Service | Nguyễn Văn Dạng | EmailService.java | JavaMailSender + log fallback |
| 8 | Upload Security | Nguyễn Văn Dạng | FileUploadController.java | MIME whitelist + 10 MB limit |
| 9 | Analytics, Settings, FAQ APIs | Nguyễn Văn Dạng | AdminController.java | Phase 3C |
| 10 | vite.config.ts — manualChunks + modern Sass | Nguyễn Văn Dạng | vite.config.ts | Chunk size warning fixed |
| 11 | main.tsx — fix mixed import i18n | Nguyễn Văn Dạng | main.tsx | Rollup warning fixed |
| 12 | Backend build validation | Nguyễn Văn Dạng | Maven build | 105 files, 0 errors |
| 13 | Frontend build validation | Nguyễn Văn Dạng | Vite build | 2979 modules, 0 errors |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) hỗ trợ:
- Phân tích toàn bộ codebase và phát hiện các lỗ hổng bảo mật, mock data còn tồn tại.
- Sinh code cho toàn bộ Phase 3A (Security), 3B (Core Features), 3C (Analytics).
- Cấu hình manualChunks tối ưu cho bundle splitting.
- Fix mixed import pattern và Sass deprecation trong vite.config.ts.
- Resolve vấn đề Unicode path khi build trên Windows (tiếng Việt trong đường dẫn).
Toàn bộ code được review, test build thành công trước khi commit.
```

## Commit/Screenshot minh chứng

```text
Branch: feature/de190324-vehicle-rental-platform
Build Backend:  [INFO] BUILD SUCCESS — 105 source files — luxeway-backend-1.0.0.jar
Build Frontend: ✓ built in 7.15s — 2979 modules — dist/index.html 1.76 kB
```

---

# [Phase 04.10] Enterprise Help Center & Live Landing Page Statistics Fix

## Ngày thực hiện

```text
2026-06-03 đến 2026-06-04
```

## Đã hoàn thành

- [x] Sửa lỗi hiển thị thống kê Landing Page:
  - Khắc phục lỗi làm tròn `Math.floor(stats.totalVehicles / 100) * 100` gây hiển thị `0+` xe khi số lượng xe trong DB nhỏ hơn 100 (hiện tại là 12 xe).
  - Loại bỏ hoàn toàn mock data và silent zero fallbacks tại trang Landing Page, tích hợp live stats trực tiếp từ cơ sở dữ liệu SQL Server.
  - Thêm error alert banner kèm nút **Retry** khi gọi API stats thất bại để tăng khả năng chống chịu lỗi của giao diện.
- [x] Xây dựng hệ thống Help Center doanh nghiệp:
  - Thiết kế DDL và dữ liệu mẫu (mock-free seeds) cho các bảng `help_categories`, `help_articles`, `support_tickets`, và `support_ticket_messages` trong `data-sqlserver.sql`.
  - Tạo các Entity Java tương ứng: `HelpCategory.java`, `HelpArticle.java`, `SupportTicket.java`, `SupportTicketMessage.java`.
  - Triển khai Repositories, Services, và REST Controllers cho Help Center và Support Ticket.
  - Sửa lỗi mapping JPA query method bằng cách đổi tên method `findByUserId` thành `findByUser_IdOrderByCreatedAtDesc` để tránh exception khởi động Spring Boot.
  - whitelisting công khai các endpoint `/api/v1/help/**` trong `SecurityConfig.java` và phân quyền bảo mật cho `/api/v1/support/**`.
- [x] Nâng cấp Frontend Help Page:
  - Viết `helpService.ts` tích hợp API categories, articles, ticket submission, và thread replies.
  - Redesign giao diện Help Center với các category cards hiển thị live article count, trang chi tiết bài viết, thanh tìm kiếm debounced gọi API thực tế, form submit support ticket và dashboard theo dõi/phản hồi ticket.
- [x] Biên dịch thành công backend JAR và frontend Vite bundle, xác thực E2E thông qua các browser subagents.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Sửa lỗi làm tròn hiển thị số lượng xe | Nguyễn Văn Dạng | LandingPage.tsx | `stats.totalVehicles < 100 ? ...` |
| 2 | Tạo Entity, Repository, Service & Controller cho Help Center | Nguyễn Văn Dạng | HelpCategory.java, HelpArticle.java, HelpController.java, HelpService.java | Backend source files |
| 3 | Tạo Entity, Repository, Service & Controller cho Support Ticket | Nguyễn Văn Dạng | SupportTicket.java, SupportTicketMessage.java, SupportTicketController.java, SupportTicketService.java | Backend source files |
| 4 | Sửa lỗi JPA query method mapping | Nguyễn Văn Dạng | SupportTicketRepository.java, SupportTicketService.java | `findByUser_IdOrderByCreatedAtDesc` |
| 5 | whitelisting public help endpoints & Security Config | Nguyễn Văn Dạng | SecurityConfig.java | `permitAll()` `/help/**` |
| 6 | Thêm DDL & Seed dữ liệu thật vào data-sqlserver.sql | Nguyễn Văn Dạng | data-sqlserver.sql | Tạo 8 categories và 15 articles |
| 7 | Viết helpService.ts gọi live APIs | Nguyễn Văn Dạng | helpService.ts | Frontend services |
| 8 | Redesign UI HelpPage & tích hợp forms, search, ticket thread | Nguyễn Văn Dạng | HelpPage.tsx | Rebuilt 100% |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) hỗ trợ:
- Gợi ý cấu trúc DDL, entities, controllers/services cho Help Center và Support Ticket.
- Phát hiện và đề xuất đổi tên query method thành findByUser_Id để giải quyết lỗi Spring Boot bootup query-creation.
- Gợi ý giải pháp classpath launcher để bypass lỗi build Maven do Unicode path (Tài liệu) trên Windows.
- Hỗ trợ xây dựng giao diện Help Center, search debounced, và form submittal/reply.
Toàn bộ code được kiểm chứng hoạt động thực tế trên browser và backend database.
```

## Commit/Screenshot minh chứng

```text
Branch: feature/de190324-vehicle-rental-platform
Commit: [DE190324] feat: upgrade help center to enterprise marketplace support and fix landing page stats
```

---

# [Phase 05.0] Separation of Vehicle Entity into Car and Motorbike

## Ngày thực hiện

```text
2026-06-06
```

## Đã hoàn thành

- [x] Tách thực thể `Vehicle` chung thành 2 thực thể chuyên biệt `Car` và `Motorbike`.
- [x] Tạo các class JPA Entity tương ứng: `Car.java`, `Motorbike.java`, `CarBrand.java`, `MotorbikeBrand.java`, `CarModel.java`, `MotorbikeModel.java`, `CarBooking.java`, `MotorbikeBooking.java`.
- [x] Tạo các REST API Controllers, Services, và Repositories cho cả 2 module: `CarController.java`, `MotorbikeController.java`, `CarService.java`, `MotorbikeService.java`, `CarBookingService.java`, `MotorbikeBookingService.java`.
- [x] whitelist public access cho các endpoint `/cars`, `/motorbikes` và các APIs tương ứng tại `SecurityConfig.java`.
- [x] Cập nhật Frontend routing trong `App.tsx` hỗ trợ `/cars`, `/motorbikes`, `/cars/:id`, `/motorbikes/:id`.
- [x] Xây dựng các trang marketplace và chi tiết xe mới: `CarsMarketplace.tsx`, `CarDetails.tsx`, `MotorbikeMarketplace.tsx`, `MotorbikeDetails.tsx`.
- [x] Triển khai `carService.ts` và `motorbikeService.ts` gọi APIs thực tế từ Backend.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Tạo Entities và DTOs cho Car & Motorbike | Nguyễn Văn Dạng | Car.java, Motorbike.java, DTOs | Backend Java classes |
| 2 | Thiết lập Controllers và Services chuyên biệt | Nguyễn Văn Dạng | CarController.java, MotorbikeController.java, Services | Backend Java classes |
| 3 | Cập nhật cấu hình bảo mật permitAll | Nguyễn Văn Dạng | SecurityConfig.java | Endpoint whitelisting |
| 4 | Tạo Marketplaces & Details Pages ở Frontend | Nguyễn Văn Dạng | CarsMarketplace.tsx, MotorbikeMarketplace.tsx, Details | Frontend pages |
| 5 | Tạo services gọi API car/motorbike | Nguyễn Văn Dạng | carService.ts, motorbikeService.ts | Frontend services |
| 6 | Cấu hình router links & navigation | Nguyễn Văn Dạng | App.tsx | App routes config |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) hỗ trợ sinh code boilerplate cho các thực thể Car/Motorbike mới, viết các repositories & controllers Spring Boot, và hỗ trợ thiết kế các component UI Marketplace tương ứng cho ô tô và xe máy ở Frontend.
```

## Commit/Screenshot minh chứng

```text
Branch: feature/de190324-vehicle-rental-platform
Commit: [DE190324] feat: split Vehicle entity into specialized Car and Motorbike sub-modules
```

---

# [Phase 05.1] Premium Landing Page Redesign, Promotions & Bilingual Notification Localisation

## Ngày thực hiện

```text
2026-06-07
```

## Đã hoàn thành

- [x] Thiết kế và lập trình lại trang Landing Page giao diện Premium:
  - Thêm phần `VehicleTypeShowcase` trực quan và hiện đại.
  - Tích hợp `RevenueCalculator` động giúp chủ xe tính toán lợi nhuận khi cho thuê.
  - Thêm `LiveActivitySection` hiển thị các hoạt động thực tế trên sàn (đặt xe, đánh giá, đăng xe) cập nhật tự động mỗi 3.5 giây.
- [x] Thiết kế Database Schema & DDL cho bảng `promotions`, hỗ trợ lưu trữ các chương trình khuyến mại trực tiếp từ SQL Server.
- [x] Seed dữ liệu promotions trong file `DatabaseMigration.java` và `data-sqlserver.sql`.
- [x] Bản địa hóa và quốc tế hóa (`i18n`) hệ thống dịch thuật song ngữ Anh-Việt cho toàn bộ thông báo (Bilingual Notification Localisation - `translateNotification`).
- [x] Khắc phục toàn bộ các lỗi biên dịch TypeScript, chuẩn hóa hướng tài liệu (LTR/RTL) theo ngôn ngữ được chọn.

## Thay đổi chi tiết - Nguyễn Văn Dạng (DE190324)

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thêm bảng promotions & logic migrations | Nguyễn Văn Dạng | DatabaseMigration.java, schema.sql, data-sqlserver.sql | DB table promotions |
| 2 | Redesign Landing Page với live updates và calculator | Nguyễn Văn Dạng | LandingPage.tsx | LiveActivitySection, RevenueCalculator |
| 3 | Tích hợp hàm translateNotification | Nguyễn Văn Dạng | translations.ts, App.tsx | Bắn notification bằng tiếng Anh/Việt |
| 4 | Fix lỗi TypeScript & sync document direction (LTR/RTL) | Nguyễn Văn Dạng | App.tsx, i18n/config.ts | `document.documentElement.dir` sync |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI (Antigravity) hỗ trợ viết logic cập nhật tự động cho LiveActivitySection, công thức tính toán cho RevenueCalculator, cấu hình bảng promotions trong DB migration, và xây dựng hàm translateNotification cho i18n translations.
```

## Commit/Screenshot minh chứng

```text
Branch: feature/de190324-vehicle-rental-platform
Commit: [DE190324] feat: redesign premium Landing Page with live activity, revenue calculator and promotions seed
```

---

# 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nguyễn Văn Dạng - DE190324 | 2026-06-07 |

