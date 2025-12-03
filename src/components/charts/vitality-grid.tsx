// =====================================================
// Vitality Grid - 4-Quadrant Matrix Chart
// =====================================================

'use client';

import { useMemo } from 'react';
import { OrganizationUnit } from '@/types';
import { 
  Flame, 
  TrendingDown, 
  Trophy, 
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Info
} from 'lucide-react';

interface VitalityGridProps {
  units: OrganizationUnit[];
  onUnitClick: (unit: OrganizationUnit) => void;
  selectedUnitId?: string;
}

export function VitalityGrid({ units, onUnitClick, selectedUnitId }: VitalityGridProps) {
  // データの範囲を計算
  const { minEng, maxEng, minStress, maxStress } = useMemo(() => {
    if (units.length === 0) {
      return { minEng: 1, maxEng: 4, minStress: 1, maxStress: 4 };
    }
    
    const engagements = units.map(u => u.engagementScore || 0);
    const stresses = units.map(u => u.stressScore || 0);
    
    return {
      minEng: Math.min(...engagements) - 0.3,
      maxEng: Math.max(...engagements) + 0.3,
      minStress: Math.min(...stresses) - 0.3,
      maxStress: Math.max(...stresses) + 0.3,
    };
  }, [units]);

  // 位置を計算
  const getPosition = (unit: OrganizationUnit) => {
    const engScore = unit.engagementScore || 0;
    const stressScore = unit.stressScore || 0;
    const x = ((engScore - minEng) / (maxEng - minEng)) * 100;
    const y = ((stressScore - minStress) / (maxStress - minStress)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, 100 - y)) };
  };

  // バブルサイズを計算
  const getBubbleSize = (headcount: number) => {
    const minSize = 36;
    const maxSize = 72;
    const maxHeadcount = Math.max(...units.map(u => u.headcount), 100);
    return minSize + (headcount / maxHeadcount) * (maxSize - minSize);
  };

  // カラーを取得
  const getBubbleColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500 border-red-600';
      case 'warning': return 'bg-amber-500 border-amber-600';
      case 'caution': return 'bg-yellow-400 border-yellow-500';
      default: return 'bg-green-500 border-green-600';
    }
  };

  const centerEng = (minEng + maxEng) / 2;
  const centerStress = (minStress + maxStress) / 2;

  return (
    <div className="h-full flex flex-col">
      {/* 凡例 */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-6">
          <LegendItem color="bg-red-500" label="バーンアウト予備軍" icon={<Flame className="w-3 h-3" />} />
          <LegendItem color="bg-amber-500" label="低エンゲージメント" icon={<TrendingDown className="w-3 h-3" />} />
          <LegendItem color="bg-yellow-400" label="注意" icon={<AlertTriangle className="w-3 h-3" />} />
          <LegendItem color="bg-green-500" label="健全" icon={<Trophy className="w-3 h-3" />} />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Info className="w-3.5 h-3.5" />
          バブルサイズ＝人数
        </div>
      </div>

      {/* グリッド */}
      <div className="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200">
        {/* 背景の4象限 */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="bg-red-50/70 border-r border-b border-gray-200/50" /> {/* 左上: 低Eng高Stress */}
          <div className="bg-amber-50/50 border-b border-gray-200/50" /> {/* 右上: 高Eng高Stress (バーンアウト) */}
          <div className="bg-gray-50/50 border-r border-gray-200/50" /> {/* 左下: 低Eng低Stress */}
          <div className="bg-green-50/70" /> {/* 右下: 高Eng低Stress (理想) */}
        </div>

        {/* 中央線 */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gray-300/70" />
        </div>
        <div className="absolute inset-0 flex justify-center">
          <div className="h-full w-px bg-gray-300/70" />
        </div>

        {/* 象限ラベル */}
        <div className="absolute top-4 left-4 text-xs font-medium text-red-400/80 flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          低Eng・高Stress
        </div>
        <div className="absolute top-4 right-4 text-xs font-medium text-amber-500/80 flex items-center gap-1">
          <Flame className="w-3 h-3" />
          バーンアウト予備軍
        </div>
        <div className="absolute bottom-4 left-4 text-xs font-medium text-gray-400/80 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          要観察
        </div>
        <div className="absolute bottom-4 right-4 text-xs font-medium text-green-500/80 flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          理想的
        </div>

        {/* 軸ラベル */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs text-gray-500 font-medium bg-white/80 px-2 py-1 rounded">
          <ArrowRight className="w-3 h-3" />
          エンゲージメント
        </div>
        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 -rotate-90 flex items-center gap-1 text-xs text-gray-500 font-medium bg-white/80 px-2 py-1 rounded origin-center">
          <ArrowUp className="w-3 h-3" />
          ストレス反応
        </div>

        {/* バブル */}
        {units.map((unit) => {
          const pos = getPosition(unit);
          const size = getBubbleSize(unit.headcount);
          const isSelected = unit.id === selectedUnitId;

          return (
            <button
              key={unit.id}
              onClick={() => onUnitClick(unit)}
              className={`
                absolute transform -translate-x-1/2 -translate-y-1/2
                rounded-full border-2 flex items-center justify-center
                transition-all duration-200 cursor-pointer
                ${getBubbleColor(unit.riskLevel)}
                ${isSelected 
                  ? 'ring-4 ring-blue-400 ring-offset-2 scale-110 z-20' 
                  : 'hover:scale-110 hover:z-10 shadow-sm hover:shadow-md'
                }
              `}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              title={`${unit.name}: Eng ${unit.engagementScore?.toFixed(2) || 'N/A'}, Stress ${unit.stressScore?.toFixed(2) || 'N/A'}`}
            >
              <span className="text-white text-xs font-bold truncate px-1 max-w-full">
                {unit.name.length > 4 ? unit.name.slice(0, 4) : unit.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LegendItem({ color, label, icon }: { color: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
