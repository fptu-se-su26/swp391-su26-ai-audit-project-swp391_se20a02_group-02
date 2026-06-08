import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Shield, Zap, Gauge, Users, ChevronLeft, ChevronRight,
  Heart, Share2, Clock, Check, Car, ArrowRight, X, Loader2, Calendar,
  ShieldCheck, AlertCircle, Award, Info, FileText, CheckCircle2,
  Navigation, UserCircle, Briefcase, HeartIcon, Plane, Sparkles, Play, Video
} from 'lucide-react';
import { carService } from '@/services/carService';
import { reviewService } from '@/services/otherServices';
import type { Vehicle, Review } from '@/types';
import { useVehicleStore, useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, getRatingLabel, cn } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import { VehicleMap } from '@/components/map/VehicleMap';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000';

const MOCK_360_IMAGES = [
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000',
];

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    backToList: "Back to Cars Fleet",
    about: "About this Car",
    features: "Features & Amenities",
    insurance: "Insurance & Protection",
    requirements: "Rental Requirements",
    calendar: "Availability Calendar",
    map: "Location & Pickup Map",
    owner: "Owner Credibility",
    reviews: "Renter Reviews",
    similar: "Similar Cars You May Like",
    book: "Book Experience",
    instantBook: "Instant Book",
    requestToBook: "Request to Book",
    selectDates: "Select your dates",
    pickup: "Pick-up",
    return: "Return",
    delivery: "Requested Delivery",
    deliveryAddress: "Enter delivery address...",
    basePrice: "Base Price",
    serviceFee: "LuxeWay Service Fee",
    taxes: "Taxes & VAT",
    insuranceFee: "Protection Plan",
    total: "Total Cost",
    deposit: "Refundable Security Deposit",
    coupon: "Apply Coupon",
    apply: "Apply",
    saved: "Saved",
    wishlist: "Wishlist",
    share: "Share",
    compare: "Compare",
    comparing: "Added to Compare",
    loading: "Loading car details...",
    noDescription: "No description available for this premium car.",
    hdVideo: "HD Walkaround Video",
    threeSixty: "360° Exterior Rotator",
    panoramic: "Interior Virtual Tour",
    verifiedHost: "Identity Verified Host",
    superhost: "Super Host",
    responseRate: "Response Rate",
    responseTime: "Response Time",
    rating: "Host Rating",
    days: "Days",
    freeCancel: "Free cancellation up to 48 hours before pickup",
    damageCover: "100% damage cover options available at checkout",
    hours: "hours",
    noReviews: "No reviews yet for this vehicle.",
    viewVehicle: "View Car",
    weeklyDiscount: "Weekly Discount",
    weekendMarkup: "Weekend markup (+15%)",
    activeViewers: "other travelers are viewing this car",
    recentlyBooked: "Recently Booked 4 times in this area this week."
  },
  vi: {
    backToList: "Quay lại danh sách xe hơi",
    about: "Thông tin chi tiết xe",
    features: "Tính năng & Tiện nghi",
    insurance: "Bảo hiểm & Bảo vệ",
    requirements: "Yêu cầu thuê xe",
    calendar: "Lịch trống khả dụng",
    map: "Bản đồ & Giao nhận xe",
    owner: "Hồ sơ chủ xe",
    reviews: "Đánh giá từ khách hàng",
    similar: "Xe tương tự có thể bạn thích",
    book: "Tiến hành đặt xe",
    instantBook: "Đặt ngay",
    requestToBook: "Yêu cầu đặt xe",
    selectDates: "Chọn ngày đặt xe",
    pickup: "Nhận xe",
    return: "Trả xe",
    delivery: "Giao xe tận nơi",
    deliveryAddress: "Nhập địa chỉ giao xe...",
    basePrice: "Giá thuê cơ bản",
    serviceFee: "Phí dịch vụ LuxeWay",
    taxes: "Thuế VAT & Phí",
    insuranceFee: "Gói bảo hiểm bảo vệ",
    total: "Tổng chi phí",
    deposit: "Tiền đặt cọc thế chấp (reembolsable)",
    coupon: "Áp dụng mã giảm giá",
    apply: "Áp dụng",
    saved: "Đã lưu",
    wishlist: "Yêu thích",
    share: "Chia sẻ",
    compare: "So sánh",
    comparing: "Đã thêm vào so sánh",
    loading: "Đang tải thông tin xe...",
    noDescription: "Không có mô tả chi tiết cho chiếc xe này.",
    hdVideo: "Video cận cảnh thực tế",
    threeSixty: "Góc nhìn xoay 360°",
    panoramic: "Tour thực tế ảo nội thất",
    verifiedHost: "Chủ xe đã xác minh danh tính",
    superhost: "Chủ xe ưu tú",
    responseRate: "Tỷ lệ phản hồi",
    responseTime: "Thời gian phản hồi",
    rating: "Điểm đánh giá chủ xe",
    days: "Ngày",
    freeCancel: "Hủy miễn phí lên đến 48 giờ trước khi nhận xe",
    damageCover: "Hỗ trợ bảo vệ hư hại 100% khi thanh toán",
    hours: "giờ",
    noReviews: "Chưa có đánh giá nào cho chiếc xe này.",
    viewVehicle: "Xem xe",
    weeklyDiscount: "Chiết khấu thuê tuần",
    weekendMarkup: "Giá tăng cuối tuần (+15%)",
    activeViewers: "khách du lịch khác đang xem xe này",
    recentlyBooked: "Được đặt 4 lần gần đây trong khu vực tuần này."
  },
  ja: {
    backToList: "車両一覧に戻る",
    about: "車両情報",
    features: "装備とアメニティ",
    insurance: "保険と保護",
    requirements: "レンタル要件",
    calendar: "空車カレンダー",
    map: "位置と受け取りマップ",
    owner: "オーナーの信頼性",
    reviews: "レンターのレビュー",
    similar: "おすすめの同等車両",
    book: "予約手続きに進む",
    instantBook: "即時予約",
    requestToBook: "予約をリクエスト",
    selectDates: "日程を選択",
    pickup: "受け取り",
    return: "返却",
    delivery: "デリバリーを希望する",
    deliveryAddress: "配達先住所を入力してください...",
    basePrice: "基本料金",
    serviceFee: "LuxeWayサービス料",
    taxes: "税金と消費税",
    insuranceFee: "プロテクションプラン",
    total: "合計金額",
    deposit: "保証金（返金可能）",
    coupon: "クーポンを適用する",
    apply: "適用",
    saved: "保存済み",
    wishlist: "お気に入り",
    share: "共有",
    compare: "比較",
    comparing: "比較リストに追加されました",
    loading: "車両詳細を読み込み中...",
    noDescription: "この車両の詳細説明はありません。",
    hdVideo: "HDウォークアラウンドビデオ",
    threeSixty: "360°外観ビューア",
    panoramic: "内装バーチャルツアー",
    verifiedHost: "身元確認済みのホスト",
    superhost: "スーパーホスト",
    responseRate: "返信率",
    responseTime: "返答時間",
    rating: "ホストの評価",
    days: "日",
    freeCancel: "受け取り of 48時間前までキャンセル無料",
    damageCover: "チェックアウト時に100%の損害補償オプションが利用可能",
    hours: "時間",
    noReviews: "この車両に対するレビューはまだありません。",
    viewVehicle: "詳細を見る",
    weeklyDiscount: "週割引",
    weekendMarkup: "週末料金 (+15%)",
    activeViewers: "人の旅行者がこの車両を閲覧しています",
    recentlyBooked: "このエリアで今週すでに4回予約されています。"
  },
  ko: {
    backToList: "차량 목록으로 돌아가기",
    about: "차량 상세 정보",
    features: "기능 및 편의 장치",
    insurance: "보험 및 보장 범위",
    requirements: "대여 자격 요건",
    calendar: "대여 가능 달력",
    map: "위치 및 인수 지도",
    owner: "호스트 신뢰도",
    reviews: "고객 이용 후기",
    similar: "이런 차량은 어떠세요?",
    book: "예약하기",
    instantBook: "즉시 예약",
    requestToBook: "예약 요청",
    selectDates: "날짜 선택",
    pickup: "인수",
    return: "반납",
    delivery: "차량 배송 요청",
    deliveryAddress: "배송 주소 입력...",
    basePrice: "기본 대여료",
    serviceFee: "LuxeWay 서비스 수수료",
    taxes: "세금 및 부가세",
    insuranceFee: "보장 계획 요금",
    total: "총 결제 금액",
    deposit: "보증금 (반환 가능)",
    coupon: "쿠폰 적용",
    apply: "적용",
    saved: "저장됨",
    wishlist: "위시리스트",
    share: "공유",
    compare: "비교",
    comparing: "비교 목록에 추가됨",
    loading: "차량 정보를 불러오는 중...",
    noDescription: "이 프리미엄 차량에 대한 설명이 없습니다.",
    hdVideo: "HD 둘러보기 동영상",
    threeSixty: "360° 외관 뷰어",
    panoramic: "내부 가상 투어",
    verifiedHost: "신원 확인된 호스트",
    superhost: "슈퍼호스트",
    responseRate: "응답률",
    responseTime: "응답 시간",
    rating: "호스트 평점",
    days: "일",
    freeCancel: "인수 48시간 전까지 무료 취소 가능",
    damageCover: "결제 시 100% 손상 면책 옵션 선택 가능",
    hours: "시간",
    noReviews: "이 차량에 대한 후기가 아직 없습니다.",
    viewVehicle: "차량 보기",
    weeklyDiscount: "주간 할인",
    weekendMarkup: "주말 할증 (+15%)",
    activeViewers: "명의 여행자가 이 차량을 보고 있습니다",
    recentlyBooked: "이번 주 이 지역에서 4회 최근 예약되었습니다."
  },
  zh: {
    backToList: "返回车型列表",
    about: "车辆详情",
    features: "配置与服务",
    insurance: "保险与保障计划",
    requirements: "租车资格要求",
    calendar: "空车日历",
    map: "位置与取车地图",
    owner: "车主信用度",
    reviews: "租客评价",
    similar: "为您推荐的相似车型",
    book: "立即预订",
    instantBook: "闪电预订",
    requestToBook: "申请预订",
    selectDates: "选择租赁日期",
    pickup: "取车",
    return: "还车",
    delivery: "送车上门服务",
    deliveryAddress: "输入送车地址...",
    basePrice: "基础租金",
    serviceFee: "LuxeWay 平台服务费",
    taxes: "税费与增值税",
    insuranceFee: "保险保障费用",
    total: "总计费用",
    deposit: "安全押金（可退）",
    coupon: "使用优惠券",
    apply: "应用",
    saved: "已保存",
    wishlist: "心愿单",
    share: "分享",
    compare: "对比",
    comparing: "已加入对比",
    loading: "车辆详情加载中...",
    noDescription: "暂无此豪华车辆的详细描述。",
    hdVideo: "高清实车展示视频",
    threeSixty: "360° 外观展示",
    panoramic: "内饰虚拟体验",
    verifiedHost: "已实名认证车主",
    superhost: "超赞车主",
    responseRate: "回复率",
    responseTime: "回复时间",
    rating: "车主评分",
    days: "天",
    freeCancel: "取车前48小时内可免费取消",
    damageCover: "结账时可选100%全额车损险",
    hours: "小时",
    noReviews: "该车辆暂无租客评价。",
    viewVehicle: "查看车辆",
    weeklyDiscount: "周租优惠",
    weekendMarkup: "周末价格浮动 (+15%)",
    activeViewers: "名游客正在浏览该车型",
    recentlyBooked: "本周该区域已成功预订 4 次。"
  },
  fr: {
    backToList: "Retour aux voitures",
    about: "À propos de ce véhicule",
    features: "Équipements & Options",
    insurance: "Assurance & Protection",
    requirements: "Conditions de location",
    calendar: "Calendrier des disponibilités",
    map: "Emplacement & Carte de retrait",
    owner: "Crédibilité du propriétaire",
    reviews: "Avis des locataires",
    similar: "Véhicules similaires",
    book: "Réserver l'expérience",
    instantBook: "Réservation instantanée",
    requestToBook: "Demande de réservation",
    selectDates: "Sélectionnez vos dates",
    pickup: "Départ",
    return: "Retour",
    delivery: "Livraison demandée",
    deliveryAddress: "Saisir l'adresse de livraison...",
    basePrice: "Prix de base",
    serviceFee: "Frais de service LuxeWay",
    taxes: "Taxes & TVA",
    insuranceFee: "Plan de protection",
    total: "Coût Total",
    deposit: "Dépôt de garantie (remboursable)",
    coupon: "Appliquer un coupon",
    apply: "Appliquer",
    saved: "Enregistré",
    wishlist: "Favoris",
    share: "Partager",
    compare: "Comparer",
    comparing: "Ajouté au comparateur",
    loading: "Chargement des détails...",
    noDescription: "Aucune description disponible pour cette voiture.",
    hdVideo: "Vidéo de présentation HD",
    threeSixty: "Rotateur extérieur 360°",
    panoramic: "Visite virtuelle intérieure",
    verifiedHost: "Hôte d'identité vérifié",
    superhost: "Super Hôte",
    responseRate: "Taux de réponse",
    responseTime: "Délai de réponse",
    rating: "Évaluation de l'hôte",
    days: "Jours",
    freeCancel: "Annulation gratuite jusqu'à 48h avant le départ",
    damageCover: "Options de couverture de dommages à 100% disponibles",
    hours: "heures",
    noReviews: "Aucun avis pour le moment.",
    viewVehicle: "Voir le véhicule",
    weeklyDiscount: "Remise hebdomadaire",
    weekendMarkup: "Majoration de week-end (+15%)",
    activeViewers: "autres voyageurs consultent cette voiture",
    recentlyBooked: "Récemment réservé 4 fois dans cette zone cette semaine."
  },
  de: {
    backToList: "Zurück zur Flotte",
    about: "Über dieses Auto",
    features: "Features & Annehmlichkeiten",
    insurance: "Versicherung & Schutz",
    requirements: "Mietbedingungen",
    calendar: "Verfügbarkeitskalender",
    map: "Standort & Abholungskarte",
    owner: "Vermieter-Bewertungen",
    reviews: "Kundenbewertungen",
    similar: "Ähnliche Autos, die Ihnen gefallen könnten",
    book: "Erlebnis buchen",
    instantBook: "Sofortbuchung",
    requestToBook: "Buchung anfragen",
    selectDates: "Daten auswählen",
    pickup: "Abholung",
    return: "Rückgabe",
    delivery: "Gewünschte Lieferung",
    deliveryAddress: "Lieferadresse eingeben...",
    basePrice: "Grundpreis",
    serviceFee: "Servicegebühr",
    taxes: "Steuern & MwSt.",
    insuranceFee: "Schutzplan",
    total: "Gesamtkosten",
    deposit: "Kaution (rückerstattbar)",
    coupon: "Gutschein anwenden",
    apply: "Anwenden",
    saved: "Gespeichert",
    wishlist: "Wunschliste",
    share: "Teilen",
    compare: "Vergleichen",
    comparing: "Zum Vergleich hinzugefügt",
    loading: "Lade Details...",
    noDescription: "Keine Beschreibung für dieses Premium-Fahrzeug vorhanden.",
    hdVideo: "HD-Walkaround-Video",
    threeSixty: "360° Außenansicht",
    panoramic: "Innenraum-Virtual Tour",
    verifiedHost: "Verifizierter Vermieter",
    superhost: "Super Host",
    responseRate: "Antwortrate",
    responseTime: "Antwortzeit",
    rating: "Host-Rating",
    days: "Tage",
    freeCancel: "Kostenlose Stornierung bis zu 48 Std. vor Abholung",
    damageCover: "100% Schadensabdeckung beim Checkout wählbar",
    hours: "Stunden",
    noReviews: "Noch keine Bewertungen vorhanden.",
    viewVehicle: "Fahrzeug anzeigen",
    weeklyDiscount: "Wochenrabatt",
    weekendMarkup: "Wochenendaufschlag (+15%)",
    activeViewers: "andere Reisende sehen sich dieses Auto an",
    recentlyBooked: "Kürzlich diese Woche 4 Mal in dieser Region gebucht."
  },
  es: {
    backToList: "Volver a la Flota de Autos",
    about: "Acerca de este Auto",
    features: "Características y Servicios",
    insurance: "Seguro y Protección",
    requirements: "Requisitos de Alquiler",
    calendar: "Calendario de Disponibilidad",
    map: "Mapa de Ubicación y Entrega",
    owner: "Credibilidad del Propietario",
    reviews: "Reseñas de Locatarios",
    similar: "Autos Similares que te Pueden Gustar",
    book: "Reservar Experiencia",
    instantBook: "Reserva Instantánea",
    requestToBook: "Solicitar Reserva",
    selectDates: "Seleccione sus fechas",
    pickup: "Recogida",
    return: "Devolución",
    delivery: "Entrega Solicitada",
    deliveryAddress: "Ingrese la dirección de entrega...",
    basePrice: "Precio Base",
    serviceFee: "Tarifa de Servicio LuxeWay",
    taxes: "Impuestos e IVA",
    insuranceFee: "Plan de Protección",
    total: "Costo Total",
    deposit: "Depósito de Seguridad (reembolsable)",
    coupon: "Aplicar Cupón",
    apply: "Aplicar",
    saved: "Guardado",
    wishlist: "Lista de Deseos",
    share: "Compartir",
    compare: "Comparar",
    comparing: "Añadido a Comparación",
    loading: "Cargando detalles del auto...",
    noDescription: "No hay descripción disponible para este auto premium.",
    hdVideo: "Video de Presentación HD",
    threeSixty: "Rotador Exterior 360°",
    panoramic: "Tour Virtual Interior",
    verifiedHost: "Anfitrión con Identidad Verificada",
    superhost: "Super Anfitrión",
    responseRate: "Tasa de Respuesta",
    responseTime: "Tiempo de Respuesta",
    rating: "Calificación del Anfitrión",
    days: "Días",
    freeCancel: "Cancelación gratuita hasta 48 horas antes de la recogida",
    damageCover: "Cobertura de daños al 100% disponible al pagar",
    hours: "horas",
    noReviews: "Aún no hay reseñas para este vehículo.",
    viewVehicle: "Ver Auto",
    weeklyDiscount: "Descuento Semanal",
    weekendMarkup: "Recargo de fin de semana (+15%)",
    activeViewers: "otros viajeros están viendo este auto",
    recentlyBooked: "Recientemente reservado 4 veces en esta zona esta semana."
  }
};

