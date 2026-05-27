# AI Learning Reflection

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
| Ngày hoàn thành reflection | 2026-05-25 |

---

## 2. Mục đích Reflection

File này dùng để Nguyễn Văn Dạng (DE190324) tự đánh giá quá trình sử dụng AI (Antigravity) trong việc xây dựng Frontend UI/UX cho dự án LuxeWay.

Reflection cần thể hiện:

- AI đã hỗ trợ gì trong quá trình học.
- Sinh viên/nhóm đã kiểm chứng kết quả AI như thế nào.
- Sinh viên/nhóm đã tự chỉnh sửa, cải tiến ra sao.
- Sinh viên/nhóm học được gì về môn học.
- Sinh viên/nhóm học được gì về cách sử dụng AI minh bạch và có trách nhiệm.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Trong sprint đầu tiên (2026-05-12 đến 2026-05-21), mình đã sử dụng AI (Antigravity)
để hỗ trợ xây dựng toàn bộ Frontend UI/UX cho dự án LuxeWay.

Cách mình dùng AI:
- Giai đoạn setup (2026-05-12): Hỏi AI về cấu trúc thư mục phù hợp cho React + TypeScript + Vite project
  với kiến trúc feature-based. AI gợi ý cấu trúc 12 thư mục con rõ ràng.

- Giai đoạn coding (2026-05-14 đến 2026-05-20): Hỏi AI sinh code khung cho các component lớn:
  MarketplacePage (414 dòng), FilterPanel, App.tsx với routing, VehicleCard, animation variants.
  Mỗi lần đều đọc code kỹ, test, và chỉnh sửa trước khi dùng.

## Reflection - Triển khai Backend (2026-05-23)

Trong giai đoạn này, nhóm đã sử dụng Antigravity để sinh toàn bộ logic cho các module backend Spring Boot còn thiếu (Review, Notification, Payment, User Profile, Admin).
Tuy nhiên, một số câu truy vấn JPA do AI tạo ra ban đầu sử dụng String literal cho Enum, điều này gây ra lỗi dialect với SQL Server.

Nhóm đã review code của AI và sửa lại các câu truy vấn JPA trong `VehicleRepository` và `BookingRepository` để sử dụng đường dẫn Enum đầy đủ (ví dụ: `com.luxeway.enums.BookingStatus.COMPLETED`).
Quá trình này giúp nhóm hiểu được tầm quan trọng của việc kiểm tra các truy vấn database do AI sinh ra so với dialect SQL cụ thể đang được sử dụng.

Bài học lớn nhất rút ra là: mặc dù AI cực kỳ xuất sắc trong việc tạo ra một lượng lớn code khung (Controllers, Services, DTOs), lập trình viên luôn phải kiểm tra kỹ ORM và các ràng buộc database để đảm bảo code có thể chạy tốt trên môi trường thực tế.

- Giai đoạn debug (2026-05-17): Gặp lỗi git submodule (src/Front_end không hiện code trên GitHub).
  AI giải thích nguyên nhân và hướng dẫn fix step by step.

- Giai đoạn Backend (2026-05-23): Sử dụng AI để sinh toàn bộ các module Backend thiếu sót bằng Spring Boot. 
  Từ Review, Notification, Payment, đến User và Admin. AI giúp liên kết logic rất tốt (như bắn notification khi tạo booking).

## Reflection - Tích hợp Frontend & Backend (2026-05-24)

Mình đã sử dụng Antigravity để refactor toàn bộ service layer ở frontend. Ban đầu project bị phụ thuộc vào module `mock/db` do chính AI gợi ý ở giai đoạn đầu để làm Frontend độc lập.
Khi Backend Spring Boot hoàn tất, mình đã yêu cầu AI tạo `apiClient.ts` sử dụng `axios` với interceptors tự động gán JWT.
Sau đó, AI hỗ trợ loại bỏ hoàn toàn module mock và gọi API thực tế.
Bài học lớn nhất là: việc thiết kế Service Layer tốt từ ban đầu (tách biệt UI và logic gọi data) đã giúp quá trình chuyển đổi từ Mock sang Real API cực kỳ dễ dàng, gần như không phải sửa đổi component UI (chỉ cần đảm bảo fallback an toàn khi API thiếu dữ liệu).

