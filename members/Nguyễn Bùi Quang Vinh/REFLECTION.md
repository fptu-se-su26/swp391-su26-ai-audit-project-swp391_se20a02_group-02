# AI Learning Reflection

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | SWP212 |
| Mã môn học | SWP212 |
| Lớp | SE20A02 |
| Học kỳ | SU26 |
| Tên bài tập / Project | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Tên sinh viên | Nguyễn Bùi Quang Vinh |
| MSSV | DE190264 |
| Vai trò | Member - Frontend/Backend Integration |
| Thời gian reflection | 2026-05-10 đến 2026-06-28 |
| Ngày hoàn thành reflection | 2026-06-28 |

---

## 2. Tóm tắt quá trình sử dụng AI

```text
Trong quá trình phát triển LuxeWay từ lúc bắt đầu project đến ngày 2026-06-28, em sử dụng
ChatGPT/Codex để hỗ trợ đọc code, xác định nguyên nhân lỗi và đề xuất cách đồng bộ giữa
React/TypeScript và Spring Boot.

Công việc trải qua nhiều nhóm chức năng: xây dựng UI/UX nền tảng, tích hợp backend Spring Boot,
hoàn thiện authentication, OTP, Google OAuth, ổn định marketplace, chuẩn hóa ảnh xe, mở rộng
booking, cải tiến dashboard, merge frontend/backend, sửa lỗi sau merge, bổ sung KYC/eKYC,
WebSocket/STOMP, hợp đồng điện tử, payment/VNPay, invoice, refund/dispute và admin operation
timeline.

AI giúp việc rà soát nhiều tầng code nhanh hơn, nhưng kết quả chỉ hữu ích khi em cung cấp đúng
bối cảnh, đọc lại DTO/entity/service và tự quyết định phần nào phù hợp với kiến trúc LuxeWay.
```

---

## 3. Công cụ AI đã sử dụng

- [x] ChatGPT / Codex
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Microsoft Copilot

### Công cụ được sử dụng nhiều nhất

```text
ChatGPT / Codex, vì có thể đọc trực tiếp repository, so sánh frontend với backend,
phân tích diff và hỗ trợ chỉnh sửa trong đúng workspace.
```

---

## 4. AI đã hỗ trợ em ở điểm nào?

- [x] Hiểu luồng frontend/backend
- [x] Phân tích request/response và DTO
- [x] Debug authentication, OTP và OAuth
- [x] Debug marketplace, ảnh xe và bộ lọc
- [x] Hoàn thiện booking và dữ liệu giao xe
- [x] Merge frontend/backend theo module
- [x] Sửa lỗi sau merge
- [x] Hoàn thiện KYC/eKYC, WebSocket/STOMP
- [x] Thiết kế hợp đồng điện tử, payment/VNPay, invoice, dispute/refund
- [x] Review tác động giữa nhiều file
- [ ] Làm thay toàn bộ project

### Mô tả chi tiết

```text
Ở giai đoạn đầu, AI hỗ trợ em chia layout và xác định component cho landing, marketplace,
vehicle detail và dashboard. Khi project bắt đầu có backend Spring Boot, AI giúp em đọc luồng
controller/service/repository và so sánh với frontend service để phát hiện các điểm không khớp.

Ở authentication, AI giúp nhận ra frontend còn phụ thuộc dữ liệu mock và cần chuẩn hóa ApiResponse,
token và User. Ở OTP, AI hỗ trợ xây dựng luồng gửi/xác minh mã nhưng em phải kiểm tra thêm thời hạn,
rate limit, số lần thử và trạng thái verified.

Ở marketplace, AI hỗ trợ lần theo dữ liệu từ repository/service tới VehicleCard để tìm nguyên nhân
danh sách rỗng hoặc ảnh sai. Ở booking, AI giúp rà soát công thức giá và những trường tuyến đường
cần truyền xuyên suốt frontend, DTO, entity và service.

Ở giai đoạn merge, AI giúp em lập kế hoạch chia frontend/backend theo module, tránh copy hàng loạt
và hạn chế làm hỏng chức năng đã ổn định. Sau merge, AI hỗ trợ xác định lỗi H2, KYC submit/reset,
STOMP handshake, ESLint và dependency security.

Ở giai đoạn cuối, AI hỗ trợ thiết kế workflow hợp đồng điện tử, payment/VNPay, invoice, refund/dispute
và timeline vận hành cho admin. AI cũng hỗ trợ debug lỗi KYC đã được admin duyệt nhưng customer chưa
hiển thị verified, và phân tích lỗi booking legacy chưa đồng bộ với contract/payment mới.
```

