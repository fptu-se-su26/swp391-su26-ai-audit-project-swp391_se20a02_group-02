package com.luxeway.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class TranslationService {

    private final MessageSource messageSource;
    private final JdbcTemplate jdbcTemplate;

    public String getMessage(String key, String langCode, Object... args) {
        Locale locale = getLocale(langCode);
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            // Fallback to English
            try {
                return messageSource.getMessage(key, args, Locale.ENGLISH);
            } catch (Exception ex) {
                return key;
            }
        }
    }

    public Locale getLocale(String langCode) {
        if (langCode == null) return Locale.ENGLISH;
        switch (langCode.toLowerCase()) {
            case "vi": return Locale.forLanguageTag("vi");
            case "ja": return Locale.JAPANESE;
            case "ko": return Locale.KOREAN;
            case "zh": return Locale.SIMPLIFIED_CHINESE;
            case "fr": return Locale.FRENCH;
            case "de": return Locale.GERMAN;
            case "es": return Locale.forLanguageTag("es");
            default: return Locale.ENGLISH;
        }
    }

    public String getCurrentLanguageCode() {
        try {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes) {
                HttpServletRequest request = ((ServletRequestAttributes) attrs).getRequest();
                
                // Query parameter "lang" has highest priority
                String lang = request.getParameter("lang");
                if (lang != null && !lang.trim().isEmpty()) {
                    return lang.trim().toLowerCase();
                }
                
                // Accept-Language header
                String header = request.getHeader("Accept-Language");
                if (header != null && !header.trim().isEmpty()) {
                    String[] parts = header.split(",");
                    if (parts.length > 0) {
                        String code = parts[0].split(";")[0].split("-")[0].trim().toLowerCase();
                        if (!code.isEmpty()) {
                            return code;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Context not available (e.g. background threads)
        }
        return "en";
    }

    public String translateVehicle(String vehicleId, String langCode, String originalName, String originalDescription, String originalCity, String originalAddress, String field) {
        if (langCode != null && langCode.equalsIgnoreCase("vi")) {
            return getOriginalField(originalName, originalDescription, originalCity, originalAddress, field);
        }
        try {
            String sql = "SELECT name, description, city, address FROM vehicle_translations WHERE vehicle_id = ? AND language_code = ?";
            String val = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                if ("name".equals(field)) return rs.getString("name");
                if ("description".equals(field)) return rs.getString("description");
                if ("city".equals(field)) return rs.getString("city");
                if ("address".equals(field)) return rs.getString("address");
                return null;
            }, vehicleId, langCode);
            if (val != null && !val.trim().isEmpty()) {
                return val;
            }
        } catch (Exception e) {
            // ignore
        }
        return getEnglishVehicleField(vehicleId, originalName, originalDescription, originalCity, originalAddress, field);
    }

    private String getOriginalField(String originalName, String originalDescription, String originalCity, String originalAddress, String field) {
        if ("name".equals(field)) return originalName;
        if ("description".equals(field)) return originalDescription;
        if ("city".equals(field)) return originalCity;
        if ("address".equals(field)) return originalAddress;
        return null;
    }

    public String translateCar(String carId, String langCode, String originalName, String originalDescription, String field) {
        if (langCode != null && langCode.equalsIgnoreCase("vi")) {
            return "name".equals(field) ? originalName : originalDescription;
        }
        try {
            String sql = "SELECT name, description FROM car_translations WHERE car_id = ? AND language_code = ?";
            String val = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                if ("name".equals(field)) return rs.getString("name");
                if ("description".equals(field)) return rs.getString("description");
                return null;
            }, carId, langCode);
            if (val != null && !val.trim().isEmpty()) {
                return val;
            }
        } catch (Exception e) {
            // ignore
        }
        if ("name".equals(field)) {
            return translateNameToEnglish(originalName);
        } else {
            return translateDescriptionToEnglish(originalDescription);
        }
    }

    public String translateMotorbike(String motorbikeId, String langCode, String originalName, String originalDescription, String field) {
        if (langCode != null && langCode.equalsIgnoreCase("vi")) {
            return "name".equals(field) ? originalName : originalDescription;
        }
        try {
            String sql = "SELECT name, description FROM motorbike_translations WHERE motorbike_id = ? AND language_code = ?";
            String val = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                if ("name".equals(field)) return rs.getString("name");
                if ("description".equals(field)) return rs.getString("description");
                return null;
            }, motorbikeId, langCode);
            if (val != null && !val.trim().isEmpty()) {
                return val;
            }
        } catch (Exception e) {
            // ignore
        }
        if ("name".equals(field)) {
            return translateNameToEnglish(originalName);
        } else {
            return translateDescriptionToEnglish(originalDescription);
        }
    }

    public String translateReview(String reviewId, String langCode, String originalComment) {
        if (langCode != null && langCode.equalsIgnoreCase("vi")) {
            return originalComment;
        }
        try {
            String sql = "SELECT comment FROM review_translations WHERE review_id = ? AND language_code = ?";
            String val = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> rs.getString("comment"), reviewId, langCode);
            if (val != null && !val.trim().isEmpty()) {
                return val;
            }
        } catch (Exception e) {
            // ignore
        }
        return translateReviewCommentToEnglish(originalComment);
    }

    public String translateNotification(String notificationId, String langCode, String originalTitle, String originalBody, String field) {
        if (langCode != null && langCode.equalsIgnoreCase("vi")) {
            return "title".equals(field) ? originalTitle : originalBody;
        }
        try {
            String sql = "SELECT title, body FROM notification_translations WHERE notification_id = ? AND language_code = ?";
            String val = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                if ("title".equals(field)) return rs.getString("title");
                if ("body".equals(field)) return rs.getString("body");
                return null;
            }, notificationId, langCode);
            if (val != null && !val.trim().isEmpty()) {
                return val;
            }
        } catch (Exception e) {
            // ignore
        }
        return "title".equals(field) ? originalTitle : originalBody;
    }

    private String getEnglishVehicleField(String vehicleId, String originalName, String originalDescription, String originalCity, String originalAddress, String field) {
        if ("name".equals(field)) return translateNameToEnglish(originalName);
        if ("description".equals(field)) return translateDescriptionToEnglish(originalDescription);
        if ("city".equals(field)) return translateCityToEnglish(originalCity);
        if ("address".equals(field)) return translateAddressToEnglish(originalAddress);
        return null;
    }

    private String translateCityToEnglish(String city) {
        if (city == null) return null;
        String c = city.trim();
        if (c.contains("Hồ Chí Minh") || c.contains("Ho Chi Minh")) return "Ho Chi Minh City";
        if (c.contains("Hà Nội") || c.contains("Ha Noi")) return "Hanoi";
        if (c.contains("Đà Nẵng") || c.contains("Da Nang")) return "Da Nang";
        if (c.contains("Đà Lạt") || c.contains("Da Lat")) return "Da Lat";
        if (c.contains("Nha Trang")) return "Nha Trang";
        if (c.contains("Huế") || c.contains("Hue")) return "Hue";
        return city;
    }

    private String translateAddressToEnglish(String address) {
        if (address == null) return null;
        String a = address;
        a = a.replace("Đường", "Street");
        a = a.replace("đường", "Street");
        a = a.replace("Phố", "Street");
        a = a.replace("phố", "Street");
        a = a.replace("Quận", "District");
        a = a.replace("quận", "District");
        a = a.replace("Phường", "Ward");
        a = a.replace("phường", "Ward");
        a = a.replace("Thành phố", "City");
        a = a.replace("thành phố", "City");
        a = a.replace("Hà Nội", "Hanoi");
        a = a.replace("Hồ Chí Minh", "Ho Chi Minh City");
        a = a.replace("Đà Nẵng", "Da Nang");
        a = a.replace("Đà Lạt", "Da Lat");
        a = a.replace("Giải Phóng", "Giai Phong");
        a = a.replace("Nguyễn Huệ", "Nguyen Hue");
        a = a.replace("Lê Lợi", "Le Loi");
        a = a.replace("Đường Láng", "Lang Street");
        return a;
    }

    private String translateNameToEnglish(String originalName) {
        if (originalName == null) return null;
        String name = originalName;
        name = name.replace("Xe Đẹp Như Mới", "Like New");
        name = name.replace("Tiết Kiệm Nhiên Liệu", "Fuel Efficient");
        name = name.replace("Xe Máy Cao Cấp", "Premium Motorbike");
        name = name.replace("Sang Trọng", "Luxury");
        name = name.replace("SUV Thể Thao", "Sport SUV");
        name = name.replace("Hạng Sang", "Luxury Grade");
        name = name.replace("Xe Đô Thị Nhỏ Gọn", "Compact City Car");
        name = name.replace("Trải Nghiệm Thể Thao", "Sporty Experience");
        name = name.replace("Bản Cao Cấp", "Premium Edition");
        name = name.replace("Đi Học Đi Làm", "Daily Commute");
        name = name.replace("Phanh ABS Siêu Khỏe", "ABS - Powerful");
        name = name.replace("Cam Đen Cực Chất", "Orange & Black Edition");
        name = name.replace("Xe Điện Thời Trang", "Stylish Electric");
        name = name.replace("Cốp Siêu Rộng Rãi", "Spacious Storage");
        name = name.replace("Sang Chảnh Đẳng Cấp", "High-Class Luxury");
        name = name.replace("Tiết Kiệm Bền Bỉ", "Durable & Fuel Efficient");
        name = name.replace("Dành Cho Phái Đẹp", "Elegant Edition");
        name = name.replace("Xe Máy Điện Tiện Lợi", "Convenient Electric Scooter");
        name = name.replace("Phong Cách Châu Âu", "European Style");
        name = name.replace("Phượt Tour Chuyên Nghiệp", "Professional Touring");
        name = name.replace("Xe Nhập Đầm Ấm", "Smooth Import");
        name = name.replace("Cross Hybrid Đổi Mới", "Innovative Hybrid Cross");
        name = name.replace("Điện Tiện Lợi", "Convenient Electric");
        name = name.replace("SUV 7 Chỗ", "7-Seat SUV");
        name = name.replace("Hồ Chí Minh", "Ho Chi Minh City");
        name = name.replace("Hà Nội", "Hanoi");
        name = name.replace("Đà Nẵng", "Da Nang");
        name = name.replace("Đà Lạt", "Da Lat");
        name = name.replace("Nha Trang", "Nha Trang");
        name = name.replace("Huế", "Hue");
        name = name.replace("Xe Đẹp", "Beautiful Car");
        name = name.replace("Hành Trình Êm Ái", "Smooth Ride");
        name = name.replace("Hạng Thương Gia", "Business Class");
        name = name.replace("Bản Sport", "Sport Edition");
        name = name.replace("Sedan Đẹp Nhất Phân Khúc", "Best-in-class Sedan");
        name = name.replace("Xe Độc Sang Trọng", "Exclusive Luxury");
        name = name.replace("Xe Đô Thị Nhỏ Gọn", "Compact City Car");
        name = name.replace("Xe Nhỏ Gọn", "Compact Car");
        return name;
    }

    private String translateDescriptionToEnglish(String desc) {
        if (desc == null) return null;
        String d = desc.trim();
        if (d.contains("Honda City 2023 màu trắng")) {
            return "White 2023 Honda City with luxurious black interior. Regularly maintained, clean, and highly fuel-efficient. Perfect for small families and city trips.";
        }
        if (d.contains("Toyota Vios 2022 màu bạc")) {
            return "Silver 2022 Toyota Vios, automatic transmission, cold AC, good sound system. Family used, very new condition. Ideal for long trips and city driving.";
        }
        if (d.contains("Honda Air Blade 2023 màu đỏ đen")) {
            return "Red & black sporty 2023 Honda Air Blade, ABS brakes, smart key. 100% brand new, suitable for fast city commuting, economical and flexible.";
        }
        if (d.contains("Mercedes C200 2021 màu đen")) {
            return "Black 2021 Mercedes C200, premium leather interior, fully equipped with modern amenities. Perfect for VIP clients, important events, and business trips.";
        }
        if (d.contains("BMW X3 2022 màu xanh dương")) {
            return "Metallic blue 2022 BMW X3, powerful engine, advanced safety systems. Ideal for large families and off-road adventures.";
        }
        if (d.contains("Toyota Camry 2023")) {
            return "Glossy black 2023 Toyota Camry, youthful, modern, and luxurious design. Suitable for business meetings or wedding events.";
        }
        if (d.contains("Mazda 3 2023")) {
            return "Red 2023 Mazda 3, elegant Kodo design, premium sound system, sunroof. Exceptional driving feel, suitable for couples and business travel.";
        }
        if (d.contains("Mercedes C200 2022")) {
            return "White 2022 Mercedes C200, elegant, premium leather interior, modern driving assistance systems. Suitable for luxury events and business trips.";
        }
        if (d.contains("BMW 320i Sport Line")) {
            return "Black 2022 BMW 320i Sport Line, powerful engine, sporty handling. Perfect for car enthusiasts seeking a dynamic driving experience.";
        }
        if (d.contains("Kia Morning 2022")) {
            return "Compact yellow 2022 Kia Morning, automatic, very easy to park and drive. Highly fuel-efficient, ideal for daily city driving.";
        }
        if (d.contains("Hyundai Tucson 2023")) {
            return "Grey 2023 Hyundai Tucson, spacious interior, advanced safety, panoramic sunroof. Perfect for family road trips and weekend getaways.";
        }
        if (d.contains("Toyota Innova Cross 2024")) {
            return "Newest 2024 Toyota Innova Cross Hybrid, spacious 7-seater, smooth ride, extremely low fuel consumption. Ideal for family vacations.";
        }
        if (d.contains("VinFast VF8 Eco 2023")) {
            return "Electric grey 2023 VinFast VF8 Eco, high-tech features, ADAS driving assistant. Fast charging, highly economical for both city and highway travel.";
        }
        if (d.contains("Ford Everest 2022")) {
            return "White 2022 Ford Everest, robust 7-seater SUV, strong bi-turbo engine, 4WD. Perfect for challenging terrains and family adventures.";
        }
        
        // Motorbikes
        if (d.contains("Honda Vision 2022")) {
            return "White 2022 Honda Vision, lightweight, smart key. Very easy to ride and highly fuel-efficient, ideal for students and daily commuting.";
        }
        if (d.contains("Honda Vision 2023")) {
            return "Blue 2023 Honda Vision Premium, brand new condition, smart key, idle stop. The perfect scooter for navigating city traffic.";
        }
        if (d.contains("Honda Vision 2021")) {
            return "Black 2021 Honda Vision, reliable engine, regularly serviced. Great value and highly economical for daily work or study commutes.";
        }
        if (d.contains("Honda Air Blade 125i")) {
            return "Sporty black-red 2022 Honda Air Blade 125cc, smart key, strong performance, spacious under-seat storage. Ideal for active riders.";
        }
        if (d.contains("Honda Air Blade 160i")) {
            return "Grey-blue 2023 Honda Air Blade 160cc, equipped with ABS brakes, powerful engine, smart key. Excellent stability and safety.";
        }
        if (d.contains("Yamaha Exciter 155")) {
            return "Orange-black 2022 Yamaha Exciter 155 VVA, manual transmission, sporty styling. Excellent acceleration for speed and manual clutch lovers.";
        }
        if (d.contains("VinFast Evo200")) {
            return "Red 2023 VinFast Evo200 electric scooter, stylish European design. Silent operation, long range of up to 200km per charge.";
        }
        if (d.contains("Honda Lead 2022")) {
            return "Gold 2022 Honda Lead, famous for its massive 37-liter under-seat storage. Smart key, comfortable seat, highly suitable for shopping and family use.";
        }
        if (d.contains("Honda SH125i 2023")) {
            return "Luxurious white 2023 Honda SH125i, smart key, ABS brakes. The pinnacle of high-class city scooters, offering absolute elegance.";
        }
        if (d.contains("Honda SH160i 2023")) {
            return "Premium black 2023 Honda SH160i, powerful 160cc engine, ABS brakes, traction control. Top-tier performance and prestige.";
        }
        if (d.contains("Yamaha Sirius 2021")) {
            return "Red-black 2021 Yamaha Sirius, semi-automatic, extremely durable and reliable. The most economical choice for long-distance city travel.";
        }
        if (d.contains("Yamaha Grande 2023")) {
            return "Elegant blue 2023 Yamaha Grande, Blue Core hybrid engine, smart key. Ultra-lightweight and highly fashionable for female riders.";
        }
        if (d.contains("VinFast Feliz S")) {
            return "Green 2023 VinFast Feliz S electric motorcycle, strong hub motor, LFP battery. Large storage, comfortable ride for daily commutes.";
        }
        if (d.contains("VinFast Klara S")) {
            return "White 2023 VinFast Klara S, premium electric scooter with Italian design, smart connectivity. Eco-friendly and elegant.";
        }
        if (d.contains("Kawasaki Versys X300")) {
            return "Green 2022 Kawasaki Versys X300 adventure touring motorcycle, twin-cylinder engine, luggage racks. Perfect for long-distance adventure tours.";
        }

        String result = desc;
        result = result.replace("màu trắng", "white");
        result = result.replace("màu đen", "black");
        result = result.replace("màu bạc", "silver");
        result = result.replace("nội thất", "interior");
        result = result.replace("sang trọng", "luxurious");
        result = result.replace("tiết kiệm nhiên liệu", "fuel-efficient");
        result = result.replace("số tự động", "automatic");
        result = result.replace("động cơ mạnh mẽ", "powerful engine");
        result = result.replace("mới", "new");
        result = result.replace("phù hợp", "suitable");
        result = result.replace("gia đình", "family");
        result = result.replace("thành phố", "city");
        return result;
    }

    private String translateReviewCommentToEnglish(String comment) {
        if (comment == null) return null;
        String c = comment;
        c = c.replace("Xe đi rất mượt, sạch sẽ.", "Very smooth ride, clean car.");
        c = c.replace("Chủ xe nhiệt tình, giao xe đúng giờ.", "Very friendly host, delivered the car on time.");
        c = c.replace("Xe tiết kiệm xăng, đi êm.", "Fuel efficient, smooth ride.");
        c = c.replace("Dịch vụ tuyệt vời, sẽ ủng hộ tiếp.", "Excellent service, will support again.");
        c = c.replace("Xe sạch sẽ, đi êm ái.", "Clean and smooth ride.");
        c = c.replace("Giao xe nhanh, xe đi mượt.", "Fast delivery, smooth ride.");
        return c;
    }
}

