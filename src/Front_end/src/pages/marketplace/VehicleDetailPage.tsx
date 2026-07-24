import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Shield, Users, ChevronLeft, ChevronRight,
  Info, Clock, Check, Loader2, Calendar, AlertCircle, FileText, CheckCircle2,
  Sparkles, ShieldCheck, SlidersHorizontal
} from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import apiClient from '@/services/api';
import type { Vehicle } from '@/types';
import { useAuthStore, useUIStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, cn, resolveImageUrl, sanitizeLocation } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import LuxeWayMap from '@/components/map/LuxeWayMap';
import { recommendationService } from '@/services/enterpriseService';
import { Camera, Music, Smartphone, Compass, Eye, Heart, Menu, Trash } from 'lucide-react';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { isAuthenticated } = useAuthStore();
  const { language } = useUIStore();
  const lang = language || 'en';
  const isVi = lang === 'vi';

  const vdt = {
    reviews: lang === 'vi' ? 'đánh giá' : lang === 'ja' ? '件のレビュー' : lang === 'ko' ? '리뷰' : lang === 'zh' ? '条评价' : lang === 'fr' ? 'avis' : lang === 'de' ? 'Bewertungen' : lang === 'es' ? 'reseñas' : 'reviews',
    tripsCount: lang === 'vi' ? 'chuyến đi' : lang === 'ja' ? '回利用' : lang === 'ko' ? '회 대여' : lang === 'zh' ? '次出行' : lang === 'fr' ? 'trajets' : lang === 'de' ? 'Fahrten' : lang === 'es' ? 'viajes' : 'trips',
    noDeposit: lang === 'vi' ? 'Không cần thế chấp' : lang === 'ja' ? '保証金不要' : lang === 'ko' ? '보증금 없음' : lang === 'zh' ? '免押金' : lang === 'fr' ? 'Sans Dépôt' : lang === 'de' ? 'Keine Kaution' : lang === 'es' ? 'Sin Depósito' : 'No Deposit Required',
    deliveryAvailable: lang === 'vi' ? 'Giao xe tận nơi' : lang === 'ja' ? '配車可能' : lang === 'ko' ? '딜리버리 가능' : lang === 'zh' ? '送车上门' : lang === 'fr' ? 'Livraison disponible' : lang === 'de' ? 'Lieferung verfügbar' : lang === 'es' ? 'Entrega disponible' : 'Delivery Available',
    instantBook: lang === 'vi' ? 'Đặt xe nhanh' : lang === 'ja' ? '即時予約' : lang === 'ko' ? '즉시 예약' : lang === 'zh' ? '闪电预订' : lang === 'fr' ? 'Réservation instantanée' : lang === 'de' ? 'Sofortbuchung' : lang === 'es' ? 'Reserva Instantánea' : 'Instant Book',

    // Specs
    transmission: lang === 'vi' ? 'Hộp số' : lang === 'ja' ? 'トランスミッション' : lang === 'ko' ? '변속기' : lang === 'zh' ? '变速箱' : lang === 'fr' ? 'Transmission' : lang === 'de' ? 'Getriebe' : lang === 'es' ? 'Transmisión' : 'Transmission',
    automatic: lang === 'vi' ? 'Tự động' : lang === 'ja' ? 'AT (オートマ)' : lang === 'ko' ? '자동' : lang === 'zh' ? '自动挡' : lang === 'fr' ? 'Automatique' : lang === 'de' ? 'Automatik' : lang === 'es' ? 'Automático' : 'Automatic',
    manual: lang === 'vi' ? 'Số sàn' : lang === 'ja' ? 'MT (マニュアル)' : lang === 'ko' ? '수동' : lang === 'zh' ? '手动挡' : lang === 'fr' ? 'Manuelle' : lang === 'de' ? 'Manuell' : lang === 'es' ? 'Manual' : 'Manual',
    seats: lang === 'vi' ? 'Số chỗ' : lang === 'ja' ? '座席数' : lang === 'ko' ? '좌석 수' : lang === 'zh' ? '座位数' : lang === 'fr' ? 'Places' : lang === 'de' ? 'Sitzplätze' : lang === 'es' ? 'Asientos' : 'Seats',
    seatsCount: lang === 'vi' ? 'chỗ' : lang === 'ja' ? '人乗り' : lang === 'ko' ? '인승' : lang === 'zh' ? '座' : lang === 'fr' ? 'places' : lang === 'de' ? 'Sitze' : lang === 'es' ? 'plazas' : 'seats',
    fuelType: lang === 'vi' ? 'Nhiên liệu' : lang === 'ja' ? '燃料タイプ' : lang === 'ko' ? '연료' : lang === 'zh' ? '燃料类型' : lang === 'fr' ? 'Carburant' : lang === 'de' ? 'Kraftstoff' : lang === 'es' ? 'Combustible' : 'Fuel Type',
    gasoline: lang === 'vi' ? 'Xăng' : lang === 'ja' ? 'ガソリン' : lang === 'ko' ? '휘발유' : lang === 'zh' ? '汽油' : lang === 'fr' ? 'Essence' : lang === 'de' ? 'Benzin' : lang === 'es' ? 'Gasolina' : 'Gasoline',
    electric: lang === 'vi' ? 'Điện' : lang === 'ja' ? '電気' : lang === 'ko' ? '전기' : lang === 'zh' ? '纯电动' : lang === 'fr' ? 'Électrique' : lang === 'de' ? 'Elektro' : lang === 'es' ? 'Eléctrico' : 'Electric',
    diesel: lang === 'vi' ? 'Dầu (Diesel)' : lang === 'ja' ? 'ディーゼル' : lang === 'ko' ? '디젤' : lang === 'zh' ? '柴油' : lang === 'fr' ? 'Diesel' : lang === 'de' ? 'Diesel' : lang === 'es' ? 'Diésel' : 'Diesel',
    fuelEconomy: lang === 'vi' ? 'Tiêu hao nhiên liệu' : lang === 'ja' ? '燃費' : lang === 'ko' ? '연비' : lang === 'zh' ? '油耗' : lang === 'fr' ? 'Consommation' : lang === 'de' ? 'Verbrauch' : lang === 'es' ? 'Consumo' : 'Fuel Economy',

    // Sections
    description: lang === 'vi' ? 'Mô tả' : lang === 'ja' ? '詳細説明' : lang === 'ko' ? '상세 설명' : lang === 'zh' ? '车辆描述' : lang === 'fr' ? 'Description' : lang === 'de' ? 'Beschreibung' : lang === 'es' ? 'Descripción' : 'Description',
    showLess: lang === 'vi' ? 'Thu gọn ▲' : lang === 'ja' ? '折りたたむ ▲' : lang === 'ko' ? '접기 ▲' : lang === 'zh' ? '收起 ▲' : lang === 'fr' ? 'Réduire ▲' : lang === 'de' ? 'Weniger anzeigen ▲' : lang === 'es' ? 'Mostrar menos ▲' : 'Show less ▲',
    readMore: lang === 'vi' ? 'Xem thêm ▼' : lang === 'ja' ? 'もっと見る ▼' : lang === 'ko' ? '더 보기 ▼' : lang === 'zh' ? '展开更多 ▼' : lang === 'fr' ? 'Voir plus ▼' : lang === 'de' ? 'Mehr lesen ▼' : lang === 'es' ? 'Leer más ▼' : 'Read more ▼',
    featuresAmenities: lang === 'vi' ? 'Tính năng & Tiện ích' : lang === 'ja' ? '装備・機能' : lang === 'ko' ? '편의 기능 및 옵션' : lang === 'zh' ? '配置与设施' : lang === 'fr' ? 'Équipements & Options' : lang === 'de' ? 'Ausstattung & Funktionen' : lang === 'es' ? 'Características y Equipamiento' : 'Features & Amenities',

    // Documents
    requiredDocuments: lang === 'vi' ? 'Giấy tờ thuê xe yêu cầu' : lang === 'ja' ? '必要書類' : lang === 'ko' ? '대여 필요 서류' : lang === 'zh' ? '租车所需证件' : lang === 'fr' ? 'Documents requis' : lang === 'de' ? 'Erforderliche Dokumente' : lang === 'es' ? 'Documentos Requeridos' : 'Required Rental Documents',
    gplxTab: lang === 'vi' ? 'Bằng lái xe & CCCD' : lang === 'ja' ? '運転免許証 & 身分証' : lang === 'ko' ? '운전면허증 및 신분증' : lang === 'zh' ? '驾照及身份证' : lang === 'fr' ? 'Permis de conduire & CNI' : lang === 'de' ? 'Führerschein & Ausweis' : lang === 'es' ? 'Licencia de Conducir y DNI' : 'Driver License & ID',
    passportTab: lang === 'vi' ? 'Hộ chiếu (Passport)' : lang === 'ja' ? 'パスポート' : lang === 'ko' ? '여권' : lang === 'zh' ? '护照' : lang === 'fr' ? 'Passeport' : lang === 'de' ? 'Reisepass' : lang === 'es' ? 'Pasaporte' : 'Passport',
    gplxReqTitle: lang === 'vi' ? 'Yêu cầu Bằng lái xe B1 / B2 trở lên (đối với ô tô)' : lang === 'ja' ? 'B1/B2以上の有効な運転免許証が必要です' : lang === 'ko' ? 'B1 / B2 이상의 운전면허증 필요 (차량)' : lang === 'zh' ? '需持有 B1 / B2 及以上有效驾照（针对汽车）' : lang === 'fr' ? 'Permis B1 / B2 ou supérieur requis' : lang === 'de' ? 'Führerschein Klasse B1 / B2 erforderlich' : lang === 'es' ? 'Requiere Licencia B1 / B2 o superior' : 'Requires Driver License B1 / B2 or above (for cars)',
    gplxReqDesc: lang === 'vi' ? 'Bản gốc thẻ PET hoặc tài khoản VNeID định danh mức 2 có thông tin bằng lái hợp lệ.' : lang === 'ja' ? 'オリジナルPETカードまたは有効な免許情報を含むVNeIDレベル2アカウント。' : lang === 'ko' ? '실물 PET 카드 또는 유효한 면허 정보가 담긴 VNeID Level 2 계정.' : lang === 'zh' ? '实体PET驾驶证或包含有效驾照信息的VNeID 2级账号。' : lang === 'fr' ? 'Permis original PET ou compte VNeID niveau 2 avec informations valides.' : lang === 'de' ? 'Original PET-Karte oder VNeID Stufe 2 Konto mit gültigen Daten.' : lang === 'es' ? 'Tarjeta PET original o cuenta VNeID nivel 2 con datos válidos.' : 'Original PET card or VNeID level 2 account containing valid driver license information.',
    gplxFootNote: lang === 'vi' ? 'Khách thuê cần mang theo bản gốc bằng lái xe để chủ xe đối chiếu khi ký hợp đồng giao xe.' : lang === 'ja' ? 'レンタル開始時にオーナーが確認するため、運転免許証の原本をご持参ください。' : lang === 'ko' ? '차량 인도 계약 서명 시 파트너 확인을 위해 운전면허증 실물을 지참해야 합니다.' : lang === 'zh' ? '取车签署合同时，租客必须出示驾驶证原件供车主核验。' : lang === 'fr' ? 'Le locataire doit présenter son permis original lors de la signature du contrat.' : lang === 'de' ? 'Mieter müssen ihren Original-Führerschein zur Überprüfung vorlegen.' : lang === 'es' ? 'El arrendatario debe llevar su licencia original para verificación al firmar.' : 'Renters must bring their original driver license for the owner to verify when signing the vehicle delivery contract.',

    passportReqTitle: lang === 'vi' ? 'Áp dụng cho người nước ngoài hoặc khách du lịch' : lang === 'ja' ? '外国人・旅行者向け' : lang === 'ko' ? '외국인 및 관광객 적용' : lang === 'zh' ? '适用于外籍人士及游客' : lang === 'fr' ? 'Applicable aux étrangers et touristes' : lang === 'de' ? 'Für Ausländer und Touristen' : lang === 'es' ? 'Aplicable a extranjeros o turistas' : 'Applicable for foreigners or tourists',
    passportReqDesc: lang === 'vi' ? 'Hộ chiếu còn hạn trên 6 tháng kèm tài sản thế chấp trị giá 15 triệu VNĐ hoặc tiền mặt tương đương.' : lang === 'ja' ? '6ヶ月以上有効なパスポートと15,000,000 VND相当の保証金または現金。' : lang === 'ko' ? '유효기간 6개월 이상 여권 및 1,500만 동 상당의 담보/현금 deposit.' : lang === 'zh' ? '有效期6个月以上的护照及价值1500万越南盾的押金或同等资产。' : lang === 'fr' ? 'Passeport valide 6+ mois et dépôt de garantie de 15 Mio VND.' : lang === 'de' ? 'Gültiger Pass (min. 6 Monate) & 15 Mio. VND Kaution.' : lang === 'es' ? 'Pasaporte válido 6+ meses y depósito de 15 Millones VND.' : 'Passport valid for over 6 months along with collateral worth 15 million VND or equivalent cash deposit.',

    // Collateral
    collateral: lang === 'vi' ? 'Thế chấp' : lang === 'ja' ? '保証金・担保' : lang === 'ko' ? '담보 조건' : lang === 'zh' ? '押金担保' : lang === 'fr' ? 'Dépôt de garantie' : lang === 'de' ? 'Kaution' : lang === 'es' ? 'Garantía' : 'Collateral',
    noCollateralTitle: lang === 'vi' ? 'Không yêu cầu đặt cọc thế chấp' : lang === 'ja' ? '保証金・担保不要' : lang === 'ko' ? '담보 필요 없음' : lang === 'zh' ? '无需押金担保' : lang === 'fr' ? 'Aucun dépôt de garantie requis' : lang === 'de' ? 'Keine Kaution erforderlich' : lang === 'es' ? 'No se requiere depósito de garantía' : 'No Collateral Deposit Required',
    noCollateralDesc: lang === 'vi' ? 'LuxeWay bảo lãnh toàn bộ tiền thế chấp. Khách hàng chỉ cần xuất trình giấy tờ hợp lệ.' : lang === 'ja' ? 'LuxeWayが保証金を全額保証します。有効な書類をご提示いただくだけでOKです。' : lang === 'ko' ? 'LuxeWay가 보증금을 전액 보증합니다. 유효한 서류만 제출하시면 됩니다.' : lang === 'zh' ? 'LuxeWay 全程担保押金，客户只需出示有效证件即可。' : lang === 'fr' ? 'LuxeWay garantit entièrement le dépôt. Il suffit de présenter des documents valides.' : lang === 'de' ? 'LuxeWay übernimmt die Kaution. Sie müssen nur gültige Dokumente vorlegen.' : lang === 'es' ? 'LuxeWay garantiza totalmente el depósito. Solo necesitas presentar documentos válidos.' : 'LuxeWay fully guarantees the collateral deposit. Customers only need to present valid documents.',

    // Terms & Policies
    termsPolicies: lang === 'vi' ? 'Điều khoản & Chính sách' : lang === 'ja' ? '利用規約・政策' : lang === 'ko' ? '이용 약관 및 정책' : lang === 'zh' ? '条款与政策' : lang === 'fr' ? 'Conditions & Politiques' : lang === 'de' ? 'Bedingungen & Richtlinien' : lang === 'es' ? 'Términos y Políticas' : 'Terms & Policies',
    cancelPolicy: lang === 'vi' ? 'CHÍNH SÁCH HỦY CHUYẾN' : lang === 'ja' ? 'キャンセルポリシー' : lang === 'ko' ? '취소 정책' : lang === 'zh' ? '取消政策' : lang === 'fr' ? 'POLITIQUE D\'ANNULATION' : lang === 'de' ? 'STORNIERUNGSRICHTLINIE' : lang === 'es' ? 'POLÍTICA DE CANCELACIÓN' : 'CANCELLATION POLICY',
    timeOfCancel: lang === 'vi' ? 'Thời điểm hủy' : lang === 'ja' ? 'キャンセル時期' : lang === 'ko' ? '취소 시점' : lang === 'zh' ? '取消时间' : lang === 'fr' ? 'Moment de l\'annulation' : lang === 'de' ? 'Stornierungszeit' : lang === 'es' ? 'Momento de Cancelación' : 'Time of Cancellation',
    renterReceives: lang === 'vi' ? 'Khách nhận lại' : lang === 'ja' ? '返金額' : lang === 'ko' ? '환불 금액' : lang === 'zh' ? '退款金额' : lang === 'fr' ? 'Remboursement' : lang === 'de' ? 'Rückerstattung' : lang === 'es' ? 'Reembolso' : 'Renter Receives',
    serviceFee: lang === 'vi' ? 'Phí dịch vụ LuxeWay' : lang === 'ja' ? 'LuxeWay サービス料' : lang === 'ko' ? 'LuxeWay 수수료' : lang === 'zh' ? 'LuxeWay 服务费' : lang === 'fr' ? 'Frais de service' : lang === 'de' ? 'Servicegebühr' : lang === 'es' ? 'Tarifa de servicio' : 'LuxeWay Service Fee',
    before7Days: lang === 'vi' ? 'Trước chuyến > 7 ngày' : lang === 'ja' ? '乗車7日前まで' : lang === 'ko' ? '대여 7일 전' : lang === 'zh' ? '行程前 > 7天' : lang === 'fr' ? 'Plus de 7 jours avant' : lang === 'de' ? 'Mehr als 7 Tage vor Reise' : lang === 'es' ? 'Más de 7 días antes' : 'Before trip > 7 days',
    refund100: lang === 'vi' ? 'Hoàn 100%' : lang === 'ja' ? '100% 全額返金' : lang === 'ko' ? '100% 전액 환불' : lang === 'zh' ? '100% 全额退款' : lang === 'fr' ? 'Remboursement 100%' : lang === 'de' ? '100% Rückerstattung' : lang === 'es' ? 'Reembolso 100%' : '100% Refund',
    freeFee: lang === 'vi' ? 'Miễn phí' : lang === 'ja' ? '無料' : lang === 'ko' ? '무료' : lang === 'zh' ? '免费' : lang === 'fr' ? 'Gratuit' : lang === 'de' ? 'Kostenlos' : lang === 'es' ? 'Gratis' : 'Free',
    before1to7Days: lang === 'vi' ? '1 - 7 ngày trước chuyến' : lang === 'ja' ? '乗車1〜7日前' : lang === 'ko' ? '대여 1~7일 전' : lang === 'zh' ? '行程前 1 - 7天' : lang === 'fr' ? '1 à 7 jours avant' : lang === 'de' ? '1 - 7 Tage vor Reise' : lang === 'es' ? '1 - 7 días antes' : '1 - 7 days before trip',
    refund90: lang === 'vi' ? 'Hoàn 90%' : lang === 'ja' ? '90% 返金' : lang === 'ko' ? '90% 환불' : lang === 'zh' ? '90% 退款' : lang === 'fr' ? 'Remboursement 90%' : lang === 'de' ? '90% Rückerstattung' : lang === 'es' ? 'Reembolso 90%' : '90% Refund',
    fee10Percent: lang === 'vi' ? '10% tiền thuê xe' : lang === 'ja' ? 'レンタル料の10%' : lang === 'ko' ? '대여료의 10%' : lang === 'zh' ? '租金的 10%' : lang === 'fr' ? '10% du loyer' : lang === 'de' ? '10% Mietgebühr' : lang === 'es' ? '10% del alquiler' : '10% rental fee',
    within24h: lang === 'vi' ? 'Trong vòng 24 giờ' : lang === 'ja' ? '24時間以内' : lang === 'ko' ? '24시간 이내' : lang === 'zh' ? '24小时以内' : lang === 'fr' ? 'Moins de 24 heures' : lang === 'de' ? 'Innerhalb 24 Std.' : lang === 'es' ? 'En 24 horas' : 'Within 24 hours',
    noRefund: lang === 'vi' ? 'Không hoàn tiền' : lang === 'ja' ? '返金なし' : lang === 'ko' ? '환불 불가' : lang === 'zh' ? '不予退款' : lang === 'fr' ? 'Non remboursable' : lang === 'de' ? 'Keine Rückerstattung' : lang === 'es' ? 'Sin Reembolso' : 'No Refund',
    fee100Deposit: lang === 'vi' ? '100% phí cọc giữ chỗ' : lang === 'ja' ? '手配手数料100%' : lang === 'ko' ? '예약금 100%' : lang === 'zh' ? '100% 订金' : lang === 'fr' ? '100% des frais de réservation' : lang === 'de' ? '100% Reservierungsgebühr' : lang === 'es' ? '100% tarifa de reserva' : '100% reservation fee',

    // Location & Owner
    parkingLocation: lang === 'vi' ? 'Vị trí xe' : lang === 'ja' ? '停車場所・マップ' : lang === 'ko' ? '차량 주차 위치' : lang === 'zh' ? '停放位置' : lang === 'fr' ? 'Emplacement du véhicule' : lang === 'de' ? 'Fahrzeugstandort' : lang === 'es' ? 'Ubicación del Vehículo' : 'Parking Location',
    pickupLocation: lang === 'vi' ? 'Địa điểm nhận xe' : lang === 'ja' ? '受取場所' : lang === 'ko' ? '픽업 장소' : lang === 'zh' ? '取车地点' : lang === 'fr' ? 'Lieu de prise en charge' : lang === 'de' ? 'Abholort' : lang === 'es' ? 'Lugar de Recogida' : 'Pickup Location',
    ownerInfo: lang === 'vi' ? 'Thông tin chủ xe' : lang === 'ja' ? 'オーナー情報' : lang === 'ko' ? '파트너 정보' : lang === 'zh' ? '车主信息' : lang === 'fr' ? 'Informations Propriétaire' : lang === 'de' ? 'Vermieterinformationen' : lang === 'es' ? 'Información del Propietario' : 'Owner Information',
    verifiedPartner: lang === 'vi' ? 'ĐỐI TÁC ĐÃ XÁC MINH' : lang === 'ja' ? '認証済みパートナー' : lang === 'ko' ? '인증 파트너' : lang === 'zh' ? '认证车主' : lang === 'fr' ? 'PARTENAIRE VÉRIFIÉ' : lang === 'de' ? 'VERIFIZIERTER PARTNER' : lang === 'es' ? 'SOCIO VERIFICADO' : 'VERIFIED PARTNER',
    memberSince: lang === 'vi' ? 'Thành viên từ' : lang === 'ja' ? '登録年' : lang === 'ko' ? '가입 연도' : lang === 'zh' ? '注册年份' : lang === 'fr' ? 'Membre depuis' : lang === 'de' ? 'Mitglied seit' : lang === 'es' ? 'Miembro desde' : 'Member since',
    ratingLabel: lang === 'vi' ? 'Đánh giá' : lang === 'ja' ? '評価' : lang === 'ko' ? '평점' : lang === 'zh' ? '评分' : lang === 'fr' ? 'Évaluation' : lang === 'de' ? 'Bewertung' : lang === 'es' ? 'Valoración' : 'Rating',
    responseRateLabel: lang === 'vi' ? 'Tỉ lệ phản hồi' : lang === 'ja' ? '返答率' : lang === 'ko' ? '응답률' : lang === 'zh' ? '回复率' : lang === 'fr' ? 'Taux de réponse' : lang === 'de' ? 'Antwortrate' : lang === 'es' ? 'Tasa de respuesta' : 'Response Rate',
    tripsCountLabel: lang === 'vi' ? 'Số chuyến' : lang === 'ja' ? '総予約数' : lang === 'ko' ? '총 대여 건수' : lang === 'zh' ? '完成订单' : lang === 'fr' ? 'Trajets effectués' : lang === 'de' ? 'Abschlüsse' : lang === 'es' ? 'Viajes realizados' : 'Trips Count',
    avgResponseNote: lang === 'vi' ? '* Tỷ lệ phản hồi trung bình: 100% trong vòng 15 phút.' : lang === 'ja' ? '※ 平均返答率: 15分以内に100%' : lang === 'ko' ? '* 평균 응답률: 15분 이내 100%' : lang === 'zh' ? '* 平均回复率：15分钟内 100%' : lang === 'fr' ? '* Taux de réponse moyen : 100% en moins de 15 minutes.' : lang === 'de' ? '* Durchschnittliche Antwortzeit: 100% innerhalb von 15 Minuten.' : lang === 'es' ? '* Tasa media de respuesta: 100% en 15 minutos.' : '* Average response rate: 100% within 15 minutes.',

    // Booking Card Widget
    rentalPrice: lang === 'vi' ? 'Giá thuê xe' : lang === 'ja' ? 'レンタル料金' : lang === 'ko' ? '대여 요금' : lang === 'zh' ? '租金价格' : lang === 'fr' ? 'Tarif de location' : lang === 'de' ? 'Mietpreis' : lang === 'es' ? 'Precio de Alquiler' : 'Rental Price',
    perDay: lang === 'vi' ? 'ngày' : lang === 'ja' ? '日' : lang === 'ko' ? '일' : lang === 'zh' ? '天' : lang === 'fr' ? 'jour' : lang === 'de' ? 'Tag' : lang === 'es' ? 'día' : 'day',
    pickupDate: lang === 'vi' ? 'NGÀY NHẬN XE' : lang === 'ja' ? '受取日' : lang === 'ko' ? '픽업 날짜' : lang === 'zh' ? '取车日期' : lang === 'fr' ? 'DATE DE DEPART' : lang === 'de' ? 'ABHOLPADATUM' : lang === 'es' ? 'FECHA DE RECOGIDA' : 'PICKUP DATE',
    returnDate: lang === 'vi' ? 'NGÀY TRẢ XE' : lang === 'ja' ? '返却日' : lang === 'ko' ? '반납 날짜' : lang === 'zh' ? '还车日期' : lang === 'fr' ? 'DATE DE RETOUR' : lang === 'de' ? 'RÜCKGABEDATUM' : lang === 'es' ? 'FECHA DE DEVOLUCIÓN' : 'RETURN DATE',
    additionalServices: lang === 'vi' ? 'Dịch vụ bổ sung' : lang === 'ja' ? '追加オプション' : lang === 'ko' ? '추가 옵션' : lang === 'zh' ? '附加服务' : lang === 'fr' ? 'Services additionnels' : lang === 'de' ? 'Zusatzleistungen' : lang === 'es' ? 'Servicios Adicionales' : 'Additional Services',
    tripInsuranceTitle: lang === 'vi' ? 'Bảo hiểm chuyến đi' : lang === 'ja' ? '旅行・車両保険' : lang === 'ko' ? '여행 및 차량 보험' : lang === 'zh' ? '行程保险' : lang === 'fr' ? 'Assurance voyage' : lang === 'de' ? 'Reiseversicherung' : lang === 'es' ? 'Seguro de Viaje' : 'Trip Insurance',
    tripInsuranceSub: lang === 'vi' ? 'Bảo vệ rủi ro va chạm (+15%)' : lang === 'ja' ? '免責補償 (+15%)' : lang === 'ko' ? '자차 면책 보험 (+15%)' : lang === 'zh' ? '碰撞免责保障 (+15%)' : lang === 'fr' ? 'Exonération des dommages (+15%)' : lang === 'de' ? 'Vollkaskoschutz (+15%)' : lang === 'es' ? 'Exención de daños (+15%)' : 'Collision damage waiver (+15%)',
    homeDeliveryTitle: lang === 'vi' ? 'Giao xe tận nơi' : lang === 'ja' ? '指定場所への配車' : lang === 'ko' ? '원하는 장소 딜리버리' : lang === 'zh' ? '指定地点送车' : lang === 'fr' ? 'Livraison à domicile' : lang === 'de' ? 'Lieferung nach Hause' : lang === 'es' ? 'Entrega a Domicilio' : 'Delivery Available',
    homeDeliverySub: lang === 'vi' ? 'Giao nhận tại nhà (+40.000₫)' : lang === 'ja' ? '自宅・ホテルへお届け (+40,000₫)' : lang === 'ko' ? '집/호텔까지 딜리버리 (+40,000₫)' : lang === 'zh' ? '送到指定位置 (+40,000₫)' : lang === 'fr' ? 'Livraison à l\'adresse (+40 000₫)' : lang === 'de' ? 'Lieferung an Adresse (+40.000₫)' : lang === 'es' ? 'Entrega en dirección (+40.000₫)' : 'Home delivery (+₫40,000)',
    bookNowBtn: lang === 'vi' ? 'ĐẶT XE NGAY' : lang === 'ja' ? '今すぐ予約する' : lang === 'ko' ? '지금 예약하기' : lang === 'zh' ? '立即预订' : lang === 'fr' ? 'RÉSERVER MAINTENANT' : lang === 'de' ? 'JETZT BUCHEN' : lang === 'es' ? 'RESERVAR AHORA' : 'BOOK NOW',
  };

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<any[]>([]);
  
  // Gallery slider state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Collapsible description state
  const [descExpanded, setDescExpanded] = useState(false);

  // Documents tab selection
  const [selectedDocTab, setSelectedDocTab] = useState<'gplx' | 'passport'>('gplx');

  // Booking options state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [includeDelivery, setIncludeDelivery] = useState(false);
  
  // Validation modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    vehicleService.getVehicleDetail(id)
      .then(data => {
        if (data) {
          setVehicle(data);
          
          // Load recommendations / similar listings
          if (data.vehicleType === 'motorbike') {
            recommendationService.getSimilarMotorbikes(data.id)
              .then(sim => {
                if (sim && sim.length > 0) {
                  setSimilarVehicles(sim);
                } else {
                  // Fallback
                  vehicleService.getAll({ vehicleType: 'motorbike' })
                    .then(res => setSimilarVehicles(res.data.filter((v: any) => v.id !== data.id).slice(0, 4)))
                    .catch(() => {});
                }
              })
              .catch(() => {
                vehicleService.getAll({ vehicleType: 'motorbike' })
                  .then(res => setSimilarVehicles(res.data.filter((v: any) => v.id !== data.id).slice(0, 4)))
                  .catch(() => {});
              });
          } else {
            recommendationService.getSimilarCars(data.id)
              .then(sim => {
                if (sim && sim.length > 0) {
                  setSimilarVehicles(sim);
                } else {
                  // Fallback
                  vehicleService.getAll({ vehicleType: 'car' })
                    .then(res => setSimilarVehicles(res.data.filter((v: any) => v.id !== data.id).slice(0, 4)))
                    .catch(() => {});
                }
              })
              .catch(() => {
                vehicleService.getAll({ vehicleType: 'car' })
                  .then(res => setSimilarVehicles(res.data.filter((v: any) => v.id !== data.id).slice(0, 4)))
                  .catch(() => {});
              });
          }
        } else {
          toast.error('Error', isVi ? 'Không tìm thấy thông tin xe.' : 'Vehicle details not found.');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error', isVi ? 'Lỗi tải chi tiết xe từ máy chủ.' : 'Failed to load vehicle details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isVi]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090D1A]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">{isVi ? 'Đang tải thông tin xe...' : 'Loading vehicle details...'}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090D1A]">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{isVi ? 'Không tìm thấy xe' : 'Vehicle Not Found'}</h2>
          <p className="text-slate-500 mb-6">{isVi ? 'Xe này không tồn tại hoặc chưa được duyệt.' : 'This vehicle does not exist or has not been approved.'}</p>
          <button onClick={() => navigate('/marketplace')} className="w-full py-3 bg-[#0B1221] text-white rounded-xl font-bold">
            {isVi ? 'Quay lại Marketplace' : 'Back to Marketplace'}
          </button>
        </div>
      </div>
    );
  }

  // Pre-book criteria validation click handler
  const handleBookClick = async () => {
    if (!isAuthenticated) {
      toast.warning(isVi ? 'Yêu cầu đăng nhập' : 'Authentication Required', isVi ? 'Vui lòng đăng nhập để tiến hành đặt xe.' : 'Please log in to complete your booking.');
      navigate('/auth/login');
      return;
    }

    if (!startDate || !endDate) {
      toast.warning(isVi ? 'Chọn ngày thuê' : 'Dates Required', isVi ? 'Vui lòng chọn ngày nhận xe và ngày trả xe.' : 'Please choose pick-up and return dates.');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        vehicleId: vehicle.id,
        startDate,
        endDate,
        includeInsurance,
        includeDelivery
      };
      
      const res = await apiClient.post<any>('/bookings/validate-pre-book', payload);
      
      if (res.success || res.data?.valid) {
        const params = new URLSearchParams({
          start: startDate,
          end: endDate,
          insurance: includeInsurance ? 'true' : 'false',
          delivery: includeDelivery ? 'true' : 'false',
        });
        navigate(`/booking/${vehicle.id}?${params.toString()}`);
      } else {
        setErrorModalMessage(res.message || (isVi ? 'Xác thực đặt xe thất bại' : 'Validation failed'));
        setShowErrorModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorModalMessage(err.message || err.error || (isVi ? 'Quy trình kiểm tra điều kiện đặt xe không thành công.' : 'Booking validation failed.'));
      setShowErrorModal(true);
    } finally {
      setBookingLoading(false);
    }
  };

  // Image list preparation
  const imageList = vehicle.vehicleImages && vehicle.vehicleImages.length > 0 
    ? vehicle.vehicleImages 
    : [vehicle.thumbnailUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'];

  const discountPercent = vehicle.discount ? Number(vehicle.discount) : 0;
  const finalPrice = vehicle.finalPrice ? Number(vehicle.finalPrice) : Number(vehicle.pricePerDay);
  const showMap = !!(vehicle.location?.lat && vehicle.location?.lng && Number(vehicle.location.lat) !== 0 && Number(vehicle.location.lng) !== 0);

  const days = (startDate && endDate) 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const rawBase = Number(vehicle.pricePerDay) * (days || 1);
  const discountAmt = Math.round(rawBase * (discountPercent / 100));
  const basePriceAfterDiscount = rawBase - discountAmt;
  const insuranceFee = includeInsurance ? Math.round(Number(vehicle.pricePerDay) * 0.15 * (days || 1)) : 0;
  const deliveryFee = includeDelivery ? (Number(vehicle.deliveryFee) || 0) : 0;
  const serviceFee = Math.round(basePriceAfterDiscount * 0.12);
  const taxes = Math.round(basePriceAfterDiscount * 0.08);
  const estimatedTotal = basePriceAfterDiscount + insuranceFee + deliveryFee + serviceFee + taxes;

  const featureIcons: Record<string, React.JSX.Element> = {
    gps: <Compass className="w-4 h-4 text-[#D4AF37]" />,
    wifi: <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />,
    camera: <Camera className="w-4 h-4 text-[#D4AF37]" />,
    bluetooth: <Smartphone className="w-4 h-4 text-[#D4AF37]" />,
    map: <MapPin className="w-4 h-4 text-[#D4AF37]" />,
    safety: <Shield className="w-4 h-4 text-[#D4AF37]" />
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D1A] pt-24 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div 
            onClick={() => setShowFullscreen(true)}
            className="lg:col-span-2 relative h-[320px] sm:h-[460px] bg-black rounded-3xl overflow-hidden shadow-md border border-slate-200/50 dark:border-white/5 cursor-pointer group"
          >
            <img 
              src={resolveImageUrl(imageList[activeImageIdx])} 
              alt={vehicle.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <span className="text-white text-xs font-bold bg-[#0B1221]/80 backdrop-blur px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow">
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                {isVi ? 'Xem ảnh chế độ đầy đủ' : 'View full-screen gallery'}
              </span>
            </div>

            {imageList.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-[#0B1221]/75 backdrop-blur text-white text-[10px] font-black px-3.5 py-1.5 rounded-full select-none shadow">
                {activeImageIdx + 1} / {imageList.length}
              </div>
            )}

            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full shadow flex items-center gap-1.5 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Giảm {discountPercent}%
              </div>
            )}
          </div>
          
          {/* Thumbnails grid */}
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-3 h-fit">
            {imageList.slice(0, 6).map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  "relative h-20 sm:h-24 lg:h-[110px] rounded-2xl overflow-hidden border-2 transition-all",
                  activeImageIdx === idx ? "border-[#D4AF37] scale-[0.98] shadow-md shadow-[#D4AF37]/10" : "border-transparent hover:border-slate-350 dark:hover:border-slate-800"
                )}
              >
                <img src={resolveImageUrl(img)} alt="Thumbnail" className="w-full h-full object-cover" />
                {idx === 5 && imageList.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-sm">
                    +{imageList.length - 6}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Double Column Info Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Header Card */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm transition-colors">
              <h1 className="text-2xl sm:text-3xl font-display font-black text-[#0B1221] dark:text-white uppercase tracking-tight mb-2">
                {vehicle.brand} {vehicle.model} <span className="text-slate-400 font-sans font-light">{vehicle.year}</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="font-black text-slate-850 dark:text-white text-sm">{vehicle.rating?.toFixed(1) || '5.0'}</span>
                  <span className="font-medium text-slate-455">({vehicle.totalReviews || 0} {vdt.reviews})</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div>
                  <span className="font-black text-slate-850 dark:text-white text-sm">{vehicle.totalBookings || 12}</span> {vdt.tripsCount}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-1 font-medium">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{sanitizeLocation(vehicle.location?.city || 'Hồ Chí Minh')}</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 pt-2 select-none">
                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  {vdt.noDeposit}
                </span>
                {vehicle.deliveryAvailable && (
                  <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20">
                    {vdt.deliveryAvailable}
                  </span>
                )}
                {vehicle.instantBook && (
                  <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    {vdt.instantBook}
                  </span>
                )}
              </div>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">{vdt.transmission}</p>
                <p className="font-extrabold text-slate-800 dark:text-white capitalize text-sm">
                  {vehicle.specs?.transmission ? (vehicle.specs.transmission.toLowerCase().includes('auto') ? vdt.automatic : vdt.manual) : vdt.automatic}
                </p>
              </div>
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">{vdt.seats}</p>
                <p className="font-extrabold text-slate-800 dark:text-white text-sm">{vehicle.seatNumber || vehicle.specs?.seats || 5} {vdt.seatsCount}</p>
              </div>
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">{vdt.fuelType}</p>
                <p className="font-extrabold text-slate-800 dark:text-white capitalize text-sm">
                  {vehicle.specs?.fuelType ? (vehicle.specs.fuelType.toLowerCase().includes('elec') ? vdt.electric : vehicle.specs.fuelType.toLowerCase().includes('diesel') ? vdt.diesel : vdt.gasoline) : vdt.gasoline}
                </p>
              </div>
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm text-center">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-1">{vdt.fuelEconomy}</p>
                <p className="font-extrabold text-slate-800 dark:text-white text-sm">{vehicle.vehicleType === 'motorbike' ? '2.5L/100km' : '7.0L/100km'}</p>
              </div>
            </div>

            {/* Description Collapsible block */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">{vdt.description}</h3>
              <p className={cn(
                "text-slate-650 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-line",
                !descExpanded && "line-clamp-4"
              )}>
                {vehicle.description || 'The owner has not provided a detailed description for this vehicle.'}
              </p>
              
              <button 
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-3 text-xs font-black text-[#D4AF37] hover:underline"
              >
                {descExpanded ? vdt.showLess : vdt.readMore}
              </button>
            </div>

            {/* Amenities Grid */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
                <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-[#D4AF37] pl-3">{vdt.featuresAmenities}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {vehicle.features.map((feature, idx) => {
                    const cleanKey = feature.toLowerCase().trim();
                    let icon = <Check className="w-4 h-4 text-emerald-500" />;
                    for (const [k, v] of Object.entries(featureIcons)) {
                      if (cleanKey.includes(k)) {
                        icon = v;
                        break;
                      }
                    }
                    return (
                      <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        {icon}
                        <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Required Rental Documents with tab selectors */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-[#D4AF37] pl-3">{vdt.requiredDocuments}</h3>
              
              {/* Tab options selector */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
                <button
                  onClick={() => setSelectedDocTab('gplx')}
                  className={cn(
                    "flex-1 pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all",
                    selectedDocTab === 'gplx' ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-slate-400 hover:text-slate-300"
                  )}
                >
                  {vdt.gplxTab}
                </button>
                <button
                  onClick={() => setSelectedDocTab('passport')}
                  className={cn(
                    "flex-1 pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all",
                    selectedDocTab === 'passport' ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-slate-400 hover:text-slate-300"
                  )}
                >
                  {vdt.passportTab}
                </button>
              </div>

              {selectedDocTab === 'gplx' ? (
                <div className="space-y-4">
                  <div className="flex gap-3 text-xs bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold">{vdt.gplxReqTitle}</p>
                      <p className="mt-1 font-medium text-[11px] opacity-90">{vdt.gplxReqDesc}</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-1 leading-relaxed">
                    {vdt.gplxFootNote}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-3 text-xs bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold">{vdt.passportReqTitle}</p>
                      <p className="mt-1 font-medium text-[11px] opacity-90">{vdt.passportReqDesc}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Collateral Details */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">{vdt.collateral}</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3.5 items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-lg">💰</div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-850 dark:text-white">{vdt.noCollateralTitle}</h4>
                  <p className="text-[11px] font-medium text-slate-455 mt-0.5">{vdt.noCollateralDesc}</p>
                </div>
              </div>
            </div>

            {/* Policies and Terms Grid Cancellation Table */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider border-l-4 border-[#D4AF37] pl-3">{vdt.termsPolicies}</h3>
              
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wide">{vdt.cancelPolicy}</h4>
                
                {/* Cancellation Refund Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-900/60 p-3 font-extrabold border-b border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white">
                    <span>{vdt.timeOfCancel}</span>
                    <span>{vdt.renterReceives}</span>
                    <span>{vdt.serviceFee}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-600 dark:text-slate-400">
                    <span>{vdt.before7Days}</span>
                    <span className="text-emerald-500 font-extrabold">{vdt.refund100}</span>
                    <span>{vdt.freeFee}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-600 dark:text-slate-400">
                    <span>{vdt.before1to7Days}</span>
                    <span className="text-amber-500 font-extrabold">{vdt.refund90}</span>
                    <span>{vdt.fee10Percent}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 font-medium text-slate-600 dark:text-slate-400">
                    <span>{vdt.within24h}</span>
                    <span className="text-red-500 font-extrabold">{vdt.noRefund}</span>
                    <span>{vdt.fee100Deposit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-4 border-l-4 border-[#D4AF37] pl-3">{vdt.parkingLocation}</h3>
              
              {showMap ? (
                <div className="relative h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <LuxeWayMap 
                    vehicles={[vehicle]} 
                    selectedVehicleId={vehicle.id} 
                    height="100%" 
                    pickupCoords={[Number(vehicle.location?.lat), Number(vehicle.location?.lng)]}
                    disableAutoPan={true}
                  />
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800">
                  <MapPin className="w-8 h-8 text-amber-500 mb-2" />
                  <h4 className="font-bold text-foreground text-sm mb-1">{vdt.pickupLocation}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.location?.address + ", " + vehicle.location?.city}</p>
                </div>
              )}
            </div>

            {/* Host Section */}
            {vehicle.owner && (
              <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
                <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-[#D4AF37] pl-3">{vdt.ownerInfo}</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center font-display font-black text-[#D4AF37] text-2xl overflow-hidden">
                      {vehicle.owner.avatar ? (
                        <img src={resolveImageUrl(vehicle.owner.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        vehicle.owner.displayName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-850 dark:text-white flex items-center gap-2 text-base">
                        {vehicle.owner.displayName}
                        {vehicle.owner.approvalBadge && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            {vdt.verifiedPartner}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {vdt.memberSince} 2024
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-center select-none font-bold">
                    <div>
                      <p className="text-xs text-slate-400">{vdt.ratingLabel}</p>
                      <p className="font-black text-slate-850 dark:text-white text-lg flex items-center justify-center gap-0.5 mt-0.5">
                        {vehicle.owner.rating?.toFixed(1) || '5.0'} <Star className="w-4 h-4 text-amber-500 fill-amber-500 inline" />
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <p className="text-xs text-slate-400">{vdt.responseRateLabel}</p>
                      <p className="font-black text-slate-850 dark:text-white text-lg mt-0.5">{vehicle.owner.responseRate || 100}%</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <p className="text-xs text-slate-400">{vdt.tripsCountLabel}</p>
                      <p className="font-black text-slate-850 dark:text-white text-lg mt-0.5">{vehicle.owner.totalTrips || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-xs font-medium text-slate-400">
                  {vdt.avgResponseNote}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="h-fit lg:sticky lg:top-24">
            <div className="bg-white dark:bg-[#131F35] border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-xl space-y-6 transition-colors">
              
              {/* Rental pricing */}
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{vdt.rentalPrice}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-display font-black text-[#0B1221] dark:text-white">{formatCurrency(finalPrice)}</span>
                  <span className="text-xs text-slate-400 font-bold">/{vdt.perDay}</span>
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold line-through text-slate-400 ml-2">
                      {formatCurrency(Number(vehicle.pricePerDay))}
                    </span>
                  )}
                </div>
              </div>

              {/* Date pickers */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5">{vdt.pickupDate}</label>
                  <input 
                    type="date" 
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5">{vdt.returnDate}</label>
                  <input 
                    type="date" 
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              {/* Addons toggle */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{vdt.additionalServices}</h4>
                
                {/* Insurance Protection */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-slate-850 dark:text-white">{vdt.tripInsuranceTitle}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{vdt.tripInsuranceSub}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeInsurance}
                    onChange={(e) => setIncludeInsurance(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* Delivery Option */}
                {vehicle.deliveryAvailable && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-850 dark:text-white">{vdt.homeDeliveryTitle}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {vdt.homeDeliverySub}
                      </p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={includeDelivery}
                      onChange={(e) => setIncludeDelivery(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-200 dark:border-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Bill Breakdown */}
              {days > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2.5 font-bold">
                  <div className="flex justify-between text-slate-400">
                    <span>{vdt.rentalPrice} ({days} {vdt.perDay})</span>
                    <span className="text-slate-800 dark:text-white">{formatCurrency(rawBase)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>{lang === 'vi' ? 'Ưu đãi giảm giá' : 'Discount'}</span>
                      <span>-{formatCurrency(discountAmt)}</span>
                    </div>
                  )}
                  {includeInsurance && (
                    <div className="flex justify-between text-slate-450">
                      <span>{vdt.tripInsuranceTitle}</span>
                      <span className="text-slate-800 dark:text-white">+{formatCurrency(insuranceFee)}</span>
                    </div>
                  )}
                  {includeDelivery && (
                    <div className="flex justify-between text-slate-450">
                      <span>{vdt.homeDeliveryTitle}</span>
                      <span className="text-slate-800 dark:text-white">+{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-450">
                    <span>LuxeWay Service Fee (12%)</span>
                    <span className="text-slate-800 dark:text-white">+{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-450">
                    <span>VAT (8%)</span>
                    <span className="text-slate-800 dark:text-white">+{formatCurrency(taxes)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-slate-850 dark:text-white">{lang === 'vi' ? 'TỔNG CỘNG TẠM TÍNH' : 'ESTIMATED TOTAL'}</span>
                    <span className="text-[#D4AF37] font-display text-base">{formatCurrency(estimatedTotal)}</span>
                  </div>
                </div>
              )}

              {/* Book Action Button */}
              <button
                onClick={handleBookClick}
                disabled={bookingLoading}
                className="w-full py-4 bg-[#0B1221] dark:bg-white text-white dark:text-[#0B1221] hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-white disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 font-display font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {lang === 'vi' ? 'ĐANG KIỂM TRA ĐIỀU KIỆN...' : 'VERIFYING ELIGIBILITY...'}
                  </>
                ) : (
                  vdt.bookNowBtn
                )}
              </button>

            </div>
          </div>

        </div>

        {/* Similar Vehicles Carousel / Slider */}
        {similarVehicles && similarVehicles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200/60 dark:border-white/5">
            <h3 className="text-lg font-display font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6">Similar Vehicles</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarVehicles.map(v => {
                const thumbnailSrc = v.thumbnail || v.thumbnailUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                
                const displayPrice = v.pricePerDay >= 1000 
                  ? `${(v.pricePerDay / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`
                  : `${v.pricePerDay}`;
                  
                const discountPercent = v.discount || 0;
                
                return (
                  <div 
                    key={v.id}
                    onClick={() => {
                      const typePath = v.vehicleType?.toLowerCase() === 'motorbike' || v.type?.toLowerCase() === 'motorbike' ? 'motorbikes' : 'cars';
                      navigate(`/${typePath}/${v.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-white dark:bg-[#131F35] rounded-3xl border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-lg hover:border-[#D4AF37]/35 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      <img 
                        src={thumbnailSrc} 
                        alt={v.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 select-none">
                        {discountPercent > 0 && (
                          <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
                            Giảm {discountPercent}%
                          </span>
                        )}
                        <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
                          No Deposit Required
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-850 dark:text-white truncate uppercase tracking-tight">
                          {v.brand} {v.name.replace(new RegExp('^' + v.brand, 'i'), '').trim()}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-450 mt-1 font-bold">
                          <span>Automatic</span>
                          <span>•</span>
                          <span>{v.type?.toLowerCase() === 'motorbike' || v.vehicleType?.toLowerCase() === 'motorbike' ? '2 seats' : '5 seats'}</span>
                          <span>•</span>
                          <span>Gasoline</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-[#D4AF37] font-bold">★</span>
                          <span className="font-extrabold text-slate-800 dark:text-white">{Number(v.rating || 5.0).toFixed(1)}</span>
                          <span className="text-slate-450">({v.totalTrips || v.totalReviews || 12} trips)</span>
                        </div>
                        
                        <p className="font-display font-black text-[#0B1221] dark:text-white leading-none">
                          <span className="text-base text-amber-500">{displayPrice}</span>
                          <span className="text-[9px] text-slate-450 font-bold font-sans">/day</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* FULLSCREEN PHOTO VIEWER MODAL */}
      {showFullscreen && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-white px-2 py-4">
            <span className="text-xs font-extrabold tracking-wider bg-white/10 px-3 py-1.5 rounded-full select-none">
              Ảnh xe ({activeImageIdx + 1} / {imageList.length})
            </span>
            <button 
              onClick={() => setShowFullscreen(false)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all text-xs font-black select-none"
            >
              Đóng (Esc)
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <img 
              src={resolveImageUrl(imageList[activeImageIdx])} 
              alt="Fullscreen slide" 
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />
            
            {imageList.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImageIdx(prev => prev === 0 ? imageList.length - 1 : prev - 1); }}
                  className="absolute left-4 p-3.5 bg-white/15 hover:bg-white/30 text-white rounded-full transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImageIdx(prev => prev === imageList.length - 1 ? 0 : prev + 1); }}
                  className="absolute right-4 p-3.5 bg-white/15 hover:bg-white/30 text-white rounded-full transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom small indicators list */}
          <div className="flex gap-2.5 overflow-x-auto justify-center py-6 select-none scrollbar-none">
            {imageList.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  "relative w-14 h-10 rounded-lg overflow-hidden border transition-all flex-shrink-0",
                  activeImageIdx === idx ? "border-[#D4AF37] scale-110" : "border-white/20 hover:border-white/50"
                )}
              >
                <img src={resolveImageUrl(img)} alt="Thumbnail small" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ERROR / CRITERIA FAILS MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131F35] border border-slate-200 dark:border-slate-805 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-lg font-black text-slate-850 dark:text-white uppercase tracking-tight">{isVi ? 'Không thể đặt xe' : 'Booking Conditions Unmet'}</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mb-6">{errorModalMessage}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowErrorModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground font-bold rounded-xl transition-colors text-xs"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
              {(errorModalMessage.toLowerCase().includes('verification') || 
                errorModalMessage.toLowerCase().includes('identity') || 
                errorModalMessage.toLowerCase().includes('kyc') ||
                errorModalMessage.toLowerCase().includes('license') ||
                errorModalMessage.toLowerCase().includes('gplx') ||
                errorModalMessage.toLowerCase().includes('driving')
              ) && (
                <button 
                  onClick={() => { setShowErrorModal(false); navigate('/dashboard/documents'); }}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0B1221] font-bold rounded-xl transition-all shadow-sm text-xs animate-pulse"
                >
                  {isVi ? 'Xác thực & Tải GPLX' : 'Verify & Upload License'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleDetailPage;