---

## 5. AI có giúp em học tốt hơn không?

### Những điểm AI giúp tốt hơn

```text
AI giúp em nhìn một lỗi theo toàn bộ luồng thay vì chỉ sửa tại giao diện. Ví dụ, một lỗi ảnh xe
không chỉ nằm ở thẻ React mà còn có thể do backend không sắp xếp VehicleImage hoặc DTO không
trả trường images. Tương tự, lỗi đăng nhập có thể liên quan tới response wrapper, token storage,
trạng thái Zustand hoặc backend chặn tài khoản chưa verified.

Khi merge frontend/backend, AI giúp em hiểu rõ hơn vì sao phải chia theo module, tạo checkpoint
và đối chiếu API contract. Nếu không làm vậy, các chức năng đã chạy như auth, booking hoặc KYC
có thể bị lỗi khi bổ sung code từ folder khác.

Qua đó em hiểu rõ hơn cách chia trách nhiệm giữa controller, service, repository, DTO, entity,
frontend service, store và UI.
```

### Những điểm AI chưa giúp tốt hoặc cần cẩn thận

```text
AI đôi khi giả định tên field hoặc cấu trúc response theo mẫu phổ biến, trong khi project có
cấu trúc riêng. Nếu áp dụng ngay có thể gây lỗi type hoặc làm sai luồng. AI cũng có thể đưa ra
giải pháp chạy được ở môi trường phát triển nhưng chưa đủ an toàn cho production, đặc biệt với
OTP, OAuth, token, payment và hợp đồng điện tử.

Trong giai đoạn thêm contract/payment, nếu chỉ nghe theo gợi ý tổng quát mà không kiểm tra booking
model cũ, hệ thống có thể tạo booking thành công nhưng contract/payment lại không tìm thấy booking.
Vì vậy em phải kiểm tra lại dữ liệu thật, mapper và endpoint cụ thể của project.
```

### Mức độ phụ thuộc vào AI

- [ ] Không phụ thuộc
- [ ] Phụ thuộc ít
- [x] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

```text
Em dùng AI khá thường xuyên để tăng tốc việc phân tích và hiện thực, nhưng vẫn phải tự cung cấp
yêu cầu, kiểm tra code, lựa chọn phương án và chịu trách nhiệm với thay đổi. Em không thể dùng
kết quả AI hiệu quả nếu không hiểu luồng dữ liệu của project.
```

---

## 6. Em đã kiểm tra kết quả AI như thế nào?

- [x] Đọc lại các file sau khi chỉnh sửa
- [x] So sánh type frontend với DTO/entity backend
- [x] Kiểm tra endpoint trong controller
- [x] Kiểm tra logic service và trạng thái store
- [x] Đối chiếu các trường dữ liệu xuyên suốt luồng
- [x] Chạy checkpoint build/test phù hợp với từng giai đoạn
- [x] Loại bỏ đề xuất không phù hợp với project

```text
Ví dụ với email OTP, em kiểm tra từ form đăng ký, authService, endpoint controller, dữ liệu OTP
trong AuthService đến trường verified của User. Với booking, em kiểm tra pickup/dropoff,
tọa độ, route distance, delivery fee từ UI đến request DTO, entity và response.

Với KYC, em kiểm tra trạng thái từ admin review, backend service, auth response, frontend store
và trang Documents. Với payment/contract, em kiểm tra luồng booking -> hợp đồng -> ký -> thanh toán
-> invoice -> dispute/refund để phát hiện nơi contract/payment chưa nhận đúng booking.
```

