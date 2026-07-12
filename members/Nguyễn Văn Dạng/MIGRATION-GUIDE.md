# 🔄 MIGRATION GUIDE - Upgrading to Secure Version

## 📋 Overview

This guide helps you migrate from the old version (with hardcoded secrets) to the new secure version (with environment variables).

**Target Audience**: Developers who already have the project running locally

---

## ⚠️ Breaking Changes

### What Changed:
1. **All secrets removed from `application.yml`**
2. **Environment variables now REQUIRED**
3. **New VNPay IP whitelist filter**
4. **CORS configuration via environment**
5. **Logging level configurable via environment**

### What Still Works:
- ✅ All API endpoints unchanged
- ✅ Database schema unchanged
- ✅ Frontend code unchanged
- ✅ Authentication flow unchanged
- ✅ Booking logic unchanged

---

## 🚀 Migration Steps

### Step 1: Backup Current Configuration

```bash
# Backup current application.yml (optional)
copy src\Back_end\src\main\resources\application.yml application.yml.backup
```

### Step 2: Pull Latest Code

```bash
git pull origin main
```

**You will see these new/modified files:**
```
modified:   .gitignore
modified:   README.md
modified:   src/Back_end/src/main/resources/application.yml
modified:   src/Back_end/src/main/java/com/luxeway/service/AuthService.java
modified:   src/Back_end/src/main/java/com/luxeway/config/SecurityConfig.java
new:        .env.example
new:        src/Back_end/src/main/java/com/luxeway/security/VNPayIPWhitelistFilter.java
new:        BUG-FIXES-SUMMARY.md
new:        SECURITY-SETUP-GUIDE.md
new:        QUICK-SECURITY-FIX-REFERENCE.md
new:        MIGRATION-GUIDE.md
```

### Step 3: Extract Your Old Secrets

**From old `application.yml` (if you have backup):**

```yaml
# Find these values in your backup:
jwt:
  secret: YOUR_OLD_JWT_SECRET  # ← Copy this

mail:
  username: your-email@gmail.com  # ← Copy this
  password: your-app-password      # ← Copy this

payment:
  vnpay:
    tmn-code: YOUR_VNPAY_CODE    # ← Copy this
    secret-key: YOUR_VNPAY_KEY   # ← Copy this

security:
  oauth2:
    client:
      registration:
        google:
          client-id: YOUR_GOOGLE_ID        # ← Copy this
          client-secret: YOUR_GOOGLE_SECRET # ← Copy this
```

**If you don't have backup**, use these defaults for development:
- JWT_SECRET: Generate new with `openssl rand -base64 32`
- VNPay: Use sandbox credentials (see `.env.example`)
- Email: Use your Gmail with App Password
- Google OAuth: Create new credentials

### Step 4: Create `.env` File

```bash
# Copy template
copy .env.example .env
```

**Edit `.env` with your values:**

```env
# JWT (use old value OR generate new)
JWT_SECRET=your-old-jwt-secret-OR-generate-new-one

# Database (use your current values)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=luxeway_db
DB_USERNAME=sa
DB_PASSWORD=your-current-db-password

# Email (use old values)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Google OAuth (use old values)
GOOGLE_CLIENT_ID=your-old-client-id
GOOGLE_CLIENT_SECRET=your-old-client-secret

# VNPay (use old values)
VNPAY_TMN_CODE=your-old-tmn-code
VNPAY_SECRET_KEY=your-old-secret-key
VNPAY_ALLOWED_IPS=  # Empty for development

# Other settings
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
LOG_LEVEL=DEBUG
SPRING_PROFILES_ACTIVE=sqlserver
```

### Step 5: Test Backend Startup

```bash
cd src\Back_end
gradlew bootRun
```

**Expected Output:**
```
✅ VNPay IP whitelist initialized with 0 IPs
✅ Started LuxewayBackendApplication in X seconds
```

**If you see errors**, check Step 6 below.

### Step 6: Troubleshoot Common Migration Issues

#### Error: "JWT secret not configured"

**Cause**: `.env` file not loaded or JWT_SECRET missing

**Solution:**
```bash
# Check .env exists in project root
dir .env

# Check JWT_SECRET is set (PowerShell)
$env:JWT_SECRET

# If not set, ensure .env has:
JWT_SECRET=your-secret-at-least-32-characters
```

**Alternative**: Set directly in IDE run configuration
- IntelliJ: Run > Edit Configurations > Environment Variables
- Eclipse: Run > Run Configurations > Environment

#### Error: "Failed to authenticate database"

**Cause**: Database credentials wrong or DB not running

**Solution:**
```bash
# Test SQL Server connection
sqlcmd -S localhost -U sa -P your-password

# If fails, check:
1. SQL Server service is running
2. Username/password in .env is correct
3. Database 'luxeway_db' exists
```

