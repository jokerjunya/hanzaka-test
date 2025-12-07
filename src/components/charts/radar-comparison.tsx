// =====================================================
// Radar Comparison Chart - Multi-axis Score Visualization
// =====================================================

'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { OrganizationUnit } from '@/types';

interface RadarComparisonProps {
  unit: OrganizationUnit;
  benchmark: OrganizationUnit | null;
  type: 'engagement' | 'stress';
}

interface RadarDataPoint {
  subject: string;
  value: number | null;
  benchmark: number | null;
  fullMark: number;
}

export function RadarComparison({ unit, benchmark, type }: RadarComparisonProps) {
  const data: RadarDataPoint[] = type === 'engagement' 
    ? getEngagementRadarData(unit, benchmark)
    : getStressRadarData(unit, benchmark);

  // null値をフィルタリング
  const validData = data.filter(d => d.value !== null);

  if (validData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={validData}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 4]} 
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickCount={5}
          axisLine={false}
        />
        
        {/* 全社平均 */}
        {benchmark && (
          <Radar
            name="全社平均"
            dataKey="benchmark"
            stroke="#9ca3af"
            fill="#9ca3af"
            fillOpacity={0.15}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}
        
        {/* 対象組織 */}
        <Radar
          name={unit.name}
          dataKey="value"
          stroke={type === 'engagement' ? '#3b82f6' : '#f59e0b'}
          fill={type === 'engagement' ? '#3b82f6' : '#f59e0b'}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        
        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
        />
        <Tooltip 
          content={<CustomTooltip />}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }> }) {
  if (!active || !payload || payload.length === 0) return null;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold">{entry.value?.toFixed(2) ?? 'N/A'}</span>
        </div>
      ))}
    </div>
  );
}

function getEngagementRadarData(unit: OrganizationUnit, benchmark: OrganizationUnit | null): RadarDataPoint[] {
  const eng = unit.engagement;
  const benchEng = benchmark?.engagement;
  
  return [
    { subject: '期待明確化', value: eng.期待明確化, benchmark: benchEng?.期待明確化 ?? null, fullMark: 4 },
    { subject: '環境・資源', value: eng.環境資源, benchmark: benchEng?.環境資源 ?? null, fullMark: 4 },
    { subject: 'スキル適正', value: eng.スキル適正, benchmark: benchEng?.スキル適正 ?? null, fullMark: 4 },
    { subject: '褒められ度', value: eng.褒められ度, benchmark: benchEng?.褒められ度 ?? null, fullMark: 4 },
    { subject: '気にかけ度', value: eng.気にかけ度, benchmark: benchEng?.気にかけ度 ?? null, fullMark: 4 },
    { subject: '成長サポート', value: eng.成長サポート, benchmark: benchEng?.成長サポート ?? null, fullMark: 4 },
    { subject: '個人の尊重', value: eng.個人の尊重, benchmark: benchEng?.個人の尊重 ?? null, fullMark: 4 },
    { subject: 'ミッション', value: eng.ミッション, benchmark: benchEng?.ミッション ?? null, fullMark: 4 },
    { subject: '質の高い仕事', value: eng.質の高い仕事, benchmark: benchEng?.質の高い仕事 ?? null, fullMark: 4 },
    { subject: '信頼関係', value: eng.信頼関係, benchmark: benchEng?.信頼関係 ?? null, fullMark: 4 },
    { subject: 'フィードバック', value: eng.フィードバック, benchmark: benchEng?.フィードバック ?? null, fullMark: 4 },
    { subject: '成長機会', value: eng.成長機会, benchmark: benchEng?.成長機会 ?? null, fullMark: 4 },
  ];
}

function getStressRadarData(unit: OrganizationUnit, benchmark: OrganizationUnit | null): RadarDataPoint[] {
  const stress = unit.stress;
  const benchStress = benchmark?.stress;
  
  return [
    { subject: '上司サポート', value: stress.上司のサポート, benchmark: benchStress?.上司のサポート ?? null, fullMark: 4 },
    { subject: '同僚サポート', value: stress.同僚のサポート, benchmark: benchStress?.同僚のサポート ?? null, fullMark: 4 },
    { subject: 'リーダーシップ', value: stress.上司のリーダーシップ, benchmark: benchStress?.上司のリーダーシップ ?? null, fullMark: 4 },
    { subject: '褒める職場', value: stress.ほめてもらえる職場, benchmark: benchStress?.ほめてもらえる職場 ?? null, fullMark: 4 },
    { subject: '失敗を認める', value: stress.失敗を認める職場, benchmark: benchStress?.失敗を認める職場 ?? null, fullMark: 4 },
    { subject: '職場一体感', value: stress.職場の一体感, benchmark: benchStress?.職場の一体感 ?? null, fullMark: 4 },
    { subject: '仕事満足度', value: stress.仕事満足度, benchmark: benchStress?.仕事満足度 ?? null, fullMark: 4 },
    { subject: 'ハラスメント', value: stress.職場のハラスメント, benchmark: benchStress?.職場のハラスメント ?? null, fullMark: 4 },
  ];
}