---

## 7. Ví dụ AI có thể sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| Gợi ý chưa phù hợp | Logout ngay khi `/auth/me` lỗi |
| Vì sao chưa phù hợp | Lỗi mạng tạm thời không đồng nghĩa token hết hạn; logout làm mất phiên người dùng |
| Cách phát hiện | Theo dõi luồng khởi tạo store và dữ liệu cached trong localStorage |
| Cách xử lý | Giữ cached session, trả `null` khi refresh profile lỗi và chỉ logout khi xác thực thật sự thất bại |

Một ví dụ khác:

| Nội dung | Mô tả |
|---|---|
| Gợi ý chưa đủ | Lưu OTP dạng text và chỉ kiểm tra đúng/sai |
| Rủi ro | OTP có thể bị lộ, thử không giới hạn hoặc dùng lại |
| Cách cải thiện | Hash OTP xác minh email, đặt thời hạn, rate limit, giới hạn 5 lần thử và xóa sau khi dùng |

Một ví dụ trong giai đoạn cuối:

| Nội dung | Mô tả |
|---|---|
| Gợi ý chưa đủ | Thêm contract/payment chỉ dựa trên booking mới |
| Rủi ro | Booking legacy vẫn confirmed nhưng hợp đồng/payment báo `Booking not found` |
| Cách cải thiện | Đối chiếu lại toàn bộ mapper, lookup và dữ liệu booking giữa luồng cũ và luồng mới |

---

## 8. Phần đóng góp thực sự của sinh viên

```text
Em xác định yêu cầu cần làm, cung cấp bối cảnh lỗi, lựa chọn module cần sửa, đọc và điều chỉnh
kết quả AI theo cấu trúc LuxeWay. Em tham gia tích hợp authentication thật, hoàn thiện các luồng
OTP/OAuth, kiểm tra dữ liệu marketplace và booking, đồng thời rà soát tính nhất quán giữa UI,
service, DTO, entity và backend service.

Ở giai đoạn merge, em theo dõi kế hoạch frontend/backend, yêu cầu kiểm tra chức năng thiếu,
không xóa folder phụ trước khi checkpoint đạt và tiếp tục sửa lỗi sau merge. Ở giai đoạn payment
và hợp đồng điện tử, em xác định thêm yêu cầu nghiệp vụ cho người thuê/chủ xe, payment, invoice
và dispute/refund.

AI hỗ trợ tăng tốc và gợi ý phương án; phần quyết định áp dụng, sửa lại và chịu trách nhiệm là
đóng góp của em.
```

---

## 9. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện |
|---|---|---|---|
| Tìm lỗi tích hợp | Thường kiểm tra từng file riêng | Lần theo toàn bộ request/response | Có hệ thống hơn |
| UI/UX nền | Dễ thiếu cấu trúc chung | Có layout/component rõ hơn | Dễ mở rộng hơn |
| Authentication | Frontend còn phụ thuộc mock | Kết nối backend, token và user thật | Hoàn chỉnh hơn |
| OTP | Luồng đơn giản, thiếu kiểm soát | Có expiry, rate limit, attempt và one-time use | An toàn hơn |
| Marketplace | Có thể rỗng/sai ảnh | Có fallback và chuẩn hóa gallery | Ổn định hơn |
| Booking | Thiếu dữ liệu tuyến đường và extras | Đồng bộ route, fee và tổng tiền | Đầy đủ hơn |
| Merge frontend/backend | Dễ copy trùng hoặc thiếu chức năng | Chia theo module và checkpoint | Ít rủi ro hơn |
| KYC/eKYC | Trạng thái có thể lệch giữa admin/customer | Đồng bộ auth response/store/UI | Nhất quán hơn |
| Payment/Contract | Chưa có luồng hợp đồng điện tử hoàn chỉnh | Có contract, VNPay, invoice, dispute/refund | Gần nghiệp vụ thật hơn |
| Viết báo cáo | Nội dung chung chung | Có module và minh chứng cụ thể | Minh bạch hơn |