#### Error: "Failed to send email"

**Cause**: Email credentials wrong or 2FA not enabled

**Solution:**
1. Enable 2-Factor Auth on Gmail
2. Generate new App Password: https://myaccount.google.com/apppasswords
3. Update MAIL_PASSWORD in .env (remove spaces)
4. Restart backend

#### Error: "CORS policy blocked"

**Cause**: Frontend URL not in CORS_ALLOWED_ORIGINS

**Solution:**
```env
# In .env, ensure both localhost and 127.0.0.1:
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Step 7: Test Frontend

```bash
cd src\Front_end
npm install  # In case dependencies updated
npm run dev
```

**Test these flows:**
1. Login with existing account
2. Create new booking
3. VNPay payment (if configured)
4. Forgot password (if email configured)

### Step 8: Verify Everything Works

**Backend Health Check:**
- Visit: http://localhost:8080/actuator/health
- Expected: `{"status":"UP"}`

**Frontend:**
- Visit: http://localhost:5173/
- Login should work
- No CORS errors in browser console

**API Test:**
```bash
curl http://localhost:8080/api/v1/vehicles
# Should return vehicle list (public endpoint)
```

---

## 🔄 If Migration Fails

### Option A: Reset to Clean State

```bash
# Stash your changes
git stash

# Pull clean version
git pull origin main

# Start from Step 3 (Create .env)
```

### Option B: Manual Verification

```bash
# 1. Check .env exists
dir .env

# 2. Check .env has all required variables
type .env | findstr "JWT_SECRET"
type .env | findstr "DB_PASSWORD"

# 3. Check application.yml has NO hardcoded secrets
type src\Back_end\src\main\resources\application.yml | findstr "LuxeWay"
# Should NOT find "LuxeWaySecretKeyFor..." anymore

# 4. Check logs for errors
cd src\Back_end
gradlew bootRun > backend.log 2>&1
type backend.log
```

---

## 📊 Migration Checklist

After migration, verify:

### Files
- [ ] `.env` file exists in project root
- [ ] `.env` is in `.gitignore` (don't commit!)
- [ ] `.env` has all variables from `.env.example`
- [ ] `application.yml` has NO hardcoded secrets

### Backend
- [ ] Backend starts without "not configured" errors
- [ ] Can connect to database
- [ ] Health check responds: `/actuator/health`
- [ ] Swagger UI loads: `/swagger-ui.html`

### Authentication
- [ ] Can login with existing account
- [ ] JWT token generated successfully
- [ ] Token refresh works
- [ ] Logout works

### Features
- [ ] Vehicle listing works
- [ ] Booking creation works
- [ ] Email sending works (if configured)
- [ ] Payment flow works (if configured)

### Security
- [ ] No secrets in git history (`git log -p | grep "JWT_SECRET"` → should be empty)
- [ ] VNPay callback uses IP whitelist
- [ ] OTP not logged in INFO level
- [ ] CORS works for frontend

---

## 🆘 Still Having Issues?

### 1. Check Logs
```bash
cd src\Back_end
gradlew bootRun --debug > debug.log 2>&1
type debug.log | findstr "error"
```

### 2. Compare Your `.env` with `.env.example`
```bash
# Check if you missed any variables
fc .env .env.example
```

### 3. Reset Environment Variables
```bash
# PowerShell: Clear all env vars and reload
$env:JWT_SECRET = $null
# Restart terminal
# Restart backend
```

### 4. Contact Team
- Create issue on GitHub (DON'T paste secrets!)
- Ask in team chat
- Contact leader: @LEHAu1

---

## 🎓 What You Learned

After this migration, you now have:
- ✅ **Secure secret management** with environment variables
- ✅ **Better security** with VNPay IP whitelist
- ✅ **Flexible configuration** for dev/staging/production
- ✅ **No more hardcoded passwords** in code
- ✅ **Safer Git repository** (.env never committed)

---

## 📚 Next Steps

1. **Read full guides:**
   - `SECURITY-SETUP-GUIDE.md` for detailed setup
   - `BUG-FIXES-SUMMARY.md` for all bugs fixed

2. **Update your documentation:**
   - If you have custom docs, update with new .env requirements
   - Share migration guide with team

3. **Plan production deployment:**
   - Use cloud secrets manager (AWS Secrets Manager, Azure Key Vault)
   - Rotate JWT secret every 90 days
   - Use VNPay production credentials and IP whitelist

---

**Migration Support**: SE20A02 Group 02  
**Last Updated**: June 4, 2026  
**Questions?** Check `SECURITY-SETUP-GUIDE.md` Troubleshooting section
