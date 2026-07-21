const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'Front_end', 'src', 'pages', 'marketplace', 'VehicleDetailPage.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = {
  'Miễn thế chấp': 'No Deposit Required',
  'Giao xe tận nơi': 'Delivery Available',
  'Đặt xe nhanh': 'Instant Book',
  'Hộp số': 'Transmission',
  'Số tự động': 'Automatic',
  'Số chỗ': 'Seats',
  'chỗ': 'seats',
  'Nhiên liệu': 'Fuel Type',
  'Xăng': 'Gasoline',
  'Tiêu hao': 'Fuel Economy',
  'Mô tả chi tiết': 'Description',
  'Chủ xe chưa cập nhật mô tả chi tiết cho phương tiện này. Tuy nhiên bạn có thể liên hệ trực tiếp để giải đáp các thắc mắc về tình trạng vận hành.': 'The owner has not provided a detailed description for this vehicle. However, you can contact them directly for any inquiries regarding its operating condition.',
  'Rút gọn ▲': 'Show less ▲',
  'Xem thêm ▼': 'Read more ▼',
  'Tính năng tiện ích': 'Features & Amenities',
  'Giấy tờ thuê xe bắt buộc': 'Required Rental Documents',
  'GPLX & Căn cước định danh': 'Driver License & ID',
  'Hộ chiếu (Passport)': 'Passport',
  'Yêu cầu GPLX hạng B1 / B2 trở lên (đối với xe ô tô)': 'Requires Driver License B1 / B2 or above (for cars)',
  'Bản gốc thẻ PET hoặc thông tin tài khoản VNeID định danh mức độ 2 chứa giấy phép lái xe hợp lệ.': 'Original PET card or VNeID level 2 account containing valid driver license information.',
  'Khách thuê cần mang theo bản gốc giấy phép lái xe để chủ xe đối chiếu khi ký hợp đồng giao nhận xe.': 'Renters must bring their original driver license for the owner to verify when signing the vehicle delivery contract.',
  'Áp dụng cho người nước ngoài hoặc khách du lịch': 'Applicable for foreigners or tourists',
  'Hộ chiếu còn hạn trên 6 tháng kèm tài sản thế chấp trị giá 15 triệu VNĐ hoặc đặt cọc tiền mặt tương đương.': 'Passport valid for over 6 months along with collateral worth 15 million VND or equivalent cash deposit.',
  'Tài sản thế chấp': 'Collateral',
  'Không cần đặt cọc thế chấp tài sản': 'No Collateral Deposit Required',
  'LuxeWay bảo lãnh hoàn toàn khoản cọc thế chấp. Khách hàng chỉ cần xuất trình giấy tờ hợp lệ.': 'LuxeWay fully guarantees the collateral deposit. Customers only need to present valid documents.',
  'Điều khoản & Chính sách': 'Terms & Policies',
  'Quy định hủy chuyến': 'Cancellation Policy',
  'Thời điểm hủy chuyến': 'Time of Cancellation',
  'Khách thuê nhận lại': 'Renter Receives',
  'Phí dịch vụ LuxeWay': 'LuxeWay Service Fee',
  'Trước chuyến đi &gt; 7 ngày': 'Before trip &gt; 7 days',
  'Hoàn trả 100%': '100% Refund',
  'Miễn phí': 'Free',
  'Từ 1 - 7 ngày trước đi': '1 - 7 days before trip',
  'Hoàn trả 90%': '90% Refund',
  '10% phí thuê xe': '10% rental fee',
  'Trong vòng 24 giờ': 'Within 24 hours',
  'Không hoàn trả': 'No Refund',
  '100% phí cọc giữ chỗ': '100% reservation deposit',
  'Vị trí đỗ xe': 'Parking Location',
  'Vị trí nhận xe': 'Pickup Location',
  'Thông tin chủ xe': 'Owner Information',
  'ĐỐI TÁC XÁC MINH': 'VERIFIED PARTNER',
  'Thành viên từ': 'Member since',
  'Tỷ lệ phản hồi trung bình: 100% trong vòng 15 phút.': 'Average response rate: 100% within 15 minutes.',
  'Đơn giá thuê': 'Rental Price',
  '/ngày': '/day',
  'Ngày nhận xe': 'Pickup Date',
  'Ngày trả xe': 'Return Date',
  'Dịch vụ kèm theo': 'Additional Services',
  'Bảo hiểm chuyến đi': 'Trip Insurance',
  'Hỗ trợ chi trả tổn thất va chạm (+15%)': 'Collision damage waiver (+15%)',
  'Giao nhận xe tận nhà': 'Home delivery',
  'ĐẶT XE NGAY': 'BOOK NOW',
  'Xe tương tự đề xuất': 'Similar Vehicles',
  'Số sàn': 'Manual',
  'Điện': 'Electric',
  'chuyến': 'trips',
  'chuyến đi': 'trips',
  'đánh giá': 'reviews',
};

for (const [vn, en] of Object.entries(replacements)) {
  const regex = new RegExp(vn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(regex, en);
}

// Special case for 'chỗ' because it was replaced with 'seats' but we need 'Seats' for title
content = content.replace(/>Số seats</g, '>Seats<');

fs.writeFileSync(filePath, content);
console.log('Replaced Vietnamese strings with English in VehicleDetailPage.tsx');
