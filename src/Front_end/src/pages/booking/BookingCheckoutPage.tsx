import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Shield, CreditCard, Loader2, ArrowRight, CheckCircle, Tag, MapPin, Sparkles, Star } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import type { Vehicle } from '@/types';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, resolveImageUrl } from '@/utils';

const getDemoDateRange = () => {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 2);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

const BookingCheckoutPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const lang = language || 'en';
  const isVi = lang === 'vi';

  const bkt: Record<string, string> = {
    pageTitle: { vi: 'Thông Tin Đặt Xe', ja: '予約チェックアウト', ko: '예약 결제', zh: '预订结账', fr: 'Confirmation de Réservation', de: 'Buchungs-Checkout', es: 'Pago de Reserva', en: 'Booking Checkout' }[lang] || 'Booking Checkout',
    preparingCheckout: { vi: 'Đang chuẩn bị thông tin thanh toán...', ja: 'チェックアウト情報を準備しています...', ko: '결제 정보를 준비하고 있습니다...', zh: '正在准备结账信息...', fr: 'Préparation des détails...', de: 'Checkout-Details werden vorbereitet...', es: 'Preparando los detalles...', en: 'Preparing checkout details...' }[lang] || 'Preparing checkout details...',
    vehicleNotFound: { vi: 'Không tìm thấy xe', ja: '車両が見つかりません', ko: '차량을 찾을 수 없습니다', zh: '未找到车辆', fr: 'Véhicule non trouvé', de: 'Fahrzeug nicht gefunden', es: 'Vehículo no encontrado', en: 'Vehicle Not Found' }[lang] || 'Vehicle Not Found',
    vehicleNotFoundDesc: { vi: 'Vui lòng chọn xe hợp lệ từ marketplace.', ja: 'マーケットプレイスから有効な車両を選択してください。', ko: '마켓플레이스에서 유효한 차량을 선택해주세요.', zh: '请从市场中选择一辆有效车辆。', fr: 'Veuillez sélectionner un véhicule valide.', de: 'Bitte wählen Sie ein gültiges Fahrzeug.', es: 'Seleccione un vehículo válido del marketplace.', en: 'Please select a valid vehicle from the marketplace.' }[lang] || 'Please select a valid vehicle from the marketplace.',
    backToMarketplace: { vi: 'Về Marketplace', ja: 'マーケットプレイスに戻る', ko: '마켓플레이스로 돌아가기', zh: '返回市场', fr: 'Retour au marketplace', de: 'Zurück zum Marktplatz', es: 'Volver al marketplace', en: 'Back to Marketplace' }[lang] || 'Back to Marketplace',
    invalidDateRange: { vi: 'Ngày thuê không hợp lệ', ja: '無効な日付範囲', ko: '잘못된 날짜 범위', zh: '无效日期范围', fr: 'Dates invalides', de: 'Ungültiger Datumsbereich', es: 'Rango de fechas no válido', en: 'Invalid Date Range' }[lang] || 'Invalid Date Range',
    invalidDateRangeDesc: { vi: 'Vui lòng chọn ngày nhận và trả xe hợp lệ trước.', ja: '有効な受取日と返却日を選択してください。', ko: '유효한 픽업 및 반납일을 선택해주세요.', zh: '请先选择有效的取车和还车日期。', fr: 'Veuillez sélectionner des dates valides.', de: 'Bitte wählen Sie gültige Abhol- und Rückgabedaten.', es: 'Seleccione fechas de recogida y devolución válidas.', en: 'Please select valid pick-up and return dates first.' }[lang] || 'Please select valid pick-up and return dates first.',
    goBackSelectDates: { vi: 'Quay lại chọn ngày', ja: '日付を選択し直す', ko: '날짜 선택으로 돌아가기', zh: '返回选择日期', fr: 'Retour pour sélectionner les dates', de: 'Zurück zur Datumsauswahl', es: 'Volver a seleccionar fechas', en: 'Go back and select dates' }[lang] || 'Go back and select dates',
    seats: { vi: 'chỗ', ja: '人乗り', ko: '인승', zh: '座', fr: 'places', de: 'Sitze', es: 'plazas', en: 'seats' }[lang] || 'seats',
    reviews: { vi: 'đánh giá', ja: '件のレビュー', ko: '리뷰', zh: '条评价', fr: 'avis', de: 'Bewertungen', es: 'reseñas', en: 'reviews' }[lang] || 'reviews',
    rentalDuration: { vi: 'Lịch trình thuê xe', ja: 'レンタル期間', ko: '대여 기간', zh: '租赁时长', fr: 'Durée de location', de: 'Mietdauer', es: 'Duración del alquiler', en: 'Rental Duration' }[lang] || 'Rental Duration',
    pickUp: { vi: 'NHẬN XE', ja: '受取日', ko: '픽업', zh: '取车', fr: 'DÉPART', de: 'ABHOLUNG', es: 'RECOGIDA', en: 'PICK-UP' }[lang] || 'PICK-UP',
    returnDate: { vi: 'TRẢ XE', ja: '返却日', ko: '반납', zh: '还车', fr: 'RETOUR', de: 'RÜCKGABE', es: 'DEVOLUCIÓN', en: 'RETURN' }[lang] || 'RETURN',
    totalDuration: { vi: 'Thời gian thuê:', ja: 'レンタル日数:', ko: '총 대여 기간:', zh: '总租赁时长:', fr: 'Durée totale :', de: 'Gesamtdauer:', es: 'Duración total:', en: 'Total Duration:' }[lang] || 'Total Duration:',
    days: { vi: 'ngày', ja: '日', ko: '일', zh: '天', fr: 'jours', de: 'Tage', es: 'días', en: 'days' }[lang] || 'days',
    weatherAdvisor: { vi: 'Dự báo thời tiết điểm đón xe', ja: '受取地点の天気予報', ko: '픽업 지점 날씨 예보', zh: '取车地点天气预报', fr: 'Prévisions météo au lieu de prise en charge', de: 'Wetterbericht am Abholort', es: 'Pronóstico del clima en el punto de recogida', en: 'Pick-up Weather Advisor' }[lang] || 'Pick-up Weather Advisor',
    today: { vi: 'Hôm nay', ja: '今日', ko: '오늘', zh: '今天', fr: "Aujourd'hui", de: 'Heute', es: 'Hoy', en: 'Today' }[lang] || 'Today',
    weatherRainWarning: { vi: 'Dự báo hôm nay có mưa lớn hoặc dông sét tại điểm nhận xe. Hãy lái xe cẩn thận và liên hệ trước với chủ xe để thống nhất phương án giao nhận.', ja: '本日、受取場所で大雨または雷雨が予想されます。安全運転を心がけ、ホストと受け渡し方法をご確認ください。', ko: '오늘 픽업 장소에 폭우 또는 뇌우가 예상됩니다. 안전 운전하시고 호스트와 인수 방법을 조율해 주세요.', zh: '今天取车地点预计有大雨或雷暴。请谨慎驾驶并与车主协调取车方式。', fr: 'Fortes pluies ou orage prévus au lieu de prise en charge. Soyez prudent.', de: 'Starker Regen oder Gewitter am Abholort erwartet. Bitte fahren Sie vorsichtig.', es: 'Se esperan fuertes lluvias o tormentas en el punto de recogida. Conduzca con precaución.', en: 'Heavy rain or storm is expected today at the pick-up location. Please drive carefully and coordinate delivery with the host.' }[lang] || 'Heavy rain or storm is expected today at the pick-up location. Please drive carefully and coordinate delivery with the host.',
    weatherGoodMsg: { vi: 'Thời tiết lý tưởng cho việc thuê xe tự lái. Hãy khởi hành vui vẻ và nhớ kiểm tra kỹ tình trạng xe trước khi nhận!', ja: 'ドライブに最適な天気です。素敵な旅をお楽しみください。出発前に車両をご確認ください！', ko: '드라이브에 이상적인 날씨입니다. 즐거운 여행 되세요! 출발 전 차량 상태를 확인해 주세요.', zh: '今天天气非常适合自驾出行。祝旅途愉快，出发前请检查车辆状况！', fr: 'Conditions météo idéales pour conduire. Bon voyage et inspectez le véhicule avant le départ !', de: 'Ideales Wetter zum Fahren. Gute Fahrt und überprüfen Sie das Fahrzeug vor der Abfahrt!', es: 'Condiciones climáticas ideales para conducir. ¡Buen viaje y revise el vehículo antes de partir!', en: 'Ideal weather conditions for a drive. Have a wonderful trip and remember to inspect the vehicle prior to acceptance!' }[lang] || 'Ideal weather conditions for a drive. Have a wonderful trip and remember to inspect the vehicle prior to acceptance!',
    weatherUnavailable: { vi: 'Không thể tải dự báo thời tiết.', ja: '天気予報を取得できませんでした。', ko: '날씨 예보를 불러올 수 없습니다.', zh: '无法加载天气预报。', fr: 'Prévisions météo indisponibles.', de: 'Wettervorhersage nicht verfügbar.', es: 'Pronóstico del tiempo no disponible.', en: 'Weather forecast unavailable.' }[lang] || 'Weather forecast unavailable.',
    exchangeAdvisor: { vi: 'Tỷ giá thanh toán (Quy đổi ước tính)', ja: '国際決済アドバイザー', ko: '국제 결제 환율 안내', zh: '国际支付换算顾问', fr: 'Conseiller de paiement international', de: 'Internationaler Zahlungsberater', es: 'Asesor de pago internacional', en: 'International Payment Advisor' }[lang] || 'International Payment Advisor',
    exchangeDesc: { vi: 'Dành cho khách quốc tế, tổng giá trị đặt xe quy đổi sang các ngoại tệ phổ biến dựa trên tỷ giá trực tiếp:', ja: '海外カードをご利用の場合、リアルタイム為替レートに基づく概算換算額は以下の通りです：', ko: '해외 카드 사용 시, 실시간 환율 기준 예상 환산 금액은 다음과 같습니다:', zh: '对于国际银行卡，以下是根据实时汇率的预估折算金额：', fr: 'Pour les cartes internationales, les taux de conversion estimés sont :', de: 'Für internationale Karten, die geschätzten Umrechnungskurse:', es: 'Para tarjetas internacionales, las tasas de conversión estimadas son:', en: 'For international cards, the estimated total converted rates based on live mid-market rates are:' }[lang] || 'For international cards, the estimated total converted rates based on live mid-market rates are:',
    exchangeUnavailable: { vi: 'Không thể tải tỷ giá tiền tệ.', ja: '為替レートを取得できませんでした。', ko: '환율 정보를 불러올 수 없습니다.', zh: '无法加载汇率。', fr: 'Taux de change indisponibles.', de: 'Wechselkurse nicht verfügbar.', es: 'Tasas de cambio no disponibles.', en: 'Exchange rates unavailable.' }[lang] || 'Exchange rates unavailable.',
    deliveryAddress: { vi: 'Địa chỉ giao xe tận nơi', ja: '配車先住所', ko: '배달 주소', zh: '送车地址', fr: 'Adresse de livraison', de: 'Lieferadresse', es: 'Dirección de entrega', en: 'Delivery Address' }[lang] || 'Delivery Address',
    deliveryPlaceholder: { vi: 'Nhập địa chỉ giao xe chi tiết...', ja: '配車先の住所を入力...', ko: '배달 주소를 입력하세요...', zh: '输入详细的送车地址...', fr: 'Entrez votre adresse de livraison...', de: 'Ihre Lieferadresse eingeben...', es: 'Ingrese su dirección de entrega...', en: 'Enter your specific address for delivery...' }[lang] || 'Enter your specific address for delivery...',
    notesForHost: { vi: 'Ghi chú cho chủ xe (Tùy chọn)', ja: 'ホストへのメモ（任意）', ko: '호스트에게 메모 (선택사항)', zh: '给车主的备注（可选）', fr: 'Notes pour le propriétaire (Optionnel)', de: 'Notizen an den Gastgeber (Optional)', es: 'Notas para el anfitrión (Opcional)', en: 'Notes for Host (Optional)' }[lang] || 'Notes for Host (Optional)',
    notesPlaceholder: { vi: 'Lời nhắn, yêu cầu giao xe hoặc lưu ý khi sử dụng xe...', ja: '指示、受取の詳細、運転時の注意事項...', ko: '안내사항, 픽업 세부사항 또는 운전 시 참고사항...', zh: '备注、取车说明或驾驶注意事项...', fr: 'Instructions ou notes pour la conduite...', de: 'Anweisungen, Abholdetails oder Hinweise...', es: 'Instrucciones, detalles de recogida o notas...', en: 'Instructions, pick-up details or notes when driving...' }[lang] || 'Instructions, pick-up details or notes when driving...',
    priceBreakdown: { vi: 'Chi tiết bảng giá', ja: '料金内訳', ko: '요금 상세', zh: '费用明细', fr: 'Détail des prix', de: 'Preisübersicht', es: 'Desglose de precios', en: 'Price Breakdown' }[lang] || 'Price Breakdown',
    vehicleRent: { vi: 'Giá thuê xe', ja: 'レンタル料金', ko: '차량 대여비', zh: '车辆租金', fr: 'Location du véhicule', de: 'Fahrzeugmiete', es: 'Alquiler del vehículo', en: 'Vehicle Rent' }[lang] || 'Vehicle Rent',
    promoDiscount: { vi: 'Ưu đãi giảm giá', ja: 'プロモーション割引', ko: '프로모션 할인', zh: '促销折扣', fr: 'Réduction promotionnelle', de: 'Sonderrabatt', es: 'Descuento promocional', en: 'Special promo discount' }[lang] || 'Special promo discount',
    insurance: { vi: 'Phí bảo hiểm', ja: '保険料', ko: '보험료', zh: '保险费', fr: 'Assurance', de: 'Versicherung', es: 'Seguro', en: 'Insurance' }[lang] || 'Insurance',
    deliveryFee: { vi: 'Phí giao xe', ja: '配送料', ko: '배달비', zh: '送车费', fr: 'Frais de livraison', de: 'Liefergebühr', es: 'Cargo por entrega', en: 'Delivery fee' }[lang] || 'Delivery fee',
    serviceFee: { vi: 'Phí nền tảng', ja: 'サービス手数料', ko: '서비스 수수료', zh: '平台服务费', fr: 'Frais de service', de: 'Servicegebühr', es: 'Tarifa de servicio', en: 'Service fee' }[lang] || 'Service fee',
    taxesVat: { vi: 'Thuế VAT', ja: '税金・消費税', ko: '세금 및 부가세', zh: '税费（增值税）', fr: 'Taxes et TVA', de: 'Steuern & MwSt.', es: 'Impuestos e IVA', en: 'Taxes & VAT' }[lang] || 'Taxes & VAT',
    securityDeposit: { vi: 'Tiền đặt cọc thế chấp', ja: '保証金', ko: '보증금', zh: '押金', fr: 'Caution', de: 'Kaution', es: 'Depósito de seguridad', en: 'Security Deposit' }[lang] || 'Security Deposit',
    totalPrice: { vi: 'TỔNG CỘNG', ja: '合計金額', ko: '총 금액', zh: '总价', fr: 'PRIX TOTAL', de: 'GESAMTPREIS', es: 'PRECIO TOTAL', en: 'TOTAL PRICE' }[lang] || 'TOTAL PRICE',
    paymentMethod: { vi: 'Phương thức thanh toán', ja: 'お支払い方法', ko: '결제 수단', zh: '支付方式', fr: 'Mode de paiement', de: 'Zahlungsmethode', es: 'Método de pago', en: 'Payment method' }[lang] || 'Payment method',
    payosDesc: { vi: 'Ký hợp đồng xong sẽ chuyển sang cổng thanh toán PayOS.', ja: '契約署名後、PayOS決済ゲートウェイに移動します。', ko: '계약 서명 후 PayOS 결제 게이트웨이로 이동합니다.', zh: '签署合同后，将跳转到PayOS支付网关。', fr: "Après la signature du contrat, vous serez redirigé vers PayOS.", de: 'Nach Vertragsunterzeichnung weiter zum PayOS-Zahlungsgateway.', es: 'Tras firmar el contrato, continuará al portal de PayOS.', en: 'After signing the contract, continue to the PayOS gateway.' }[lang] || 'After signing the contract, continue to the PayOS gateway.',
    bankTransfer: { vi: 'Chuyển khoản ngân hàng', ja: '銀行振込', ko: '은행 송금', zh: '银行转账', fr: 'Virement bancaire', de: 'Banküberweisung', es: 'Transferencia bancaria', en: 'Bank transfer' }[lang] || 'Bank transfer',
    bankTransferDesc: { vi: 'Quét VietQR rồi gửi xác nhận cho admin duyệt.', ja: 'VietQRをスキャンし、手動で振込確認を提出してください。', ko: 'VietQR을 스캔한 후 수동 송금 확인을 제출하세요.', zh: '扫描VietQR，然后提交手动转账确认。', fr: 'Scannez VietQR puis soumettez la confirmation.', de: 'VietQR scannen und manuelle Bestätigung einreichen.', es: 'Escanee VietQR y envíe la confirmación manual.', en: 'Scan VietQR, then submit manual transfer confirmation.' }[lang] || 'Scan VietQR, then submit manual transfer confirmation.',
    submitting: { vi: 'ĐANG GỬI YÊU CẦU...', ja: 'リクエスト送信中...', ko: '요청 처리 중...', zh: '正在提交请求...', fr: 'ENVOI EN COURS...', de: 'ANFRAGE WIRD GESENDET...', es: 'ENVIANDO SOLICITUD...', en: 'SUBMITTING REQUEST...' }[lang] || 'SUBMITTING REQUEST...',
    confirmBook: { vi: 'XÁC NHẬN ĐẶT XE', ja: '予約を確定する', ko: '예약 확정', zh: '确认预订', fr: 'CONFIRMER LA RÉSERVATION', de: 'BUCHUNG BESTÄTIGEN', es: 'CONFIRMAR RESERVA', en: 'CONFIRM & BOOK' }[lang] || 'CONFIRM & BOOK',
    termsText: { vi: 'Bằng việc nhấp vào đặt xe, bạn đồng ý với Điều khoản Dịch vụ và Chính sách hủy chuyến của LuxeWay.', ja: 'この予約を確定することで、LuxeWayの利用規約とキャンセルポリシーに同意したものとみなされます。', ko: '이 요청을 확인하면 LuxeWay 서비스 약관 및 취소 정책에 동의하는 것입니다.', zh: '确认此请求即表示您同意LuxeWay的服务条款和取消政策。', fr: "En confirmant, vous acceptez les conditions d'utilisation et la politique d'annulation de LuxeWay.", de: 'Mit der Bestätigung stimmen Sie den AGB und der Stornierungsrichtlinie von LuxeWay zu.', es: 'Al confirmar, acepta los Términos de servicio y la Política de cancelación de LuxeWay.', en: 'By confirming this request, you agree to LuxeWay Terms of Service and Cancellation Policies.' }[lang] || 'By confirming this request, you agree to LuxeWay Terms of Service and Cancellation Policies.',
    // Weather labels
    sunny: { vi: 'Nắng ráo', ja: '晴れ', ko: '맑음', zh: '晴天', fr: 'Ensoleillé', de: 'Sonnig', es: 'Soleado', en: 'Sunny' }[lang] || 'Sunny',
    cloudy: { vi: 'Nhiều mây', ja: '曇り', ko: '흐림', zh: '多云', fr: 'Nuageux', de: 'Bewölkt', es: 'Nublado', en: 'Cloudy' }[lang] || 'Cloudy',
    foggy: { vi: 'Có sương mù', ja: '霧', ko: '안개', zh: '有雾', fr: 'Brumeux', de: 'Neblig', es: 'Neblinoso', en: 'Foggy' }[lang] || 'Foggy',
    rainy: { vi: 'Có mưa', ja: '雨', ko: '비', zh: '有雨', fr: 'Pluvieux', de: 'Regnerisch', es: 'Lluvioso', en: 'Rainy' }[lang] || 'Rainy',
    snowy: { vi: 'Có tuyết', ja: '雪', ko: '눈', zh: '有雪', fr: 'Neigeux', de: 'Schneereich', es: 'Nevado', en: 'Snowy' }[lang] || 'Snowy',
    stormy: { vi: 'Có dông sét', ja: '雷雨', ko: '폭풍', zh: '雷暴', fr: 'Orageux', de: 'Stürmisch', es: 'Tormentoso', en: 'Stormy' }[lang] || 'Stormy',
  };

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  
  const demoDates = getDemoDateRange();
  const [startDate, setStartDate] = useState(searchParams.get('start') || demoDates.start);
  const [endDate, setEndDate] = useState(searchParams.get('end') || demoDates.end);
  const [includeInsurance, setIncludeInsurance] = useState(searchParams.get('insurance') === 'true');
  const [includeDelivery, setIncludeDelivery] = useState(searchParams.get('delivery') === 'true');
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'payos' | 'bank_transfer'>(
    searchParams.get('method') === 'bank_transfer' ? 'bank_transfer' : 'payos'
  );

  // Live Weather & Currency Exchange Rates Integration
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  useEffect(() => {
    if (!vehicle) return;
    
    // Default coordinates or fallback based on DB values
    const lat = vehicle.location?.lat || 10.762;
    const lng = vehicle.location?.lng || 106.660;

    // Fetch live weather forecast from Open-Meteo API
    setWeatherLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
      .then(res => res.json())
      .then(data => {
        if (data && data.daily) {
          setWeather(data.daily);
        }
      })
      .catch(err => console.error('Error fetching weather:', err))
      .finally(() => setWeatherLoading(false));

    // Fetch live exchange rates base VND from open.er-api.com
    setRatesLoading(true);
    fetch('https://open.er-api.com/v6/latest/VND')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch(err => console.error('Error fetching exchange rates:', err))
      .finally(() => setRatesLoading(false));
  }, [vehicle]);

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return '☀️'; // Sunny/Clear
    if (code === 2 || code === 3) return '⛅'; // Partly Cloudy/Cloudy
    if (code === 45 || code === 48) return '🌫️'; // Foggy
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'; // Rainy
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️'; // Snowy
    if ([95, 96, 99].includes(code)) return '⛈️'; // Thunderstorm
    return '☁️';
  };

  const getWeatherLabel = (code: number) => {
    if (code === 0 || code === 1) return bkt.sunny;
    if (code === 2 || code === 3) return bkt.cloudy;
    if (code === 45 || code === 48) return bkt.foggy;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return bkt.rainy;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return bkt.snowy;
    if ([95, 96, 99].includes(code)) return bkt.stormy;
    return bkt.cloudy;
  };

  useEffect(() => {
    if (!vehicleId) return;
    
    setLoading(true);
    vehicleService.getVehicleDetail(vehicleId)
      .then(data => {
        if (data) {
          setVehicle(data);
        } else {
          toast.error('Error', isVi ? 'Không lấy được thông tin xe.' : 'Failed to fetch vehicle details.');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error', isVi ? 'Lỗi kết nối máy chủ.' : 'Failed to connect to backend.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [vehicleId, isVi]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">{bkt.preparingCheckout}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-card rounded-3xl border border-border shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{bkt.vehicleNotFound}</h2>
          <p className="text-slate-500 mb-6">{bkt.vehicleNotFoundDesc}</p>
          <button onClick={() => navigate('/marketplace')} className="w-full btn-primary py-3 rounded-xl font-bold">
            {bkt.backToMarketplace}
          </button>
        </div>
      </div>
    );
  }

  // Duration calculations
  const days = (startDate && endDate) 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (days === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-card rounded-3xl border border-border shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{bkt.invalidDateRange}</h2>
          <p className="text-slate-500 mb-6">{bkt.invalidDateRangeDesc}</p>
          <button onClick={() => navigate(`/vehicles/${vehicle.id}`)} className="w-full btn-primary py-3 rounded-xl font-bold">
            {bkt.goBackSelectDates}
          </button>
        </div>
      </div>
    );
  }

  // Pricing calculations
  const discountPercent = vehicle.discount ? Number(vehicle.discount) : 0;
  const rawBase = Number(vehicle.pricePerDay) * days;
  const discountAmt = Math.round(rawBase * (discountPercent / 100));
  const basePriceAfterDiscount = rawBase - discountAmt;
  const insuranceFee = includeInsurance ? Math.round(Number(vehicle.pricePerDay) * 0.15 * days) : 0;
  const deliveryFee = includeDelivery ? (Number(vehicle.deliveryFee) || 0) : 0;
  const serviceFee = Math.round(basePriceAfterDiscount * 0.12);
  const taxes = Math.round(basePriceAfterDiscount * 0.08);
  const totalCost = basePriceAfterDiscount + insuranceFee + deliveryFee + serviceFee + taxes;
  const deposit = Number(vehicle.deposit) || 0;

  // Handle final booking submission
  const handleSubmitBooking = async () => {
    if (includeDelivery && !deliveryAddress.trim()) {
      toast.warning(isVi ? 'Địa chỉ giao xe' : 'Delivery Address Required', isVi ? 'Vui lòng nhập địa chỉ nhận xe.' : 'Please enter the delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      // Mock structure matching BookingWizardState for bookingService.create method
      const wizardState: any = {
        vehicleId: vehicle.id,
        step: 3,
        startDate,
        endDate,
        includeInsurance,
        includeDelivery,
        deliveryAddress: includeDelivery ? deliveryAddress : '',
        pickupLocation: vehicle.location?.address || '',
        notes,
        couponCode: '',
        selectedAddons: [],
        paymentMethodId: '',
      };

      const booking = await bookingService.create(
        wizardState,
        user?.id || '',
        vehicle.vehicleType === 'motorbike' ? 'motorbike' : 'car'
      );

      if (booking && booking.id) {
        toast.success(isVi ? 'Đặt xe thành công' : 'Booking Created', isVi ? 'Đơn đặt xe đã được tạo. Vui lòng thanh toán.' : 'Booking created. Please make payment.');
        navigate(`/booking/${booking.id}/contract?method=${paymentMethod}`);
      } else {
        toast.error(isVi ? 'Đặt xe thất bại' : 'Submission failed', isVi ? 'Không khởi tạo được lịch trình.' : 'Failed to initialize booking.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(isVi ? 'Lỗi tạo lịch trình' : 'Submission Error', err.message || err.error || (isVi ? 'Có lỗi xảy ra khi gửi yêu cầu đặt xe.' : 'An error occurred while creating your booking.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        
        <h1 className="text-3xl font-display font-black text-foreground uppercase tracking-tight mb-8">
          {bkt.pageTitle}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT: Checkout Info Fields (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Vehicle Summary Box */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-24 h-16 rounded-2xl overflow-hidden border border-border bg-slate-100 flex-shrink-0">
                <img src={resolveImageUrl(vehicle.thumbnailUrl || vehicle.images?.[0])} alt={vehicle.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-foreground uppercase">{vehicle.brand} {vehicle.model}</h3>
                <p className="text-xs text-slate-400 capitalize">
                  {vehicle.specs?.transmission} · {vehicle.seatNumber} {bkt.seats} · {vehicle.specs?.fuelType}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-foreground">{vehicle.rating?.toFixed(1)}</span>
                  <span>({vehicle.totalReviews} {bkt.reviews})</span>
                </div>
              </div>
            </div>

            {/* Selected Booking Info */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground border-b border-border pb-2.5">{bkt.rentalDuration}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{bkt.pickUp}</p>
                  <p className="font-bold text-foreground">{startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{bkt.returnDate}</p>
                  <p className="font-bold text-foreground">{endDate}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-500">
                  {bkt.totalDuration} <span className="font-bold text-foreground">{days} {bkt.days}</span>
                </p>
              </div>
            </div>

            {/* Live Weather Forecast Advisory */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="text-lg">🌤️</span>
                  {bkt.weatherAdvisor}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                  {vehicle.location?.city || 'Vietnam'}
                </span>
              </div>
              
              {weatherLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : weather && weather.time ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {weather.time.slice(0, 3).map((timeStr: string, idx: number) => {
                      const maxTemp = weather.temperature_2m_max[idx];
                      const minTemp = weather.temperature_2m_min[idx];
                      const code = weather.weathercode[idx];
                      const date = new Date(timeStr);
                      const localeMap: Record<string, string> = { vi: 'vi-VN', ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', en: 'en-US' };
                      const dayLabel = idx === 0 
                        ? bkt.today 
                        : date.toLocaleDateString(localeMap[lang] || 'en-US', { weekday: 'short' });
                      
                      return (
                        <div key={timeStr} className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 text-center space-y-1">
                          <span className="text-2xl block">{getWeatherIcon(code)}</span>
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{dayLabel}</span>
                          <span className="text-xs font-black text-foreground block">{minTemp}° - {maxTemp}°C</span>
                          <span className="text-[10px] text-slate-450 font-medium block truncate">{getWeatherLabel(code)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-blue-600 dark:text-blue-400 leading-normal font-medium">
                    <span className="text-base mt-0.5">ℹ️</span>
                    <p>
                      {[51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.weathercode[0]) 
                        ? bkt.weatherRainWarning
                        : bkt.weatherGoodMsg}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-450 text-center">{bkt.weatherUnavailable}</p>
              )}
            </div>

            {/* Live Exchange Rate Advisor */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span className="text-lg">💱</span>
                  {bkt.exchangeAdvisor}
                </h3>
                <span className="text-[10px] text-slate-450 font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                  Base: VND
                </span>
              </div>
              
              {ratesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : exchangeRates ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-normal">
                    {bkt.exchangeDesc}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <span className="font-extrabold text-slate-400">💵 USD</span>
                      <span className="font-black text-foreground">${(totalCost * (exchangeRates.USD || 0.000039)).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <span className="font-extrabold text-slate-400">💶 EUR</span>
                      <span className="font-black text-foreground">€{(totalCost * (exchangeRates.EUR || 0.000036)).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <span className="font-extrabold text-slate-400">💴 JPY</span>
                      <span className="font-black text-foreground">¥{(totalCost * (exchangeRates.JPY || 0.0061)).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <span className="font-extrabold text-slate-400">🪙 SGD</span>
                      <span className="font-black text-foreground">S${(totalCost * (exchangeRates.SGD || 0.000053)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-450 text-center">{bkt.exchangeUnavailable}</p>
              )}
            </div>

            {/* Delivery address (if selected) */}
            {includeDelivery && (
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {bkt.deliveryAddress}
                </h3>
                <input 
                  type="text" 
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={bkt.deliveryPlaceholder}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3.5 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground">{bkt.notesForHost}</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={bkt.notesPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3.5 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
              />
            </div>

          </div>

          {/* RIGHT: Price breakdown & Submit Widget (1 col) */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-lg space-y-5">
              
              <h3 className="text-base font-bold text-foreground pb-2 border-b border-border">{bkt.priceBreakdown}</h3>
              
              <div className="text-xs space-y-3.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>{bkt.vehicleRent}</span>
                  <span className="font-bold text-foreground">{formatCurrency(rawBase, language)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>{bkt.promoDiscount}</span>
                    <span className="font-bold">-{formatCurrency(discountAmt, language)}</span>
                  </div>
                )}
                {includeInsurance && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{bkt.insurance}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(insuranceFee, language)}</span>
                  </div>
                )}
                {includeDelivery && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{bkt.deliveryFee}</span>
                    <span className="font-bold text-foreground">+{formatCurrency(deliveryFee, language)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{bkt.serviceFee} (12%)</span>
                  <span className="font-bold text-foreground">+{formatCurrency(serviceFee, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{bkt.taxesVat} (8%)</span>
                  <span className="font-bold text-foreground">+{formatCurrency(taxes, language)}</span>
                </div>

                {deposit > 0 && (
                  <div className="flex justify-between pt-2 text-amber-600">
                    <span>{bkt.securityDeposit}</span>
                    <span className="font-bold">{formatCurrency(deposit, language)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold pt-3 border-t border-dashed border-border">
                  <span className="text-foreground">{bkt.totalPrice}</span>
                  <span className="text-blue-500 font-display font-black">{formatCurrency(totalCost, language)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  {bkt.paymentMethod}
                </h4>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('payos')}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                      paymentMethod === 'payos'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                        : 'border-border bg-slate-50 text-slate-600 hover:border-blue-300 dark:bg-white/5 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm font-black">
                        <CreditCard className="w-4 h-4" />
                        PayOS online checkout
                      </span>
                      {paymentMethod === 'payos' && <CheckCircle className="w-4 h-4" />}
                    </span>
                    <span className="block mt-1 text-[11px] opacity-75">
                      {bkt.payosDesc}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                        : 'border-border bg-slate-50 text-slate-600 hover:border-amber-300 dark:bg-white/5 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm font-black">
                        <CreditCard className="w-4 h-4" />
                        {bkt.bankTransfer}
                      </span>
                      {paymentMethod === 'bank_transfer' && <CheckCircle className="w-4 h-4" />}
                    </span>
                    <span className="block mt-1 text-[11px] opacity-75">
                      {bkt.bankTransferDesc}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmitBooking}
                disabled={submitting}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-display font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {bkt.submitting}
                  </>
                ) : (
                  <>
                    {bkt.confirmBook}
                  </>
                )}
              </button>

              <div className="text-[10px] text-slate-450 leading-normal text-center pt-2">
                {bkt.termsText}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BookingCheckoutPage;
