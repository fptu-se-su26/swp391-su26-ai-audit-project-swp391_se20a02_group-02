$file = "d:\GitHub\swp391-su26-ai-audit-project-swp391_se20a02_group-02\members\Lê Văn Hậu\AI_AUDIT_LOG.md"
$content = Get-Content $file -Raw

# Remove the duplicate "Cam kết học thuật" in the middle (the first one)
$content = $content -replace "(?s)## 10\. Cam kết học thuật.*?2026-\d{2}-\d{2} \|(\r?\n|\r)---(\r?\n|\r)## Lần sử dụng", "## Lần sử dụng"

# Rename "## Lần sử dụng AI #X" to "## Log" to make them consistent
$content = $content -replace "## Lần sử dụng AI #8 — Phase 3A: Security Hardening", "## Log #14`n`n- **Purpose:** Security Hardening"
$content = $content -replace "## Lần sử dụng AI #9 — Phase 3B: OTP Forgot Password", "## Log #15`n`n- **Purpose:** OTP Forgot Password"
$content = $content -replace "## Lần sử dụng AI #10 — Phase 3B: Chat Persistence, PaymentMethod, Employee", "## Log #16`n`n- **Purpose:** Chat Persistence, PaymentMethod, Employee"
$content = $content -replace "## Lần sử dụng AI #11 — Phase 3 Build Optimisation", "## Log #17`n`n- **Purpose:** Build Optimisation"
$content = $content -replace "## Lần sử dụng AI #12 — Phase 4: E2E Verification & Database Startup Fix", "## Log #18`n`n- **Purpose:** E2E Verification & DB Startup"

# The old Log #13, 14, 15 at the bottom need to become 19, 20, 21
$content = $content -replace "(?m)^## Log #13$", "## Log #19"
$content = $content -replace "(?m)^## Log #14$", "## Log #20"
$content = $content -replace "(?m)^## Log #15$", "## Log #21"

# Add Log 22, 23, 24 before "## 10. Cam kết học thuật"
$newLogs = @"
## Log #22

- **Date:** DATE_PLACEHOLDER
- **Author:** Lê Văn Hậu (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Thiết kế kiến trúc Predictive Analytics (ML Sidecar)
- **Prompt Reference:** PROMPTS.md#prompt-22
- **AI Output Summary:** Gợi ý sử dụng kiến trúc FastAPI làm ML Sidecar, độc lập với Spring Boot backend, sử dụng REST API để giao tiếp.
- **Human Decision:** Đồng ý với kiến trúc này để tách biệt logic Machine Learning (Python) và Business Logic (Java).
- **Applied To:** `src/ML_Sidecar/`
- **Verification:** Chạy thành công FastAPI server và Swagger UI ở port 8000.

---

## Log #23

- **Date:** DATE_PLACEHOLDER
- **Author:** Lê Văn Hậu (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Xây dựng mô hình Anomaly Detection cho Predictive Analytics
- **Prompt Reference:** PROMPTS.md#prompt-23
- **AI Output Summary:** Sinh code Python sử dụng Isolation Forest để phát hiện các giao dịch thuê xe bất thường dựa trên giá, thời gian và user behavior.
- **Human Decision:** Tích hợp mô hình vào FastAPI route `/predict/anomaly`. Cấu hình threshold phù hợp để tránh false positives.
- **Applied To:** `src/ML_Sidecar/models/anomaly_detector.py`
- **Verification:** Test với dữ liệu mock, API trả về `is_anomaly: true` chính xác cho các giao dịch đáng ngờ.

---

## Log #24

- **Date:** DATE_PLACEHOLDER
- **Author:** Lê Văn Hậu (DE190968)
- **AI Tool:** Antigravity
- **Purpose:** Tích hợp Spring Boot Backend với FastAPI ML Sidecar
- **Prompt Reference:** PROMPTS.md#prompt-24
- **AI Output Summary:** Gợi ý tạo `MLSidecarClient` bằng RestTemplate/WebClient trong Spring Boot để gọi sang FastAPI.
- **Human Decision:** Tích hợp vào quy trình duyệt giao dịch. Tự động flag các giao dịch nếu ML Sidecar trả về `is_anomaly`.
- **Applied To:** `src/Back_end/src/main/java/com/luxeway/service/ai/MLSidecarClient.java`
- **Verification:** E2E test: tạo giao dịch bất thường từ Frontend -> Spring Boot -> ML Sidecar -> Trả kết quả cảnh báo cho Admin.

---

## 10. Cam kết học thuật
"@

$content = $content -replace "(?s)## 10\. Cam kết học thuật(?!.*## 10\. Cam kết học thuật).*", $newLogs

[System.IO.File]::WriteAllText($file, $content)
