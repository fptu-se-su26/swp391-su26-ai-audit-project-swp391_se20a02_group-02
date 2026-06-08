# SE AI Audit Project Template

## 1. Project Information

| Item | Description |
|---|---|
| Course |  SWP391|
| Class | SE20A02  |
| Semester | SU26 |
| Group | 2 |
| Topic | LuxeWay - Trusted E-commerce Platform for Vehicle Rental |
| Repository |swp391-su26-ai-audit-project-swp391_se20a02_group-02|

---

## 2. Team Members

| No | Student ID | Full Name | GitHub Username | Role | Main Responsibility |
|---:|---|---|---|---|---|
| 1 |  DE190968|  Lê Văn Hậu|  LEHAu1| Leader |  |
| 2 |DE190324  |Nguyễn Văn Dạng | Nguyendang2005 | Member |  |
| 3 | DE190928 | Hồ Thành Trung |  trungho20050-lang | Member |  |
| 4 |  DE190371| Trần Phú Thịnh |  hellolang123| Member |  |
| 5 |DE190264  | Nguyễn Bùi Quang Vinh | quangvinh7115 | Member |  |

---
  
## 3. Project Structure

```text
src/
docs/
.github/
README.md
```

---

## 4. Required AI Audit Documents

Each group must maintain the following documents:

```text
docs/AI_AUDIT_LOG.md
docs/PROMPTS.md
docs/REFLECTION.md
docs/CHANGELOG.md
```

---

## 5. Workflow

Students must follow this workflow:

```text
Issue → Branch → Commit → Pull Request → Review → Merge
```

Direct push to the `main` branch should be avoided.

---

## 6. Branch Naming Convention

```text
feature/studentid-task-name
bugfix/studentid-error-name
docs/studentid-update-audit-log
test/studentid-test-case-name
```

Example:

```text
feature/se123456-login-page
bugfix/se123456-login-validation
docs/se123456-update-ai-audit-log
```

---

## 7. Commit Message Convention

```text
[StudentID] type: short description
```

Examples:

```text
[SE123456] feat: add login page
[SE123456] fix: fix login validation
[SE123456] docs: update AI audit log
[SE123456] test: add login test cases
```

Common types:

```text
feat, fix, docs, test, refactor, style, chore
```

---

## 🔐 SECURITY UPDATE (June 4, 2026)

**⚠️ CRITICAL: Environment Variables Required**

This project now uses environment variables for security. Before starting:

1. **Copy environment template:**
   ```bash
   copy .env.example .env
   ```

2. **Generate JWT secret:**
   ```bash
   openssl rand -base64 32
   ```
   
3. **Edit `.env` with your credentials**

4. **Read security guides:**
   - Quick Start: `QUICK-SECURITY-FIX-REFERENCE.md`
   - Full Guide: `SECURITY-SETUP-GUIDE.md`
   - Bug Fixes: `BUG-FIXES-SUMMARY.md`

**Never commit `.env` file to Git!** (Already in `.gitignore`)

---

## 8. How to Run

### 🚀 Quick Start

#### Prerequisites
- ✅ Node.js 18+ & npm (for Frontend)
- ✅ Java 17+ (for Backend)
- ✅ SQL Server (Database)
- ⚠️ Maven or IDE (IntelliJ IDEA/Eclipse)

#### Step 1: Start Frontend
```bash
cd src/Front_end
npm install
npm run dev
```
**Frontend URL**: http://localhost:5173/

#### Step 2: Start Backend
**Option A - Using IDE (Recommended)**
1. Open IntelliJ IDEA or Eclipse
2. Import Maven project from `src/Back_end`
3. Run `LuxewayBackendApplication.java`

**Option B - Using Maven**
```bash
cd src/Back_end
mvn spring-boot:run
```
**Backend URL**: http://localhost:8080/api/v1

#### Step 3: Import Sample Data
Run `src/Back_end/import-data.sql` in SQL Server Management Studio

#### Step 4: Test Connection
Visit: http://localhost:5173/test-backend

### 📖 Detailed Documentation
See [START-PROJECT.md](START-PROJECT.md) for complete setup guide.

### 🔗 Important URLs
- **Frontend**: http://localhost:5173/
- **Backend Test Page**: http://localhost:5173/test-backend
- **Backend API**: http://localhost:8080/api/v1/test/health
- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html

### 🧪 Test Accounts
```
Admin:    admin@luxeway.vn / password
Customer: nguyen.van.a@gmail.com / password
Owner:    pham.minh.d@gmail.com / password
```

---

## 9. AI Usage Rule

Students are allowed to use AI tools such as ChatGPT, Gemini, Claude, GitHub Copilot, Cursor, Antigravity, or similar tools.

However, all important AI usage must be recorded in:

```text
docs/AI_AUDIT_LOG.md
docs/PROMPTS.md
docs/CHANGELOG.md
docs/REFLECTION.md
```

Students must be able to explain, verify, and defend all submitted work.
