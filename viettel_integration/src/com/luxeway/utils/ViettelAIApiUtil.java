package com.luxeway.utils;

import okhttp3.*;
import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Lớp tiện ích cung cấp các phương thức để gọi API của Viettel AI (OCR và Face Match).
 * Sử dụng thư viện OkHttp3 làm HTTP Client.
 * 
 * @author Senior Java Web Developer
 */
public class ViettelAIApiUtil {

    // Token xác thực API của Viettel AI do khách hàng cung cấp
    private static final String API_TOKEN = "f92f8d0c242dff748f8582d471d0aec3";

    // Endpoint URL cho dịch vụ Viettel OCR (Trích xuất thông tin giấy tờ)
    private static final String OCR_ENDPOINT = "https://api-gateway.viettelai.vn/ocr/v1/id-card";

    // Endpoint URL cho dịch vụ Viettel eKYC Face Match (So khớp khuôn mặt)
    private static final String FACE_MATCH_ENDPOINT = "https://api-gateway.viettelai.vn/ekyc/v1/face-compare";

    // Khởi tạo OkHttpClient với cấu hình Timeout tối ưu cho xử lý ảnh AI
    private static final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();

    /**
     * Gửi ảnh giấy tờ CCCD/CMND lên Viettel OCR API và nhận chuỗi phản hồi JSON.
     * 
     * @param imageFile File ảnh chụp giấy tờ
     * @return Chuỗi JSON trả về từ hệ thống Viettel AI
     * @throws IOException Xảy ra lỗi kết nối mạng hoặc lỗi đọc/ghi dữ liệu
     */
    public static String callViettelOCR(File imageFile) throws IOException {
        if (imageFile == null || !imageFile.exists()) {
            throw new IllegalArgumentException("File ảnh không tồn tại hoặc rỗng!");
        }

        System.out.println("[INFO] Bắt đầu gọi Viettel OCR API cho file: " + imageFile.getName());

        // Định dạng kiểu MediaType của file ảnh (tự động nhận dạng qua phần mở rộng hoặc mặc định là image/jpeg)
        MediaType mediaType = MediaType.parse("image/jpeg");
        
        // Tạo RequestBody dạng Multipart
        RequestBody fileBody = RequestBody.create(mediaType, imageFile);
        RequestBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                // Trường 'image' thường là khóa mặc định nhận file của API Viettel OCR
                .addFormDataPart("image", imageFile.getName(), fileBody)
                .build();

        // Xây dựng HTTP Request với Header Token xác thực
        Request request = new Request.Builder()
                .url(OCR_ENDPOINT)
                .post(requestBody)
                .addHeader("Token", API_TOKEN) // Token dùng để xác thực theo yêu cầu hệ thống Viettel AI
                .addHeader("accept", "application/json")
                .build();

        // Thực thi request
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Không có dữ liệu phản hồi lỗi";
                System.err.println("[ERROR] API Viettel OCR trả về mã lỗi HTTP: " + response.code() + " - Chi tiết: " + errorBody);
                throw new IOException("API OCR lỗi với mã HTTP: " + response.code() + ". Chi tiết: " + errorBody);
            }

            if (response.body() == null) {
                System.err.println("[ERROR] API Viettel OCR trả về phản hồi rỗng (body is null)");
                throw new IOException("Phản hồi từ API OCR rỗng!");
            }

            String responseString = response.body().string();
            System.out.println("[INFO] Gọi API Viettel OCR thành công!");
            return responseString;
        } catch (IOException e) {
            System.err.println("[EX] Lỗi kết nối hoặc xử lý dữ liệu với API Viettel OCR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Gửi ảnh CCCD và ảnh Selfie lên Viettel eKYC Face Match API để so khớp độ trùng khớp khuôn mặt.
     * 
     * @param idImage File ảnh chân dung trích xuất từ giấy tờ (hoặc ảnh chụp mặt trước CCCD)
     * @param selfieImage File ảnh chụp chân dung thực tế (selfie) của khách hàng
     * @return Chuỗi JSON kết quả so khớp khuôn mặt
     * @throws IOException Xảy ra lỗi kết nối mạng hoặc lỗi đọc/ghi dữ liệu
     */
    public static String callViettelFaceMatch(File idImage, File selfieImage) throws IOException {
        if (idImage == null || !idImage.exists() || selfieImage == null || !selfieImage.exists()) {
            throw new IllegalArgumentException("Một hoặc cả hai file ảnh xác thực không tồn tại!");
        }

        System.out.println("[INFO] Bắt đầu gọi Viettel Face Match API so khớp: " 
                + idImage.getName() + " và " + selfieImage.getName());

        MediaType mediaType = MediaType.parse("image/jpeg");

        // Tạo RequestBody dạng Multipart chứa cả 2 file ảnh
        RequestBody idFileBody = RequestBody.create(mediaType, idImage);
        RequestBody selfieFileBody = RequestBody.create(mediaType, selfieImage);

        RequestBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                // Các key 'image1' (ảnh gốc/ảnh CCCD) và 'image2' (ảnh chụp chân dung thực tế)
                .addFormDataPart("image1", idImage.getName(), idFileBody)
                .addFormDataPart("image2", selfieImage.getName(), selfieFileBody)
                .build();

        // Xây dựng HTTP Request
        Request request = new Request.Builder()
                .url(FACE_MATCH_ENDPOINT)
                .post(requestBody)
                .addHeader("Token", API_TOKEN) // Token dùng để xác thực theo yêu cầu hệ thống Viettel AI
                .addHeader("accept", "application/json")
                .build();

        // Thực thi request
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Không có dữ liệu phản hồi lỗi";
                System.err.println("[ERROR] API Viettel Face Match trả về mã lỗi HTTP: " + response.code() + " - Chi tiết: " + errorBody);
                throw new IOException("API Face Match lỗi với mã HTTP: " + response.code() + ". Chi tiết: " + errorBody);
            }

            if (response.body() == null) {
                System.err.println("[ERROR] API Viettel Face Match trả về phản hồi rỗng (body is null)");
                throw new IOException("Phản hồi từ API Face Match rỗng!");
            }

            String responseString = response.body().string();
            System.out.println("[INFO] Gọi API Viettel Face Match thành công!");
            return responseString;
        } catch (IOException e) {
            System.err.println("[EX] Lỗi kết nối hoặc xử lý dữ liệu với API Viettel Face Match: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
