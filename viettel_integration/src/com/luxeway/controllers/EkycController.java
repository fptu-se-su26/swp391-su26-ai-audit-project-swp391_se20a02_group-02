package com.luxeway.controllers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.luxeway.utils.ViettelAIApiUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Controller xử lý luồng xác thực eKYC khách hàng thuê xe.
 * Sử dụng kiến trúc Servlet (MVC Model 2), kế thừa HttpServlet từ không gian mạng javax.
 * 
 * Cấu hình MultipartConfig để nhận file upload từ form gửi lên.
 * 
 * @author Senior Java Web Developer
 */
@WebServlet("/EkycController")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2, // 2MB
    maxFileSize = 1024 * 1024 * 10,      // 10MB cho mỗi file ảnh
    maxRequestSize = 1024 * 1024 * 20    // 20MB cho toàn bộ request
)
public class EkycController extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /**
     * Nhận yêu cầu POST chứa ảnh giấy tờ và ảnh selfie từ form xác minh.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Thiết lập mã hóa ký tự UTF-8 cho request/response phòng ngừa lỗi font tiếng Việt
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        System.out.println("[INFO] EkycController bắt đầu tiếp nhận request xử lý...");

        File cccdFile = null;
        File selfieFile = null;

        String ocrName = "Không xác định";
        String ocrIdNumber = "Không xác định";
        String matchScore = "0.0";
        
        String ocrRawJson = "";
        String faceMatchRawJson = "";
        String errorMessage = null;

        try {
            // 1. Lấy dữ liệu file từ request
            Part cccdPart = request.getPart("cccd_image");
            Part selfiePart = request.getPart("selfie_image");

            if (cccdPart == null || cccdPart.getSize() == 0 || selfiePart == null || selfiePart.getSize() == 0) {
                throw new IllegalArgumentException("Vui lòng tải lên đầy đủ cả ảnh CCCD và ảnh Selfie chân dung!");
            }

            // 2. Lưu file tạm thời lên ổ đĩa của server để gọi API
            cccdFile = savePartToTempFile(cccdPart, "cccd");
            selfieFile = savePartToTempFile(selfiePart, "selfie");

            System.out.println("[INFO] Đã lưu file tạm tại: " + cccdFile.getAbsolutePath() + " và " + selfieFile.getAbsolutePath());

            // 3. Gọi dịch vụ Viettel AI thông qua Utility Class
            ocrRawJson = ViettelAIApiUtil.callViettelOCR(cccdFile);
            faceMatchRawJson = ViettelAIApiUtil.callViettelFaceMatch(cccdFile, selfieFile);

            // 4. Trích xuất thông tin OCR sử dụng thư viện Gson
            try {
                JsonObject ocrObj = JsonParser.parseString(ocrRawJson).getAsJsonObject();
                
                // Viettel AI OCR thường trả về danh sách kết quả trong trường 'data'
                if (ocrObj.has("data") && ocrObj.get("data").isJsonArray()) {
                    JsonArray dataArray = ocrObj.getAsJsonArray("data");
                    if (dataArray.size() > 0) {
                        JsonObject firstResult = dataArray.get(0).getAsJsonObject();
                        
                        // Trích xuất Số CCCD/CMND
                        if (firstResult.has("id")) {
                            ocrIdNumber = firstResult.get("id").getAsString();
                        } else if (firstResult.has("id_number")) {
                            ocrIdNumber = firstResult.get("id_number").getAsString();
                        }
                        
                        // Trích xuất Họ và tên
                        if (firstResult.has("name")) {
                            ocrName = firstResult.get("name").getAsString();
                        }
                    }
                } else if (ocrObj.has("data") && ocrObj.get("data").isJsonObject()) {
                    // Fallback trong trường hợp 'data' trả về là một đối tượng chứ không phải mảng
                    JsonObject dataObj = ocrObj.getAsJsonObject("data");
                    if (dataObj.has("id")) {
                        ocrIdNumber = dataObj.get("id").getAsString();
                    }
                    if (dataObj.has("name")) {
                        ocrName = dataObj.get("name").getAsString();
                    }
                }
            } catch (Exception ex) {
                System.err.println("[WARN] Không thể trích xuất chi tiết các trường từ OCR JSON. Cấu trúc JSON có thể đã thay đổi.");
                ex.printStackTrace();
            }

            // 5. Trích xuất kết quả Face Match sử dụng thư viện Gson
            try {
                JsonObject fmObj = JsonParser.parseString(faceMatchRawJson).getAsJsonObject();
                
                // Viettel eKYC Face Match thường trả về score ở trường 'similarity' hoặc 'match_score' trong 'data'
                if (fmObj.has("data") && fmObj.get("data").isJsonObject()) {
                    JsonObject dataObj = fmObj.getAsJsonObject("data");
                    if (dataObj.has("similarity")) {
                        matchScore = dataObj.get("similarity").getAsString();
                    } else if (dataObj.has("match_score")) {
                        matchScore = dataObj.get("match_score").getAsString();
                    }
                } else {
                    if (fmObj.has("similarity")) {
                        matchScore = fmObj.get("similarity").getAsString();
                    } else if (fmObj.has("match_score")) {
                        matchScore = fmObj.get("match_score").getAsString();
                    }
                }
            } catch (Exception ex) {
                System.err.println("[WARN] Không thể trích xuất điểm match_score từ Face Match JSON.");
                ex.printStackTrace();
            }

        } catch (IllegalArgumentException e) {
            errorMessage = e.getMessage();
            System.err.println("[WARN] Tham số đầu vào không hợp lệ: " + errorMessage);
        } catch (Exception e) {
            errorMessage = "Đã xảy ra lỗi hệ thống trong quá trình xác thực eKYC: " + e.getMessage();
            System.err.println("[ERROR] Lỗi xử lý eKYC servlet: ");
            e.printStackTrace();
        } finally {
            // 6. Xóa các file tạm thời để tránh tràn dung lượng bộ nhớ ổ cứng của server
            if (cccdFile != null && cccdFile.exists()) {
                boolean deleted = cccdFile.delete();
                System.out.println("[INFO] Xóa file tạm CCCD: " + (deleted ? "Thành công" : "Thất bại"));
            }
            if (selfieFile != null && selfieFile.exists()) {
                boolean deleted = selfieFile.delete();
                System.out.println("[INFO] Xóa file tạm Selfie: " + (deleted ? "Thành công" : "Thất bại"));
            }
        }

        // 7. Đẩy các giá trị kết quả hoặc thông báo lỗi vào request attributes
        request.setAttribute("ocrName", ocrName);
        request.setAttribute("ocrIdNumber", ocrIdNumber);
        request.setAttribute("matchScore", matchScore);
        request.setAttribute("ocrRawJson", ocrRawJson);
        request.setAttribute("faceMatchRawJson", faceMatchRawJson);
        request.setAttribute("errorMessage", errorMessage);

        // 8. Chuyển tiếp luồng (forward) sang trang giao diện JSP hiển thị kết quả
        System.out.println("[INFO] Hoàn tất xử lý, chuyển tiếp sang trang ekyc_result.jsp");
        request.getRequestDispatcher("/ekyc_result.jsp").forward(request, response);
    }

    /**
     * Hàm phụ trợ chuyển đổi Part (Multipart file) thành File tạm thời vật lý trên server.
     * Tương thích hoàn toàn với các phiên bản Servlet 3.0+.
     */
    private File savePartToTempFile(Part part, String prefix) throws IOException {
        String originalFileName = getSubmittedFileName(part);
        String suffix = ".jpg";
        
        if (originalFileName != null && originalFileName.contains(".")) {
            suffix = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        // Tạo file tạm ở thư mục Temp của hệ điều hành
        File tempFile = File.createTempFile(prefix + "_", suffix);
        tempFile.deleteOnExit(); // Tự động xóa khi tắt Server nếu chưa được xóa thủ công

        try (InputStream input = part.getInputStream();
             FileOutputStream output = new FileOutputStream(tempFile)) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = input.read(buffer)) != -1) {
                output.write(buffer, 0, bytesRead);
            }
        }
        return tempFile;
    }

    /**
     * Lấy tên file gốc do Client tải lên từ Header Content-Disposition.
     * Cần thiết vì Servlet 3.0 không có hàm part.getSubmittedFileName() như Servlet 3.1.
     */
    private String getSubmittedFileName(Part part) {
        String header = part.getHeader("content-disposition");
        if (header != null) {
            for (String content : header.split(";")) {
                if (content.trim().startsWith("filename")) {
                    return content.substring(content.indexOf('=') + 1)
                            .trim()
                            .replace("\"", "");
                }
            }
        }
        return null;
    }
}
