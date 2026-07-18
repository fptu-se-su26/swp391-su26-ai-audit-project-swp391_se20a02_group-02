# 🚀 Hướng Dẫn Deploy LuxeWay Bằng Docker Lên VPS

Tài liệu này hướng dẫn cách đưa toàn bộ hệ thống LuxeWay lên mạng Internet thực tế thông qua một máy chủ ảo (VPS) chạy hệ điều hành Ubuntu/Linux.

> [!IMPORTANT]
> **Yêu cầu hệ thống VPS tối thiểu:**
> - CPU: 2 Cores
> - RAM: 4GB (Khuyến nghị 8GB vì SQL Server & AI Container ăn khá nhiều RAM)
> - OS: Ubuntu 22.04 LTS hoặc mới hơn.

---

## Bước 1: Chuẩn bị trên máy chủ (VPS)

SSH vào máy chủ của bạn và chạy các lệnh sau để cài đặt Docker và Git:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo apt-get install docker-compose-plugin -y

# Cài đặt Git
sudo apt install git -y
```

## Bước 2: Tải mã nguồn về VPS

Trên VPS, bạn clone project này về (có thể dùng Github hoặc copy trực tiếp).

```bash
git clone <đường-dẫn-repo-github-của-bạn>
cd swp391-su26-ai-audit-project-swp391_se20a02_group-02
```

> [!TIP]
> Nếu bạn không dùng Github, có thể nén toàn bộ thư mục thành file `.zip`, tải lên VPS, rồi giải nén ra.

## Bước 3: Cấu hình biến môi trường (Environment Variables)

Hệ thống Docker Compose đọc các thông số từ file `.env`. Bạn cần tạo file này trên Server:

```bash
cp .env.example .env
nano .env
```

Trong file `.env`, hãy sửa lại các thông số sau cho đúng với mạng thực tế:
- `VITE_AUTH_API_URL=https://<tên-miền-của-bạn.com>`
- `FRONTEND_URL=https://<tên-miền-của-bạn.com>`
- Đảm bảo Google Client ID và Firebase Key được điền đúng.
*(Lưu rồi thoát nano bằng `Ctrl+O`, `Enter`, `Ctrl+X`)*

## Bước 4: Khởi chạy toàn bộ hệ thống

Đứng tại thư mục chứa file `docker-compose.yml`, chạy lệnh sau:

```bash
sudo docker compose up -d --build
```

Lệnh này sẽ tự động:
1. Kéo (Pull) image SQL Server, Redis, Grafana.
2. Build (đóng gói) Backend Java thành Docker Container.
3. Build (đóng gói) Frontend Vite thành Nginx Container.
4. Chạy toàn bộ chúng ngầm trong nền (`-d`).

> [!NOTE]
> Lần chạy đầu tiên có thể mất từ 5 - 10 phút tùy vào tốc độ mạng của VPS để tải và cài đặt các thư viện (npm, maven, python).

## Bước 5: Cấu hình Tên miền và HTTPS (Nginx Proxy Manager / Cloudflare)

Frontend của bạn đang chạy ở cổng `5173` theo cấu hình docker-compose (`localhost:5173`).
Để có đường link `https://luxeway.vn` xịn xò, bạn có thể:
1. Trỏ Domain về IP của VPS trên Cloudflare.
2. Dùng Cloudflare Tunnel (cách dễ nhất để có HTTPS mà không cần mở Port).
3. Hoặc cài Nginx Proxy Manager ngay trên VPS để map Port `5173` ra cổng `80/443`.

---

## 🛠️ Các lệnh quản trị cần biết

**Xem danh sách các Container đang chạy:**
```bash
sudo docker ps
```

**Xem log (lỗi) của Backend:**
```bash
sudo docker logs luxeway-backend -f
```

**Xem log (lỗi) của Frontend (Nginx):**
```bash
sudo docker logs luxeway-frontend -f
```

**Tắt toàn bộ hệ thống:**
```bash
sudo docker compose down
```
