# API PROVIDERS MANAGEMENT SYSTEM

## 📋 Tổng Quan

Hệ thống **API Providers** cho phép backend quản lý cấu hình các external API (KYC, Payment, SMS, Email, etc.) từ database thay vì hardcode trong code.

### ✅ Lợi Ích:
- ✔️ **Động**: Đổi API provider mà không cần redeploy
- ✔️ **Dễ quản lý**: Quản lý credentials từ Admin Panel
- ✔️ **Fallback**: Có nhiều provider cùng loại, tự động switch nếu primary fail
- ✔️ **Error Tracking**: Lưu lại error logs của từng provider
- ✔️ **Retry Logic**: Tự động retry với exponential backoff

---

## 📊 Database Schema

### Bảng: `api_providers`

```sql
CREATE TABLE api_providers (
    id                  NVARCHAR(36)    NOT NULL PRIMARY KEY,      -- Unique ID
    provider_name       NVARCHAR(100)   NOT NULL UNIQUE,            -- Tên unique (e.g., 'ViaSoft KYC')
    provider_type       NVARCHAR(50)    NOT NULL,                   -- Loại (KYC, PAYMENT, SMS, EMAIL, etc.)
    base_url            NVARCHAR(500)   NOT NULL,                   -- URL gốc của API
    api_key             NVARCHAR(500)   NOT NULL,                   -- API Key chính
    secret_key          NVARCHAR(500),                              -- Secret key (optional)
    username            NVARCHAR(500),                              -- Username (cho Basic Auth)
    password            NVARCHAR(500),                              -- Password (cho Basic Auth)
    additional_config   NVARCHAR(2000),                             -- Config thêm (JSON format)
    is_active           BIT             NOT NULL DEFAULT 1,         -- Có đang active không
    is_primary          BIT             NOT NULL DEFAULT 0,         -- Đây có phải provider chính không
    description         NVARCHAR(500),                              -- Mô tả
    webhook_url         NVARCHAR(500),                              -- Webhook URL cho callback
    retry_attempts      INT             NOT NULL DEFAULT 3,         -- Số lần retry
    timeout_seconds     INT             NOT NULL DEFAULT 30,        -- Timeout (giây)
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(), -- Ngày tạo
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(), -- Ngày update cuối
    last_error_message  NVARCHAR(500),                              -- Lỗi cuối cùng
    last_error_time     DATETIME2                                   -- Thời gian lỗi
);
```

---

## 🔌 Cách Sử Dụng

### 1️⃣ **Thêm Provider mới (Qua API)**

```bash
POST /api/v1/admin/providers
Content-Type: application/json

{
  "providerName": "ViaSoft KYC",
  "providerType": "KYC",
  "baseUrl": "https://api.viasoft.vn/kyc",
  "apiKey": "viasoft_api_key_here",
  "secretKey": "viasoft_secret_key_here",
  "isActive": true,
  "isPrimary": true,
  "description": "ViaSoft KYC service for identity verification",
  "retryAttempts": 3,
  "timeoutSeconds": 30
}
```

### 2️⃣ **Gọi API Provider từ Backend Code**

#### Option A: Gọi trực tiếp theo provider type

```java
@Service
public class KYCService {
    
    private final ApiClientService apiClientService;
    
    public void verifyKYC(String userId, String documentData) throws Exception {
        // Gọi primary KYC provider
        ResponseEntity<?> response = apiClientService.callKYCProvider(
            "/verify",
            HttpMethod.POST,
            new KYCVerificationRequest(userId, documentData)
        );
        
        if (response.getStatusCode() == HttpStatus.OK) {
            // Xử lý thành công
        }
    }
}
```

#### Option B: Gọi provider cụ thể

```java
public void processPayment(String paymentId, double amount) throws Exception {
    // Lấy Stripe provider từ DB
    Optional<ApiProvider> stripeProvider = apiProviderService.getProviderByName("Stripe");
    
    if (stripeProvider.isPresent()) {
        ResponseEntity<?> response = apiClientService.callProviderWithRetry(
            stripeProvider.get(),
            "/v1/charges",
            HttpMethod.POST,
            new PaymentRequest(amount)
        );
    }
}
```

#### Option C: Gọi theo loại provider

```java
// Gọi payment provider chính (fallback to secondary nếu fail)
ResponseEntity<?> payment = apiClientService.callPaymentProvider(
    "/charges",
    HttpMethod.POST,
    paymentData
);

// Gọi SMS provider
ResponseEntity<?> sms = apiClientService.callSmsProvider(
    "/send",
    HttpMethod.POST,
    smsData
);

// Gọi Email provider
ResponseEntity<?> email = apiClientService.callEmailProvider(
    "/send",
    HttpMethod.POST,
    emailData
);
```

---

## 📡 API Endpoints

### Quản lý Providers

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/admin/providers` | Lấy tất cả providers |
| GET | `/api/v1/admin/providers/active` | Lấy tất cả active providers |
| GET | `/api/v1/admin/providers/{id}` | Lấy provider theo ID |
| GET | `/api/v1/admin/providers/name/{name}` | Lấy provider theo tên |
| GET | `/api/v1/admin/providers/type/{type}` | Lấy providers theo loại |
| GET | `/api/v1/admin/providers/type/{type}/active` | Lấy active providers theo loại |
| GET | `/api/v1/admin/providers/type/{type}/primary` | Lấy primary provider của loại |
| GET | `/api/v1/admin/providers/{id}/health` | Kiểm tra sức khỏe provider |
| POST | `/api/v1/admin/providers` | Tạo provider mới |
| PUT | `/api/v1/admin/providers/{id}` | Cập nhật provider |
| DELETE | `/api/v1/admin/providers/{id}` | Xóa provider |

### Ví dụ Request/Response

```bash
# Lấy tất cả active providers
GET /api/v1/admin/providers/active

