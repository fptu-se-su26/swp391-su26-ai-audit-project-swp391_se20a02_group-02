# 🤖 LuxeWay AI Chatbot Service

Hệ thống Chatbot AI hỗ trợ tư vấn thuê xe thông minh cho nền tảng LuxeWay. Chatbot sử dụng công nghệ **RAG (Retrieval-Augmented Generation)** kết hợp giữa cơ sở dữ liệu Vector **FAISS**, thư viện **LangChain** và mô hình ngôn ngữ lớn **Gemini (LLM)** để đọc hiểu thông tin thực tế của các dòng xe được đồng bộ trực tiếp từ SQL Server.

---

## 📋 Yêu cầu Hệ thống

Để hệ thống hoạt động ổn định và tương thích tốt nhất với tất cả các thư viện xử lý khoa học dữ liệu (như `faiss-cpu`, `pymssql`, `numpy`):
* **Phiên bản khuyến nghị**: **Python 3.11** (Tránh sử dụng các phiên bản quá mới như 3.13 hoặc 3.14 để hạn chế lỗi không tương thích thư viện).

---

## ⚙️ Hướng dẫn Cài đặt & Khởi động nhanh

### **Bước 1: Tạo môi trường ảo và kích hoạt (Khuyên dùng)**
Tạo môi trường ảo giúp cô lập các thư viện của chatbot mà không ảnh hưởng đến các ứng dụng Python khác trên máy:

1. Di chuyển vào thư mục `chatbot`:
   ```powershell
   cd C:\Users\LAPTOP\Downloads\SWP\swp391-su26-ai-audit-project-swp391_se20a02_group-02\src\chatbot
   ```
2. Tạo môi trường ảo sử dụng Python 3.11:
   ```powershell
   py -3.11 -m venv venv
   ```
3. Kích hoạt môi trường ảo:
   * **Trên Windows PowerShell / CMD**:
     ```powershell
     .\venv\Scripts\activate
     ```
     *(Khi kích hoạt thành công, bạn sẽ thấy tiền tố `(venv)` xuất hiện ở đầu dòng lệnh).*

---

### **Bước 2: Cài đặt các thư viện từ `requirements.txt`**
Với môi trường ảo đã kích hoạt, hãy cài đặt toàn bộ các thư viện cần thiết:
```powershell
pip install -r requirements.txt
```

---

### **Bước 3: Cấu hình biến môi trường (`.env`)**
Tạo hoặc chỉnh sửa file `.env` nằm trong thư mục `chatbot` với nội dung như sau:
```env
# Cấu hình Google Gemini API Key
GEMINI_API_KEY=MÃ_API_KEY_GEMINI_CỦA_BẠN

# Cấu hình kết nối SQL Server (Dùng để nạp dữ liệu xe thực tế)
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=MẬT_KHẨU_SQL_SERVER
DB_NAME=car_rental_platform

# Cấu hình Port chạy Flask Chatbot Service
FLASK_PORT=5000
FLASK_ENV=development
```

---

### **Bước 4: Chạy Dịch vụ Chatbot**
Chạy câu lệnh sau để khởi động máy chủ Flask API:
```powershell
python app.py
```
Máy chủ sẽ khởi chạy thành công tại địa chỉ: **`http://localhost:5000`**.

---

## 🔌 Chi tiết các Endpoint API hỗ trợ

| Phương thức | Endpoint | Mô tả | Định dạng dữ liệu |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Kiểm tra trạng thái hoạt động của Chatbot & kết nối Vector DB. | Trả về JSON trạng thái. |
| **POST** | `/api/bootstrap` | Nạp mới/Đồng bộ hóa dữ liệu xe từ SQL Server vào Vector DB (FAISS). | Trả về thông báo thành công. |
| **POST** | `/api/chat` | Endpoint chính để trò chuyện với AI. Nhận vào câu hỏi và lịch sử chat. | Nhận JSON body: `{ "message": "...", "history": [...] }` |

---

## 💡 Cấu trúc Thư mục chính

* `app.py`: Điểm khởi chạy Flask server, tiếp nhận và định tuyến các luồng API từ Frontend.
* `rag_engine.py`: Lõi xử lý RAG (kết nối SQL Server, xử lý nhúng/embeddings, lưu trữ Vector DB FAISS và truy vấn Gemini LLM).
* `actions.py`: Quản lý các hành vi chatbot theo nguyên lý Open-Closed Principle (OCP).
* `requirements.txt`: Danh sách các thư viện cần thiết.
* `faiss_index/`: Thư mục lưu trữ cơ sở dữ liệu vector dạng local để nạp nhanh cho các lần chạy sau.
