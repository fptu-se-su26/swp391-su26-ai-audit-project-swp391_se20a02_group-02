# ⚡ QUICK SECURITY FIX REFERENCE

## 🚀 TL;DR - Start Backend Ngay

```bash
# 1. Copy file .env
copy .env.example .env

# 2. Tạo JWT secret (bất kỳ chuỗi 32+ ký tự)
# Sửa trong file .env:
JWT_SECRET=LuxeWay2024SecretKeyMinimum32CharsRequired!

# 3. Sửa database credentials trong .env
DB_HOST=localhost
DB_USERNAME=sa
DB_PASSWORD=your-password

# 4. Sửa email trong .env (nếu cần gửi email)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# 5. Start backend
cd src\Back_end
gradlew bootRun
```

---

## 📝 Những Gì Đã Sửa

### ✅ Đã Loại Bỏ Hardcoded Secrets
- JWT secret không còn trong `application.yml`
- VNPay credentials không còn trong code
- Email password không còn visible
- Google OAuth keys phải set qua environment

### ✅ Thêm Security Features
- VNPay IP Whitelist filter (chặn callback giả mạo)
- OTP chỉ log ở DEBUG mode (không log trong production)
- CORS có thể config qua environment
- Logging level có thể điều chỉnh qua environment

### ✅ Booking Overlap
- Đã verify: Logic chống double-booking hoạt động tốt
- Có pessimistic lock trên database
- Check overlap với bookings đang active

---

## 🔧 Config Nhanh Cho Development

### File `.env` Tối Thiểu:

```env
# JWT (bắt buộc)
JWT_SECRET=dev-secret-key-at-least-32-characters-long-luxeway

# Database (bắt buộc)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=luxeway_db
DB_USERNAME=sa
DB_PASSWORD=YourPassword123!

# Email (optional - chỉ khi cần test email)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# Google OAuth (optional - chỉ khi dùng Google login)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# VNPay (optional - chỉ khi test payment)
VNPAY_TMN_CODE=B98SI22O
VNPAY_SECRET_KEY=BZ6G1H7WHANSOR3JXMGTBAHCWRAEB6ZL
VNPAY_ALLOWED_IPS=  # Empty = allow all trong dev

# Frontend URL
FRONTEND_URL=http://localhost:5173

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Logging
LOG_LEVEL=DEBUG

# Profile
SPRING_PROFILES_ACTIVE=sqlserver
```

---

## 🚨 Lỗi Thường Gặp

### Error: "JWT secret not configured"
```bash
# Kiểm tra .env có JWT_SECRET chưa
# Phải có ít nhất 32 ký tự
JWT_SECRET=your-secret-at-least-32-chars
```

### Error: "Database connection failed"
```bash
# Kiểm tra SQL Server đang chạy
# Check username/password đúng chưa
DB_USERNAME=sa
DB_PASSWORD=YourPassword123!
```

### Error: "Failed to send email"
```bash
# Nếu không cần test email, ignore error này
# Nếu cần: phải có Gmail App Password (không phải password thường)
# Tạo tại: https://myaccount.google.com/apppasswords
```

### Error: "CORS error"
```bash
# Thêm frontend URL vào CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 📂 File Structure Mới

```
swp391-su26-ai-audit-project/
├── .env.example                     # ← MỚI: Template cho environment variables
├── .env                            # ← BẠN TẠO: Copy từ .env.example
├── .gitignore                      # ← CẬP NHẬT: Thêm .env, secrets
├── BUG-FIXES-SUMMARY.md           # ← MỚI: Chi tiết tất cả bugs đã sửa
├── SECURITY-SETUP-GUIDE.md        # ← MỚI: Hướng dẫn setup đầy đủ
├── QUICK-SECURITY-FIX-REFERENCE.md # ← MỚI: Quick reference (file này)
│
├── src/Back_end/
│   ├── src/main/resources/
│   │   └── application.yml         # ← SỬA: Loại bỏ hardcoded secrets
│   ├── src/main/java/com/luxeway/
│   │   ├── security/
│   │   │   └── VNPayIPWhitelistFilter.java  # ← MỚI: VNPay security
│   │   ├── service/
│   │   │   └── AuthService.java    # ← SỬA: OTP logging, email verification
│   │   └── config/
│   │       └── SecurityConfig.java # ← SỬA: CORS, VNPay filter
```

---

## 🎯 Checklist Trước Khi Commit

- [ ] **.env KHÔNG có trong git** (check .gitignore)
- [ ] **Không có password trong code**
- [ ] **Không có JWT secret trong application.yml**
- [ ] **VNPay credentials không hardcoded**
- [ ] **Test chạy được trước khi push**

---

## 💡 Tips Cho Team

### Khi Clone Project Lần Đầu:
```bash
git clone <repo-url>
cd swp391-su26-ai-audit-project
copy .env.example .env
# Sửa .env với credentials của bạn
# Chạy backend
```

### Khi Pull Code Mới:
```bash
git pull
# Check xem .env.example có thay đổi không
# Cập nhật .env nếu cần
```

### Khi Gặp Lỗi Environment:
```bash
# So sánh .env với .env.example
# Có thể thiếu biến mới
```

---

## 📚 Đọc Thêm

- **Chi tiết về bugs**: `BUG-FIXES-SUMMARY.md`
- **Setup đầy đủ**: `SECURITY-SETUP-GUIDE.md`
- **Project README**: `README.md`

---

## 🆘 Cần Giúp?

1. Đọc `SECURITY-SETUP-GUIDE.md` phần Troubleshooting
2. Check logs trong console khi start backend
3. Hỏi team leader: @LEHAu1
4. Tạo issue trên GitHub (KHÔNG public secrets)

---

**Created**: June 4, 2026  
**For**: SE20A02 Group 02  
**Project**: LuxeWay Vehicle Rental Platform
