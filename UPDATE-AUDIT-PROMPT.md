# Tự động cập nhật AI Audit Log (Dành cho Antigravity)

**Cách sử dụng:** 
Copy toàn bộ nội dung bên dưới phần đường kẻ ngang (---) và dán vào khung chat với Antigravity mỗi khi bạn làm xong một task và muốn cập nhật 4 file nhật ký. Bạn chỉ cần sửa lại nội dung trong ngoặc vuông `[...]` cho phù hợp.

---

**@Antigravity:** Đóng vai trò là Agent chuyên ghi nhận Audit Log. Hãy giúp tôi tự động cập nhật 4 file báo cáo trong thư mục `members/Lê Văn Hậu/` dựa trên task tôi vừa hoàn thành.

**Thông tin Task vừa làm:**
- **Mục đích (Purpose):** [Ví dụ: Xây dựng chức năng Quên mật khẩu / Fix bug giỏ hàng]
- **Kết quả AI sinh ra:** [Ví dụ: Tạo ra entity, controller và giao diện đổi mật khẩu]
- **Quyết định của con người:** [Ví dụ: Tôi đã review code và thêm validation bảo mật]
- **File/Module bị ảnh hưởng:** [Chỉ cần nói chung chung, hoặc để AI tự đọc git diff]
- **Tình trạng:** [Đã chạy thành công / Còn lỗi nhỏ]

**Nhiệm vụ của bạn (Agent):**
1. Đọc lướt qua các file code tôi vừa thay đổi (dùng git status / diff nếu cần).
2. Mở file `members/Lê Văn Hậu/AI_AUDIT_LOG.md`: Tạo thêm 1 Log mới nhất ở cuối danh sách (tự động tăng số Log #, tự động điền Date hôm nay) với thông tin tôi cung cấp ở trên.
3. Mở file `members/Lê Văn Hậu/PROMPTS.md`: Thêm một mục Prompt mới tương ứng với Log vừa tạo, ghi lại tóm tắt yêu cầu của tôi.
4. Mở file `members/Lê Văn Hậu/CHANGELOG.md`: Thêm một bullet point tóm tắt tính năng vừa làm vào đầu file.
5. Mở file `members/Lê Văn Hậu/REFLECTION.md` (nếu có update): Xem có cần bổ sung bài học hay khó khăn gì vào mục Reflection không, nếu có hãy cập nhật.

Hãy cẩn thận giữ nguyên định dạng Markdown có sẵn của các file. Sau khi xong, hãy báo cáo tóm tắt những file bạn đã sửa!
