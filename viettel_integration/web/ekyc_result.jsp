<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Kết Quả Xác Thực eKYC - LuxeWay</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --text-color: #f8fafc;
            --primary-color: #3b82f6;
            --accent-color: #10b981;
            --error-color: #ef4444;
            --border-color: rgba(255, 255, 255, 0.1);
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 800px;
            background: var(--card-bg);
            backdrop-filter: blur(16px);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        h1 {
            text-align: center;
            font-size: 2.2rem;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #60a5fa, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .form-section, .result-section {
            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
        }

        label {
            font-weight: 600;
            margin-bottom: 8px;
            color: #94a3b8;
        }

        input[type="file"] {
            background: rgba(15, 23, 42, 0.6);
            border: 1px dashed var(--primary-color);
            padding: 15px;
            border-radius: 10px;
            color: #cbd5e1;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        input[type="file"]:hover {
            border-color: var(--accent-color);
            background: rgba(15, 23, 42, 0.8);
        }

        button {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border: none;
            padding: 14px 28px;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }

        .status-card {
            border-left: 5px solid var(--primary-color);
            background: rgba(15, 23, 42, 0.5);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
        }

        .status-card.error {
            border-left-color: var(--error-color);
            background: rgba(239, 68, 68, 0.1);
        }

        .status-card.success {
            border-left-color: var(--accent-color);
            background: rgba(16, 185, 129, 0.1);
        }

        .result-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .data-box {
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid var(--border-color);
            padding: 20px;
            border-radius: 12px;
        }

        .data-box h3 {
            margin-top: 0;
            color: #60a5fa;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
        }

        .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .data-label {
            color: #94a3b8;
        }

        .data-value {
            font-weight: 600;
        }

        .score-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
        }

        .score-match {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
        }

        .score-mismatch {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
        }

        .json-box {
            background: #020617;
            border: 1px solid var(--border-color);
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.85rem;
            max-height: 200px;
            overflow-y: auto;
            white-space: pre-wrap;
            color: #a7f3d0;
        }

        .raw-section h4 {
            color: #94a3b8;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>LuxeWay eKYC Verification Center</h1>

    <!-- 1. Hiển thị thông báo lỗi hoặc thành công nếu có kết quả trả về -->
    <% 
        String errorMessage = (String) request.getAttribute("errorMessage");
        String ocrName = (String) request.getAttribute("ocrName");
        String ocrIdNumber = (String) request.getAttribute("ocrIdNumber");
        String matchScoreStr = (String) request.getAttribute("matchScore");
        String ocrRawJson = (String) request.getAttribute("ocrRawJson");
        String faceMatchRawJson = (String) request.getAttribute("faceMatchRawJson");

        if (errorMessage != null) { 
    %>
        <div class="status-card error">
            <h3>Lỗi Tiến Trình eKYC</h3>
            <p><%= errorMessage %></p>
        </div>
    <% } %>

    <% if (ocrIdNumber != null && errorMessage == null) { %>
        <div class="status-card success">
            <h3>Xác Thực Hoàn Tất</h3>
            <p>Thông tin đã được so khớp với cơ sở dữ liệu Viettel AI API.</p>
        </div>

        <div class="result-section">
            <div class="result-grid">
                <!-- Thông tin OCR -->
                <div class="data-box">
                    <h3>Kết quả Trích Xuất Giấy Tờ (OCR)</h3>
                    <div class="data-row">
                        <span class="data-label">Họ và Tên:</span>
                        <span class="data-value"><%= ocrName %></span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Số CCCD/CMND:</span>
                        <span class="data-value"><%= ocrIdNumber %></span>
                    </div>
                </div>

                <!-- Thông tin Face Match -->
                <div class="data-box">
                    <h3>Kết quả So Khớp Khuôn Mặt</h3>
                    <div class="data-row">
                        <span class="data-label">Điểm Tương Đồng:</span>
                        <span class="data-value"><%= matchScoreStr %>%</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Trạng thái:</span>
                        <span class="data-value">
                            <% 
                                double score = 0;
                                try {
                                    score = Double.parseDouble(matchScoreStr);
                                } catch (Exception e) {}
                                if (score >= 70.0) { 
                            %>
                                <span class="score-badge score-match">KHỚP (Hợp Lệ)</span>
                            <% } else { %>
                                <span class="score-badge score-mismatch">KHÔNG KHỚP</span>
                            <% } %>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Phản hồi Raw JSON từ API -->
            <div class="raw-section">
                <h4>Phản hồi Raw JSON từ OCR API:</h4>
                <div class="json-box"><%= ocrRawJson != null ? ocrRawJson : "{}" %></div>
                
                <h4 style="margin-top: 20px;">Phản hồi Raw JSON từ Face Match API:</h4>
                <div class="json-box"><%= faceMatchRawJson != null ? faceMatchRawJson : "{}" %></div>
            </div>
        </div>
        <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 30px 0;">
    <% } %>

    <!-- 2. Form Upload ảnh phục vụ kiểm thử -->
    <div class="form-section">
        <h3 style="color: #60a5fa; margin-bottom: 20px;">Tải Lên Ảnh Xác Thực eKYC</h3>
        <form action="${pageContext.request.contextPath}/EkycController" method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label for="cccd_image">Ảnh mặt trước CCCD / CMND:</label>
                <input type="file" id="cccd_image" name="cccd_image" accept="image/*" required>
            </div>
            
            <div class="form-group" style="margin-top: 20px; margin-bottom: 30px;">
                <label for="selfie_image">Ảnh chân dung chụp thực tế (Selfie):</label>
                <input type="file" id="selfie_image" name="selfie_image" accept="image/*" required>
            </div>

            <button type="submit">Bắt Đầu Xác Minh eKYC</button>
        </form>
    </div>
</div>

</body>
</html>
