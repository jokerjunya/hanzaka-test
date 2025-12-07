// =====================================================
// Category Comparison Chart - Cross-segment Analysis
// =====================================================

'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { OrganizationUnit } from '@/types';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Trophy } from 'lucide-react';

interface CategoryComparisonProps {
  units: OrganizationUnit[];
  overallAverage: OrganizationUnit | null;
  onUnitClick: (unit: OrganizationUnit) => void;
}

type ViewMode = 'bar' | 'scatter';
type CategoryType = '役職' | '雇用形態' | '拠点' | '年代';

export function CategoryComparison({ units, overallAverage, onUnitClick }: CategoryComparisonProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('拠点');
  const [viewMode, setViewMode] = useState<ViewMode>('bar');

  // 選択されたカテゴリのユニットをフィルタ
  const categoryUnits = useMemo(() => {
    return units.filter(u => u.category === selectedCategory);
  }, [units, selectedCategory]);

  // バーチャート用データ
  const barData = useMemo(() => {
    return categoryUnits.map(u => ({
      name: u.name.length > 8 ? u.name.slice(0, 8) + '...' : u.name,
      fullName: u.name,
      engagement: u.engagementScore,
      stress: u.stressScore,
      headcount: u.headcount,
      riskLevel: u.riskLevel,
      unit: u,
    })).sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0));
  }, [categoryUnits]);

  // 散布図用データ
  const scatterData = useMemo(() => {
    return categoryUnits.map(u => ({
      name: u.name,
      x: u.engagementScore,
      y: u.stressScore,
      z: u.headcount,
      riskLevel: u.riskLevel,
      unit: u,
    }));
  }, [categoryUnits]);

  const avgEngagement = overallAverage?.engagementScore ?? 3.2;
  const avgStress = overallAverage?.stressScore ?? 2.65;

  const categories: CategoryType[] = ['拠点', '役職', '雇用形態', '年代'];

  return (
    <div className="space-y-4">
      {/* コントロール */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('bar')}
            className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'bar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            バーチャート
          </button>
          <button
            onClick={() => setViewMode('scatter')}
            className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'scatter'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            散布図
          </button>
        </div>
      </div>

      {/* チャート */}
      <div className="h-64 sm:h-80">
        {viewMode === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#6b7280' }}
                domain={[0, 4]}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <ReferenceLine 
                y={avgEngagement} 
                stroke="#3b82f6" 
                strokeDasharray="4 4"
                label={{ value: '全社Eng平均', position: 'right', fontSize: 10, fill: '#3b82f6' }}
              />
              <ReferenceLine 
                y={avgStress} 
                stroke="#f59e0b" 
                strokeDasharray="4 4"
                label={{ value: '全社Stress平均', position: 'right', fontSize: 10, fill: '#f59e0b' }}
              />
              <Bar 
                dataKey="engagement" 
                name="エンゲージメント"
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                onClick={(data: { payload?: { unit?: OrganizationUnit } }) => data.payload?.unit && onUnitClick(data.payload.unit)}
                cursor="pointer"
              />
              <Bar 
                dataKey="stress" 
                name="ストレス反応"
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                onClick={(data: { payload?: { unit?: OrganizationUnit } }) => data.payload?.unit && onUnitClick(data.payload.unit)}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="エンゲージメント" 
                domain={[2, 4]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                label={{ value: 'エンゲージメント →', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="ストレス"
                domain={[2, 4]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                label={{ value: 'ストレス反応 →', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 600]} name="人数" />
              <Tooltip content={<CustomScatterTooltip />} />
              <ReferenceLine x={avgEngagement} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine y={avgStress} stroke="#94a3b8" strokeDasharray="4 4" />
              <Scatter 
                data={scatterData} 
                onClick={(data: { payload?: { unit?: OrganizationUnit } }) => data.payload?.unit && onUnitClick(data.payload.unit)}
                cursor="pointer"
              >
                {scatterData.map((entry, index) => (
                  <circle
                    key={`scatter-${index}`}
                    fill={getScatterColor(entry.riskLevel)}
                    fillOpacity={0.7}
                    stroke={getScatterColor(entry.riskLevel)}
                    strokeWidth={2}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {categoryUnits.slice(0, 4).map((unit) => (
          <CategorySummaryCard 
            key={unit.id} 
            unit={unit} 
            avgEngagement={avgEngagement}
            avgStress={avgStress}
            onClick={() => onUnitClick(unit)}
          />
        ))}
      </div>
    </div>
  );
}

function CustomBarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullName: string; engagement: number; stress: number; headcount: number; riskLevel: string } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        {data.fullName}
        <span className="text-xs text-gray-400">({data.headcount}名)</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-blue-600">エンゲージメント:</span>
          <span className="font-medium">{data.engagement?.toFixed(2) ?? 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-amber-600">ストレス反応:</span>
          <span className="font-medium">{data.stress?.toFixed(2) ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

function CustomScatterTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; x: number; y: number; z: number; riskLevel: string } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        {data.name}
        <span className="text-xs text-gray-400">({data.z}名)</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-blue-600">エンゲージメント:</span>
          <span className="font-medium">{data.x?.toFixed(2) ?? 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-amber-600">ストレス反応:</span>
          <span className="font-medium">{data.y?.toFixed(2) ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

function getScatterColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'caution': return '#eab308';
    default: return '#22c55e';
  }
}

function CategorySummaryCard({ 
  unit, 
  avgEngagement,
  avgStress,
  onClick 
}: { 
  unit: OrganizationUnit; 
  avgEngagement: number;
  avgStress: number;
  onClick: () => void;
}) {
  const engDiff = (unit.engagementScore ?? 0) - avgEngagement;
  const stressDiff = (unit.stressScore ?? 0) - avgStress;
  const engPositive = engDiff >= 0;
  const stressPositive = stressDiff <= 0;

  return (
    <button 
      onClick={onClick}
      className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-900 truncate">{unit.name}</span>
        {unit.riskLevel === 'critical' && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />}
        {unit.riskLevel === 'healthy' && <Trophy className="w-3 h-3 text-green-500 flex-shrink-0" />}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
        <Users className="w-3 h-3" />
        {unit.headcount}名
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Eng</span>
          <span className={`text-xs font-medium flex items-center gap-0.5 ${engPositive ? 'text-green-600' : 'text-red-500'}`}>
            {engPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {unit.engagementScore?.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Stress</span>
          <span className={`text-xs font-medium flex items-center gap-0.5 ${stressPositive ? 'text-green-600' : 'text-red-500'}`}>
            {stressPositive ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
            {unit.stressScore?.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  );
}