## Reflection - Kỹ năng Debugging (2026-05-24)

Quá trình chạy Backend gặp một số trở ngại lớn mà nhóm đã học được cách giải quyết cùng AI:
1. **Lỗi thiếu Method JPA**: Khi Spring Boot báo lỗi `cannot find symbol method`, nhóm nhận ra dù AI đã sinh ra các Service dùng các method query (`findByStatusOrderByCreatedAtDesc`, v.v) nhưng lại quên không khai báo chúng trong interface `VehicleRepository`. Học được cách đọc lỗi biên dịch Java để tìm chính xác interface nào đang thiếu khai báo.
2. **Lỗi khóa file của HĐH (Windows File Lock)**: Mặc dù đã thêm code vào Repository, lỗi cũ vẫn liên tục xuất hiện. Qua sự hỗ trợ của AI, nhóm hiểu rằng do ứng dụng Java cũ chưa tắt hẳn, nó đã "khóa" (lock) thư mục `build/classes`. Gradle không thể xóa file cũ để dịch file mới. Bài học: Sử dụng PowerShell kill process (`taskkill /F /IM java.exe`), force delete thư mục `build`, và dùng tính năng `Rebuild Project` của IntelliJ để giải quyết triệt để các lỗi out-of-sync của IDE.

## Reflection - Các API nâng cao & Đa ngôn ngữ (2026-05-25)

Trong ngày hôm nay (2026-05-25), mình đã sử dụng AI để hỗ trợ hoàn thành các cấu hình và API nâng cao cho LuxeWay.
1. Triển khai Spring WebSocket: Cấu hình và tạo ChatController giúp hoàn thiện backend cho Messenger, thay thế phần WebSocket giả lập trước đó ở Frontend.
2. API quản lý (Coupon, DigitalContract, Dispute, FAQ, Location, Stats): AI sinh nhanh các Entity và REST controllers, giúp nhóm có đủ tài nguyên để quản lý mã giảm giá, tranh chấp, hợp đồng thuê xe điện tử và thống kê tổng quan doanh thu của hệ thống.
3. Hỗ trợ đa ngôn ngữ (i18n): Thiết lập react-i18next với cấu hình translations EN/VI ở Frontend. AI đã sinh component switcher LanguageSwitcher giúp chuyển đổi ngôn ngữ mượt mà.
4. Token Refresh & OTP Flow: Bổ sung logic token refresh tự động trong authService.ts và xử lý mã OTP cho việc thay đổi/khôi phục mật khẩu.

Bài học lớn nhất rút ra: Việc chia nhỏ cấu hình Spring Boot (multi-profile) giúp việc demo dự án linh hoạt hơn khi có thể chạy dễ dàng trên cả SQL Server, MySQL lẫn in-memory H2 DB mà không cần sửa code gốc. Đồng thời, cấu hình dịch thuật (i18n) nên được tách thành các file JSON độc lập để dễ dàng bảo trì dịch thuật hơn là hardcode trực tiếp trong file config của AI.

Công cụ sử dụng nhiều nhất: Antigravity (AI coding assistant tích hợp trong IDE).
AI giúp tăng tốc đáng kể - ước tính tiết kiệm 60-70% thời gian coding cho các component phức tạp.
Tuy nhiên, vẫn phải đầu tư nhiều thời gian để đọc, hiểu, test và chỉnh sửa kết quả AI.
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
- [ ] Microsoft Copilot
- [ ] Perplexity
- [ ] Công cụ khác: ....................................

### Công cụ được sử dụng nhiều nhất

