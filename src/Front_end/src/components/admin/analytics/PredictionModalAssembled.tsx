import React from 'react';
import { Brain, Download } from 'lucide-react';
import { PredictionModal } from './PredictionModal';
import { ExecutiveSummaryCard } from './ExecutiveSummaryCard';
import { BusinessImpactCard } from './BusinessImpactCard';
import { ForecastChart } from './charts/ForecastChart';
import { PredictionMetricGrid } from './PredictionMetricGrid';
import { AIReasoningCard } from './AIReasoningCard';
import { RecommendationList } from './RecommendationList';
import { DataSourceChips } from './DataSourceChips';
import { Badge } from './primitives/Badge';
import { Button } from './primitives/Button';
import { Divider } from './primitives/Divider';
import { LoadingSkeleton } from './primitives/LoadingSkeleton';
import { EmptyState } from './primitives/EmptyState';
import { PredictionDashboardDTO } from '@/services/adminService';

export interface PredictionModalAssembledProps {
  isOpen: boolean;
  onClose: () => void;
  dto?: PredictionDashboardDTO;
  isLoading?: boolean;
  onExport?: (format: 'PDF' | 'CSV') => void;
  className?: string;
}

export const PredictionModalAssembled: React.FC<PredictionModalAssembledProps> = ({
  isOpen,
  onClose,
  dto,
  isLoading = false,
  onExport,
}) => {
  const hasContent = Boolean(
    dto &&
    (dto.summary ||
     dto.businessImpact ||
     (dto.forecast && dto.forecast.length > 0) ||
     (dto.recommendations && dto.recommendations.length > 0))
  );

  const title = dto?.summary?.title || 'DỰ BÁO VẬN HÀNH & PHÂN TÍCH NỀN TẢNG AI';
  const subtitle = dto?.modelInformation?.modelName
    ? `${dto.modelInformation.modelName} (Phiên bản ${dto.modelInformation.version || 'v2.4'})`
    : 'Phân tích tự động từ dữ liệu hệ thống thời gian thực';
  const scorePct = Math.round((dto?.confidence?.score || 0.95) * 100);

  return (
    <PredictionModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={<Brain className="w-6 h-6 text-indigo-500" />}
      badge={<Badge variant="success">Độ Tin Cậy {scorePct}%</Badge>}
      maxWidth="4xl"
      footer={
        <div className="w-full flex items-center justify-between gap-4">
          <DataSourceChips
            sources={[
              { id: '1', name: 'CSDL Lịch Sử Analytics 90 Ngày', type: 'DATABASE' },
              { id: '2', name: dto?.modelInformation?.algorithm || 'Mô Hình ML Sidecar Engine', type: 'ML_MODEL' },
            ]}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport && onExport('CSV')}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Xuất Báo Cáo Analysis
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Đóng Phân Tích
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="p-6 space-y-4">
          <LoadingSkeleton height="140px" className="w-full rounded-3xl" />
          <LoadingSkeleton height="100px" className="w-full rounded-2xl" />
          <LoadingSkeleton height="280px" className="w-full rounded-3xl" />
        </div>
      ) : !hasContent || !dto ? (
        <EmptyState
          title="Chưa có dữ liệu phân tích chi tiết"
          description="Hệ thống chưa ghi nhận đủ dữ liệu lịch sử để tổng hợp dự báo chuyên sâu cho mục này."
        />
      ) : (
        <>
          {/* 1. Executive Summary Card (Reads directly from dto.summary & dto.confidence) */}
          {dto.summary && (
            <ExecutiveSummaryCard
              title="Tóm Tắt Chiến Lược & Phát Hiện AI Chính"
              summary={dto.summary.summaryText || ''}
              businessImpact={dto.businessImpact?.impactText}
              urgency={(dto.summary.urgency as any) || 'ROUTINE'}
              confidence={{
                score: dto.confidence?.score || 0.95,
                rating: (dto.confidence?.rating as any) || 'HIGH',
              }}
              keyTakeaways={dto.summary.keyTakeaways}
            />
          )}

          {/* 2. Business Impact KPI Grid (Reads directly from dto.businessImpact) */}
          {dto.businessImpact && (
            <BusinessImpactCard
              title="Tác Động Kinh Doanh & Dự Báo ROI"
              subtitle="Ước tính doanh thu tăng thêm và hiệu suất lấp đầy hạm đội xe"
              metrics={{
                revenueOpportunity: dto.businessImpact.revenueOpportunity,
                occupancyRate: dto.businessImpact.occupancyRate,
                bookingsDelta: dto.businessImpact.bookingsDelta,
                roiPercentage: dto.businessImpact.roiPercentage,
                trendDirection: (dto.businessImpact.trendDirection as any) || 'UP',
              }}
            />
          )}

          {/* 3. Interactive Forecast Line Chart (Reads directly from dto.forecast) */}
          {dto.forecast && dto.forecast.length > 0 && (
            <ForecastChart
              data={dto.forecast.map((p) => ({
                date: p.date,
                actual: p.actual ?? null,
                predicted: p.predicted,
                lowerBound: p.lowerBound,
                upperBound: p.upperBound,
              }))}
              title="Biểu Đồ Dự Báo Doanh Thu & Nhu Cầu 14 Ngày"
              subtitle="So sánh đường cơ sở thực tế lịch sử với dự báo máy học (kèm khoảng tin cậy 95%)"
              height={320}
              isCurrency={
                // Demand / utilization metrics are counts, not VND amounts
                !(dto.modelInformation?.algorithm ?? dto.modelInfo?.algorithm ?? '')
                  .toLowerCase()
                  .match(/demand|seasonal|dow|utilization|category|decomp/)
              }
            />
          )}

          {/* 4. Model Telemetry & Evaluation Metric Grid (Reads directly from dto.telemetry) */}
          {dto.telemetry && (
            <PredictionMetricGrid
              telemetryMetrics={{
                confidence: dto.confidence?.score,
                confidenceRating: dto.confidence?.rating,
                modelName: dto.modelInformation?.modelName,
                inferenceTimeMs: dto.telemetry.inferenceTimeMs,
                trainingWindowDays: dto.telemetry.trainingWindowDays,
                mape: dto.telemetry.mape,
                r2Score: dto.telemetry.r2Score,
              }}
            />
          )}

          {/* 5. Explainable AI (XAI) Feature Importance Breakdown (Reads directly from dto.featureImportance) */}
          {dto.featureImportance && dto.featureImportance.length > 0 && (
            <AIReasoningCard
              title="Trọng Số Đặc Trưng & Lý Giải Mô Hình AI (XAI)"
              subtitle="Bảng giải trình các biến số quan trọng tác động trực tiếp tới kết quả dự báo"
              features={dto.featureImportance.map((f) => ({
                key: f.key,
                label: f.label,
                importancePercentage: f.importancePercentage,
                impactDirection: (f.impactDirection as any) || 'POSITIVE',
                description: f.description,
              }))}
            />
          )}

          <Divider />

          {/* 6. Prescriptive Action Recommendation List (Reads directly from dto.recommendations) */}
          {dto.recommendations && dto.recommendations.length > 0 && (
            <RecommendationList
              title="Khuyến Nghị Hành Động Vận Hành Từ AI"
              subtitle="Các đề xuất chiến lược trực tiếp được tính toán tự động để tối ưu hiệu suất"
              items={dto.recommendations.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description,
                priority: (r.priority as any) || 'MEDIUM',
                expectedImpact: r.expectedImpact,
                actionLabel: r.actionLabel,
                actionType: (r.actionType as any) || 'SYSTEM',
              }))}
            />
          )}
        </>
      )}
    </PredictionModal>
  );
};
