# 🔐 SECURITY SETUP GUIDE - LUXEWAY

## ⚠️ CRITICAL: Read Before Starting the Application

This guide walks you through securing your LuxeWay application with proper environment variables and security configurations.

---

## 📋 QUICK START CHECKLIST

- [ ] Copy `.env.example` to `.env`
- [ ] Generate JWT secret key
- [ ] Configure database credentials
- [ ] Set up Gmail App Password for emails
- [ ] Configure VNPay credentials (if using payments)
- [ ] Verify all environment variables are set
- [ ] Test application startup

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Create Environment File

```bash
# Navigate to project root
cd /path/to/swp391-su26-ai-audit-project

# Copy example to actual .env file
cp .env.example .env
```

**Windows Command Prompt:**
```cmd
copy .env.example .env
```

---

### Step 2: Generate JWT Secret Key

**Option A - Using OpenSSL (Recommended):**
```bash
openssl rand -base64 32
```

**Option B - Using Online Generator:**
- Visit: https://generate-random.org/api-token-generator
- Generate a 256-bit key
- **WARNING**: Don't use public generators for production secrets!

**Option C - Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the generated key and paste into `.env`:
```env
JWT_SECRET=your-generated-secret-here
```

---

### Step 3: Configure Database

Edit `.env`:
```env
# SQL Server (Primary database)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=luxeway_db
DB_USERNAME=sa
DB_PASSWORD=YourStrongPassword123!
```

**Create Database:**
```sql
-- Connect to SQL Server Management Studio
CREATE DATABASE luxeway_db;
GO

-- Run schema and data files (in order):
-- 1. src/Back_end/src/main/resources/schema.sql
-- 2. src/Back_end/import-data.sql
```

---

### Step 4: Set Up Gmail for Emails

#### 4.1 Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

#### 4.2 Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### 4.3 Configure in `.env`
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=abcdefghijklmnop  # Remove spaces from app password
```

**⚠️ NEVER use your actual Gmail password!**

---

### Step 5: Google OAuth Setup (Optional)

#### 5.1 Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create new project: "LuxeWay"
3. Enable "Google+ API"

#### 5.2 Create OAuth Credentials
1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Authorized redirect URIs:
   - Development: `http://localhost:8080/login/oauth2/code/google`
   - Production: `https://api.luxeway.vn/login/oauth2/code/google`

#### 5.3 Configure in `.env`
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

---

### Step 6: VNPay Payment Gateway Setup

#### 6.1 Register with VNPay
- Contact: https://vnpay.vn/
- Request sandbox credentials for testing
- Get production credentials before going live

#### 6.2 Configure in `.env`
```env
# Sandbox (Development)
VNPAY_TMN_CODE=B98SI22O
VNPAY_SECRET_KEY=BZ6G1H7WHANSOR3JXMGTBAHCWRAEB6ZL
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_ALLOWED_IPS=  # Empty in development (allows all IPs)

# Production (Get real credentials from VNPay)
# VNPAY_TMN_CODE=your-production-code
# VNPAY_SECRET_KEY=your-production-key
# VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
# VNPAY_ALLOWED_IPS=203.171.19.146,203.171.19.147,203.171.19.148
```

**Security Notes:**
- VNPay callback endpoint has IP whitelist protection
- In development (empty `VNPAY_ALLOWED_IPS`), all IPs are allowed with warning
- In production, MUST set actual VNPay server IPs

---

### Step 7: Frontend Configuration

Edit `.env`:
```env
# Development
FRONTEND_URL=http://localhost:5173

# Production
# FRONTEND_URL=https://luxeway.vn
```

Also update `src/Front_end/.env`:
```env
VITE_API_URL=http://localhost:8080
```

---

### Step 8: CORS Configuration

Edit `.env`:
```env
# Development (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Production
# CORS_ALLOWED_ORIGINS=https://luxeway.vn,https://www.luxeway.vn
```