```text
Antigravity - AI coding assistant tích hợp trong VS Code IDE.
```

### Lý do sử dụng công cụ đó

```text
- Antigravity tích hợp trực tiếp vào IDE, không cần chuyển tab ra ngoài
- Hiểu context của project (đọc được code đang mở, file structure)
- Hỗ trợ tốt React + TypeScript: hiểu types, imports, JSX syntax
- Có thể run git commands trực tiếp (dùng khi fix git submodule)
- Trả lời tiếng Việt khi cần
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [ ] Hiểu yêu cầu đề bài
- [ ] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [x] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [ ] Viết test case
- [x] Review code
- [ ] Tối ưu code
- [ ] Kiểm tra bảo mật
- [ ] Viết báo cáo
- [ ] Chuẩn bị thuyết trình
- [x] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết

```text
1. Tìm ý tưởng giải pháp:
   AI gợi ý dùng AnimatePresence cho sidebar filter slide-in/out, gợi ý pattern debounced search
   với useCallback để tránh re-render không cần thiết.

2. Thiết kế giao diện:
   AI gợi ý layout 3-column grid cho vehicle cards, sticky top bar với search + filters,
   sidebar filter panel 280px với responsive hide/show.

3. Thiết kế kiến trúc hệ thống (Frontend):
   Folder structure feature-based, lazy loading với React.lazy + Suspense,
   centralized state với Zustand, service layer tách biệt logic khỏi UI.

4. Viết code mẫu:
   AI sinh code khung cho MarketplacePage, FilterPanel, App.tsx routing, VehicleCard.
   Tổng ước tính ~1200 dòng code khung từ AI, sau chỉnh sửa thành ~4000+ dòng.

5. Debug lỗi:
   Fix git submodule issue - giải thích rõ nguyên nhân và fix step by step.
   Gợi ý fix hasFilters logic cho FilterPanel.

6. Review code:
   AI review và gợi ý cải tiến filter logic, pagination UX.

7. Tìm hiểu công nghệ mới:
   Học cách dùng Framer Motion staggerContainer, AnimatePresence qua code AI sinh ra,
   sau đó tự áp dụng vào các component khác.
```

---

## 6. AI có giúp em/nhóm học tốt hơn không?

### 6.1. Những điểm AI giúp em/nhóm học tốt hơn

```text
1. Hiểu Framer Motion nhanh hơn:
   Trước khi dùng AI, mình không biết dùng AnimatePresence như thế nào để animate sidebar.
   AI sinh ra code mẫu với AnimatePresence + motion.aside, mình đọc, chạy thử, sau đó hiểu
   cách nó hoạt động và tự áp dụng vào các component khác (VehicleCard hover, page transitions).

2. Biết cách tổ chức code React lớn:
   Folder structure feature-based, lazy loading, code splitting - những pattern này mình biết
   về lý thuyết nhưng AI giúp mình thấy cách implement cụ thể trong project thực.

3. Biết pattern debounced search với useCallback:
   Trước đây mình hay dùng setTimeout trực tiếp, AI gợi ý pattern debounce wrapper function
   kết hợp useCallback, giúp mình hiểu sâu hơn về React hooks.

4. Hiểu git submodule issue:
   Lỗi git submodule là lần đầu tiên mình gặp. AI giải thích rõ nguyên nhân
   (embedded .git folder → git coi là separate repo) và cách fix. Bài học này rất valuable.

5. Biết thêm cách thiết kế UI component có variants:
   VehicleCard với variant grid/list mode - pattern này AI gợi ý và mình học được cách design
   component có thể switch giữa các layout khác nhau.
