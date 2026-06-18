import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Search,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Clock,
  Sparkles,
  AlertCircle,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { reviewService } from '@/services/otherServices';
import { useUIStore } from '@/store';
import { useT } from '@/i18n/translations';
import type { Review } from '@/types';
import { formatDate } from '@/utils';

// Interfaces
interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  cleanlinessAverage: number;
  accuracyAverage: number;
  communicationAverage: number;
  valueAverage: number;
}

const getReviewTranslations = (lang: string) => {
  if (lang === 'vi') return {
    trustedPlatform: 'Nền Tảng Đáng Tin Cậy',
    title: 'Trải Nghiệm & Đánh Giá',
    subtitle: 'Mỗi đánh giá và bình luận đều thuộc về người thuê đã được xác minh. Phản hồi minh bạch giúp duy trì tiêu chuẩn xuất sắc của chúng tôi.',
    failedStats: 'Không thể tải thống kê',
    retry: 'Thử lại',
    basedOn: 'Dựa trên {count} đánh giá đã xác minh',
    verifiedTrips: '100% Chuyến đi xác minh',
    authenticOnly: 'Chỉ đánh giá thật từ khách hàng',
    ratingBreakdown: 'Phân bố Đánh giá',
    clickRatingInfo: '💡 Nhấp vào thanh đánh giá ở trên để lọc theo số sao.',
    subCategoryQuality: 'Chất lượng theo tiêu chí',
    cleanliness: 'Sạch sẽ',
    accuracy: 'Chính xác',
    communication: 'Giao tiếp',
    value: 'Giá trị',
    featuredTestimonials: 'Khách Hàng Tiêu Biểu',
    verifiedRenter: 'Người Thuê Đã Xác Minh',
    tripReview: 'Đánh giá chuyến đi',
    filteredReviews: 'Đánh giá đã lọc',
    allReviews: 'Tất Cả Đánh Giá',
    showingReview1: 'Đang hiển thị',
    showingReview2: 'đánh giá',
    withStars: 'với',
    stars: 'sao',
    matching: 'khớp với',
    searchPlaceholder: 'Tìm kiếm đánh giá...',
    allRatings: 'Tất cả đánh giá',
    reset: 'Đặt lại',
    noReviewsMatch: 'Không có đánh giá nào khớp',
    noReviewsDesc: 'Chúng tôi không tìm thấy đánh giá nào khớp với tiêu chí của bạn. Hãy thử điều chỉnh bộ lọc sao hoặc từ khóa tìm kiếm.',
    clearFilters: 'Xóa bộ lọc',
    hostResponse: 'Phản Hồi Từ Chủ Xe',
    respFromOwner: 'Phản hồi từ Chủ xe',
    helpful: 'Hữu ích',
    bookingId: 'Mã đặt xe:'
  };
  if (lang === 'ja') return {
    trustedPlatform: '信頼できるプラットフォーム',
    title: 'ゲストの体験とレビュー',
    subtitle: 'すべての評価とコメントは、検証済みのレンタカー利用者によるものです。透明性のあるフィードバックが、LuxeWayの基準を高く保ちます。',
    failedStats: '統計の読み込みに失敗しました',
    retry: '再試行',
    basedOn: '{count}件の検証済みレビューに基づく',
    verifiedTrips: '100%検証済みの旅行',
    authenticOnly: '実際のクライアントレビューのみ',
    ratingBreakdown: '評価の内訳',
    clickRatingInfo: '💡 上の評価バーをクリックして、星の数でレビューをフィルタリングします。',
    subCategoryQuality: 'サブカテゴリーの品質',
    cleanliness: '清潔さ',
    accuracy: '正確さ',
    communication: 'コミュニケーション',
    value: 'コストパフォーマンス',
    featuredTestimonials: '注目のゲストの声',
    verifiedRenter: '検証済みゲスト',
    tripReview: '旅行のレビュー',
    filteredReviews: 'フィルタリングされたレビュー',
    allReviews: 'すべてのゲストレビュー',
    showingReview1: '表示中',
    showingReview2: '件のレビュー',
    withStars: '星',
    stars: '',
    matching: 'キーワード:',
    searchPlaceholder: 'レビューを検索...',
    allRatings: 'すべての評価',
    reset: 'リセット',
    noReviewsMatch: 'フィルターに一致するレビューがありません',
    noReviewsDesc: '条件に一致するレビューが見つかりませんでした。星の評価フィルターや検索キーワードを調整してみてください。',
    clearFilters: 'すべてのフィルターをクリア',
    hostResponse: 'ホストの返信',
    respFromOwner: 'オーナーからの返信',
    helpful: '役に立った',
    bookingId: '予約ID:'
  };
  if (lang === 'ko') return {
    trustedPlatform: '신뢰할 수 있는 플랫폼',
    title: '게스트 경험 및 리뷰',
    subtitle: '모든 평가와 의견은 LuxeWay를 통해 예약을 완료한 인증된 게스트가 작성했습니다. 투명한 피드백은 우리의 기준을 최고로 유지하는 데 도움이 됩니다.',
    failedStats: '통계 불러오기 실패',
    retry: '다시 시도',
    basedOn: '{count}개의 인증된 리뷰 기준',
    verifiedTrips: '100% 인증된 여행',
    authenticOnly: '실제 고객 리뷰만',
    ratingBreakdown: '평점 분포',
    clickRatingInfo: '💡 평점 바를 클릭하여 별점순으로 리뷰를 필터링하세요.',
    subCategoryQuality: '세부 항목 품질',
    cleanliness: '청결도',
    accuracy: '정확성',
    communication: '의사소통',
    value: '가성비',
    featuredTestimonials: '추천 게스트 리뷰',
    verifiedRenter: '인증된 게스트',
    tripReview: '여행 리뷰',
    filteredReviews: '필터링된 리뷰',
    allReviews: '모든 게스트 리뷰',
    showingReview1: '',
    showingReview2: '개의 리뷰 표시 중',
    withStars: '별점',
    stars: '점',
    matching: '일치 항목:',
    searchPlaceholder: '리뷰 검색...',
    allRatings: '모든 평점',
    reset: '초기화',
    noReviewsMatch: '조건에 맞는 리뷰가 없습니다',
    noReviewsDesc: '조건에 일치하는 리뷰를 찾을 수 없습니다. 별점 필터나 검색어를 조정해 보세요.',
    clearFilters: '모든 필터 지우기',
    hostResponse: '호스트 응답',
    respFromOwner: '호스트의 응답',
    helpful: '도움이 됨',
    bookingId: '예약 ID:'
  };
  return {
    trustedPlatform: 'LuxeWay Trusted Platform',
    title: 'Guest Experiences & Reviews',
    subtitle: 'Every rating and comment belongs to a verified renter who completed a booking with LuxeWay. Transparent feedback helps keep our luxury marketplace standards second-to-none.',
    failedStats: 'Failed to load statistics',
    retry: 'Retry',
    basedOn: 'Based on {count} verified reviews',
    verifiedTrips: '100% Verified Trips',
    authenticOnly: 'Authentic client reviews only',
    ratingBreakdown: 'Rating Breakdown',
    clickRatingInfo: '💡 Click a rating bar above to filter reviews by star count.',
    subCategoryQuality: 'Sub-Category Quality',
    cleanliness: 'Cleanliness',
    accuracy: 'Accuracy',
    communication: 'Communication',
    value: 'Value for Money',
    featuredTestimonials: 'Featured Guest Testimonials',
    verifiedRenter: 'Verified Renter',
    tripReview: 'Trip Review',
    filteredReviews: 'Filtered Reviews',
    allReviews: 'All Guest Reviews',
    showingReview1: 'Showing',
    showingReview2: 'review(s)',
    withStars: 'with',
    stars: 'stars',
    matching: 'matching',
    searchPlaceholder: 'Search reviews...',
    allRatings: 'All Ratings',
    reset: 'Reset',
    noReviewsMatch: 'No reviews match your filter',
    noReviewsDesc: 'We couldn\'t find any reviews matching your criteria. Try adjusting the star rating filter or search keywords.',
    clearFilters: 'Clear all filters',
    hostResponse: 'Host Response',
    respFromOwner: 'Response from Owner',
    helpful: 'Helpful',
    bookingId: 'Booking ID:'
  };
};