---

### Step 9: Logging Configuration

Edit `.env`:
```env
# Development (shows SQL queries and debug info)
LOG_LEVEL=DEBUG

# Production (hides sensitive data)
# LOG_LEVEL=INFO
```

**⚠️ WARNING**: DEBUG mode logs sensitive data (OTP codes, SQL queries). Use INFO in production!

---

### Step 10: Set Spring Profile

Edit `.env`:
```env
# Options: sqlserver, mysql, h2
SPRING_PROFILES_ACTIVE=sqlserver
```

---

## 🧪 VERIFICATION STEPS

### 1. Check Environment Variables are Loaded

**Windows CMD:**
```cmd
echo %JWT_SECRET%
```

**Windows PowerShell:**
```powershell
$env:JWT_SECRET
```

**Linux/Mac:**
```bash
echo $JWT_SECRET
```

### 2. Start Backend

```bash
cd src/Back_end
./gradlew bootRun
```

**Check logs for:**
```
✅ VNPay IP whitelist initialized with X IPs
✅ Application started successfully
❌ JWT secret not configured (ERROR - fix required)
```

### 3. Start Frontend

```bash
cd src/Front_end
npm run dev
```

### 4. Test Authentication

1. Go to http://localhost:5173/login
2. Login with test account: `admin@luxeway.vn` / `password`
3. Check browser console for errors
4. Verify JWT token is stored in localStorage

### 5. Test Email Sending

1. Trigger forgot password flow
2. Check logs for OTP (in DEBUG mode)
3. Check email inbox for OTP email

### 6. Test VNPay Payment

1. Create a booking
2. Initiate payment
3. Should redirect to VNPay sandbox
4. Use test card provided by VNPay

---

## 🔒 SECURITY BEST PRACTICES

### DO ✅

1. **Keep secrets in environment variables**
   - ✅ Use `.env` file for local development
   - ✅ Use cloud secrets manager for production (AWS Secrets Manager, Azure Key Vault)

2. **Rotate secrets regularly**
   - ✅ JWT secret: Every 90 days
   - ✅ API keys: When leaving team members have access
   - ✅ Database passwords: Quarterly

3. **Use strong passwords**
   - ✅ Minimum 16 characters
   - ✅ Mix of upper, lower, numbers, symbols
   - ✅ No dictionary words

4. **Limit access**
   - ✅ Database user should have minimum required permissions
   - ✅ Gmail App Password is app-specific (revokable)
   - ✅ VNPay credentials should be in CI/CD secrets

5. **Monitor logs**
   - ✅ Set up alerts for failed authentication attempts
   - ✅ Monitor VNPay callback rejections
   - ✅ Track unusual API access patterns

### DON'T ❌

1. **❌ NEVER commit `.env` file to Git**
   - Already in `.gitignore`
   - Use `.env.example` as template only

2. **❌ NEVER use default secrets in production**
   - Default JWT secret → Anyone can forge tokens
   - Default VNPay sandbox → Real money transactions fail

3. **❌ NEVER share secrets in chat/email**
   - Use secure password managers (1Password, LastPass)
   - Use encrypted channels for sharing

4. **❌ NEVER log secrets**
   - Fixed: OTP now only logs in DEBUG mode
   - Review code for `log.info()` with sensitive data

5. **❌ NEVER hardcode secrets in code**
   - Fixed: All secrets now from environment
   - Code review should catch new hardcoded secrets

---

## 🚨 TROUBLESHOOTING

### Problem: "JWT secret not configured"

**Solution:**
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET  # Linux/Mac
echo %JWT_SECRET%  # Windows CMD

# If empty, add to .env:
JWT_SECRET=your-generated-secret-here