export const CarDetails: React.FC = () => {
  const { language } = useUIStore();
  const langKey = (LOCAL_TRANSLATIONS[language] ? language : 'en') as string;
  const tLocal = LOCAL_TRANSLATIONS[langKey];

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, addToWishlist, removeFromWishlist, addRecentlyViewed, compareList, addToCompare, removeFromCompare } = useVehicleStore();
  const toast = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageTab, setActiveImageTab] = useState<'all' | '360' | 'video' | 'tour'>('all');
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Date and Calculation States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryRequested, setDeliveryRequested] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [insuranceTier, setInsuranceTier] = useState<'basic' | 'premium' | 'zero'>('premium');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Car Packages Options
  const [chauffeurRequested, setChauffeurRequested] = useState(false);
  const [weddingPackageRequested, setWeddingPackageRequested] = useState(false);
  const [businessPackageRequested, setBusinessPackageRequested] = useState(false);

  // 360 Rotation Simulation States
  const [rotationIndex, setRotationIndex] = useState(0);
  const rotationDragStart = useRef(0);
  const [isRotating, setIsRotating] = useState(false);

  // Virtual Tour panorama state
  const [panPosition, setPanPosition] = useState(50);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(0);

  const [activeReviewTab, setActiveReviewTab] = useState<'vehicle' | 'owner'>('vehicle');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [similarCars, setSimilarCars] = useState<Vehicle[]>([]);
  const [simulatedViewers, setSimulatedViewers] = useState(5);

  const wishlisted = vehicle ? isWishlisted(vehicle.id) : false;
  const isCompared = vehicle ? compareList.includes(vehicle.id) : false;

  // Viewers Count simulation
  useEffect(() => {
    setSimulatedViewers(Math.floor(Math.random() * 6) + 3);
    const interval = setInterval(() => {
      setSimulatedViewers(Math.floor(Math.random() * 6) + 3);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // SEO & Schema JSON-LD injection
  useEffect(() => {
    if (!vehicle) return;

    // SEO title & description
    document.title = `${vehicle.name} | LuxeWay Premium Rentals`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', vehicle.description || `Rent this premium ${vehicle.name} on LuxeWay.`);
    }

    // JSON-LD Schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": vehicle.name,
      "image": vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.thumbnailUrl || FALLBACK_IMAGE],
      "description": vehicle.description || "Premium car rental",
      "brand": {
        "@type": "Brand",
        "name": vehicle.brand || "LuxeWay"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "VND",
        "price": vehicle.pricePerDay,
        "itemCondition": "https://schema.org/UsedCondition",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": vehicle.rating || 5.0,
        "reviewCount": vehicle.totalReviews || 1
      }
    };

    const scriptId = 'json-ld-car-schema';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.innerHTML = JSON.stringify(schema);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [vehicle]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      carService.getById(id),
      reviewService.getByVehicle(id),
    ]).then(([v, r]) => {
      if (v) {
        setVehicle(v);
        addRecentlyViewed(v.id);

        // Load similar cars in the same city
        carService.getAll({ location: v.location.city }).then(res => {
          const filtered = (res.data || [])
            .filter(item => item.id !== v.id && item.vehicleType === 'car')
            .slice(0, 3);
          setSimilarCars(filtered);
        });

        // Generate client-side reviews if empty but totalReviews > 0
        if (r.length === 0 && v.totalReviews > 0) {
          const names = ['John Doe', 'Alice Smith', 'David Miller', 'Sophia Johnson'];
          const comments = [
            'Excellent performance, clean interior, and very helpful owner.',
            'Amazing trip! The car was delivered in pristine condition and full tank.',
            'Highly professional service, modern vehicle, very comfortable.',
            'Great rates, simple check-in and check-out. Strongly recommend!'
          ];
          const generated: Review[] = Array.from({ length: v.totalReviews }).map((_, i) => ({
            id: `gen-rev-${i}`,
            vehicleId: v.id,
            bookingId: `bk-${i}`,
            reviewerId: `u-${i}`,
            ownerId: v.ownerId,
            reviewer: {
              id: `u-${i}`,
              displayName: names[i % names.length],
              avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?auto=format&fit=crop&q=80&w=100`,
            },
            rating: Math.floor(v.rating) + (i % 2 === 0 ? 0.5 : 0),
            cleanliness: 5,
            accuracy: 5,
            communication: 5,
            value: 4.8,
            comment: comments[i % comments.length],
            photos: [],
            helpful: i * 2 + 1,
            createdAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
          }));
          setReviews(generated);
        } else {
          setReviews(r);
        }
      }
      setLoading(false);
    });
  }, [id]);

  const days = startDate && endDate ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) : 1;

  // Real-time Pricing engine supporting weekend/seasonal surcharges
  const weekendMultiplier = 1.15;
  const seasonalMultiplier = 1.10;

  let baseDailyRate = vehicle ? vehicle.pricePerDay : 0;
  baseDailyRate = Math.round(baseDailyRate * seasonalMultiplier);

  let basePrice = 0;
  if (startDate && endDate && vehicle) {
    let curr = new Date(startDate);
    const endLimit = new Date(endDate);
    while (curr <= endLimit) {
      const day = curr.getDay();
      const isWeekend = day === 0 || day === 6; // Sunday or Saturday
      basePrice += baseDailyRate * (isWeekend ? weekendMultiplier : 1);
      curr.setDate(curr.getDate() + 1);
    }
  } else {
    basePrice = baseDailyRate * days;
  }

  const deliveryFee = deliveryRequested && vehicle ? vehicle.deliveryFee || 200000 : 0;
  const chauffeurFee = chauffeurRequested ? 500000 * days : 0;
  const weddingFee = weddingPackageRequested ? 1500000 : 0;
  const businessDiscount = businessPackageRequested ? Math.round(basePrice * 0.1) : 0;

  const insuranceFee = vehicle
    ? insuranceTier === 'premium'
      ? Math.round(vehicle.pricePerDay * 0.15 * days)
      : insuranceTier === 'zero'
        ? Math.round(vehicle.pricePerDay * 0.25 * days)
        : 0
    : 0;

  const serviceFee = Math.round(basePrice * 0.12);
  const taxes = Math.round(basePrice * 0.08);
  const subtotal = basePrice + deliveryFee + chauffeurFee + weddingFee + insuranceFee + serviceFee + taxes - businessDiscount;
  const totalCost = subtotal - (couponApplied ? Math.round(subtotal * couponDiscount) : 0);

  const handleBookingRedirect = () => {
    if (!isAuthenticated) {
      toast.warning('Authentication Required', 'Please log in to complete your booking.');
      navigate('/auth/login');
      return;
    }
    if (!startDate || !endDate) {
      toast.warning('Select dates', 'Please choose pick-up and return dates.');
      return;
    }
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
        insurance: insuranceTier,
        delivery: deliveryRequested ? 'true' : 'false',
        chauffeur: chauffeurRequested ? 'true' : 'false',
        wedding: weddingPackageRequested ? 'true' : 'false',
        business: businessPackageRequested ? 'true' : 'false',
        coupon: couponApplied ? couponCode : ''
      });
      navigate(`/booking/${vehicle?.id}?${params.toString()}`);
    }, 1000);
  };

  const handleWishlistToggle = () => {
    if (!vehicle) return;
    if (wishlisted) {
      removeFromWishlist(vehicle.id);
      toast.info('Removed', 'Removed vehicle from wishlist.');
    } else {
      addToWishlist(vehicle.id);
      toast.success('Saved', 'Added vehicle to wishlist.');
    }
  };

  const handleCompareToggle = () => {
    if (!vehicle) return;
    if (isCompared) {
      removeFromCompare(vehicle.id);
      toast.info('Removed', 'Removed from comparison list.');
    } else {
      if (compareList.length >= 3) {
        toast.warning('Limit reached', 'You can compare up to 3 vehicles maximum.');
        return;
      }
      addToCompare(vehicle.id);
      toast.success('Added', 'Added vehicle to comparison list.');
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'LUXELUXE') {
      setCouponApplied(true);
      setCouponDiscount(0.10);
      toast.success('Success', '10% promotional discount applied.');
    } else {
      toast.error('Invalid Coupon', 'The coupon code entered is not valid.');
    }
  };

  // 360 Rotator Drag Handlers
  const handleRotationMouseDown = (e: React.MouseEvent) => {
    setIsRotating(true);
    rotationDragStart.current = e.clientX;
  };

  const handleRotationMouseMove = (e: React.MouseEvent) => {
    if (!isRotating) return;
    const deltaX = e.clientX - rotationDragStart.current;
    if (Math.abs(deltaX) > 15) {
      const direction = deltaX > 0 ? -1 : 1;
      setRotationIndex((prev) => (prev + direction + MOCK_360_IMAGES.length) % MOCK_360_IMAGES.length);
      rotationDragStart.current = e.clientX;
    }
  };

  const handleRotationMouseUp = () => {
    setIsRotating(false);
  };

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">{tLocal.loading}</p>
        </div>
      </div>
    );
  }

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.thumbnailUrl || FALLBACK_IMAGE];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">

      {/* Dynamic Urgency banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border-b border-blue-500/20 py-2.5 text-center px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{tLocal.recentlyBooked}</span>
          <span className="hidden md:inline text-slate-400 font-normal">|</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {simulatedViewers} {tLocal.activeViewers}
          </span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header Breadcrumbs & Actions */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/cars" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-500 transition-colors font-bold">
            <ChevronLeft className="w-4 h-4" /> {tLocal.backToList}
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleCompareToggle}
              className={cn(
                "p-2.5 rounded-2xl border transition-colors text-xs font-bold flex items-center gap-1",
                isCompared
                  ? "border-blue-200 bg-blue-50 text-blue-500 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompared ? tLocal.comparing : tLocal.compare}</span>
            </button>
            <button onClick={handleWishlistToggle} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <Heart className={cn("w-5 h-5", wishlisted ? "fill-red-500 text-red-500" : "text-slate-400")} />
            </button>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <Share2 className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Title details block */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              {vehicle.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-yellow-500 font-extrabold bg-yellow-500/10 px-2 py-0.5 rounded-xl">
              ★ {vehicle.rating?.toFixed(1) ?? '5.0'}
            </span>
          </div>
          <h1 className="text-display text-3xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
            {vehicle.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1 font-semibold">
            <MapPin className="w-4 h-4 text-blue-500" /> {vehicle.location.address}, {vehicle.location.city}
          </p>
        </div>

        {/* 1. Hero Gallery Sections */}
        <div className="mb-8">
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 gap-4 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Photos' },
              { id: '360', label: tLocal.threeSixty },
              { id: 'video', label: tLocal.hdVideo },
              { id: 'tour', label: tLocal.panoramic },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveImageTab(tab.id as any);
                  setActiveImage(0);
                }}
                className={`py-2 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeImageTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-foreground'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-slate-950 aspect-[16/9] shadow-xl">
            {activeImageTab === '360' ? (
              /* 2. 360 Exterior Rotator Section */
              <div
                onMouseDown={handleRotationMouseDown}
                onMouseMove={handleRotationMouseMove}
                onMouseUp={handleRotationMouseUp}
                onMouseLeave={handleRotationMouseUp}
                className="w-full h-full flex items-center justify-center cursor-ew-resize select-none relative"
              >
                <img
                  src={MOCK_360_IMAGES[rotationIndex]}
                  alt="360 rotation angle"
                  className="max-h-full object-contain pointer-events-none"
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur">
                  Drag left or right to rotate vehicle
                </div>
              </div>
            ) : activeImageTab === 'video' ? (
              /* 3. HD Walkaround Video Gallery Section */
              <div className="w-full h-full relative flex items-center justify-center">
                <img src={images[0]} alt="Video Thumbnail" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
                  <button onClick={() => toast.info('Video Player', 'Streaming simulated video details...')} className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition-all">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                  <p className="text-white font-bold text-lg mt-4">HD Walkaround & Sound check</p>
                  <p className="text-slate-450 text-xs mt-1">Duration: 1m 24s</p>
                </div>
              </div>
            ) : activeImageTab === 'tour' ? (
              /* 4. Virtual Tour cabin Section */
              <div
                onMouseDown={(e) => { setIsPanning(true); panStart.current = e.clientX; }}
                onMouseMove={(e) => {
                  if (!isPanning) return;
                  const deltaX = e.clientX - panStart.current;
                  setPanPosition(prev => Math.max(0, Math.min(100, prev + deltaX * 0.1)));
                  panStart.current = e.clientX;
                }}
                onMouseUp={() => setIsPanning(false)}
                onMouseLeave={() => setIsPanning(false)}
                className="w-full h-full cursor-move select-none relative"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-75"
                  style={{
                    backgroundImage: `url(${images[3] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1400'})`,
                    backgroundPosition: `${panPosition}% 50%`,
                    backgroundSize: '200% 100%'
                  }}
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur">
                  Drag cabin interior panorama to look around
                </div>
              </div>
            ) : (
              /* 5. Fullscreen Lightbox triggers */
              <>
                <img
                  src={images[activeImage]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/45 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full transition-all",
                          activeImage === idx ? "bg-blue-500 w-5" : "bg-white/40 hover:bg-white/60"
                        )}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Details Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT AREA: Product specs highlights & content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Specs Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Seats', value: `${vehicle.specs?.seats || 5} Seats`, icon: Users },
                { label: 'Transmission', value: vehicle.specs?.transmission || 'Automatic', icon: Gauge },
                { label: 'Fuel Type', value: vehicle.specs?.fuelType || 'Gasoline', icon: Zap },
                { label: 'Privileges', value: vehicle.instantBook ? 'Instant Book' : 'Fast Approval', icon: ShieldCheck }
              ].map(spec => (
                <div key={spec.label} className="bg-card border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                  <spec.icon className="w-6 h-6 text-blue-500 mb-4" />
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{spec.label}</p>
                  <p className="text-slate-800 dark:text-white font-extrabold text-sm mt-0.5 capitalize">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{tLocal.about}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                {vehicle.description || tLocal.noDescription}
              </p>
            </div>

            {/* Features list */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">{tLocal.features}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(vehicle.features && vehicle.features.length > 0 ? vehicle.features : ['GPS Navigation', 'Apple CarPlay', 'Bluetooth Sync', 'Backup Camera', 'Sanitized Interior']).map(feat => (
                  <div key={feat} className="flex items-center gap-2.5 text-sm text-slate-655 dark:text-slate-350">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">{tLocal.requirements}</h3>
              <ul className="space-y-2.5 text-sm font-semibold text-slate-655 dark:text-slate-400">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-1" /> Valid Identity document (National ID card / CCCD / Passport)</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-1" /> Valid Driver License with appropriate class endorsement</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-1" /> Driver must be 21 years or older</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-1" /> Security deposit of {formatCurrency(vehicle.deposit)} required if not verified.</li>
              </ul>
            </div>

            {/* Calendar */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-xl font-bold text-foreground">{tLocal.calendar}</h3>
                <span className="text-[10px] font-black uppercase bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
                  {tLocal.weekendMarkup}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="font-bold text-slate-450 py-1">{d}</div>)}
                {Array.from({ length: 30 }, (_, idx) => (
                  <div key={idx} className="p-2 border border-slate-50 dark:border-slate-800 rounded-xl h-10 flex flex-col justify-between font-bold text-slate-500">
                    <span>{idx + 1}</span>
                    <span className="text-[7px] text-slate-400">{(idx + 1) % 6 === 0 ? 'Booked' : 'VND ' + (vehicle.pricePerDay / 1000) + 'k'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">{tLocal.map}</h3>
              <div className="relative h-96 rounded-[2rem] overflow-hidden shadow border border-slate-200 dark:border-slate-800">
                <VehicleMap vehicles={[vehicle]} selectedVehicleId={vehicle.id} height="100%" />
              </div>
            </div>

            {/* Owner Trust */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">{tLocal.owner}</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center font-display font-black text-blue-500 text-2xl">
                  {(vehicle.owner?.displayName || 'Owner').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    {vehicle.owner?.displayName || 'LuxeWay Partner'}
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                      {tLocal.verifiedHost}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{tLocal.superhost} · Joined July 2023</p>
                  <p className="text-xs text-slate-500 mt-2 font-semibold">Turo/Airbnb verified listings. Dedicated cleaning crew. Airport drop-off configured.</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">{tLocal.reviews}</h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400">{tLocal.noReviews}</p>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {reviews.map(rev => (
                    <div key={rev.id} className="pt-4 first:pt-0">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={rev.reviewer?.avatar || 'https://via.placeholder.com/40'} alt="Reviewer Avatar" className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{rev.reviewer?.displayName || 'Renter'}</p>
                          <p className="text-[9px] text-slate-400">{formatDate(rev.createdAt, 'short')}</p>
                        </div>
                        <span className="text-xs text-yellow-500 font-bold ml-auto">★ {rev.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT AREA: Sticky booking widget */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-slate-200 dark:border-slate-850 rounded-[2.5rem] p-6 shadow-xl sticky top-28 space-y-5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Rental Rate</p>
                <p className="text-display text-2xl font-black text-blue-500">
                  {formatCurrency(vehicle.pricePerDay)}
                  <span className="text-xs text-slate-400 font-normal"> / day</span>
                </p>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">{tLocal.pickup}</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-foreground outline-none border-0"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">{tLocal.return}</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-foreground outline-none border-0"
                  />
                </div>
              </div>

              {/* Addons checkbox toggles */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">{tLocal.addons}</p>

                {/* Private chauffeur option */}
                {vehicle.hasChauffeur && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-blue-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{tLocal.chauffeur}</p>
                        <p className="text-[9px] text-slate-400">+500,000 VND / day</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={chauffeurRequested}
                      onChange={e => setChauffeurRequested(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Airport Delivery option */}
                {vehicle.airportDelivery && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-blue-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{tLocal.airportDelivery}</p>
                        <p className="text-[9px] text-slate-400">Delivered directly to Arrivals</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={deliveryRequested}
                      onChange={e => setDeliveryRequested(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Wedding decor option */}
                {vehicle.weddingRental && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <HeartIcon className="w-4 h-4 text-rose-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Wedding Decor Package</p>
                        <p className="text-[9px] text-slate-400">+1,500,000 VND flat</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={weddingPackageRequested}
                      onChange={e => setWeddingPackageRequested(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Business corporate option */}
                {vehicle.businessRental && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Corporate Package (VAT)</p>
                        <p className="text-[9px] text-slate-400">10% discount on base rent</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={businessPackageRequested}
                      onChange={e => setBusinessPackageRequested(e.target.checked)}
                      className="rounded accent-blue-500 w-4 h-4"
                    />
                  </label>
                )}
              </div>

              {/* Total Calculation breakdown */}
              {startDate && endDate && (
                <div className="space-y-2 mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tLocal.basePrice} ({days} {days === 1 ? 'day' : 'days'})</span>
                    <span className="font-bold text-foreground">{formatCurrency(basePrice)}</span>
                  </div>
                  {chauffeurRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chauffeur Service</span>
                      <span className="font-bold text-foreground">+{formatCurrency(chauffeurFee)}</span>
                    </div>
                  )}
                  {deliveryRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Airport Delivery</span>
                      <span className="font-bold text-foreground">+{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  {weddingPackageRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wedding Package</span>
                      <span className="font-bold text-foreground">+{formatCurrency(weddingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tLocal.serviceFee} (12%)</span>
                    <span className="font-bold text-foreground">{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tLocal.taxes} (8%)</span>
                    <span className="font-bold text-foreground">{formatCurrency(taxes)}</span>
                  </div>
                  {businessPackageRequested && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Corporate Discount (-10%)</span>
                      <span>-{formatCurrency(businessDiscount)}</span>
                    </div>
                  )}
                  {couponApplied && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Promo Coupon Code</span>
                      <span>-10%</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex justify-between font-extrabold text-foreground text-sm">
                    <span>{tLocal.total}</span>
                    <span className="text-blue-500">{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              )}

              {/* Promo code apply */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="LUXELUXE"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-transparent text-foreground uppercase outline-none"
                />
                <button onClick={applyCoupon} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold">
                  {tLocal.apply}
                </button>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookingRedirect}
                disabled={bookingLoading}
                className="w-full btn-primary py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover-lift justify-center"
              >
                {bookingLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{vehicle.instantBook ? tLocal.instantBook : tLocal.requestToBook}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
              <p className="text-center text-[9px] text-slate-400">{tLocal.freeCancel}</p>
            </div>
          </div>

        </div>

        {/* 11. Similar Vehicles (Cars only) */}
        <div className="mt-16 pt-8 border-t border-slate-150 dark:border-slate-800">
          <h3 className="font-display text-2xl font-extrabold text-foreground mb-6">{tLocal.similar}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarCars.length === 0 ? (
              <p className="text-slate-400 text-sm">No similar cars available currently.</p>
            ) : (
              similarCars.map(sc => (
                <div key={sc.id} className="bg-card border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden p-4">
                  <img
                    src={sc.images?.[0] || sc.thumbnailUrl || FALLBACK_IMAGE}
                    alt={sc.name}
                    className="w-full h-40 object-cover rounded-2xl bg-slate-800"
                  />
                  <div className="mt-3 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground text-sm truncate">{sc.name}</h4>
                      <p className="text-[10px] text-slate-405 mt-0.5">{sc.location?.city}</p>
                    </div>
                    <span className="font-extrabold text-foreground text-sm">{formatCurrency(sc.pricePerDay)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-foreground text-xs">{sc.rating || '5.0'}</span>
                    </div>
                    <Link to={`/cars/${sc.id}`} className="text-[10px] font-bold text-blue-500 hover:underline">
                      {tLocal.viewVehicle} &rarr;
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Lightbox photo viewer */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[250] flex items-center justify-center p-4"
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl text-white hover:bg-white/10 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <img src={images[activeImage]} alt={vehicle.name} className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CarDetails;