```

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

```text
1. Màu sắc không đúng design system:
   AI sinh ra màu mặc định (blue-500, gray-100) không phù hợp với LuxeWay luxury theme.
   Phải tự thay thế tất cả bằng CSS variables (#0F172A, accent, gold). Mất thêm thời gian.

2. Thiếu business logic đặc thù:
   AI không biết các business rule của LuxeWay: promo code LUXE10, date validation rules,
   extras pricing. Phải tự implement tất cả.

3. AI không hiểu mock data cụ thể:
   AI sinh code service nhưng không biết mình có bao nhiêu loại xe, ảnh từ đâu.
   Phải tự tạo mock data cho 20+ luxury vehicles.

4. Đôi khi AI sinh code quá complex:
   Một số lần AI gợi ý solution quá phức tạp (ví dụ dùng useReducer cho state đơn giản).
   Mình chọn giải pháp đơn giản hơn (useState thường).
```

### 6.3. Em/nhóm có bị phụ thuộc vào AI không?

- [ ] Không phụ thuộc
- [x] Phụ thuộc ít
- [ ] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

Giải thích:

```text
Mình phụ thuộc ít vào AI. Cụ thể:
- Các component nhỏ (pagination, dark mode toggle, empty state): tự viết không dùng AI
- Zustand store logic: tự thiết kế và viết
- Mock data (20+ xe): tự tạo toàn bộ
- CSS design tokens (globals.css): tự viết

Chỉ dùng AI cho những component phức tạp có nhiều tính năng đan xen nhau (MarketplacePage),
hoặc khi gặp bug khó (git submodule).

Mình đảm bảo mỗi phần AI sinh ra đều đọc và hiểu trước khi dùng.
```

---

## 7. Em/nhóm đã kiểm tra kết quả AI như thế nào?

Đánh dấu các cách đã sử dụng.

- [x] Chạy thử chương trình
- [x] Kiểm tra output
- [ ] Viết test case
- [x] So sánh với yêu cầu đề bài
- [ ] Đối chiếu với tài liệu môn học
- [x] Review code
- [ ] Hỏi lại giảng viên
- [ ] Tra cứu tài liệu chính thống
- [ ] Thảo luận với thành viên nhóm
- [x] Kiểm tra bằng dữ liệu mẫu
- [x] So sánh trước và sau khi dùng AI
- [ ] Khác: ....................................

### Mô tả quá trình kiểm chứng

```text
Quy trình kiểm chứng của mình cho mỗi component AI sinh ra:

Bước 1 - Đọc code trước khi dùng:
  Đọc toàn bộ file AI sinh ra, hiểu từng phần làm gì.
  Kiểm tra imports có đúng path không.
  Kiểm tra TypeScript types có match với types/index.ts không.

Bước 2 - Chạy thử:
  Copy vào project, chạy npm run dev.
  Kiểm tra TypeScript errors và runtime errors trong console.

Bước 3 - Test manual từng feature:
  Tạo checklist các tính năng cần test.
  Test từng item một, ghi nhận kết quả.

Bước 4 - Test edge cases:
  Search empty string, search không có kết quả.
  Filter nhiều categories cùng lúc.
  Pagination khi ít hơn 1 trang.
  Dark mode toggle + refresh trang (persist).

Bước 5 - Review và chỉnh sửa:
  Fix những gì không đúng design system.
  Thêm những tính năng AI bỏ sót.
  Refactor code chỗ nào quá phức tạp.
```

### Ví dụ cụ thể về một lần kiểm chứng

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | hasFilters logic để kiểm tra có filter active không, dùng Object.values().some() |
| Em/nhóm đã kiểm tra bằng cách nào? | Thêm console.log(filters, hasFilters) rồi test click các filter button |
| Kết quả kiểm tra | Sai - hasFilters trả về true ngay cả khi không có filter nào (vì key 'sortBy' luôn có giá trị) |
| Em/nhóm đã xử lý tiếp như thế nào? | Sửa logic: loại trừ undefined, '' và array rỗng. Thêm thêm điều kiện v !== 'popular' cho sortBy |

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | hasFilters = Object.values(filters).some(v => v !== undefined && v !== '') |
| Vì sao gợi ý đó sai/chưa phù hợp? | Logic này count cả category: [] (array rỗng) là có filter, count cả sortBy: 'popular' (giá trị mặc định) |
| Em/nhóm phát hiện bằng cách nào? | Test manual: vào Marketplace mà không click filter gì, badge vẫn hiện số > 0 |
| Em/nhóm đã sửa như thế nào? | Thêm: && (Array.isArray(v) ? v.length > 0 : true) để loại array rỗng; không count 'popular' trong activeFilterCount |
| Bài học rút ra | AI sinh code generic, không biết đặc thù của project. Phải test kỹ edge cases |

---

## 9. Phần đóng góp thật sự của sinh viên/nhóm

```text
Nguyễn Văn Dạng (DE190324) - Đóng góp thật sự trong sprint này:

1. Tự quyết định toàn bộ design direction:
   - Chọn luxury aesthetic: dark navy (#0F172A), subtle gold accents, glassmorphism
   - Thiết kế typography hierarchy: font-display cho headings, spacing system
   - Quyết định animation "feel": slow và smooth (0.6s) thay vì default fast

2. Tự tạo toàn bộ mock data (src/mock/db/vehicles.ts):
   - Research 20+ luxury vehicles: Ferrari 488, Lamborghini Huracan, Rolls-Royce Ghost, Porsche 911...
   - Đặt giá realistic: $800-$3500/ngày tùy xe
   - Tạo categories: supercar, luxury, suv, convertible, classic, electric

3. Tự implement Zustand stores:
   - authStore: login, logout, register, initAuth (khôi phục session từ localStorage)
   - uiStore: theme (dark/light), language, notifications, sidebar state

4. Tự viết business logic trong BookingWizardPage:
   - Tính tổng tiền: days × rate + extras
   - Promo code LUXE10 (-10%), validate format
   - Date validation: returnDate > pickupDate, tối thiểu 1 ngày

5. Tự fix các bugs sau khi dùng AI:
   - hasFilters logic
   - Dark mode persist
   - Git submodule issue (áp dụng hướng dẫn AI, xử lý .git không tồn tại)

6. Tự setup toàn bộ CI/CD configuration không dùng AI:
   - .github/ workflow files
   - Branch naming convention
   - Commit message format
```

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Hiểu yêu cầu | Đã rõ (từ đề bài) | Đã rõ | Không thay đổi |
| Phân tích bài toán | Tự phân tích | Tự phân tích | Không thay đổi |
| Thiết kế giải pháp | Mất 2-3 giờ brainstorm | 30 phút + review AI suggestion | Tiết kiệm 80% thời gian design |
| Code/Implementation | ~100 dòng/giờ | ~300-400 dòng/giờ | Tốc độ tăng 3-4x |
| Debug/Testing | Giải quyết thủ công | AI giải thích nhanh hơn | Giảm 50% thời gian debug |
| Báo cáo/Thuyết trình | Tự làm | Tự làm | Không dùng AI |
| Làm việc nhóm | Phân chia theo skill | Phân chia theo skill | Không thay đổi |

---

## 11. Bài học về môn học

```text
Sau sprint đầu tiên của LuxeWay, mình học được:

Kỹ thuật:
- React Router v6: lazy loading + Suspense giúp performance tốt hơn rõ rệt
- Zustand: state management đơn giản, ít boilerplate hơn Redux nhiều
- Framer Motion: AnimatePresence + stagger tạo UX premium không cần CSS phức tạp
- TypeScript: typing chặt chẽ giúp catch bug sớm, IDE support tốt hơn
- Git workflow: branch naming, commit convention quan trọng khi làm nhóm

Thiết kế hệ thống:
- Feature-based folder structure giúp code dễ navigate và maintain
- Service layer tách biệt API calls khỏi UI component
- Mock service pattern hữu ích để develop frontend độc lập với backend

E-commerce UX:
- Filter + search + sort phải hoạt động mượt mà, debounce quan trọng
- URL persistence cho filters giúp share link và back/forward navigation
- Skeleton loading tốt hơn spinner cho grid-based layouts
- Grid/List view toggle là UX pattern phổ biến cho marketplace
```

---

## 12. Bài học về sử dụng AI có trách nhiệm

```text
Sau sprint này, mình rút ra những bài học quan trọng về dùng AI:

1. Không copy blindly:
   Mỗi file AI sinh ra mình đều đọc từ đầu đến cuối trước khi dùng.
   Có lần AI sinh code dùng useReducer cho state đơn giản → mình chuyển về useState.
   
2. Luôn test sau khi dùng code AI:
   hasFilters bug, dark mode persist bug đều được phát hiện qua test manual.
   AI không thể predict tất cả edge cases của project cụ thể.

3. AI không biết business context:
   AI không biết xe nào là luxury, giá bao nhiêu là realistic, validation rules gì.
   Phần business logic luôn phải tự viết.

4. Prompt tốt → kết quả tốt → ít phải chỉnh sửa:
   Prompt cho MarketplacePage với đủ tech stack + requirements → kết quả tốt, ít phải fix.
   Prompt "create a booking form" → kết quả tệ, phải viết lại từ đầu.

5. Ghi nhận trung thực:
   File này (REFLECTION.md), PROMPTS.md, AI_AUDIT_LOG.md, CHANGELOG.md được viết
   dựa trên những gì mình thực sự làm. Không thêm thắt hay che giấu.

6. AI là công cụ, không thay thế hiểu biết:
   Mình vẫn cần hiểu React, TypeScript, Framer Motion để có thể đọc và chỉnh sửa code AI.
   Nếu chỉ copy không hiểu → không debug được khi có lỗi.
```

---

## 13. Điều em/nhóm sẽ không làm khi sử dụng AI

Đánh dấu các cam kết phù hợp.

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.
- [x] Không dùng AI để tạo nội dung sai lệch hoặc gian lận.
- [x] Không dùng AI thay thế hoàn toàn quá trình học.
- [x] Không bỏ qua yêu cầu, rubric hoặc hướng dẫn của giảng viên.

### Giải thích thêm nếu có

```text
Mình cam kết 100% các điểm trên. Tất cả 4 file docs (AI_AUDIT_LOG.md, PROMPTS.md, 
CHANGELOG.md, REFLECTION.md) được viết dựa trên hoạt động thực tế của mình,
không fake thông tin, không thêm bớt.

Cụ thể những gì mình tự làm (không dùng AI): mock data, Zustand stores, 
business logic, CSS design tokens, toàn bộ docs files này.
```

---

## 14. Kế hoạch cải thiện lần sau

```text
Những điều mình sẽ làm tốt hơn trong sprint tiếp theo:

1. Viết prompt tốt hơn:
   - Luôn bắt đầu bằng "Context: [project name và description]"
   - Thêm "Constraints: [màu sắc, font, design system tokens]" để AI sinh đúng style
   - Yêu cầu AI giải thích các quyết định design quan trọng

2. Ghi log ngay khi làm:
   Lần này mình ghi PROMPTS.md và AI_AUDIT_LOG.md vào cuối sprint → mất một số chi tiết.
   Lần sau sẽ ghi ngay sau mỗi lần dùng AI.

3. Viết test song song:
   Thêm unit test với Vitest cho các utility functions và service functions.
   
4. Test responsive từ sớm:
   Mobile responsive cần test sớm hơn, không để đến cuối sprint.

5. Thảo luận với nhóm trước khi áp dụng AI output:
   Một số quyết định design nên review với cả nhóm trước khi implement.
```

---

## 15. Tự đánh giá mức độ hoàn thành

Sinh viên/nhóm tự đánh giá theo thang 1-5.

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Ghi lại đầy đủ 7 lần dùng AI với chi tiết thực tế |
| Prompt có mục tiêu rõ ràng | 4 | Prompt MarketplacePage và folder structure rất rõ, booking form ban đầu kém |
| Kiểm chứng kết quả AI | 4 | Test manual kỹ, phát hiện bugs. Chưa có automated test |
| Tự chỉnh sửa/cải tiến | 4 | Đã chỉnh sửa màu, validation, pagination, filter logic |
| Hiểu nội dung đã nộp | 5 | Có thể giải thích từng phần code đã dùng |
| Reflection có chiều sâu | 4 | Phản ánh trung thực, có ví dụ cụ thể |
| Sử dụng AI có trách nhiệm | 5 | Không copy blindly, test kỹ, ghi nhận trung thực |

---

## 16. Câu hỏi tự vấn cuối bài

### 16.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Có. Mình có thể giải thích:
- MarketplacePage: giải thích tại sao dùng useCallback + debounce cho search,
  tại sao dùng AnimatePresence cho sidebar, cách hasFilters logic hoạt động
- App.tsx: giải thích React.lazy + Suspense, tại sao cần ProtectedRoute, 
  cách nested routes hoạt động trong React Router v6
- git submodule fix: giải thích embedded .git vấn đề gì, tại sao git rm --cached giải quyết được

Tất cả phần AI sinh ra mình đều đọc kỹ và hiểu trước khi dùng.
```

### 16.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Có thể, nhưng sẽ chậm hơn nhiều. 
MarketplacePage (414 dòng) với filter + debounced search + animation:
- Không có AI: ước tính 12-16 giờ để viết từ đầu
- Có AI: 3-4 giờ (đọc, test, chỉnh sửa code AI sinh ra)

Mình biết React, TypeScript đủ để tự viết - chỉ là chậm hơn.
Cấu trúc logic tương tự mình có thể reproduce được nếu giảng viên yêu cầu.
```

### 16.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Phần thể hiện rõ nhất năng lực thật sự:

1. Design system (globals.css): 
   Tự thiết kế CSS variables, luxury color palette, utility classes mà không có AI.
   Thể hiện khả năng thiết kế UI/UX coherent.

2. Mock data (vehicles.ts):
   Tự research và tạo 20+ xe với pricing realistic, đúng categories.
   Thể hiện khả năng tư duy về domain model.

3. Zustand stores:
   Tự thiết kế state structure và actions cho authStore + uiStore.
   Thể hiện hiểu về state management pattern.

4. Business logic trong BookingWizardPage:
   Tính giá, date validation, promo code - tất cả tự viết.
   Thể hiện khả năng translate business requirements thành code.
```

### 16.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
1. TypeScript nâng cao: generic types, conditional types, utility types
   (để định nghĩa types phức tạp hơn cho LuxeWay)

2. Testing với Vitest + React Testing Library:
   (sprint này chưa có test - cần cải thiện)

3. Performance optimization:
   React.memo, useMemo, virtualization cho large vehicle lists

4. WebSocket / real-time:
   Cho tính năng messaging và real-time notifications

5. Viết prompt tốt hơn:
   Cung cấp đủ constraints (màu, design tokens) để AI sinh đúng style ngay từ đầu
```

---

## 17. Cam kết Reflection

Em/nhóm cam kết rằng nội dung reflection này phản ánh trung thực quá trình sử dụng AI và quá trình học tập trong bài tập/project.

Sinh viên/nhóm hiểu rằng:

- AI là công cụ hỗ trợ học tập, không thay thế hoàn toàn năng lực cá nhân.
- Mọi kết quả AI gợi ý cần được kiểm tra trước khi sử dụng.
- Sinh viên/nhóm chịu trách nhiệm với sản phẩm cuối cùng.
- Sinh viên/nhóm cần giải thích được các phần đã nộp.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nguyễn Văn Dạng - DE190324 | 2026-05-25 |