# Restart backend
```

---

### Problem: "Failed to authenticate using Gmail"

**Solutions:**

1. **Check if 2FA is enabled**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Regenerate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Delete old app password
   - Generate new one
   - Update `.env`

3. **Check firewall**
   - Gmail SMTP uses port 587
   - Ensure port is open

4. **Test SMTP connection**
   ```bash
   telnet smtp.gmail.com 587
   ```

---

### Problem: "VNPay callback blocked (403 Forbidden)"

**Solutions:**

1. **Development Mode** (allow all IPs):
   ```env
   VNPAY_ALLOWED_IPS=  # Empty = allow all
   ```

2. **Production Mode** (whitelist VNPay IPs):
   ```env
   VNPAY_ALLOWED_IPS=203.171.19.146,203.171.19.147,203.171.19.148
   ```

3. **Check logs**:
   ```
   SECURITY: Blocked VNPay callback from unauthorized IP: 1.2.3.4
   ```

4. **Behind proxy/load balancer**:
   - Ensure `X-Forwarded-For` header is set
   - Check actual VNPay IP in logs
   - Add to whitelist

---

### Problem: "Database connection failed"

**Solutions:**

1. **Check SQL Server is running**:
   ```bash
   # Windows
   services.msc  # Look for "SQL Server"
   
   # Linux
   sudo systemctl status mssql-server
   ```

2. **Verify credentials**:
   ```sql
   -- Test connection
   sqlcmd -S localhost -U sa -P YourPassword
   ```

3. **Check database exists**:
   ```sql
   SELECT name FROM sys.databases WHERE name = 'luxeway_db';
   ```

4. **Verify connection string**:
   ```env
   DB_HOST=localhost  # Not 127.0.0.1 for SQL Server
   DB_PORT=1433
   ```

---

### Problem: "CORS error in browser console"

**Solutions:**

1. **Check CORS_ALLOWED_ORIGINS includes frontend URL**:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

2. **Restart backend after changing .env**

3. **Clear browser cache**

4. **Check browser console for actual origin**:
   ```
   Access-Control-Allow-Origin: http://localhost:5173
   Origin: http://127.0.0.1:5173  ← Different!
   ```

---

## 📞 GETTING HELP

### Internal Resources
- Project README: `README.md`
- API Documentation: http://localhost:8080/swagger-ui.html
- Bug Fixes Summary: `BUG-FIXES-SUMMARY.md`

### External Resources
- Spring Security: https://docs.spring.io/spring-security/reference/
- JWT: https://jwt.io/
- VNPay Docs: https://sandbox.vnpayment.vn/apis/
- Gmail SMTP: https://support.google.com/mail/answer/7126229

### Team Contacts
- Leader: Lê Văn Hậu (@LEHAu1)
- Security Issues: Create private issue or contact leader directly

---

## ✅ FINAL CHECKLIST BEFORE PRODUCTION

### Security
- [ ] All secrets in environment variables (not in code/config)
- [ ] JWT secret is 256-bit random key (not default)
- [ ] Gmail using App Password (not real password)
- [ ] VNPay using production credentials (not sandbox)
- [ ] VNPay IP whitelist configured
- [ ] CORS limited to production domains only
- [ ] Logging level set to INFO (not DEBUG)

### Functionality
- [ ] Database schema and data imported
- [ ] Email verification tested
- [ ] Payment flow tested with VNPay sandbox
- [ ] Authentication (login/register/forgot password) working
- [ ] Booking creation and cancellation working
- [ ] Admin dashboard accessible

### Monitoring
- [ ] Health check endpoint responding: `/actuator/health`
- [ ] Error logging configured (Sentry, Datadog)
- [ ] Uptime monitoring configured (Pingdom, UptimeRobot)
- [ ] Alert emails configured for critical errors

### Backup
- [ ] Database backup scheduled (daily)
- [ ] Backup restoration tested
- [ ] Secrets backed up in secure location (1Password, Vault)

---

**Last Updated**: June 4, 2026  
**Version**: 1.0  
**Maintained By**: SE20A02 Group 02
