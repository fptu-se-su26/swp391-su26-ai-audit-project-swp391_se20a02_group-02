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
| Ngày hoàn thành | 2026-05-21 |

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
| Code backend | ✅ | | | | Chưa implement trong sprint này |
| Debug lỗi | | | ✅ | | AI fix git submodule issue |
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

2. Chạy thử npm run dev:
   - Kiểm tra không có TypeScript error
   - Kiểm tra không có runtime error trong console
   - Test từng tính năng một theo checklist

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
- Debug git submodule issue

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
| Nguyễn Văn Dạng | DE190324 | Frontend UI/UX (toàn bộ React app) | Có | Branch NguuyenVanDang, commit 9c591ff |
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
| Nguyễn Văn Dạng - DE190324 | 2026-05-21 |