Response:
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "providerName": "ViaSoft KYC",
    "providerType": "KYC",
    "baseUrl": "https://api.viasoft.vn/kyc",
    "apiKey": "***hidden***",
    "isActive": true,
    "isPrimary": true,
    "description": "ViaSoft KYC service",
    "retryAttempts": 3,
    "timeoutSeconds": 30,
    "createdAt": "2024-05-23T10:00:00",
    "updatedAt": "2024-05-23T10:00:00",
    "lastErrorMessage": null,
    "lastErrorTime": null
  }
]
```

---

## 🔄 Fallback & Error Handling

### Multiple Providers của cùng loại

```java
// Nếu có nhiều KYC provider (primary + backup)
// Hệ thống sẽ:
// 1. Thử gọi primary provider
// 2. Nếu fail → tự động record error + switch to next active provider
// 3. Nếu hết → throw exception

public void setupMultipleKYCProviders() {
    // Thêm primary
    createProvider("ViaSoft KYC", "KYC", true);
    
    // Thêm backup (cùng loại, khác provider)
    createProvider("Face++ KYC", "KYC", false);
    
    // Backend sẽ tự động retry với Face++ nếu ViaSoft fail
}
```

### Error Tracking

```java
// Khi provider gặp lỗi
apiProviderService.recordProviderError(providerId, "Connection timeout");
// System sẽ lưu: last_error_message, last_error_time

// Khi provider hoạt động bình thường lại
apiProviderService.clearProviderError(providerId);
// System sẽ xóa error logs
```

---

## 📝 Sample Providers Đã Có Sẵn

### KYC Providers
1. **ViaSoft KYC** (Primary) - https://api.viasoft.vn/kyc
2. **Face++ KYC** (Backup) - https://api.megvii.com/faceid/v3

### Payment Providers
1. **Stripe** (Primary) - https://api.stripe.com
2. **PayPal** (Backup) - https://api.sandbox.paypal.com

### Communication Providers
1. **SendGrid** (Email) - https://api.sendgrid.com
2. **Twilio** (SMS) - https://api.twilio.com

---

## 🔐 Security Best Practices

1. **Credentials Encryption**: 
   - Lưu API keys encrypted trong DB
   - Không log credentials trong error messages

2. **Access Control**:
   - Chỉ ADMIN có thể view/edit providers
   - Endpoints `/api/v1/admin/providers/*` phải require admin role

3. **Audit Trail**:
   - Track tất cả changes đến provider config
   - Log từng lần gọi API (thành công/fail)

4. **Rotation**:
   - Định kỳ rotate API keys
   - Dễ dàng update credentials mà không downtime

---

## 📊 Monitoring & Health Checks

```bash
# Check health của provider
GET /api/v1/admin/providers/{id}/health

Response:
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "providerName": "ViaSoft KYC",
  "isActive": true,
  "lastErrorMessage": null,
  "lastErrorTime": null  // Null = healthy
}
```

---

## 🛠️ Development Guide

### Tạo Service mới sử dụng Provider

```java
@Service
@RequiredArgsConstructor
public class MyCustomService {
    
    private final ApiClientService apiClientService;
    private final ApiProviderService apiProviderService;
    
    public void doSomething() throws Exception {
        // Cách 1: Gọi theo type (tự động dùng primary provider)
        ResponseEntity<?> response = apiClientService.callPaymentProvider(
            "/charge",
            HttpMethod.POST,
            request
        );
        
        // Cách 2: Lấy provider cụ thể + gọi với retry
        Optional<ApiProvider> provider = apiProviderService.getProviderByName("Stripe");
        if (provider.isPresent()) {
            ResponseEntity<?> result = apiClientService.callProviderWithRetry(
                provider.get(),
                "/charges",
                HttpMethod.POST,
                request
            );
        }
    }
}
```

---

## 📚 Related Files

- Entity: `src/main/java/com/luxeway/entity/ApiProvider.java`
- Repository: `src/main/java/com/luxeway/repository/ApiProviderRepository.java`
- Service: `src/main/java/com/luxeway/service/ApiProviderService.java`
- Client: `src/main/java/com/luxeway/service/ApiClientService.java`
- Controller: `src/main/java/com/luxeway/controller/ApiProviderController.java`
- Config: `src/main/java/com/luxeway/config/RestTemplateConfig.java`
- Schema: `src/main/resources/schema.sql` (table `api_providers`)
- DTO: `src/main/java/com/luxeway/dto/ApiProviderDTO.java`

---

## ✨ Next Steps

1. **Setup Admin UI**: Tạo screen quản lý providers trong admin panel
2. **Webhook Integration**: Handle callbacks từ external providers
3. **Rate Limiting**: Implement rate limit per provider
4. **Caching**: Cache provider config để giảm DB queries
5. **Analytics**: Track API calls statistics

---

**Tạo bởi:** AI Assistant  
**Ngày:** May 28, 2024  
**Version:** 1.0
