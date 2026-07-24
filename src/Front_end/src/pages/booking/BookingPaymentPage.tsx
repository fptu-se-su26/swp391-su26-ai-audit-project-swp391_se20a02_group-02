import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Clock, Check, ChevronLeft, Info, AlertTriangle, ShieldCheck, Download, ExternalLink, QrCode } from 'lucide-react';
import { bookingService, paymentService } from '@/services/bookingService';
import { contractService } from '@/services/contractService';
import type { Booking } from '@/types';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, resolveImageUrl } from '@/utils';

const BookingPaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { language } = useUIStore();
  const lang = (language || 'en').toLowerCase();
  const isVi = lang === 'vi';

  const bpt = React.useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        backToBookings: 'Quay lại danh sách',
        summaryTitle: 'Tóm tắt đơn đặt xe',
        pickUp: 'NHẬN XE',
        return: 'TRẢ XE',
        bookingCodeLabel: 'Mã đặt xe:',
        rentalRate: 'Giá thuê xe',
        discount: 'Khuyến mãi',
        insurance: 'Bảo hiểm chuyến đi',
        deliveryFee: 'Phí giao xe',
        serviceFee: 'Phí dịch vụ',
        vatTaxes: 'Thuế VAT',
        securityDeposit: 'Tiền đặt cọc thế chấp',
        totalPayment: 'TỔNG THANH TOÁN',
        payosTitle: 'Thanh Toán Trực Tuyến PayOS',
        payosSub: 'Thanh toán qua cổng PayOS sau khi hợp đồng đã được ký.',
        payosReadyTitle: 'Sẵn sàng tạo giao dịch PayOS',
        payosReadySub: 'Bạn sẽ được chuyển sang trang PayOS để hoàn tất thanh toán, sau đó quay lại LuxeWay để hệ thống xác minh trạng thái.',
        creatingPayosLink: 'ĐANG TẠO LINK PAYOS...',
        payWithPayos: 'THANH TOÁN BẰNG PAYOS',
        useBankTransfer: 'DÙNG CHUYỂN KHOẢN NGÂN HÀNG THAY THẾ',
        bankTransferTitle: 'Thanh Toán Chuyển Khoản',
        bankTransferSub: 'Quét mã VietQR hoặc chuyển khoản thủ công',
        scanHelp: 'Quét QR bằng ứng dụng ngân hàng (Mobile Banking) để điền tự động',
        bankName: 'Tên ngân hàng',
        accountNumber: 'Số tài khoản',
        accountHolder: 'Chủ tài khoản',
        amount: 'Số tiền',
        transferMemoLabel: 'Nội dung chuyển khoản (Bắt buộc ghi đúng)',
        attentionText: 'Lưu ý: Quý khách phải điền CHÍNH XÁC nội dung chuyển khoản ở trên để hệ thống tự động nhận diện giao dịch. Giao dịch sai nội dung có thể mất nhiều thời gian để đối soát thủ công.',
        submittingBtn: 'ĐANG GỬI XÁC NHẬN...',
        iHaveTransferred: 'TÔI ĐÃ CHUYỂN KHOẢN',
        openContract: 'Mở hợp đồng điện tử',
        goToMyBookings: 'Quản lý lịch trình thuê xe',
        expiredTitle: 'Đơn đặt xe đã hết hạn',
        expiredDesc: 'Lịch trình này đã vượt quá thời gian thanh toán 15 phút. Xe đã được giải phóng để người khác thuê. Vui lòng tạo đơn đặt xe mới.',
        pendingTitle: 'Đang chờ duyệt thanh toán',
        pendingDesc: 'Hệ thống đã ghi nhận yêu cầu của bạn. Quá trình kiểm tra ngân hàng thường mất 5 - 10 phút. Bạn có thể rời trang này, chúng tôi sẽ thông báo qua email khi hoàn tất.',
        confirmedTitle: 'Đặt xe đã xác nhận thành công!',
        confirmedDesc: 'Thanh toán của bạn đã được xác nhận. Chuyến đi của bạn đã sẵn sàng. Bạn có thể tải hóa đơn PDF trong phần chi tiết lịch trình.'
      },
      ja: {
        backToBookings: 'マイ予約に戻る',
        summaryTitle: '予約概要',
        pickUp: '受取',
        return: '返却',
        bookingCodeLabel: '予約番号:',
        rentalRate: 'レンタル料金',
        discount: '割引',
        insurance: '旅行保険',
        deliveryFee: '配車手数料',
        serviceFee: 'サービス料',
        vatTaxes: '消費税および税金',
        securityDeposit: '保証金',
        totalPayment: 'お支払い合計',
        payosTitle: 'PayOS オンライン決済',
        payosSub: '契約書に署名後、PayOS ゲートウェイ経由でお支払いください。',
        payosReadyTitle: 'PayOS 決済を作成する準備ができました',
        payosReadySub: 'PayOS にリダイレクトされ、お支払い後、確認のため LuxeWay に戻ります。',
        creatingPayosLink: 'PayOS リンクを作成中...',
        payWithPayos: 'PayOS で支払う',
        useBankTransfer: '銀行振込を使用する',
        bankTransferTitle: '銀行振込決済',
        bankTransferSub: 'VietQR をスキャンするか、手動で振り込んでください',
        scanHelp: '銀行アプリでQRをスキャンして自動入力',
        bankName: '銀行名',
        accountNumber: '口座番号',
        accountHolder: '口座名義',
        amount: '金額',
        transferMemoLabel: '振込メモ（正確に入力してください）',
        attentionText: '注意：上記の正確な振込メモを入力する必要があります。間違ったメモは手動照合が必要となり確認が遅れます。',
        submittingBtn: '確認を送信中...',
        iHaveTransferred: '振込を完了しました',
        openContract: 'デジタル契約書を開く',
        goToMyBookings: 'マイ予約に移動',
        expiredTitle: '予約の支払期限が切れました',
        expiredDesc: 'この予約は15分間の支払い猶予時間を超過しました。車両の空き状況が解放されました。新しい予約を作成してください。',
        pendingTitle: '支払い確認待ち',
        pendingDesc: 'お支払い確認を受信しました。確認には通常 5〜10 分かかります。完了次第メールでお知らせします。',
        confirmedTitle: '予約が確定しました！',
        confirmedDesc: 'お支払いが確認され、予約が正式に確定しました。ダッシュボードからPDF領収書をダウンロードできます。'
      },
      ko: {
        backToBookings: '내 예약으로 돌아가기',
        summaryTitle: '예약 요약',
        pickUp: '인수',
        return: '반납',
        bookingCodeLabel: '예약 번호:',
        rentalRate: '차량 대여료',
        discount: '할인',
        insurance: '여행 보험',
        deliveryFee: '차량 탁송료',
        serviceFee: '서비스 수수료',
        vatTaxes: '부가세 및 세금',
        securityDeposit: '보증금',
        totalPayment: '총 결제 금액',
        payosTitle: 'PayOS 온라인 결제',
        payosSub: '계약서 서명 후 PayOS 게이트웨이를 통해 결제하세요.',
        payosReadyTitle: 'PayOS 결제를 생성할 준비가 되었습니다',
        payosReadySub: 'PayOS로 이동하여 결제한 후 결제 확인을 위해 LuxeWay로 돌아옵니다.',
        creatingPayosLink: 'PayOS 링크 생성 중...',
        payWithPayos: 'PayOS로 결제',
        useBankTransfer: '계좌 이체 사용',
        bankTransferTitle: '계좌 이체 결제',
        bankTransferSub: 'VietQR를 스캔하거나 수동으로 이체하세요',
        scanHelp: '모바일 뱅킹 앱으로 QR을 스캔하여 자동 입력',
        bankName: '은행명',
        accountNumber: '계좌 번호',
        accountHolder: '예금주',
        amount: '금액',
        transferMemoLabel: '이체 메모 (정확히 입력해야 합니다)',
        attentionText: '주의: 위의 정확한 이체 메모를 입력해야 합니다. 잘못된 메모는 수동 확인이 필요하여 처리가 지연됩니다.',
        submittingBtn: '확인 제출 중...',
        iHaveTransferred: '이체를 완료했습니다',
        openContract: '디지털 계약서 열기',
        goToMyBookings: '내 예약으로 이동',
        expiredTitle: '예약 결제 기한이 만료되었습니다',
        expiredDesc: '이 예약은 15분 결제 시간을 초과했습니다. 차량이 다른 사용자에게 해제되었습니다. 새 예약을 작성해주세요.',
        pendingTitle: '결제 확인 대기 중',
        pendingDesc: '결제 확인 요청이 접수되었습니다. 수동 확인은 보통 5~10분이 소요됩니다. 완료되면 이메일로 안내해 드립니다.',
        confirmedTitle: '예약이 확정되었습니다!',
        confirmedDesc: '결제가 확인되어 예약이 공식적으로 확정되었습니다. 대시보드에서 PDF 영수증을 다운로드할 수 있습니다.'
      },
      zh: {
        backToBookings: '返回我的预订',
        summaryTitle: '预订摘要',
        pickUp: '取车',
        return: '还车',
        bookingCodeLabel: '预订编号:',
        rentalRate: '车辆租金',
        discount: '折扣',
        insurance: '行程保险',
        deliveryFee: '送车服务费',
        serviceFee: '服务费',
        vatTaxes: '增值税与税费',
        securityDeposit: '押金',
        totalPayment: '总支付额',
        payosTitle: 'PayOS 在线结账',
        payosSub: '签署合同后通过 PayOS 网关进行支付。',
        payosReadyTitle: '已准备好创建 PayOS 支付',
        payosReadySub: '您将被重定向至 PayOS，支付完成后返回 LuxeWay 进行支付验证。',
        creatingPayosLink: '正在生成 PayOS 链接...',
        payWithPayos: '使用 PayOS 支付',
        useBankTransfer: '改用银行转账',
        bankTransferTitle: '银行转账支付',
        bankTransferSub: '扫描 VietQR 或手动转账',
        scanHelp: '使用银行 app 扫描 QR 码以自动填写',
        bankName: '银行名称',
        accountNumber: '账号',
        accountHolder: '户名',
        amount: '金额',
        transferMemoLabel: '转账附言（必须完全一致）',
        attentionText: '注意：您必须填写上面完全一致的转账附言。错误的附言将导致需要人工核对并延迟确认。',
        submittingBtn: '正在提交确认...',
        iHaveTransferred: '我已完成转账',
        openContract: '打开数字合同',
        goToMyBookings: '前往我的预订',
        expiredTitle: '预订支付已过期',
        expiredDesc: '此预订已超过 15 分钟的支付窗口。车辆已释放。请重新创建预订。',
        pendingTitle: '等待支付验证',
        pendingDesc: '我们已收到您的支付确认。人工核对通常需要 5 - 10 分钟。完成后您将收到电子邮件通知。',
        confirmedTitle: '预订已成功确认！',
        confirmedDesc: '您的支付已验证，预订已正式确认。您可以在仪表板中下载 PDF 收据。'
      }
    };

    const fallback = {
      backToBookings: 'Back to Bookings',
      summaryTitle: 'Booking Summary',
      pickUp: 'PICK-UP',
      return: 'RETURN',
      bookingCodeLabel: 'Booking Code:',
      rentalRate: 'Rental Rate',
      discount: 'Discount',
      insurance: 'Insurance',
      deliveryFee: 'Delivery Fee',
      serviceFee: 'Service Fee',
      vatTaxes: 'VAT & Taxes',
      securityDeposit: 'Security Deposit',
      totalPayment: 'TOTAL PAYMENT',
      payosTitle: 'PayOS Online Checkout',
      payosSub: 'Pay through the PayOS gateway after the contract has been signed.',
      payosReadyTitle: 'Ready to create a PayOS payment',
      payosReadySub: 'You will be redirected to PayOS, then returned to LuxeWay for payment verification.',
      creatingPayosLink: 'CREATING PAYOS LINK...',
      payWithPayos: 'PAY WITH PAYOS',
      useBankTransfer: 'USE BANK TRANSFER INSTEAD',
      bankTransferTitle: 'Bank Transfer Checkout',
      bankTransferSub: 'Scan VietQR or transfer manually',
      scanHelp: 'Scan with banking app for auto-fill details',
      bankName: 'Bank Name',
      accountNumber: 'Account Number',
      accountHolder: 'Account Holder',
      amount: 'Amount',
      transferMemoLabel: 'Transfer Message (Must be exact)',
      attentionText: 'Attention: You MUST supply the EXACT transfer message above. Incorrect message will delay verification as it requires manual host reconciliation.',
      submittingBtn: 'SUBMITTING CONFIRMATION...',
      iHaveTransferred: 'I HAVE TRANSFERRED',
      openContract: 'Open Digital Contract',
      goToMyBookings: 'Go to My Bookings',
      expiredTitle: 'Booking Payment Expired',
      expiredDesc: 'This booking has exceeded the 15-minute payment window. The vehicle availability has been released. Please create a new booking request.',
      pendingTitle: 'Payment Awaiting Verification',
      pendingDesc: 'We have received your payment confirmation. Manual verification typically takes 5 - 10 minutes. You will receive an email confirmation once completed.',
      confirmedTitle: 'Booking Confirmed!',
      confirmedDesc: 'Your payment is verified and booking is officially confirmed. You can now download the PDF receipt inside your dashboard.'
    };

    return dicts[lang] || fallback;
  }, [lang]);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentSetting, setPaymentSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [payosProcessing, setPayosProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes default
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const selectedMethod = searchParams.get('method') === 'bank_transfer' ? 'bank_transfer' : 'payos';

  // Load booking and payment credentials
  useEffect(() => {
    if (!bookingId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [bookingData, settingsData] = await Promise.all([
          bookingService.getById(bookingId),
          paymentService.getPaymentSettings()
        ]);

        if (bookingData) {
          const status = String(bookingData.status || '').toLowerCase();
          if (status === 'waiting_payment') {
            const contract = await contractService.getByBooking(bookingId);
            if (!contract?.renterSignedAt) {
              toast.warning(
                isVi ? 'Cần ký hợp đồng điện tử' : 'Digital contract required',
                isVi ? 'Vui lòng ký hợp đồng trước khi thanh toán.' : 'Please sign the rental contract before payment.'
              );
              navigate(`/booking/${bookingId}/contract?method=${selectedMethod}`);
              return;
            }
          }

          setBooking(bookingData);

          // Calculate initial countdown based on booking's createdAt time
          const createdTime = new Date(bookingData.createdAt || Date.now()).getTime();
          const endTime = createdTime + 15 * 60 * 1000;
          const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
          setCountdown(remainingSeconds);
        } else {
          toast.error(isVi ? 'Không tìm thấy đặt xe' : 'Booking Not Found');
        }

        if (settingsData && settingsData.data) {
          setPaymentSetting(settingsData.data);
        }
      } catch (err: any) {
        console.error('Error loading checkout page data:', err);
        toast.error(isVi ? 'Lỗi kết nối máy chủ' : 'Server Connection Error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookingId, isVi, selectedMethod]);

  // Live timer countdown logic
  useEffect(() => {
    if (loading || !booking || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Refresh booking status to check if expired
          bookingService.getById(bookingId!).then(b => {
            if (b) setBooking(b);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, booking, countdown, bookingId]);

  // Formatter for countdown mm:ss
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(isVi ? 'Đã sao chép' : 'Copied', isVi ? `Sao chép ${fieldName} thành công` : `${fieldName} copied`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmTransfer = async () => {
    if (!booking) return;

    setConfirming(true);
    try {
      const updated = await bookingService.confirmTransfer(booking.id);
      if (updated) {
        toast.success(
          isVi ? 'Đã xác nhận chuyển khoản' : 'Transfer Submitted',
          isVi ? 'Đang chờ Admin duyệt giao dịch của bạn.' : 'Awaiting manual Admin verification.'
        );
        setBooking({ ...booking, ...updated, status: String(updated.status || 'payment_pending').toLowerCase() });
      } else {
        toast.error(isVi ? 'Xác nhận thất bại' : 'Verification Submission Failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        isVi ? 'Lỗi xác nhận' : 'Confirmation Error',
        err.message || (isVi ? 'Có lỗi xảy ra khi xác nhận thanh toán.' : 'Failed to submit payment confirmation.')
      );
    } finally {
      setConfirming(false);
    }
  };

  const handlePayOSCheckout = async () => {
    if (!booking) return;

    setPayosProcessing(true);
    try {
      const amount = booking.pricing?.total || 0;
      if (amount <= 0) {
        toast.error(
          isVi ? 'Số tiền không hợp lệ' : 'Invalid payment amount',
          isVi ? 'Không thể tạo giao dịch PayOS với số tiền bằng 0.' : 'Cannot create a PayOS payment with a zero amount.'
        );
        return;
      }

      const result = await paymentService.processPayment(
        booking.id,
        'payos',
        amount,
        `${window.location.origin}/payment/payos/return`
      );

      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      toast.error(
        isVi ? 'Không tạo được thanh toán PayOS' : 'PayOS checkout failed',
        result.errorMessage || (isVi ? 'Vui lòng thử lại hoặc chọn chuyển khoản ngân hàng.' : 'Please try again or use bank transfer.')
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        isVi ? 'Lỗi PayOS' : 'PayOS Error',
        err?.message || (isVi ? 'Không thể khởi tạo cổng PayOS.' : 'Unable to initialize PayOS checkout.')
      );
    } finally {
      setPayosProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">{isVi ? 'Đang tải cổng thanh toán...' : 'Initializing payment gateway...'}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-card rounded-3xl border border-border shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{isVi ? 'Không tìm thấy đặt xe' : 'Booking Not Found'}</h2>
          <p className="text-slate-500 mb-6">{isVi ? 'Vui lòng truy cập lại từ danh sách đặt xe.' : 'Please access this page from your booking list.'}</p>
          <button onClick={() => navigate('/dashboard/bookings')} className="w-full btn-primary py-3 rounded-xl font-bold">
            {isVi ? 'Về lịch trình của tôi' : 'My Bookings'}
          </button>
        </div>
      </div>
    );
  }

  // Generate VietQR dynamic image URL
  const bankName = paymentSetting?.bankName || 'MB';
  const accountNumber = paymentSetting?.accountNumber || '0377096245';
  const ownerName = paymentSetting?.ownerName || 'NGUYEN VAN DANG';
  const transferMemo = booking.bookingCode || 'LXW-CODE';
  const amountToPay = booking.pricing?.total || 0;

  const vietQrUrl = `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.png?amount=${amountToPay}&addInfo=${transferMemo}&accountName=${encodeURIComponent(ownerName)}`;

  const status = String(booking.status || '').toLowerCase();
  const isExpired = countdown <= 0 || status === 'payment_expired';
  const isPendingApproval = status === 'payment_pending';
  const isConfirmed = status === 'confirmed' || status === 'payment_verified' || status === 'owner_approved';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 transition-colors">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Navigation header */}
        <button 
          onClick={() => navigate('/dashboard/bookings')} 
          className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-foreground transition-colors mb-6 uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          {bpt.backToBookings}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT PANEL: Summary & Checkout Details (1 col) */}
          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-3xl shadow-lg space-y-5">
              <h3 className="text-base font-bold text-foreground border-b border-border pb-3 uppercase tracking-tight">
                {bpt.summaryTitle}
              </h3>

              {/* Vehicle card */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl overflow-hidden border border-border bg-slate-100 flex-shrink-0">
                  <img src={resolveImageUrl(booking.vehicle?.thumbnailUrl)} alt={booking.vehicle?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground uppercase">{booking.vehicle?.brand} {booking.vehicle?.name}</h4>
                  <p className="text-[10px] text-slate-400 capitalize">{booking.vehicle?.category}</p>
                </div>
              </div>

              {/* Booking metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{bpt.pickUp}</p>
                  <p className="font-bold text-foreground">{booking.startDate?.toString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{bpt.return}</p>
                  <p className="font-bold text-foreground">{booking.endDate?.toString()}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/50 dark:border-white/5 flex justify-between">
                  <span className="text-slate-400">{bpt.bookingCodeLabel}</span>
                  <span className="font-black text-amber-500">{booking.bookingCode}</span>
                </div>
              </div>

              {/* Price Breakdown Details */}
              <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>{bpt.rentalRate}</span>
                  <span className="font-bold text-foreground">{formatCurrency(booking.pricing?.basePrice || 0, language)}</span>
                </div>
                {booking.pricing?.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>{bpt.discount}</span>
                    <span className="font-bold">-{formatCurrency(booking.pricing.discount, language)}</span>
                  </div>
                )}
                {booking.includeInsurance && (
                  <div className="flex justify-between">
                    <span>{bpt.insurance}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing?.insuranceFee || 0, language)}</span>
                  </div>
                )}
                {booking.includeDelivery && (
                  <div className="flex justify-between">
                    <span>{bpt.deliveryFee}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing?.deliveryFee || 0, language)}</span>
                  </div>
                )}
                {booking.pricing?.serviceFee > 0 && (
                  <div className="flex justify-between">
                    <span>{bpt.serviceFee}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing.serviceFee, language)}</span>
                  </div>
                )}
                {booking.pricing?.taxes > 0 && (
                  <div className="flex justify-between">
                    <span>{bpt.vatTaxes}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(booking.pricing.taxes, language)}</span>
                  </div>
                )}
                {booking.pricing?.deposit > 0 && (
                  <div className="flex justify-between pt-1 border-t border-slate-200/55 dark:border-white/5 text-amber-600 dark:text-amber-500">
                    <span>{bpt.securityDeposit}</span>
                    <span className="font-bold">{formatCurrency(booking.pricing.deposit, language)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-black pt-3 border-t border-dashed border-border text-foreground">
                  <span>{bpt.totalPayment}</span>
                  <span className="text-blue-500 font-display font-black text-base">{formatCurrency(amountToPay, language)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: Dynamic VietQR and Action (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Warning Banner */}
            {isExpired && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-3xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">{bpt.expiredTitle}</h4>
                  <p className="text-xs text-red-400 mt-1">
                    {bpt.expiredDesc}
                  </p>
                </div>
              </div>
            )}

            {isPendingApproval && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-5 rounded-3xl flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm">{bpt.pendingTitle}</h4>
                  <p className="text-xs text-amber-500/80 mt-1">
                    {bpt.pendingDesc}
                  </p>
                </div>
              </div>
            )}

            {isConfirmed && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-5 rounded-3xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">{bpt.confirmedTitle}</h4>
                  <p className="text-xs text-green-400 mt-1">
                    {bpt.confirmedDesc}
                  </p>
                </div>
              </div>
            )}

            {selectedMethod === 'payos' && !isExpired && !isPendingApproval && !isConfirmed && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{bpt.payosTitle}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {bpt.payosSub}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold text-xs">PayOS</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/10 p-5 text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-bold">
                    {bpt.payosReadyTitle}
                  </p>
                  <p className="text-xs mt-1 opacity-80">
                    {bpt.payosReadySub}
                  </p>
                </div>

                <button
                  onClick={handlePayOSCheckout}
                  disabled={payosProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-display font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {payosProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {bpt.creatingPayosLink}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      {bpt.payWithPayos}
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(`/booking/${booking.id}/payment?method=bank_transfer`)}
                  className="w-full py-3 rounded-2xl border border-border text-xs font-black uppercase tracking-wider text-slate-500 hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {bpt.useBankTransfer}
                </button>
              </div>
            )}

            {/* main bank transfer module */}
            {selectedMethod === 'bank_transfer' && !isExpired && !isPendingApproval && !isConfirmed && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
                
                {/* Timer Countdown Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{bpt.bankTransferTitle}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{bpt.bankTransferSub}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="font-mono font-bold text-sm">{formatTime(countdown)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* VietQR Display */}
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="bg-white p-4 rounded-3xl border border-border shadow-sm max-w-[240px] w-full aspect-square flex items-center justify-center relative group">
                      <img src={vietQrUrl} alt="VietQR Pay Code" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-slate-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5" /> VietQR Auto
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center max-w-[200px] leading-relaxed">
                      {bpt.scanHelp}
                    </span>
                  </div>

                  {/* Manual Account Details */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                      
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{bpt.bankName}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-foreground uppercase">{bankName}</span>
                          <button onClick={() => handleCopyToClipboard(bankName, bpt.bankName)} className="text-slate-400 hover:text-foreground transition-colors p-1">
                            {copiedField === bpt.bankName ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{bpt.accountNumber}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-foreground">{accountNumber}</span>
                          <button onClick={() => handleCopyToClipboard(accountNumber, bpt.accountNumber)} className="text-slate-400 hover:text-foreground transition-colors p-1">
                            {copiedField === bpt.accountNumber ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{bpt.accountHolder}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-foreground uppercase">{ownerName}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{bpt.amount}</span>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-blue-500">{formatCurrency(amountToPay, language)}</span>
                          <button onClick={() => handleCopyToClipboard(amountToPay.toString(), bpt.amount)} className="text-slate-400 hover:text-foreground transition-colors p-1">
                            {copiedField === bpt.amount ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                          {bpt.transferMemoLabel}
                        </span>
                        <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                          <span className="font-mono font-black text-amber-500 text-sm tracking-wider">{transferMemo}</span>
                          <button onClick={() => handleCopyToClipboard(transferMemo, bpt.transferMemoLabel)} className="text-amber-500 hover:text-amber-600 transition-colors p-1">
                            {copiedField === bpt.transferMemoLabel ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Important Advisory */}
                <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-blue-600 dark:text-blue-400 leading-normal">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    {bpt.attentionText}
                  </p>
                </div>

                {/* Confirm Submission Action */}
                <button
                  onClick={handleConfirmTransfer}
                  disabled={confirming}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-display font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {bpt.submittingBtn}
                    </>
                  ) : (
                    <>
                      {bpt.iHaveTransferred}
                    </>
                  )}
                </button>

              </div>
            )}

            {/* Navigation back and details */}
            {(isExpired || isPendingApproval || isConfirmed) && (
              <div className="bg-card border border-border p-6 rounded-3xl shadow-md text-center">
                {isConfirmed && (
                  <button
                    onClick={() => navigate(`/booking/${booking.id}/contract`)}
                    className="btn-primary py-3 px-8 rounded-xl font-bold inline-flex items-center gap-2 mr-0 sm:mr-3 mb-3 sm:mb-0"
                  >
                    {bpt.openContract}
                  </button>
                )}
                <button 
                  onClick={() => navigate(`/dashboard/bookings`)} 
                  className={isConfirmed ? "py-3 px-8 rounded-xl font-bold inline-flex items-center gap-2 border border-border text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-colors" : "btn-primary py-3 px-8 rounded-xl font-bold inline-flex items-center gap-2"}
                >
                  {bpt.goToMyBookings}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default BookingPaymentPage;
