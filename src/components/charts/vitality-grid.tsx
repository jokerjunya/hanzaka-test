// =====================================================
// Vitality Grid - 4-Quadrant Matrix Chart
// =====================================================

'use client';

import { useMemo, useState, useRef } from 'react';
import { OrganizationUnit } from '@/types';
import { 
  Flame, 
  TrendingDown, 
  Trophy, 
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Info,
  Hash,
  Type,
  List,
  ChevronRight,
  Users
} from 'lucide-react';

interface VitalityGridProps {
  units: OrganizationUnit[];
  onUnitClick: (unit: OrganizationUnit) => void;
  selectedUnitId?: string;
}

type DisplayMode = 'number' | 'label' | 'icon';

export function VitalityGrid({ units, onUnitClick, selectedUnitId }: VitalityGridProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('number');
  const [hoveredUnit, setHoveredUnit] = useState<OrganizationUnit | null>(null);
  const [showList, setShowList] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

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

  // ユニットをリスク順にソート（番号付け用）
  const sortedUnits = useMemo(() => {
    return [...units].sort((a, b) => {
      const riskOrder: Record<string, number> = { critical: 0, warning: 1, caution: 2, healthy: 3 };
      const riskDiff = (riskOrder[a.riskLevel] ?? 4) - (riskOrder[b.riskLevel] ?? 4);
      if (riskDiff !== 0) return riskDiff;
      return (b.stressScore ?? 0) - (a.stressScore ?? 0);
    });
  }, [units]);

  // ユニットIDと番号のマッピング
  const unitNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    sortedUnits.forEach((unit, idx) => {
      map.set(unit.id, idx + 1);
    });
    return map;
  }, [sortedUnits]);

  // 位置を計算（より広いマージン）
  const getPosition = (unit: OrganizationUnit) => {
    const engScore = unit.engagementScore || 0;
    const stressScore = unit.stressScore || 0;
    // 8%〜92%の範囲を使用して端に余裕を持たせる
    const x = 8 + ((engScore - minEng) / (maxEng - minEng)) * 84;
    const y = 8 + ((stressScore - minStress) / (maxStress - minStress)) * 84;
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, 100 - y)) };
  };

  // バブルサイズを計算（データ件数に応じて動的調整）
  const getBubbleSize = (headcount: number) => {
    const dataCount = units.length;
    // データが多いほどバブルを小さく
    const scaleFactor = Math.max(0.5, 1 - (dataCount - 10) * 0.02);
    
    let minSize: number;
    let maxSize: number;
    
    if (displayMode === 'label') {
      minSize = Math.max(50, 70 * scaleFactor);
      maxSize = Math.max(65, 90 * scaleFactor);
    } else {
      minSize = Math.max(24, 32 * scaleFactor);
      maxSize = Math.max(40, 56 * scaleFactor);
    }
    
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

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <Flame className="w-3.5 h-3.5 text-white" />;
      case 'warning': return <TrendingDown className="w-3.5 h-3.5 text-white" />;
      case 'caution': return <AlertTriangle className="w-3.5 h-3.5 text-white" />;
      default: return <Trophy className="w-3.5 h-3.5 text-white" />;
    }
  };

  // バブル内のテキストを取得
  const getBubbleContent = (unit: OrganizationUnit) => {
    const number = unitNumberMap.get(unit.id) ?? 0;
    switch (displayMode) {
      case 'number':
        return <span className="text-white text-[10px] font-bold">{number}</span>;
      case 'label':
        // 5文字まで表示、それ以上は省略
        const displayName = unit.name.length > 5 ? unit.name.slice(0, 5) + '…' : unit.name;
        return <span className="text-white text-[9px] font-bold leading-tight text-center px-0.5">{displayName}</span>;
      case 'icon':
        return getRiskIcon(unit.riskLevel);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* コントロールバー（コンパクト） */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-4">
          <LegendItem color="bg-red-500" label="バーンアウト" icon={<Flame className="w-2.5 h-2.5" />} />
          <LegendItem color="bg-amber-500" label="低Eng" icon={<TrendingDown className="w-2.5 h-2.5" />} />
          <LegendItem color="bg-yellow-400" label="注意" icon={<AlertTriangle className="w-2.5 h-2.5" />} />
          <LegendItem color="bg-green-500" label="健全" icon={<Trophy className="w-2.5 h-2.5" />} />
        </div>
        
        <div className="flex items-center gap-2">
          {/* 表示モード切替 */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => setDisplayMode('number')}
              className={`p-1 rounded transition-colors ${displayMode === 'number' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="番号表示（推奨）"
            >
              <Hash className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDisplayMode('label')}
              className={`p-1 rounded transition-colors ${displayMode === 'label' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="ラベル表示"
            >
              <Type className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDisplayMode('icon')}
              className={`p-1 rounded transition-colors ${displayMode === 'icon' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="アイコン表示"
            >
              <AlertTriangle className="w-3 h-3" />
            </button>
          </div>
          
          {/* リスト表示トグル */}
          <button
            onClick={() => setShowList(!showList)}
            className={`p-1 rounded transition-colors ${showList ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}
            title="リスト表示"
          >
            <List className="w-3 h-3" />
          </button>
          
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Info className="w-3 h-3" />
            サイズ=人数
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex gap-4">
        {/* グリッド */}
        <div 
          ref={gridRef}
          className={`relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 ${showList ? 'flex-1' : 'w-full'}`}
        >
          {/* 背景の4象限 */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-red-50/70 border-r border-b border-gray-200/50" />
            <div className="bg-amber-50/50 border-b border-gray-200/50" />
            <div className="bg-gray-50/50 border-r border-gray-200/50" />
            <div className="bg-green-50/70" />
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
            const isHovered = hoveredUnit?.id === unit.id;

            return (
              <div key={unit.id}>
                <button
                  onClick={() => onUnitClick(unit)}
                  onMouseEnter={() => setHoveredUnit(unit)}
                  onMouseLeave={() => setHoveredUnit(null)}
                  className={`
                    absolute transform -translate-x-1/2 -translate-y-1/2
                    rounded-full border-2 flex items-center justify-center
                    transition-all duration-200 cursor-pointer
                    ${getBubbleColor(unit.riskLevel)}
                    ${isSelected 
                      ? 'ring-4 ring-blue-400 ring-offset-2 scale-110 z-30' 
                      : isHovered
                        ? 'scale-125 z-20 shadow-lg'
                        : 'hover:scale-110 hover:z-10 shadow-sm hover:shadow-md'
                    }
                  `}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                >
                  {getBubbleContent(unit)}
                </button>

                {/* ホバー時のツールチップ */}
                {isHovered && (
                  <div 
                    className="absolute z-40 pointer-events-none"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `translate(${pos.x > 70 ? '-100%' : '10px'}, -50%)`,
                    }}
                  >
                    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[180px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded-full ${getBubbleColor(unit.riskLevel)} flex items-center justify-center`}>
                          {getRiskIcon(unit.riskLevel)}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{unit.name}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">カテゴリ</span>
                          <span className="font-medium text-gray-700">{unit.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">人数</span>
                          <span className="font-medium text-gray-700">{unit.headcount}名</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">エンゲージメント</span>
                          <span className="font-bold text-blue-600">{unit.engagementScore?.toFixed(2) ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ストレス反応</span>
                          <span className="font-bold text-amber-600">{unit.stressScore?.toFixed(2) ?? 'N/A'}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
                        クリックで詳細分析
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* サイドリスト（コンパクト版） */}
        {showList && (
          <div className="w-48 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-2 py-1.5 bg-gray-50 border-b border-gray-200">
              <h3 className="text-[10px] font-semibold text-gray-700">組織一覧（リスク順）</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sortedUnits.map((unit) => {
                const number = unitNumberMap.get(unit.id) ?? 0;
                const isSelected = unit.id === selectedUnitId;
                const isHovered = hoveredUnit?.id === unit.id;
                
                return (
                  <button
                    key={unit.id}
                    onClick={() => onUnitClick(unit)}
                    onMouseEnter={() => setHoveredUnit(unit)}
                    onMouseLeave={() => setHoveredUnit(null)}
                    className={`
                      w-full px-2 py-1.5 flex items-center gap-1.5 text-left transition-colors border-b border-gray-50 last:border-b-0
                      ${isSelected ? 'bg-blue-50' : isHovered ? 'bg-gray-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0
                      ${getBubbleColor(unit.riskLevel)}
                    `}>
                      {number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium text-gray-900 truncate">{unit.name}</div>
                    </div>
                    <div className="text-right flex-shrink-0 text-[9px]">
                      <span className="text-blue-600 font-medium">{unit.engagementScore?.toFixed(2)}</span>
                      <span className="text-gray-300 mx-0.5">/</span>
                      <span className="text-amber-600 font-medium">{unit.stressScore?.toFixed(2)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label, icon }: { color: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2.5 h-2.5 rounded-full ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <span className="text-[10px] text-gray-600">{label}</span>
    </div>
  );
}
