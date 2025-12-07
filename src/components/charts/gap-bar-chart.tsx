// =====================================================
// Gap Bar Chart - Benchmark Comparison Visualization
// =====================================================

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { OrganizationUnit } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GapBarChartProps {
  unit: OrganizationUnit;
  benchmark: OrganizationUnit | null;
  type: 'engagement' | 'stress' | 'stress-burden';
}

interface GapDataPoint {
  name: string;
  value: number | null;
  benchmark: number | null;
  gap: number;
  isHighBetter: boolean; // 高いほうが良い指標かどうか
}

export function GapBarChart({ unit, benchmark, type }: GapBarChartProps) {
  const data = getGapData(unit, benchmark, type);
  const validData = data.filter(d => d.value !== null && d.benchmark !== null);

  if (validData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        比較データがありません
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={validData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              domain={[-0.5, 0.5]}
              tickFormatter={(v) => v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              tick={{ fontSize: 11, fill: '#374151' }}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={2} />
            <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
              {validData.map((entry, index) => {
                // isHighBetterに基づいて色を決定
                const isPositive = entry.isHighBetter ? entry.gap >= 0 : entry.gap <= 0;
                return (
                  <Cell 
                    key={`cell-${index}`}
                    fill={isPositive ? '#10b981' : '#ef4444'}
                    fillOpacity={0.8}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 凡例 */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>良好（全社平均以上）</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>要改善（全社平均以下）</span>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: GapDataPoint }> }) {
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0].payload;
  const gap = data.gap;
  const isPositive = data.isHighBetter ? gap >= 0 : gap <= 0;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-semibold text-gray-900 mb-2">{data.name}</div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">現在値:</span>
          <span className="font-medium">{data.value?.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">全社平均:</span>
          <span className="font-medium">{data.benchmark?.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
          <span className="text-gray-500">差分:</span>
          <span className={`font-semibold flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {gap >= 0 ? '+' : ''}{gap.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function getGapData(unit: OrganizationUnit, benchmark: OrganizationUnit | null, type: string): GapDataPoint[] {
  if (!benchmark) return [];
  
  if (type === 'engagement') {
    const eng = unit.engagement;
    const benchEng = benchmark.engagement;
    
    return [
      { name: '期待明確化', value: eng.期待明確化, benchmark: benchEng.期待明確化, gap: (eng.期待明確化 ?? 0) - (benchEng.期待明確化 ?? 0), isHighBetter: true },
      { name: '環境・資源', value: eng.環境資源, benchmark: benchEng.環境資源, gap: (eng.環境資源 ?? 0) - (benchEng.環境資源 ?? 0), isHighBetter: true },
      { name: '褒められ度', value: eng.褒められ度, benchmark: benchEng.褒められ度, gap: (eng.褒められ度 ?? 0) - (benchEng.褒められ度 ?? 0), isHighBetter: true },
      { name: '成長サポート', value: eng.成長サポート, benchmark: benchEng.成長サポート, gap: (eng.成長サポート ?? 0) - (benchEng.成長サポート ?? 0), isHighBetter: true },
      { name: '心理的安全性', value: eng.心理的安全性, benchmark: benchEng.心理的安全性, gap: (eng.心理的安全性 ?? 0) - (benchEng.心理的安全性 ?? 0), isHighBetter: true },
      { name: 'フィードバック', value: eng.フィードバック, benchmark: benchEng.フィードバック, gap: (eng.フィードバック ?? 0) - (benchEng.フィードバック ?? 0), isHighBetter: true },
      { name: '成長機会', value: eng.成長機会, benchmark: benchEng.成長機会, gap: (eng.成長機会 ?? 0) - (benchEng.成長機会 ?? 0), isHighBetter: true },
    ];
  }
  
  if (type === 'stress') {
    // リソース系（高いほうが良い）
    const stress = unit.stress;
    const benchStress = benchmark.stress;
    
    return [
      { name: '上司サポート', value: stress.上司のサポート, benchmark: benchStress.上司のサポート, gap: (stress.上司のサポート ?? 0) - (benchStress.上司のサポート ?? 0), isHighBetter: true },
      { name: '同僚サポート', value: stress.同僚のサポート, benchmark: benchStress.同僚のサポート, gap: (stress.同僚のサポート ?? 0) - (benchStress.同僚のサポート ?? 0), isHighBetter: true },
      { name: 'リーダーシップ', value: stress.上司のリーダーシップ, benchmark: benchStress.上司のリーダーシップ, gap: (stress.上司のリーダーシップ ?? 0) - (benchStress.上司のリーダーシップ ?? 0), isHighBetter: true },
      { name: '褒める職場', value: stress.ほめてもらえる職場, benchmark: benchStress.ほめてもらえる職場, gap: (stress.ほめてもらえる職場 ?? 0) - (benchStress.ほめてもらえる職場 ?? 0), isHighBetter: true },
      { name: '失敗を認める', value: stress.失敗を認める職場, benchmark: benchStress.失敗を認める職場, gap: (stress.失敗を認める職場 ?? 0) - (benchStress.失敗を認める職場 ?? 0), isHighBetter: true },
      { name: '活気', value: stress.活気, benchmark: benchStress.活気, gap: (stress.活気 ?? 0) - (benchStress.活気 ?? 0), isHighBetter: true },
    ];
  }
  
  if (type === 'stress-burden') {
    // 負担系（低いほうが良い）
    const stress = unit.stress;
    const benchStress = benchmark.stress;
    
    return [
      { name: '量的負担', value: stress.仕事の量的負担, benchmark: benchStress.仕事の量的負担, gap: (stress.仕事の量的負担 ?? 0) - (benchStress.仕事の量的負担 ?? 0), isHighBetter: false },
      { name: '質的負担', value: stress.仕事の質的負担, benchmark: benchStress.仕事の質的負担, gap: (stress.仕事の質的負担 ?? 0) - (benchStress.仕事の質的負担 ?? 0), isHighBetter: false },
      { name: '役割葛藤', value: stress.役割葛藤, benchmark: benchStress.役割葛藤, gap: (stress.役割葛藤 ?? 0) - (benchStress.役割葛藤 ?? 0), isHighBetter: false },
      { name: '情緒的負担', value: stress.情緒的負担, benchmark: benchStress.情緒的負担, gap: (stress.情緒的負担 ?? 0) - (benchStress.情緒的負担 ?? 0), isHighBetter: false },
      { name: 'イライラ感', value: stress.イライラ感, benchmark: benchStress.イライラ感, gap: (stress.イライラ感 ?? 0) - (benchStress.イライラ感 ?? 0), isHighBetter: false },
      { name: '疲労感', value: stress.疲労感, benchmark: benchStress.疲労感, gap: (stress.疲労感 ?? 0) - (benchStress.疲労感 ?? 0), isHighBetter: false },
      { name: '不安感', value: stress.不安感, benchmark: benchStress.不安感, gap: (stress.不安感 ?? 0) - (benchStress.不安感 ?? 0), isHighBetter: false },
    ];
  }
  
  return [];
}

// 数値サマリーコンポーネント
export function GapSummary({ unit, benchmark }: { unit: OrganizationUnit; benchmark: OrganizationUnit | null }) {
  if (!benchmark) return null;
  
  const engGap = (unit.engagementScore ?? 0) - (benchmark.engagementScore ?? 0);
  const stressGap = (unit.stressScore ?? 0) - (benchmark.stressScore ?? 0);
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <GapCard 
        label="エンゲージメント" 
        value={unit.engagementScore} 
        benchmark={benchmark.engagementScore}
        gap={engGap}
        isHighBetter={true}
      />
      <GapCard 
        label="ストレス反応" 
        value={unit.stressScore} 
        benchmark={benchmark.stressScore}
        gap={stressGap}
        isHighBetter={false}
      />
    </div>
  );
}

function GapCard({ 
  label, 
  value, 
  benchmark, 
  gap, 
  isHighBetter 
}: { 
  label: string; 
  value: number | null; 
  benchmark: number | null;
  gap: number; 
  isHighBetter: boolean;
}) {
  const isPositive = isHighBetter ? gap >= 0 : gap <= 0;
  
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold text-gray-900">{value?.toFixed(2) ?? 'N/A'}</span>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {gap >= 0 ? '+' : ''}{gap.toFixed(2)}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">全社平均: {benchmark?.toFixed(2) ?? 'N/A'}</div>
    </div>
  );
}

