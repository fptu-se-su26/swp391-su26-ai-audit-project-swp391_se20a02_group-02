import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, CalendarDays, Car, CheckCircle2, CreditCard, ExternalLink, FileSignature, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';
import { bookingService } from '@/services/bookingService';
import { contractService, DigitalContract } from '@/services/contractService';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils';
import type { Booking } from '@/types';

const DigitalContractPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();
  const { language, theme } = useUIStore();
  const isDark = theme === 'dark';
  const lang = (language || 'en').toLowerCase();

  const dct = useMemo(() => {
    const dicts: Record<string, Record<string, string>> = {
      vi: {
        agreementHeader: 'HỢP ĐỒNG THUÊ XE ĐIỆN TỬ LUXEWAY',
        title: 'Hợp Đồng Điện Tử',
        bookingCode: 'Mã đặt xe',
        preparing: 'Đang chuẩn bị',
        fullySigned: 'Đã ký hoàn tất',
        waitingOwner: 'Chờ chủ xe ký',
        waitingRenter: 'Chờ khách thuê ký',
        awaitingSignatures: 'Chờ chữ ký',
        vehicleLabel: 'Phương tiện',
        rentalPeriodLabel: 'Thời gian thuê',
        to: 'đến',
        totalPaymentLabel: 'Tổng thanh toán',
        termsTitle: 'Các điều khoản hợp đồng',
        term1: '1. Khách thuê chịu trách nhiệm về việc nhận xe, trả xe đúng giờ, các khoản phạt giao thông và mọi hư hỏng không thuộc phạm vi bảo hiểm đã chọn.',
        term2: '2. Chủ xe xác nhận phương tiện sẵn sàng, đủ điều kiện lưu thông, có bảo hiểm và đúng với thông tin niêm yết tại thời điểm đặt xe.',
        term3: '3. LuxeWay ghi nhận cả hai chữ ký kèm bằng chứng mốc thời gian. Hợp đồng chỉ có hiệu lực sau khi chữ ký của cả khách thuê và chủ xe được ghi nhận.',
        term4: '4. Việc thanh toán và xử lý tiền cọc tuân theo bản ghi đặt xe và trạng thái xác minh thanh toán của nền tảng.',
        renter: 'Khách thuê',
        owner: 'Chủ xe',
        signaturePending: 'Chưa ký',
        signAs: 'Ký tên với tư cách',
        asRenter: 'khách thuê',
        asOwner: 'chủ xe',
        docusealNotConfiguredTitle: 'Chưa cấu hình DocuSeal',
        docusealNotConfiguredDesc: 'Sử dụng chữ ký nội bộ LuxeWay cho đến khi DocuSeal được tích hợp hoàn tất.',
        typeFullName: 'Nhập họ và tên đầy đủ',
        fullNamePlaceholder: 'Họ và tên hợp pháp',
        signContractBtn: 'Ký hợp đồng',
        signingBtn: 'Đang ký...',
        yourSigRecorded: 'Chữ ký của bạn đã được ghi nhận',
        payNow: 'Thanh toán ngay',
        payLater: 'Thanh toán sau - Quay lại danh sách đặt xe',
        auditEvidenceTitle: 'Bằng chứng kiểm toán',
        contractIdLabel: 'Mã hợp đồng',
        createdLabel: 'Ngày tạo',
        statusLabel: 'Trạng thái',
        back: 'Quay lại',
        myBookings: 'Chuyến đi của tôi'
      },
      ja: {
        agreementHeader: 'LUXEWAY 電子レンタカー契約書',
        title: 'デジタル契約書',
        bookingCode: '予約番号',
        preparing: '準備中',
        fullySigned: '署名完了',
        waitingOwner: 'オーナーの署名待ち',
        waitingRenter: '借り手の署名待ち',
        awaitingSignatures: '署名待ち',
        vehicleLabel: '車両',
        rentalPeriodLabel: 'レンタル期間',
        to: '〜',
        totalPaymentLabel: 'お支払い合計',
        termsTitle: '契約利用規約',
        term1: '1. 借り手は、車両の引き取り、返却時間、交通違反の罰金、および選択した保険パッケージでカバーされない損害について責任を負います。',
        term2: '2. オーナーは、車両が利用可能であり、走行可能で、保険に加入しており、予約時に表示された掲載詳細と一致していることを確認します。',
        term3: '3. LuxeWay はタイムスタンプの証拠とともに両方の署名を記録します。契約は、借り手とオーナーの両方の署名が記録された後にのみ有効になります。',
        term4: '4. 支払いおよび保証金の取り扱いは、予約記録およびプラットフォームの支払い確認ステータスに従います。',
        renter: '借り手',
        owner: 'オーナー',
        signaturePending: '署名保留中',
        signAs: 'として署名',
        asRenter: '借り手',
        asOwner: 'オーナー',
        docusealNotConfiguredTitle: 'DocuSeal 未設定',
        docusealNotConfiguredDesc: 'DocuSeal トークン/テンプレートがバックエンドで利用可能になるまで、LuxeWay ローカル署名を使用します。',
        typeFullName: 'フルネームを入力',
        fullNamePlaceholder: '法的フルネーム',
        signContractBtn: '契約書に署名する',
        signingBtn: '署名中...',
        yourSigRecorded: 'あなたの署名が記録されました',
        payNow: '今すぐ支払う',
        payLater: '後で支払う - マイ予約に戻る',
        auditEvidenceTitle: '監査証跡',
        contractIdLabel: '契約ID',
        createdLabel: '作成日時',
        statusLabel: 'ステータス',
        back: '戻る',
        myBookings: 'マイ予約'
      },
      ko: {
        agreementHeader: 'LUXEWAY 전자 렌탈 계약서',
        title: '디지털 계약서',
        bookingCode: '예약 번호',
        preparing: '준비 중',
        fullySigned: '서명 완료',
        waitingOwner: '호스트 서명 대기',
        waitingRenter: '대여자 서명 대기',
        awaitingSignatures: '서명 대기',
        vehicleLabel: '차량',
        rentalPeriodLabel: '대여 기간',
        to: '~',
        totalPaymentLabel: '총 결제 금액',
        termsTitle: '계약 약관',
        term1: '1. 임차인은 차량 인수, 반납 시간, 교통 과태료 및 선택한 보험 패키지로 보장되지 않는 손해에 대한 책임을 집니다.',
        term2: '2. 호스트는 차량이 이용 가능하고 운행 가능하며 보험에 가입되어 있고 예약 시 표시된 등록 정보와 일치함을 확인합니다.',
        term3: '3. LuxeWay는 타임스탬프 증거와 함께 두 서명을 모두 기록합니다. 계약은 대여자와 호스트 서명이 모두 기록된 후에만 효력이 발생합니다.',
        term4: '4. 결제 및 보증금 처리는 예약 기록 및 플랫폼 결제 확인 상태를 따릅니다.',
        renter: '대여자',
        owner: '호스트',
        signaturePending: '서명 대기',
        signAs: '(으)로 서명',
        asRenter: '대여자',
        asOwner: '호스트',
        docusealNotConfiguredTitle: 'DocuSeal 미설정',
        docusealNotConfiguredDesc: 'DocuSeal 토큰/템플릿을 사용할 수 있을 때까지 LuxeWay 로컬 서명을 사용합니다.',
        typeFullName: '성명 입력',
        fullNamePlaceholder: '법적 성명',
        signContractBtn: '계약서 서명하기',
        signingBtn: '서명 중...',
        yourSigRecorded: '서명이 기록되었습니다',
        payNow: '지금 결제',
        payLater: '나중에 결제 - 내 예약으로 돌아가기',
        auditEvidenceTitle: '감사 증거',
        contractIdLabel: '계약 ID',
        createdLabel: '생성일',
        statusLabel: '상태',
        back: '뒤로가기',
        myBookings: '내 예약'
      },
      zh: {
        agreementHeader: 'LUXEWAY 电子租赁协议',
        title: '数字合同',
        bookingCode: '预订编号',
        preparing: '准备中',
        fullySigned: '已完全签署',
        waitingOwner: '等待车主签署',
        waitingRenter: '等待租客签署',
        awaitingSignatures: '等待签署',
        vehicleLabel: '车辆',
        rentalPeriodLabel: '租赁期间',
        to: '至',
        totalPaymentLabel: '总支付额',
        termsTitle: '协议条款',
        term1: '1. 租客应对取车、还车时间、交通罚款以及所选保险方案未涵盖的任何损坏承担责任。',
        term2: '2. 车主确认车辆可用、适合行驶、已投保，且与预订时显示的发布信息一致。',
        term3: '3. LuxeWay 记录具有时间戳证据的双方签署。合同仅在记录了租客和车主双方的签署后方生效。',
        term4: '4. 支付和押金处理遵循预订记录和平台支付验证状态。',
        renter: '租客',
        owner: '车主',
        signaturePending: '等待签署',
        signAs: '签署身份',
        asRenter: '租客',
        asOwner: '车主',
        docusealNotConfiguredTitle: 'DocuSeal 未配置',
        docusealNotConfiguredDesc: '在后端可获得 DocuSeal 令牌/模板之前，使用 LuxeWay 本地签名。',
        typeFullName: '输入全名',
        fullNamePlaceholder: '法定全名',
        signContractBtn: '签署合同',
        signingBtn: '正在签署...',
        yourSigRecorded: '您的签名已记录',
        payNow: '立即支付',
        payLater: '稍后支付 - 返回我的预订',
        auditEvidenceTitle: '审计证据',
        contractIdLabel: '合同 ID',
        createdLabel: '创建时间',
        statusLabel: '状态',
        back: '返回',
        myBookings: '我的预订'
      }
    };

    const fallback = {
      agreementHeader: 'LuxeWay electronic rental agreement',
      title: 'Digital Contract',
      bookingCode: 'Booking',
      preparing: 'Preparing',
      fullySigned: 'Fully signed',
      waitingOwner: 'Waiting for owner',
      waitingRenter: 'Waiting for renter',
      awaitingSignatures: 'Awaiting signatures',
      vehicleLabel: 'Vehicle',
      rentalPeriodLabel: 'Rental period',
      to: 'to',
      totalPaymentLabel: 'Total payment',
      termsTitle: 'Agreement terms',
      term1: '1. The renter accepts responsibility for vehicle pickup, return timing, traffic penalties, and any damages not covered by the selected insurance package.',
      term2: '2. The owner confirms the vehicle is available, roadworthy, insured, and matches the listing details shown at the time of booking.',
      term3: '3. LuxeWay records both signatures with timestamp evidence. The contract becomes effective only after both renter and owner signatures are recorded.',
      term4: '4. Payment and deposit handling follow the booking record and platform payment verification status.',
      renter: 'Renter',
      owner: 'Owner',
      signaturePending: 'Signature pending',
      signAs: 'Sign as',
      asRenter: 'renter',
      asOwner: 'owner',
      docusealNotConfiguredTitle: 'DocuSeal is not configured',
      docusealNotConfiguredDesc: 'Using LuxeWay local signature until the DocuSeal token/template is available to the backend.',
      typeFullName: 'Type full name',
      fullNamePlaceholder: 'Full legal name',
      signContractBtn: 'Sign contract',
      signingBtn: 'Signing...',
      yourSigRecorded: 'Your signature is recorded',
      payNow: 'Pay now',
      payLater: 'Pay later - return to My Bookings',
      auditEvidenceTitle: 'Audit evidence',
      contractIdLabel: 'Contract ID',
      createdLabel: 'Created',
      statusLabel: 'Status',
      back: 'Back',
      myBookings: 'My bookings'
    };

    return dicts[lang] || fallback;
  }, [lang]);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [contract, setContract] = useState<DigitalContract | null>(null);
  const [signature, setSignature] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role?.toLowerCase();
  const isOwner = role === 'owner';
  const activeSignerLabel = isOwner ? `${dct.owner} signature` : `${dct.renter} signature`;
  const hasSigned = isOwner ? !!contract?.ownerSignedAt : !!contract?.renterSignedAt;
  const bookingStatus = String(booking?.status || '').toLowerCase();
  const renterCanPay = !isOwner && !!contract?.renterSignedAt && ['waiting_payment', 'payment_rejected'].includes(bookingStatus);
  const paymentMethod = searchParams.get('method') === 'bank_transfer' ? 'bank_transfer' : 'payos';
  const docusealEmbedUrl = contract?.currentSignerEmbedUrl || (isOwner ? contract?.docusealOwnerEmbedUrl : contract?.docusealRenterEmbedUrl);
  const docusealEnabled = !!docusealEmbedUrl;

  const statusText = useMemo(() => {
    if (!contract) return dct.preparing;
    if (contract.isFullySigned) return dct.fullySigned;
    if (contract.renterSignedAt && !contract.ownerSignedAt) return dct.waitingOwner;
    if (contract.ownerSignedAt && !contract.renterSignedAt) return dct.waitingRenter;
    return dct.awaitingSignatures;
  }, [contract, dct]);

  const nextActionText = useMemo(() => {
    if (!contract) return '';
    if (isOwner) {
      if (!contract.renterSignedAt) return 'The renter has not signed yet. You can review this booking again after the renter signs.';
      if (!contract.ownerSignedAt) return 'The renter signature is recorded. Please sign as owner to complete the official rental contract.';
      return 'Owner signature is recorded. No further owner action is required for the contract.';
    }
    if (!contract.renterSignedAt) return 'Sign as renter first. After your renter signature is recorded, you can pay immediately.';
    if (renterCanPay) return 'Your signature is recorded. You can proceed to payment now; owner signature can be completed later from the owner portal.';
    if (!contract.ownerSignedAt) return 'Your signature is recorded. Waiting for the owner to sign the contract.';
    return 'Both signatures are recorded.';
  }, [contract, isOwner, renterCanPay]);

  useEffect(() => {
    if (!bookingId) return;

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const bookingData = await bookingService.getById(bookingId);
        if (!mounted) return;

        if (!bookingData) {
          toast.error('Booking not found', 'Please open the contract from a valid booking.');
          return;
        }

        setBooking(bookingData);
        const contractData = await contractService.ensureForBooking(bookingId);
        if (mounted) setContract(contractData);
        if (mounted && searchParams.get('signed') === 'docuseal') {
          toast.success('Signature submitted', 'DocuSeal returned to LuxeWay. Refreshing contract status.');
        }
      } catch (error: any) {
        toast.error('Contract unavailable', error?.message || 'Unable to prepare the digital contract.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [bookingId]);

  const refreshContract = async () => {
    if (!bookingId) return;
    setRefreshing(true);
    try {
      const updated = await contractService.getByBooking(bookingId);
      if (updated) {
        setContract(updated);
        const signedNow = isOwner ? !!updated.ownerSignedAt : !!updated.renterSignedAt;
        if (signedNow) {
          toast.success('Contract status updated', 'DocuSeal signature has been recorded in LuxeWay.');
        } else {
          toast.info('Still waiting', 'Complete the DocuSeal signing flow, then refresh again.');
        }
      }
    } catch (error: any) {
      toast.error('Refresh failed', error?.message || 'Unable to refresh DocuSeal status.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSign = async () => {
    if (!contract || !signature.trim()) {
      toast.error('Signature required', 'Enter your full name before signing.');
      return;
    }

    setSigning(true);
    try {
      const signed = await contractService.sign(contract.id, signature.trim());
      setContract(signed);
      toast.success('Contract signed', `${activeSignerLabel} has been recorded.`);
    } catch (error: any) {
      toast.error('Signing failed', error?.message || 'The contract could not be signed.');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-28 flex items-center justify-center ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Preparing digital contract...</p>
        </div>
      </div>
    );
  }

  if (!booking || !contract) {
    return (
      <div className={`min-h-screen pt-28 flex items-center justify-center px-4 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-md w-full rounded-2xl border border-red-200/40 bg-white dark:bg-slate-900 p-8 text-center shadow-xl">
          <FileSignature className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-black mb-2">Contract not available</h1>
          <p className="text-sm text-slate-500 mb-6">The booking could not be loaded for electronic signing.</p>
          <button onClick={() => navigate('/dashboard/bookings')} className="btn-primary w-full py-3 justify-center">
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            {dct.back}
          </button>
          <Link to="/dashboard/bookings" className="text-xs font-black uppercase tracking-wider text-amber-600">
            {dct.myBookings}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <FileSignature className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{dct.agreementHeader}</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight">{dct.title}</h1>
                <p className="text-sm text-slate-500 mt-2">{dct.bookingCode} {booking.bookingCode || booking.id}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                contract.isFullySigned
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
              }`}>
                {statusText}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <Car className="w-5 h-5 text-amber-600 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dct.vehicleLabel}</p>
                  <p className="font-bold mt-1">{booking.vehicle?.brand} {booking.vehicle?.name}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <CalendarDays className="w-5 h-5 text-blue-600 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dct.rentalPeriodLabel}</p>
                  <p className="font-bold mt-1">{booking.startDate} {dct.to} {booking.endDate}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dct.totalPaymentLabel}</p>
                  <p className="font-bold mt-1">{formatCurrency(booking.pricing?.total || 0, language)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                <h2 className="font-display text-lg font-black mb-4">{dct.termsTitle}</h2>
                <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>{dct.term1}</p>
                  <p>{dct.term2}</p>
                  <p>{dct.term3}</p>
                  <p>{dct.term4}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SignatureStatus
                  title={dct.renter}
                  name={booking.renter?.displayName || booking.renter?.email || 'Renter account'}
                  signedAt={contract.renterSignedAt}
                  signature={contract.renterSignature}
                  signaturePendingText={dct.signaturePending}
                />
                <SignatureStatus
                  title={dct.owner}
                  name={(booking as any).owner?.displayName || (booking as any).owner?.email || 'Owner account'}
                  signedAt={contract.ownerSignedAt}
                  signature={contract.ownerSignature}
                  signaturePendingText={dct.signaturePending}
                />
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            {docusealEnabled && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden lg:hidden">
                <DocuSealFrame embedUrl={docusealEmbedUrl!} />
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <UserRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-sm">{dct.signAs} {isOwner ? dct.asOwner : dct.asRenter}</h2>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              {hasSigned ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-black text-sm">{dct.yourSigRecorded}</p>
                    <p className="text-xs opacity-80 mt-1">
                      {nextActionText}
                    </p>
                  </div>
                </div>
                  {renterCanPay && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10 p-4 space-y-3">
                      <div>
                        <p className="text-sm font-black text-amber-800 dark:text-amber-200">Choose your payment timing</p>
                        <p className="text-xs text-amber-700/80 dark:text-amber-200/75 mt-1">
                          Your renter signature is recorded. Pay now to submit this booking for review, or pay later from My Bookings.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/booking/${booking.id}/payment?method=${paymentMethod}`)}
                        className="btn-primary w-full py-3 justify-center inline-flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        {dct.payNow}
                      </button>
                      <button
                        onClick={() => {
                          toast.info('Payment saved for later', 'This booking remains in Waiting Payment. You can pay from My Bookings anytime before it expires.');
                          navigate('/dashboard/bookings');
                        }}
                        className="btn-outline w-full py-3 justify-center inline-flex items-center gap-2"
                      >
                        {dct.payLater}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {docusealEnabled ? (
                    <>
                      <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 p-4">
                        <p className="font-black text-sm">DocuSeal signing is ready</p>
                        <p className="text-xs mt-1 opacity-80">{nextActionText} After finishing in DocuSeal, refresh status here.</p>
                      </div>
                      <a
                        href={docusealEmbedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline w-full py-3 justify-center inline-flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open DocuSeal in new tab
                      </a>
                      <button
                        onClick={refreshContract}
                        disabled={refreshing}
                        className="btn-primary w-full py-3 justify-center inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'I signed, refresh status'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 p-4">
                        <p className="font-black text-sm">
                          {contract.docusealStatus === 'configuration_error' ? 'DocuSeal template needs signing fields' : dct.docusealNotConfiguredTitle}
                        </p>
                        <p className="text-xs mt-1 opacity-80">
                          {contract.docusealStatus === 'configuration_error'
                            ? 'The DocuSeal template/API is reachable, but no signer fields are available. Use LuxeWay local signing for this demo, then add fields in DocuSeal to enable embedded signing.'
                            : dct.docusealNotConfiguredDesc}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                          {dct.typeFullName}
                        </label>
                        <input
                          value={signature}
                          onChange={(event) => setSignature(event.target.value)}
                          className="lux-input w-full"
                          placeholder={dct.fullNamePlaceholder}
                        />
                      </div>
                      <button
                        onClick={handleSign}
                        disabled={signing || !signature.trim()}
                        className="btn-primary w-full py-3 justify-center disabled:opacity-50"
                      >
                        {signing ? dct.signingBtn : dct.signContractBtn}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="font-black text-sm mb-3">{dct.auditEvidenceTitle}</h3>
              <div className="space-y-3 text-xs text-slate-500">
                <p>{dct.contractIdLabel}: <span className="font-mono text-slate-800 dark:text-slate-200">#{contract.id}</span></p>
                {contract.docusealSubmissionId && (
                  <p>DocuSeal Submission: <span className="font-mono text-slate-800 dark:text-slate-200">#{contract.docusealSubmissionId}</span></p>
                )}
                <p>{dct.createdLabel}: <span className="font-mono text-slate-800 dark:text-slate-200">{contract.createdAt || 'N/A'}</span></p>
                <p>{dct.statusLabel}: <span className="font-black text-slate-800 dark:text-slate-200">{statusText}</span></p>
              </div>
            </div>
          </aside>
        </div>

        {docusealEnabled && (
          <section className="hidden lg:block mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <DocuSealFrame embedUrl={docusealEmbedUrl!} />
          </section>
        )}
      </div>
    </div>
  );
};

const DocuSealFrame: React.FC<{ embedUrl: string }> = ({ embedUrl }) => {
  useEffect(() => {
    const scriptId = 'docuseal-form-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdn.docuseal.com/js/form.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">DocuSeal embedded signing</p>
          <h2 className="font-display text-lg font-black mt-1">Sign the official rental contract</h2>
        </div>
        <a href={embedUrl} target="_blank" rel="noreferrer" className="btn-outline px-3 py-2 text-xs inline-flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Open
        </a>
      </div>
      <div className="min-h-[760px] bg-white">
        {React.createElement('docuseal-form', {
          'data-src': embedUrl,
          style: { display: 'block', width: '100%', minHeight: '760px' },
        })}
      </div>
    </div>
  );
};

const SignatureStatus: React.FC<{
  title: string;
  name: string;
  signedAt?: string | null;
  signature?: string | null;
  signaturePendingText?: string;
}> = ({ title, name, signedAt, signature, signaturePendingText = 'Signature pending' }) => {
  const signed = !!signedAt;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
          <p className="font-bold mt-1">{name}</p>
        </div>
        {signed ? <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <FileSignature className="w-5 h-5 text-slate-400 flex-shrink-0" />}
      </div>
      <div className={`mt-4 rounded-lg px-3 py-2 text-xs ${signed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-50 text-slate-500 dark:bg-slate-950'}`}>
        {signed ? (
          <>
            <p className="font-black">{signature}</p>
            <p className="mt-1 opacity-80">{signedAt}</p>
          </>
        ) : (
          <p className="font-bold">{signaturePendingText}</p>
        )}
      </div>
    </div>
  );
};

export default DigitalContractPage;