---

## 10. Bài học về môn học và phát triển phần mềm

```text
Em hiểu rõ hơn rằng một chức năng web không chỉ là giao diện. Authentication cần bảo mật và
quản lý trạng thái; marketplace cần truy vấn và ánh xạ dữ liệu chính xác; booking cần bảo đảm
công thức giá và dữ liệu được lưu nhất quán. Hợp đồng điện tử và payment còn yêu cầu trạng thái
nghiệp vụ phải chặt chẽ: booking phải tồn tại, hợp đồng phải ký trước khi thanh toán, invoice
phải gắn đúng payment và dispute/refund phải có log vận hành.

Việc sửa lỗi nên bắt đầu bằng cách xác định luồng dữ liệu, điểm vào/điểm ra và các trường hợp
thất bại. Sửa một file mà không kiểm tra các tầng liên quan dễ tạo ra lỗi mới.
```

---

## 11. Bài học về sử dụng AI có trách nhiệm

```text
AI phù hợp nhất khi được dùng như người hỗ trợ review và cùng phân tích. Cần mô tả rõ triệu chứng,
file liên quan và kết quả mong muốn; sau đó phải tự đọc lại code và kiểm tra giả định của AI.

Không nên ghi nhận các hoạt động không có minh chứng hoặc biến đề xuất AI thành đóng góp cá nhân
mà không hiểu nội dung. Báo cáo tốt cần phân biệt phần AI gợi ý, phần sinh viên áp dụng và phần
sinh viên tự điều chỉnh.
```

---

## 12. Cam kết

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Ghi nhận các phần AI hỗ trợ quan trọng.
- [x] Có thể giải thích luồng authentication, marketplace, booking, KYC, contract và payment đã chỉnh sửa.
- [x] Chịu trách nhiệm với nội dung và mã nguồn cuối cùng.

---

## 13. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Hiểu yêu cầu và phạm vi | 4 | Xác định được các module chính |
| Kiểm chứng kết quả AI | 4 | Đối chiếu nhiều tầng code |
| Tự chỉnh sửa/cải tiến | 4 | Điều chỉnh theo cấu trúc LuxeWay |
| Hiểu nội dung đã áp dụng | 4 | Có thể giải thích các luồng chính |
| Sử dụng AI minh bạch | 5 | Có audit và prompt log cụ thể |

---

## 14. Câu hỏi tự vấn cuối bài

### Nếu giảng viên hỏi AI đã hỗ trợ phần nào, em có giải thích lại được không?

```text
Có. Em có thể giải thích AI hỗ trợ phân tích và đề xuất cho UI/UX nền, authentication, OTP,
OAuth, marketplace, booking, dashboard, merge frontend/backend, KYC/eKYC, WebSocket, hợp đồng
điện tử, payment/VNPay, invoice và dispute/refund; đồng thời chỉ ra các file frontend/backend
tương ứng.
```

### Nếu không có AI, em có thể tự làm lại phần quan trọng nhất không?

```text
Có, nhưng sẽ mất nhiều thời gian hơn để đọc và đối chiếu các tầng. Em có thể tự lần theo
form -> service -> controller -> DTO -> backend service -> entity và sửa từng phần.
```

### Phần nào thể hiện rõ nhất năng lực thực sự của em?

```text
Khả năng tích hợp và debug xuyên suốt frontend/backend: nhận biết response không khớp,
đồng bộ trạng thái user, hoàn thiện OTP, bảo đảm dữ liệu marketplace/booking được ánh xạ
đúng qua nhiều file và xử lý các lỗi phát sinh khi thêm hợp đồng điện tử/payment vào hệ thống cũ.
```

---

## 15. Cam kết Reflection

Em cam kết reflection này phản ánh trung thực quá trình sử dụng AI và quá trình phát triển website LuxeWay.

| Đại diện sinh viên | Ngày xác nhận |
|---|---|
| Nguyễn Bùi Quang Vinh - DE190264 | 2026-06-28 |
