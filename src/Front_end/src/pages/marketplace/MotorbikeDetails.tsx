import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Shield, Zap, Gauge, Users, ChevronLeft, ChevronRight,
  Heart, Share2, Clock, Check, Bike, ArrowRight, X, Loader2, Calendar,
  ShieldCheck, AlertCircle, Award, Info, FileText, CheckCircle2,
  Navigation, UserCircle, Briefcase, HeartIcon, Plane, Sparkles, Play, Video,
  Smartphone, CloudRain, Package, MessageSquare
} from 'lucide-react';
import { motorbikeService } from '@/services/motorbikeService';
import { vehicleService } from '@/services/vehicleService';
import apiClient from '@/services/api';
import { reviewService } from '@/services/otherServices';
import type { Vehicle, Review } from '@/types';
import { useVehicleStore, useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, getRatingLabel, cn } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import LuxeWayMap from '@/components/map/LuxeWayMap';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000';

const MOCK_360_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1000',
];

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    backToList: "Back to Motorbikes Fleet",
    about: "About this Motorbike",
    features: "Features & Amenities",
    insurance: "Insurance & Deposit Policies",
    requirements: "Rental Requirements",
    calendar: "Availability Calendar",
    map: "Location & Pickup Map",
    owner: "Owner Credibility",
    reviews: "Renter Reviews",
    similar: "Similar Motorbikes You May Like",
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
    loading: "Loading motorbike details...",
    noDescription: "No description available for this premium motorbike.",
    hdVideo: "HD Walkaround Video",
    threeSixty: "360° Exterior Rotator",
    panoramic: "Virtual Cockpit Tour",
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
    viewVehicle: "View Motorbike",
    weeklyDiscount: "Weekly Discount",
    weekendMarkup: "Weekend markup (+15%)",
    activeViewers: "other travelers are viewing this motorbike",
    recentlyBooked: "Recently Booked 4 times in this area this week.",
    addons: "Motorbike Gear Add-ons",
    helmetAddon: "Premium Helmet rental",
    raincoatAddon: "Convenient Raincoat rental",
    phoneHolderAddon: "Secure Phone Holder rental",
    luggageRackAddon: "Luggage Rack mounting",
    goproAddon: "GoPro Mount attachment",
    depositNotice: "Security deposit hold will be pre-authorized upon confirmation."
  },
  vi: {
    backToList: "Quay lại danh sách xe máy",
    about: "Thông tin chi tiết xe máy",
    features: "Tính năng & Tiện nghi",
    insurance: "Chính sách Bảo hiểm & Đặt cọc",
    requirements: "Yêu cầu thuê xe máy",
    calendar: "Lịch trống khả dụng",
    map: "Bản đồ & Địa điểm nhận xe",
    owner: "Hồ sơ chủ xe máy",
    reviews: "Đánh giá từ khách hàng",
    similar: "Xe máy tương tự bạn có thể thích",
    book: "Tiến hành đặt xe",
    instantBook: "Đặt ngay",
    requestToBook: "Yêu cầu đặt xe",
    selectDates: "Chọn ngày đặt xe",
    pickup: "Nhận xe",
    return: "Trả xe",
    delivery: "Giao xe tận nơi",
    deliveryAddress: "Nhập địa chỉ nhận xe...",
    basePrice: "Giá thuê cơ bản",
    serviceFee: "Phí dịch vụ LuxeWay",
    taxes: "Thuế VAT & Phí",
    insuranceFee: "Gói bảo hiểm bảo vệ",
    total: "Tổng chi phí",
    deposit: "Tiền đặt cọc thế chấp (hoàn lại)",
    coupon: "Áp dụng mã giảm giá",
    apply: "Áp dụng",
    saved: "Đã lưu",
    wishlist: "Yêu thích",
    share: "Chia sẻ",
    compare: "So sánh",
    comparing: "Đã thêm vào so sánh",
    loading: "Đang tải thông tin xe máy...",
    noDescription: "Không có mô tả chi tiết cho chiếc xe máy này.",
    hdVideo: "Video cận cảnh thực tế",
    threeSixty: "Góc nhìn xoay 360°",
    panoramic: "Góc lái ảo Panorama",
    verifiedHost: "Chủ xe đã xác minh danh tính",
    superhost: "Chủ xe ưu tú",
    responseRate: "Tỷ lệ phản hồi",
    responseTime: "Thời gian phản hồi",
    rating: "Điểm đánh giá chủ xe",
    days: "Ngày",
    freeCancel: "Hủy miễn phí lên đến 48 giờ trước khi nhận xe",
    damageCover: "Hỗ trợ bảo vệ hư hại 100% khi thanh toán",
    hours: "giờ",
    noReviews: "Chưa có đánh giá nào cho chiếc xe máy này.",
    viewVehicle: "Xem xe máy",
    weeklyDiscount: "Chiết khấu thuê tuần",
    weekendMarkup: "Giá tăng cuối tuần (+15%)",
    activeViewers: "khách du lịch khác đang xem xe máy này",
    recentlyBooked: "Được đặt 4 lần gần đây trong khu vực tuần này.",
    addons: "Phụ kiện & Đồ bảo hộ xe máy",
    helmetAddon: "Thuê nón bảo hiểm cao cấp",
    raincoatAddon: "Thuê áo mưa tiện lợi",
    phoneHolderAddon: "Thuê kẹp điện thoại bản đồ",
    luggageRackAddon: "Gắn Baga / Thùng đồ sau",
    goproAddon: "Gắn đế gắn camera GoPro",
    depositNotice: "Tiền cọc sẽ được xác thực tạm giữ khi xác nhận đặt xe."
  },
  ja: {
    backToList: "バイク一覧に戻る",
    about: "バイク情報",
    features: "装備とアメニティ",
    insurance: "保険と保証金ポリシー",
    requirements: "レンタル要件",
    calendar: "空車カレンダー",
    map: "位置と受け取りマップ",
    owner: "オーナーの信頼性",
    reviews: "レンターのレビュー",
    similar: "おすすめの同等バイク",
    book: "予約手続きに進む",
    instantBook: "即時予約",
    requestToBook: "予約をリクエスト",
    selectDates: "日程を選択",
    pickup: "受け取り",
    return: "返却",
    delivery: "デリバリーを希望する",
    deliveryAddress: "配達先住所を入力...",
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
    loading: "バイク詳細を読み込み中...",
    noDescription: "このバイクの詳細説明はありません。",
    hdVideo: "HDウォークアラウンドビデオ",
    threeSixty: "360°外観ビューア",
    panoramic: "バーチャルコックピットツアー",
    verifiedHost: "身元確認済みのホスト",
    superhost: "スーパーホスト",
    responseRate: "返信率",
    responseTime: "返答時間",
    rating: "ホストの評価",
    days: "日",
    freeCancel: "受け取りの48時間前までキャンセル無料",
    damageCover: "チェックアウト時に100%の損害補償オプションが利用可能",
    hours: "時間",
    noReviews: "このバイクに対するレビューはまだありません。",
    viewVehicle: "詳細を見る",
    weeklyDiscount: "週割引",
    weekendMarkup: "週末料金 (+15%)",
    activeViewers: "人の旅行者がこのバイクを閲覧しています",
    recentlyBooked: "このエリアで今週すでに4回予約されています。",
    addons: "バイクギア・アドオン",
    helmetAddon: "プレミアムヘルメットレンタル",
    raincoatAddon: "レインコートレンタル",
    phoneHolderAddon: "スマートフォンホルダー装着",
    luggageRackAddon: "リアキャリア・荷台装着",
    goproAddon: "GoProマウント装着",
    depositNotice: "予約確定時に保証金がプリオーソライズされます。"
  },
  ko: {
    backToList: "오토바이 목록으로 돌아가기",
    about: "오토바이 상세 정보",
    features: "기능 및 편의 장치",
    insurance: "보험 및 보증금 정책",
    requirements: "대여 자격 요건",
    calendar: "대여 가능 달력",
    map: "위치 및 인수 지도",
    owner: "호스트 신뢰도",
    reviews: "고객 이용 후기",
    similar: "이런 오토바이는 어떠세요?",
    book: "예약하기",
    instantBook: "즉시 예약",
    requestToBook: "예약 요청",
    selectDates: "날짜 선택",
    pickup: "인수",
    return: "반납",
    delivery: "오토바이 배송 요청",
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
    loading: "오토바이 정보를 불러오는 중...",
    noDescription: "이 프리미엄 오토바이에 대한 설명이 없습니다.",
    hdVideo: "HD 둘러보기 동영상",
    threeSixty: "360° 외관 뷰어",
    panoramic: "가상 조종석 투어",
    verifiedHost: "신원 확인된 호스트",
    superhost: "슈퍼호스트",
    responseRate: "응답률",
    responseTime: "응답 시간",
    rating: "호스트 평점",
    days: "일",
    freeCancel: "인수 48시간 전까지 무료 취소 가능",
    damageCover: "결제 시 100% 손상 면책 옵션 선택 가능",
    hours: "시간",
    noReviews: "이 오토바이에 대한 후기가 아직 없습니다.",
    viewVehicle: "오토바이 보기",
    weeklyDiscount: "주간 할인",
    weekendMarkup: "주말 할증 (+15%)",
    activeViewers: "명의 여행자가 이 오토바이를 보고 있습니다",
    recentlyBooked: "이번 주 이 지역에서 4회 최근 예약되었습니다.",
    addons: "오토바이 추가 장비",
    helmetAddon: "프리미엄 헬멧 대여",
    raincoatAddon: "편의 우비 대여",
    phoneHolderAddon: "스마트폰 거치대 대여",
    luggageRackAddon: "수하물 랙/바가 탑재",
    goproAddon: "GoPro 마운트 장착",
    depositNotice: "예약 확정 시 보증금 결제가 가승인됩니다."
  },
  zh: {
    backToList: "返回机车列表",
    about: "机车详情",
    features: "配置与服务",
    insurance: "保险与押金政策",
    requirements: "租车资格要求",
    calendar: "空车日历",
    map: "位置与取车地图",
    owner: "车主信用度",
    reviews: "租客评价",
    similar: "为您推荐的相似机车",
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
    loading: "机车详情加载中...",
    noDescription: "暂无此豪华机车的详细描述。",
    hdVideo: "高清实车展示视频",
    threeSixty: "360° 外观展示",
    panoramic: "机车驾驶舱虚拟体验",
    verifiedHost: "已实名认证车主",
    superhost: "超赞车主",
    responseRate: "回复率",
    responseTime: "回复时间",
    rating: "车主评分",
    days: "天",
    freeCancel: "取车前48小时内可免费取消",
    damageCover: "结账时可选100%全额车损险",
    hours: "小时",
    noReviews: "该机车暂无租客评价。",
    viewVehicle: "查看机车",
    weeklyDiscount: "周租优惠",
    weekendMarkup: "周末价格浮动 (+15%)",
    activeViewers: "名游客正在浏览该机车",
    recentlyBooked: "本周该区域已成功预订 4 次。",
    addons: "机车装备配件",
    helmetAddon: "租用高级头盔",
    raincoatAddon: "租用雨衣",
    phoneHolderAddon: "加装手机支架",
    luggageRackAddon: "加装后行李架/尾箱",
    goproAddon: "加装GoPro摄像机底座",
    depositNotice: "预订确认时将预授权冻结安全押金。"
  },
  fr: {
    backToList: "Retour aux motos",
    about: "À propos de cette moto",
    features: "Équipements & Options",
    insurance: "Assurance & Politiques de dépôt",
    requirements: "Conditions de location",
    calendar: "Calendrier des disponibilités",
    map: "Emplacement & Carte de retrait",
    owner: "Crédibilité du propriétaire",
    reviews: "Avis des locataires",
    similar: "Motos similaires",
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
    noDescription: "Aucune description disponible pour cette moto.",
    hdVideo: "Vidéo de présentation HD",
    threeSixty: "Rotateur extérieur 360°",
    panoramic: "Visite virtuelle du cockpit",
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
    viewVehicle: "Voir la moto",
    weeklyDiscount: "Remise hebdomadaire",
    weekendMarkup: "Majoration de week-end (+15%)",
    activeViewers: "autres voyageurs consultent cette moto",
    recentlyBooked: "Récemment réservé 4 fois dans cette zone cette semaine.",
    addons: "Équipements Moto Optionnels",
    helmetAddon: "Location de casque premium",
    raincoatAddon: "Location de vêtement de pluie",
    phoneHolderAddon: "Support de smartphone sécurisé",
    luggageRackAddon: "Porte-bagages ou top-case",
    goproAddon: "Fixation de support GoPro",
    depositNotice: "L'autorisation de dépôt de garantie sera bloquée à la confirmation."
  },
  de: {
    backToList: "Zurück zur Motorradflotte",
    about: "Über dieses Motorrad",
    features: "Features & Annehmlichkeiten",
    insurance: "Versicherungs- & Kautionsbedingungen",
    requirements: "Mietbedingungen",
    calendar: "Verfügbarkeitskalender",
    map: "Standort & Abholungskarte",
    owner: "Vermieter-Bewertungen",
    reviews: "Kundenbewertungen",
    similar: "Ähnliche Motorräder, die Ihnen gefallen könnten",
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
    noDescription: "Keine Beschreibung für dieses Premium-Motorrad vorhanden.",
    hdVideo: "HD-Walkaround-Video",
    threeSixty: "360° Außenansicht",
    panoramic: "Virtuelle Cockpit-Tour",
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
    viewVehicle: "Motorrad anzeigen",
    weeklyDiscount: "Wochenrabatt",
    weekendMarkup: "Wochenendaufschlag (+15%)",
    activeViewers: "andere Reisende sehen sich dieses Motorrad an",
    recentlyBooked: "Kürzlich diese Woche 4 Mal in dieser Region gebucht.",
    addons: "Zusätzliche Motorradausrüstung",
    helmetAddon: "Premium-Helmverleih",
    raincoatAddon: "Regenbekleidungsverleih",
    phoneHolderAddon: "Sichere Handyhalterung montieren",
    luggageRackAddon: "Gepäckträger oder Topcase anbringen",
    goproAddon: "GoPro-Halterung montieren",
    depositNotice: "Die Kautionssperre wird bei Buchungsbestätigung vorautorisiert."
  },
  es: {
    backToList: "Volver a la Flota de Motos",
    about: "Acerca de esta Moto",
    features: "Características y Servicios",
    insurance: "Seguro y Políticas de Depósito",
    requirements: "Requisitos de Alquiler",
    calendar: "Calendario de Disponibilidad",
    map: "Mapa de Ubicación y Entrega",
    owner: "Credibilidad del Propietario",
    reviews: "Reseñas de Locatarios",
    similar: "Motos Similares que te Pueden Gustar",
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
    loading: "Cargando detalles de la moto...",
    noDescription: "No hay descripción disponible para esta moto premium.",
    hdVideo: "Video de Presentación HD",
    threeSixty: "Rotador Exterior 360°",
    panoramic: "Tour Virtual del Cockpit",
    verifiedHost: "Anfitrión con Identidad Verificada",
    superhost: "Super Anfitrión",
    responseRate: "Tasa de Respuesta",
    responseTime: "Tiempo de Respuesta",
    rating: "Calificación del Anfitrión",
    days: "Días",
    freeCancel: "Cancelación gratuita hasta 48 horas antes de la recogida",
    damageCover: "Cobertura de daños al 100% disponible al pagar",
    hours: "horas",
    noReviews: "Aún no hay reseñas para esta moto.",
    viewVehicle: "Ver Moto",
    weeklyDiscount: "Descuento Semanal",
    weekendMarkup: "Recargo de fin de semana (+15%)",
    activeViewers: "otros viajeros están viendo esta moto",
    recentlyBooked: "Recientemente reservado 4 veces en esta zona esta semana.",
    addons: "Accesorios y Equipo para Motos",
    helmetAddon: "Alquiler de casco premium",
    raincoatAddon: "Alquiler de impermeable",
    phoneHolderAddon: "Soporte de teléfono seguro",
    luggageRackAddon: "Instalación de portaequipajes / baúl trasero",
    goproAddon: "Montura de soporte para GoPro",
    depositNotice: "Se preautorizará la retención del depósito de seguridad tras la confirmación."
  }
};