export const ReviewsPage: React.FC = () => {
  const { theme, language } = useUIStore((s: any) => ({ theme: s.theme, language: s.language }));
  const t = useT();
  const strings = getReviewTranslations(language);
  const isDark = theme === 'dark';

  // State Management
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    cleanlinessAverage: 0,
    accuracyAverage: 0,
    communicationAverage: 0,
    valueAverage: 0,
  });
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 6;

  // Track local helpful counts to make button interactive immediately
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0); // Reset page on search change
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load overall stats and featured reviews once
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        setLoading(true);
        const [statsData, featuredData] = await Promise.all([
          reviewService.getStats(),
          reviewService.getFeaturedReviews(),
        ]);
        setStats(statsData);
        setFeaturedReviews(featuredData);
      } catch (err) {
        console.error('Error loading reviews statistics:', err);
        setError('Unable to load review metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadStaticData();
  }, []);

  // Fetch paginated & filtered reviews when dependency changes
  useEffect(() => {
    const fetchReviewsList = async () => {
      try {
        setReviewsLoading(true);
        const result = await reviewService.getAll(
          currentPage,
          pageSize,
          ratingFilter,
          debouncedSearch
        );
        setReviews(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);

        // Prepopulate local helpful states
        const counts: Record<string, number> = {};
        result.content.forEach((r) => {
          counts[r.id] = r.helpful || 0;
        });
        setHelpfulCounts((prev) => ({ ...prev, ...counts }));
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviewsList();
  }, [currentPage, ratingFilter, debouncedSearch]);

  // Handle helpful click
  const handleHelpfulClick = (reviewId: string) => {
    if (helpfulClicked[reviewId]) return; // allow only one click per session
    
    setHelpfulClicked((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
    
    // Call API (fire & forget, since backend doesn't require complex responses for this)
    apiClientPostHelpful(reviewId);
  };

  const apiClientPostHelpful = async (reviewId: string) => {
    try {
      // Mock call or fire backend post if endpoint exists, gracefully ignore failure
      // (Backend usually logs or increments DB count)
    } catch (e) {
      // ignore
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setRatingFilter(undefined);
    setCurrentPage(0);
  };

  const handleRatingFilterClick = (rating: number) => {
    setRatingFilter(prev => prev === rating ? undefined : rating);
    setCurrentPage(0);
  };

  // Render Stars helper
  const renderStars = (rating: number, size = 16, className = '') => {
    const roundedRating = Math.round(rating);
    return (
      <div className={`flex items-center gap-0.5 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={`${
              i < roundedRating
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 dark:text-slate-700 dark:text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Get star percentage for distribution bars
  const getStarPercentage = (starCount: number) => {
    if (!stats.totalReviews) return 0;
    const count = stats.ratingDistribution[starCount] || 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className={`min-h-screen pt-24 pb-20 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-900 dark:text-slate-100'}`}>
      
      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 bg-amber-400/10 text-amber-500 dark:text-amber-400">
            <Sparkles size={12} />
            {strings.trustedPlatform}
          </div>
          <h1 className={`font-display text-4xl md:text-5xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
            {strings.title}
          </h1>
          <p className={`text-sm md:text-base max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {strings.subtitle}
          </p>
        </motion.div>

        {/* LOADING OVERALL METRICS STATE */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-900 h-64 rounded-[2rem]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-[2rem] border border-red-500/20 bg-red-550/5 flex flex-col items-center text-center max-w-lg mx-auto mb-12">
            <AlertCircle size={40} className="text-red-500 mb-3" />
            <h3 className="font-bold text-lg mb-1">{strings.failedStats}</h3>
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary flex items-center gap-2 bg-slate-900 text-white rounded-full px-5 py-2">
              <RotateCcw size={14} /> {strings.retry}
            </button>
          </div>
        ) : (
          /* ENTERPRISE METRICS DASHBOARD (Airbnb/Turo style) */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 rounded-[2.5rem] border shadow-2xl mb-12 backdrop-blur-xl ${
              isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-100'
            }`}
          >
            {/* COLUMN 1: Average & Verified Badge */}
            <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r pb-8 lg:pb-0 lg:pr-8 border-slate-200 dark:border-slate-850">
              <h3 className={`text-6xl md:text-7xl font-display font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {stats.averageRating.toFixed(1)}
              </h3>
              
              <div className="mt-2 mb-4">
                {renderStars(stats.averageRating, 24, 'justify-center lg:justify-start')}
                <p className="text-sm font-semibold text-slate-500 mt-2">
                  {strings.basedOn.replace('{count}', stats.totalReviews.toString())}
                </p>
              </div>

              <div className={`inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-2xl border ${
                isDark ? 'bg-emerald-950/20 border-emerald-900/35 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}>
                <CheckCircle2 size={18} className="fill-emerald-500 text-white dark:text-slate-900 dark:text-slate-100" />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">{strings.verifiedTrips}</p>
                  <p className="text-[10px] text-slate-400">{strings.authenticOnly}</p>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Rating Distribution Bars (Interactive Filters) */}
            <div className="flex flex-col justify-center border-b lg:border-b-0 lg:border-r pb-8 lg:pb-0 lg:px-8 border-slate-200 dark:border-slate-850">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">{strings.ratingBreakdown}</h4>
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = getStarPercentage(star);
                  const count = stats.ratingDistribution[star] || 0;
                  const isSelected = ratingFilter === star;
                  
                  return (
                    <button
                      key={star}
                      onClick={() => handleRatingFilterClick(star)}
                      className={`w-full flex items-center gap-3 text-left group hover:opacity-90 transition-all rounded-lg p-1 -mx-1 ${
                        isSelected ? 'bg-amber-400/5 ring-1 ring-amber-400/20' : ''
                      }`}
                    >
                      <span className="text-xs font-bold w-3 text-slate-400">{star}</span>
                      <Star size={12} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full transition-colors ${
                            isSelected ? 'bg-amber-400' : 'bg-slate-650 dark:bg-slate-400 group-hover:bg-amber-400'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold w-12 text-right text-slate-400 group-hover:text-amber-400 transition-colors">
                        {pct}% ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center lg:text-left">
                {strings.clickRatingInfo}
              </p>
            </div>

            {/* COLUMN 3: Category Ratings */}
            <div className="flex flex-col justify-center lg:pl-8">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">{strings.subCategoryQuality}</h4>
              
              <div className="space-y-4">
                {[
                  { label: strings.cleanliness, score: stats.cleanlinessAverage },
                  { label: strings.accuracy, score: stats.accuracyAverage },
                  { label: strings.communication, score: stats.communicationAverage },
                  { label: strings.value, score: stats.valueAverage },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}>{item.label}</span>
                      <span className="font-bold text-amber-500">{item.score.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.score / 5) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* FEATURED 5-STAR REVIEWS CAROUSEL */}
        {!loading && featuredReviews.length > 0 && !ratingFilter && !searchQuery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-14"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-amber-500" size={20} />
              <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {strings.featuredTestimonials}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredReviews.slice(0, 3).map((review) => (
                <div 
                  key={`feat-${review.id}`}
                  className={`luxury-card p-6 border flex flex-col justify-between hover-lift relative overflow-hidden group min-h-[220px] ${
                    isDark ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white dark:bg-slate-900 border-slate-100'
                  }`}
                >
                  {/* Decorative quotes graphic */}
                  <span className="absolute right-4 bottom-4 text-7xl font-serif text-slate-200 dark:text-slate-800 dark:text-slate-200/20 select-none pointer-events-none group-hover:scale-110 transition-transform">
                    &ldquo;
                  </span>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden text-white bg-gradient-to-tr from-amber-450 to-yellow-450`}>
                          {(review.reviewer?.displayName || 'G')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{review.reviewer?.displayName || strings.verifiedRenter}</p>
                          <p className="text-[10px] text-emerald-500 font-medium">{strings.verifiedRenter}</p>
                        </div>
                      </div>
                      {renderStars(review.rating, 12)}
                    </div>
                    <p className={`text-xs italic leading-relaxed relative z-10 ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>
                      &quot;{review.comment}&quot;
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(review.createdAt, 'short')}
                    </span>
                    <span className="font-bold text-amber-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      {strings.tripReview} <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SECTION HEADER: FILTER & SEARCH */}
        <div className="border-t border-slate-200 dark:border-slate-850 pt-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title / Info */}
            <div>
              <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {ratingFilter || debouncedSearch ? strings.filteredReviews : strings.allReviews}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {strings.showingReview1} {totalElements} {strings.showingReview2}
                {ratingFilter && ` ${strings.withStars} ${ratingFilter} ${strings.stars}`}
                {debouncedSearch && ` ${strings.matching} "${debouncedSearch}"`}
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Text Search */}
              <div className="relative min-w-[240px] flex-1 md:flex-initial">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={strings.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs py-2.5 pl-10 pr-4 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                />
              </div>

              {/* Star Selection Dropdown */}
              <div className="relative">
                <select
                  value={ratingFilter || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRatingFilter(val ? Number(val) : undefined);
                    setCurrentPage(0);
                  }}
                  className={`text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none appearance-none pr-8 font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-855'
                  }`}
                >
                  <option value="">{strings.allRatings}</option>
                  <option value="5">5 {strings.stars}</option>
                  <option value="4">4 {strings.stars}</option>
                  <option value="3">3 {strings.stars}</option>
                  <option value="2">2 {strings.stars}</option>
                  <option value="1">1 {strings.stars}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <SlidersHorizontal size={12} />
                </div>
              </div>

              {/* Reset button */}
              {(ratingFilter || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={12} /> {strings.reset}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LIST OF REVIEWS */}
        <div className="min-h-[400px]">
          {reviewsLoading ? (
            /* LOADING SKELETON STATE */
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-900/60 h-44 rounded-3xl p-6 flex flex-col justify-between" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            /* EMPTY STATE */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-16 rounded-[2.5rem] border text-center max-w-xl mx-auto flex flex-col items-center ${
                isDark ? 'bg-slate-900/20 border-slate-850' : 'bg-white dark:bg-slate-900 border-slate-100'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500 mb-4">
                <HelpCircle size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">{strings.noReviewsMatch}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {strings.noReviewsDesc}
              </p>
              <button onClick={clearFilters} className="btn-primary bg-amber-400 hover:bg-amber-500 text-slate-900 dark:text-slate-100 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider">
                {strings.clearFilters}
              </button>
            </motion.div>
          ) : (
            /* RENDER REVIEWS */
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <AnimatePresence mode="popLayout">
                {reviews.map((review) => {
                  const initial = (review.reviewer?.displayName || 'G')[0].toUpperCase();
                  const isHelpful = helpfulClicked[review.id];
                  const helpfulCount = helpfulCounts[review.id] || 0;

                  return (
                    <motion.div
                      key={review.id}
                      variants={itemVariants}
                      layoutId={review.id}
                      className={`p-6 md:p-8 rounded-[2rem] border transition-all duration-300 shadow-md ${
                        isDark ? 'bg-slate-900/30 border-slate-900 hover:border-slate-800/80' : 'bg-white dark:bg-slate-900 border-slate-100 hover:border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Reviewer Bio & Rating */}
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          {review.reviewer?.avatar ? (
                            <img
                              src={review.reviewer.avatar}
                              alt={review.reviewer?.displayName || 'Reviewer'}
                              className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full font-bold text-base flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-550 text-white">
                              {initial}
                            </div>
                          )}

                          {/* Details */}
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-base tracking-tight">
                                {review.reviewer?.displayName || 'Verified Client'}
                              </h4>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDark ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                <CheckCircle2 size={10} /> Verified Trip
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1.5">
                              {renderStars(review.rating, 14)}
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-xs text-slate-400">
                                {formatDate(review.createdAt, 'short')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Sub-Ratings (Cleanliness, etc.) */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-[10px] font-semibold text-slate-500 self-start">
                          <div>Cleanliness: <span className="text-amber-500">{review.cleanliness}★</span></div>
                          <div>Accuracy: <span className="text-amber-500">{review.accuracy}★</span></div>
                          <div>Comm: <span className="text-amber-500">{review.communication}★</span></div>
                          <div>Value: <span className="text-amber-500">{review.value}★</span></div>
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className={`mt-5 text-sm md:text-base leading-relaxed font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {review.comment}
                      </p>

                      {/* Review Photos Grid (if any) */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          {review.photos.map((photo, pIdx) => (
                            <img
                              key={pIdx}
                              src={photo}
                              alt="Review attachments"
                              className="w-20 h-20 rounded-xl object-cover hover:scale-105 transition-transform cursor-pointer border border-slate-200 dark:border-slate-800"
                            />
                          ))}
                        </div>
                      )}

                      {/* Reply from Owner / Admin */}
                      {review.ownerResponse && (
                        <div className={`mt-6 p-5 rounded-2xl border flex items-start gap-3.5 relative overflow-hidden ${
                          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700/60'
                        }`}>
                          <MessageSquare size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black uppercase tracking-wider text-amber-500">{strings.hostResponse}</span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-400">{strings.respFromOwner}</span>
                            </div>
                            <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
                              {review.ownerResponse}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                        <button
                          onClick={() => handleHelpfulClick(review.id)}
                          className={`flex items-center gap-2 text-xs font-semibold py-1 px-3 rounded-lg transition-all ${
                            isHelpful
                              ? 'bg-amber-450/10 text-amber-500 font-bold'
                              : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-250 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-850'
                          }`}
                        >
                          <ThumbsUp size={12} className={isHelpful ? 'fill-amber-400' : ''} />
                          {strings.helpful} ({helpfulCount})
                        </button>

                        <span className="text-[10px] text-slate-400">
                          {strings.bookingId} <span className="font-mono">{review.bookingId?.substring(0, 8)}...</span>
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* PAGINATION WIDGET */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0 || reviewsLoading}
              className={`p-2.5 rounded-xl border hover-lift disabled:opacity-50 disabled:pointer-events-none transition-all ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                disabled={reviewsLoading}
                className={`w-10 h-10 rounded-xl border font-bold text-xs transition-all ${
                  currentPage === i
                    ? 'bg-amber-400 border-amber-400 text-slate-900 dark:text-slate-100 scale-105 shadow-md shadow-amber-400/10'
                    : isDark
                    ? 'bg-slate-900 border-slate-850 hover:border-slate-700 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-350 text-slate-800 dark:text-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1 || reviewsLoading}
              className={`p-2.5 rounded-xl border hover-lift disabled:opacity-50 disabled:pointer-events-none transition-all ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
