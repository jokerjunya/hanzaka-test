// =====================================================
// Dashboard Summary Cards
// =====================================================

'use client';

import { DashboardSummary, OrganizationUnit } from '@/types';
import { 
  Users, 
  Heart, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Trophy,
  Flame,
  ChevronRight,
  Shield
} from 'lucide-react';

interface SummaryCardsProps {
  summary: DashboardSummary;
  onUnitClick: (unit: OrganizationUnit) => void;
}

export function SummaryCards({ summary, onUnitClick }: SummaryCardsProps) {
  return (
    <div className="space-y-4">
      {/* メトリクスカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-gray-100"
          iconColor="text-gray-600"
          label="対象人数"
          value={summary.totalHeadcount.toLocaleString()}
          unit="名"
        />
        <MetricCard
          icon={<Heart className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="エンゲージメント平均"
          value={summary.averageEngagement.toFixed(2)}
          trend={summary.averageEngagement >= 3.0 ? 'positive' : 'negative'}
          trendLabel={summary.averageEngagement >= 3.0 ? '良好' : '注意'}
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="ストレス反応平均"
          value={summary.averageStress.toFixed(2)}
          trend={summary.averageStress <= 2.5 ? 'positive' : 'negative'}
          trendLabel={summary.averageStress <= 2.5 ? '良好' : '注意'}
        />
      </div>

      {/* リスク・健全リスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* 要注意組織 */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">要注意の組織</h3>
              <p className="text-xs text-gray-500">優先的なケアが必要です</p>
            </div>
          </div>
          <div className="space-y-2">
            {summary.criticalUnits.slice(0, 5).map((unit, idx) => (
              <UnitListItem
                key={unit.id}
                unit={unit}
                rank={idx + 1}
                onClick={() => onUnitClick(unit)}
                variant="risk"
              />
            ))}
            {summary.criticalUnits.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-400">
                <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                要注意の組織はありません
              </div>
            )}
          </div>
        </div>

        {/* 好調な組織 */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">好調な組織</h3>
              <p className="text-xs text-gray-500">ベストプラクティスを参考に</p>
            </div>
          </div>
          <div className="space-y-2">
            {summary.healthyUnits.slice(0, 1).map((unit, idx) => (
              <UnitListItem
                key={unit.id}
                unit={unit}
                rank={idx + 1}
                onClick={() => onUnitClick(unit)}
                variant="healthy"
              />
            ))}
            {summary.healthyUnits.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-400">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                データを読み込んでください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  unit,
  trend,
  trendLabel,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
  trend?: 'positive' | 'negative';
  trendLabel?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        {trend && trendLabel && (
          <div className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${trend === 'positive' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-amber-50 text-amber-700'
            }
          `}>
            {trend === 'positive' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-lg font-normal text-gray-500 ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

function UnitListItem({
  unit,
  rank,
  onClick,
  variant,
}: {
  unit: OrganizationUnit;
  rank: number;
  onClick: () => void;
  variant: 'risk' | 'healthy';
}) {
  const getRiskIcon = () => {
    if (unit.riskLevel === 'critical') return <Flame className="w-3 h-3" />;
    if (unit.riskLevel === 'warning') return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  const getRiskLabel = () => {
    switch (unit.riskLevel) {
      case 'critical': return 'バーンアウト予備軍';
      case 'warning': return '要注意';
      case 'caution': return '注意';
      case 'healthy': return '健全';
      default: return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
    >
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
        ${variant === 'risk' 
          ? 'bg-red-100 text-red-600' 
          : 'bg-green-100 text-green-600'
        }
      `}>
        {rank}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">{unit.name}</span>
          {variant === 'risk' && getRiskIcon() && (
            <span className="text-red-400">{getRiskIcon()}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{unit.headcount}名</span>
          <span>・</span>
          <span>{getRiskLabel()}</span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs text-gray-400">Eng / Stress</div>
        <div className="text-sm font-medium">
          <span className="text-blue-600">{unit.engagementScore?.toFixed(1) || 'N/A'}</span>
          <span className="text-gray-300">/</span>
          <span className={variant === 'risk' ? 'text-red-500' : 'text-green-500'}>
            {unit.stressScore?.toFixed(1) || 'N/A'}
          </span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </button>
  );
}