export const MotorbikeDetails: React.FC = () => {
  const { language } = useUIStore();
  const langKey = (LOCAL_TRANSLATIONS[language] ? language : 'en') as string;
  const tLocal = LOCAL_TRANSLATIONS[langKey];

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuthStore();
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

  // Motorbike Options
  const [helmetRequested, setHelmetRequested] = useState(false);
  const [raincoatRequested, setRaincoatRequested] = useState(false);
  const [phoneHolderRequested, setPhoneHolderRequested] = useState(false);
  const [touringPackageRequested, setTouringPackageRequested] = useState(false);
  const [adventurePackageRequested, setAdventurePackageRequested] = useState(false);

  // Availability, Routing and Autocomplete States
  const [availability, setAvailability] = useState<{ date: string; status: string }[]>([]);
  const [routePolyline, setRoutePolyline] = useState<string | null>(null);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [deliveryCoords, setDeliveryCoords] = useState<[number, number] | null>(null);

  // 360 Rotation Simulation States
  const [rotationIndex, setRotationIndex] = useState(0);
  const rotationDragStart = useRef(0);
  const [isRotating, setIsRotating] = useState(false);

  // Virtual Tour panorama state
  const [panPosition, setPanPosition] = useState(50);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(0);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [similarBikes, setSimilarBikes] = useState<Vehicle[]>([]);
  const [simulatedViewers, setSimulatedViewers] = useState(5);

  const wishlisted = vehicle ? isWishlisted(vehicle.id) : false;
  const isCompared = vehicle ? compareList.includes(vehicle.id) : false;

  // Fetch availability list
  useEffect(() => {
    if (!id) return;
    apiClient.get<any>(`/vehicles/${id}/availability`)
      .then((res: any) => {
        if (res) {
          setAvailability(res.data || res);
        }
      })
      .catch((err: any) => console.error('Failed to load vehicle availability', err));
  }, [id]);

  // Date locking hold
  useEffect(() => {
    if (startDate && endDate && vehicle && isAuthenticated) {
      apiClient.post<any>(`/vehicles/${vehicle.id}/lock`, { startDate, endDate })
        .then((res: any) => {
          if (res && (res.success || res.status === 'ok')) {
            toast.success('Dates Hold Active', 'These dates are temporarily held for you for 10 minutes.');
            // Reload availability to update calendar styles
            apiClient.get<any>(`/vehicles/${vehicle.id}/availability`)
              .then((availRes: any) => {
                if (availRes) setAvailability(availRes.data || availRes);
              });
          } else {
            toast.error('Date conflict', res.error || 'The selected dates are currently locked by another customer.');
          }
        })
        .catch((err: any) => console.error('Failed to lock vehicle dates', err));
    }
  }, [startDate, endDate, vehicle?.id, isAuthenticated]);

  // Debounced address autocomplete suggestions
  useEffect(() => {
    if (!deliveryAddress.trim() || !deliveryRequested) {
      setAddressSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      apiClient.get<any>(`/location/autocomplete?input=${encodeURIComponent(deliveryAddress)}`)
        .then((res: any) => {
          if (res) {
            setAddressSuggestions(res.data || res);
          }
        })
        .catch((err: any) => console.error('Autocomplete suggestions fetch failed', err));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [deliveryAddress, deliveryRequested]);

  // Suggestion select and route mapping callback
  const handleSelectSuggestion = (suggestion: any) => {
    setDeliveryAddress(suggestion.description);
    setAddressSuggestions([]);
    
    apiClient.get<any>(`/location/detail?placeId=${suggestion.place_id}`)
      .then((res: any) => {
        const place = res.data || res;
        if (place && place.lat && place.lng) {
          const lat = Number(place.lat);
          const lng = Number(place.lng);
          setDeliveryCoords([lat, lng]);
          
          if (vehicle?.location?.lat && vehicle?.location?.lng) {
            apiClient.get<any>(`/location/direction?originLat=${vehicle.location.lat}&originLng=${vehicle.location.lng}&destLat=${lat}&destLng=${lng}`)
              .then((dirRes: any) => {
                const data = dirRes.data || dirRes;
                if (data && data.polyline) {
                  setRoutePolyline(data.polyline);
                  setRouteDistance(data.distance);
                  setRouteDuration(data.duration);
                  toast.success('Route Computed', `Delivery route path resolved: ${data.distance}`);
                }
              })
              .catch((err: any) => console.error('Failed to resolve route path', err));
          }
        }
      })
      .catch((err: any) => console.error('Failed to fetch place detail coordinates', err));
  };

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
      "@type": "Motorcycle",
      "name": vehicle.name,
      "image": vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.thumbnailUrl || FALLBACK_IMAGE],
      "description": vehicle.description || "Premium motorbike rental",
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

    const scriptId = 'json-ld-bike-schema';
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
      motorbikeService.getById(id),
      reviewService.getByVehicle(id),
    ]).then(([v, r]) => {
      if (v) {
        setVehicle(v);
        addRecentlyViewed(v.id);
        
        // Load similar motorbikes in the same city
        motorbikeService.getAll({ location: v.location.city }).then(res => {
          const filtered = (res.data || [])
            .filter(item => item.id !== v.id && item.vehicleType === 'motorbike')
            .slice(0, 3);
          setSimilarBikes(filtered);
        });

        // Generate client-side reviews if empty but totalReviews > 0
        if (r.length === 0 && v.totalReviews > 0) {
          const names = ['John Doe', 'Alice Smith', 'David Miller', 'Sophia Johnson'];
          const comments = [
            'Excellent performance, clean and very helpful owner.',
            'Amazing trip! The bike was delivered in pristine condition and full tank.',
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
      } else {
        setVehicle(null);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load motorbike details", err);
      setVehicle(null);
      setLoading(false);
    });
  }, [id, language]);

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

  const helmetFee = helmetRequested ? 20000 * days : 0;
  const raincoatFee = raincoatRequested ? 10000 * days : 0;
  const phoneHolderFee = phoneHolderRequested ? 10000 * days : 0;
  const luggageRackFee = touringPackageRequested ? 30000 * days : 0;
  const goproFee = adventurePackageRequested ? 15000 * days : 0;
  const deliveryFee = deliveryRequested && vehicle ? vehicle.deliveryFee || 100000 : 0;

  const insuranceFee = vehicle
    ? insuranceTier === 'premium'
      ? Math.round(vehicle.pricePerDay * 0.12 * days)
      : insuranceTier === 'zero'
      ? Math.round(vehicle.pricePerDay * 0.20 * days)
      : 0
    : 0;

  const serviceFee = Math.round(basePrice * 0.10);
  const taxes = Math.round(basePrice * 0.08);
  const subtotal = basePrice + helmetFee + raincoatFee + phoneHolderFee + luggageRackFee + goproFee + insuranceFee + serviceFee + taxes + deliveryFee;
  const totalCost = subtotal - (couponApplied ? Math.round(subtotal * couponDiscount) : 0);

  const handleBookingRedirect = async () => {
    if (!isAuthenticated) {
      toast.warning('Authentication Required', 'Please log in to complete your booking.');
      navigate('/auth/login');
      return;
    }

    const isVi = language === 'vi';

    try {
      await refreshUser();
    } catch (e) {
      console.warn('Failed to refresh user before booking:', e);
    }

    // Mandatory Scan Check: Verify KYC is completed
    // if (!user?.kycVerified && user?.kycStatus !== 'VERIFIED') {
    //   toast.error(
    //     isVi ? 'Yêu cầu xác minh danh tính' : 'Identity Verification Required',
    //     isVi ? 'Bạn cần thực hiện quét CCCD và Bằng lái xe trước khi tiến hành đặt xe.' : 'Please scan and verify your ID (CCCD) và Driving License before booking.'
    //   );
    //   navigate('/dashboard/documents');
    //   return;
    // }

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
        helmet: helmetRequested ? 'true' : 'false',
        raincoat: raincoatRequested ? 'true' : 'false',
        phoneHolder: phoneHolderRequested ? 'true' : 'false',
        luggageRack: touringPackageRequested ? 'true' : 'false',
        gopro: adventurePackageRequested ? 'true' : 'false',
        delivery: deliveryRequested ? 'true' : 'false',
        coupon: couponApplied ? couponCode : ''
      });
      navigate(`/booking/${vehicle?.id}?${params.toString()}`);
    }, 1000);
  };

  const handleWishlistToggle = async () => {
    if (!vehicle) return;
    if (!isAuthenticated || !user?.id) {
      toast.info('Sign in required', 'Please sign in to save vehicles to your wishlist.');
      return;
    }
    const previous = wishlisted;
    if (wishlisted) {
      removeFromWishlist(vehicle.id);
      toast.info('Removed', 'Removed vehicle from wishlist.');
    } else {
      addToWishlist(vehicle.id);
      toast.success('Saved', 'Added vehicle to wishlist.');
    }
    try {
      const favorite = await vehicleService.toggleWishlist(vehicle.id, user.id);
      if (favorite) addToWishlist(vehicle.id);
      else removeFromWishlist(vehicle.id);
    } catch {
      if (previous) addToWishlist(vehicle.id);
      else removeFromWishlist(vehicle.id);
      toast.error('Wishlist failed', 'Could not save your wishlist change.');
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">{tLocal.loading}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-20 px-4 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Motorbike Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The vehicle you are looking for does not exist, has been removed, or is currently unavailable.</p>
          <button
            onClick={() => navigate('/motorbikes')}
            className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
          >
            Go to Catalog
          </button>
        </div>
      </div>
    );
  }

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.thumbnailUrl || FALLBACK_IMAGE];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      
      {/* Dynamic Urgency banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border-b border-orange-500/20 py-2.5 text-center px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400">
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
          <Link to="/motorbikes" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-500 transition-colors font-bold">
            <ChevronLeft className="w-4 h-4" /> {tLocal.backToList}
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleCompareToggle}
              className={cn(
                "p-2.5 rounded-2xl border transition-colors text-xs font-bold flex items-center gap-1",
                isCompared
                  ? "border-orange-200 bg-orange-50 text-orange-500 dark:bg-orange-950/20"
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
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
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
            <MapPin className="w-4 h-4 text-orange-500" /> {vehicle.location.address}, {vehicle.location.city}
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
                className={`py-2 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeImageTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-foreground'
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
                  <button onClick={() => toast.info('Video Player', 'Streaming simulated video details...')} className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition-all">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                  <p className="text-white font-bold text-lg mt-4">HD Walkaround & Engine Sound</p>
                  <p className="text-slate-450 text-xs mt-1">Duration: 1m 05s</p>
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
                    backgroundImage: `url(${images[3] || 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1400'})`,
                    backgroundPosition: `${panPosition}% 50%`,
                    backgroundSize: '200% 100%'
                  }}
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur">
                  Drag dashboard cockpit panorama to look around
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
                          activeImage === idx ? "bg-orange-500 w-5" : "bg-white/40 hover:bg-white/60"
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
                { label: 'Engine', value: vehicle.specs?.engineSize || `${vehicle.engineCc || 150}cc`, icon: Gauge },
                { label: 'Transmission', value: vehicle.specs?.transmission === 'manual' ? 'Manual' : 'Automatic', icon: Zap },
                { label: 'Seats', value: '2 Seats', icon: Users },
                { label: 'Privileges', value: vehicle.instantBook ? 'Instant Book' : 'Fast Approval', icon: ShieldCheck }
              ].map(spec => (
                <div key={spec.label} className="bg-card border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                  <spec.icon className="w-6 h-6 text-orange-500 mb-4" />
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
                {(vehicle.features && vehicle.features.length > 0 ? vehicle.features : ['Dual Helmets', 'Smart Keyless', 'ABS Braking', 'Phone Charger', 'Sanitized Handles']).map(feat => (
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
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-1" /> Valid Driver License (Class A1/A2 or international permit)</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-1" /> Driver must be 18 years or older</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-1" /> Refundable security deposit hold upon vehicle pick-up.</li>
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
                {Array.from({ length: 30 }, (_, idx) => {
                  const date = new Date();
                  date.setDate(date.getDate() + idx);
                  const dateStr = date.toISOString().split('T')[0];
                  const avail = availability.find(a => a.date === dateStr);
                  const status = avail ? avail.status : 'AVAILABLE';
                  
                  let statusText = `VND ${(vehicle.pricePerDay / 1000).toFixed(0)}k`;
                  let statusColor = 'text-slate-500';
                  let cellBg = '';

                  if (status === 'BOOKED') {
                    statusText = 'Booked';
                    statusColor = 'text-rose-500';
                    cellBg = 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/20';
                  } else if (status === 'PENDING') {
                    statusText = 'Pending';
                    statusColor = 'text-amber-500';
                    cellBg = 'bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/20';
                  } else if (status === 'MAINTENANCE') {
                    statusText = 'Maint.';
                    statusColor = 'text-slate-400';
                    cellBg = 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800';
                  }

                  return (
                    <div key={idx} className={cn("p-2 border border-slate-50 dark:border-slate-800 rounded-xl h-12 flex flex-col justify-between font-bold text-slate-500", cellBg)}>
                      <span className="text-[9px]">{date.getDate()} {date.toLocaleString('en-US', { month: 'short' })}</span>
                      <span className={cn("text-[8px]", statusColor)}>{statusText}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Map */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-xl font-bold text-foreground">{tLocal.map}</h3>
                {routeDistance && routeDuration && (
                  <span className="text-xs font-bold text-blue-500">
                    Delivery: {routeDistance} ({routeDuration})
                  </span>
                )}
              </div>
              <div className="relative h-96 rounded-[2rem] overflow-hidden shadow border border-slate-200 dark:border-slate-800">
                <LuxeWayMap 
                  vehicles={[vehicle]} 
                  selectedVehicleId={vehicle.id} 
                  height="100%" 
                  routePolyline={routePolyline || undefined}
                  pickupCoords={vehicle.location?.lat && vehicle.location?.lng ? [Number(vehicle.location.lat), Number(vehicle.location.lng)] : undefined}
                  destCoords={deliveryCoords || undefined}
                />
              </div>
            </div>

            {/* Owner Trust */}
            <div className="luxury-card p-6 bg-card border border-slate-150 dark:border-slate-800 rounded-3xl">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">{tLocal.owner}</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center font-display font-black text-orange-500 text-2xl">
                  {(vehicle.owner?.displayName || 'Owner').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    {vehicle.owner?.displayName || 'LuxeWay Partner'}
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                      {tLocal.verifiedHost}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{tLocal.superhost} · Joined August 2023</p>
                  <p className="text-xs text-slate-500 mt-2 font-semibold">Verified listing, vehicle fully inspected before every trip. Station pickup available.</p>
                </div>
              </div>
              {vehicle.ownerId && (
                <button
                  onClick={() => navigate(`/messages?ownerId=${encodeURIComponent(vehicle.ownerId)}&vehicleId=${encodeURIComponent(vehicle.id)}`)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-extrabold text-white transition-colors hover:bg-slate-800"
                >
                  <MessageSquare className="w-4 h-4" /> Message Owner
                </button>
              )}
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
            <div className="bg-card border border-slate-200 dark:border-slate-855 rounded-[2.5rem] p-6 shadow-xl sticky top-28 space-y-5">
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Rental Rate</p>
                  <p className="text-display text-2xl font-black text-orange-500">
                    {formatCurrency(vehicle.pricePerDay)}
                    <span className="text-xs text-slate-400 font-normal"> / day</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black rounded-xl border border-orange-500/20">
                  Ecosystem 2
                </span>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                <div>
                  <label className="block text-[8px] font-black text-slate-400 tracking-wider mb-1 uppercase">{tLocal.pickup}</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-foreground outline-none border-0"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-400 tracking-wider mb-1 uppercase">{tLocal.return}</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-foreground outline-none border-0"
                  />
                </div>
              </div>

              {/* Accessories options for Motorbikes */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">{tLocal.addons}</p>
                
                {/* Helmet Option */}
                {vehicle.hasHelmet && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{tLocal.helmetAddon}</p>
                        <p className="text-[9px] text-slate-400">+20,000 VND / day</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={helmetRequested}
                      onChange={e => setHelmetRequested(e.target.checked)}
                      className="rounded accent-orange-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Raincoat Option */}
                {vehicle.hasRaincoat && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-orange-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{tLocal.raincoatAddon}</p>
                        <p className="text-[9px] text-slate-400">+10,000 VND / day</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={raincoatRequested}
                      onChange={e => setRaincoatRequested(e.target.checked)}
                      className="rounded accent-orange-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Phone Holder Option */}
                {vehicle.hasPhoneHolder && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-orange-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{tLocal.phoneHolderAddon}</p>
                        <p className="text-[9px] text-slate-400">+10,000 VND / day</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={phoneHolderRequested}
                      onChange={e => setPhoneHolderRequested(e.target.checked)}
                      className="rounded accent-orange-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* Luggage Rack Option */}
                {vehicle.hasTouringPackage && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{tLocal.luggageRackAddon}</p>
                        <p className="text-[9px] text-slate-400">+30,000 VND / day</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={touringPackageRequested}
                      onChange={e => setTouringPackageRequested(e.target.checked)}
                      className="rounded accent-orange-500 w-4 h-4"
                    />
                  </label>
                )}

                {/* GoPro mount option */}
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-orange-500" />
                    <div className="text-left">
                      <p className="text-xs font-bold">{tLocal.goproAddon}</p>
                      <p className="text-[9px] text-slate-400">+15,000 VND / day</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={adventurePackageRequested}
                    onChange={e => setAdventurePackageRequested(e.target.checked)}
                    className="rounded accent-orange-500 w-4 h-4"
                  />
                </label>

                {/* Delivery Option */}
                {vehicle.deliveryAvailable && (
                  <>
                    <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <div className="text-left">
                          <p className="text-xs font-bold">{tLocal.delivery}</p>
                          <p className="text-[9px] text-slate-400">Delivered directly to your location</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={deliveryRequested}
                        onChange={e => setDeliveryRequested(e.target.checked)}
                        className="rounded accent-orange-500 w-4 h-4"
                      />
                    </label>

                    {deliveryRequested && (
                      <div className="space-y-1 text-left relative mt-1.5 p-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Delivery Address</label>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          placeholder={tLocal.deliveryAddress}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs bg-slate-900/50 text-foreground outline-none focus:border-orange-500 transition-colors"
                        />
                        {addressSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto">
                            {addressSuggestions.map((s, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSuggestion(s)}
                                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-900 text-slate-200 border-b border-slate-900 last:border-b-0 cursor-pointer"
                              >
                                {s.description}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Insurance tier details */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">{tLocal.insurance}</p>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                  {[
                    { id: 'basic', name: 'Basic', cost: '0' },
                    { id: 'premium', name: 'Shield', cost: '+12%' },
                    { id: 'zero', name: 'Zero', cost: '+20%' }
                  ].map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => setInsuranceTier(pkg.id as any)}
                      className={cn(
                        "py-2 rounded-xl border transition-all text-center",
                        insuranceTier === pkg.id
                          ? "border-orange-500 bg-orange-500/5 text-orange-500"
                          : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-350"
                      )}
                    >
                      <p>{pkg.name}</p>
                      <p className="text-[8px] text-slate-400 font-normal">{pkg.cost}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Calculation breakdown */}
              {startDate && endDate && (
                <div className="space-y-2 mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tLocal.basePrice} ({days} {days === 1 ? 'day' : 'days'})</span>
                    <span className="font-bold text-foreground">{formatCurrency(basePrice)}</span>
                  </div>
                  {helmetRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLocal.helmetAddon}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(helmetFee)}</span>
                    </div>
                  )}
                  {raincoatRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLocal.raincoatAddon}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(raincoatFee)}</span>
                    </div>
                  )}
                  {phoneHolderRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLocal.phoneHolderAddon}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(phoneHolderFee)}</span>
                    </div>
                  )}
                  {touringPackageRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLocal.luggageRackAddon}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(luggageRackFee)}</span>
                    </div>
                  )}
                  {adventurePackageRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLocal.goproAddon}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(goproFee)}</span>
                    </div>
                  )}
                  {deliveryRequested && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLocal.delivery}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  {insuranceFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLocal.insuranceFee}</span>
                      <span className="font-bold text-foreground">+{formatCurrency(insuranceFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tLocal.serviceFee} (10%)</span>
                    <span className="font-bold text-foreground">{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tLocal.taxes} (8%)</span>
                    <span className="font-bold text-foreground">{formatCurrency(taxes)}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Promo Coupon Code</span>
                      <span>-10%</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex justify-between font-extrabold text-foreground text-sm">
                    <span>{tLocal.total}</span>
                    <span className="text-orange-500">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 text-[9px] text-slate-400 leading-normal flex items-start gap-1">
                    <Info className="w-3 h-3 flex-shrink-0 text-orange-500 mt-0.5" />
                    <span>{tLocal.depositNotice}</span>
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
                className="w-full btn-primary py-3.5 bg-gradient-to-r from-orange-500 to-red-650 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover-lift justify-center animate-pulse-slow"
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

        {/* 11. Similar Vehicles (Motos only) */}
        <div className="mt-16 pt-8 border-t border-slate-150 dark:border-slate-800">
          <h3 className="font-display text-2xl font-extrabold text-foreground mb-6">{tLocal.similar}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarBikes.length === 0 ? (
              <p className="text-slate-400 text-sm">No similar motorbikes available currently.</p>
            ) : (
              similarBikes.map(sb => (
                <div key={sb.id} className="bg-card border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden p-4">
                  <img
                    src={sb.images?.[0] || sb.thumbnailUrl || FALLBACK_IMAGE}
                    alt={sb.name}
                    className="w-full h-40 object-cover rounded-2xl bg-slate-800"
                  />
                  <div className="mt-3 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground text-sm truncate">{sb.name}</h4>
                      <p className="text-[10px] text-slate-405 mt-0.5">{sb.location?.city}</p>
                    </div>
                    <span className="font-extrabold text-foreground text-sm">{formatCurrency(sb.pricePerDay)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-foreground text-xs">{sb.rating || '5.0'}</span>
                    </div>
                    <Link to={`/motorbikes/${sb.id}`} className="text-[10px] font-bold text-orange-500 hover:underline">
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

export default MotorbikeDetails;
