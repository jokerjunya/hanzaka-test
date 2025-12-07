// =====================================================
// Risk Indicators - Additional Metrics Display
// =====================================================

'use client';

import { OrganizationUnit } from '@/types';
import { 
  AlertTriangle, 
  Heart, 
  Home, 
  Users, 
  Zap,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface RiskIndicatorsProps {
  unit: OrganizationUnit;
  benchmark: OrganizationUnit | null;
}

export function RiskIndicators({ unit, benchmark }: RiskIndicatorsProps) {
  const stress = unit.stress;
  const benchStress = benchmark?.stress;

  const indicators = [
    {
      label: '職場のハラスメント',
      value: stress.職場のハラスメント,
      benchmark: benchStress?.職場のハラスメント ?? null,
      icon: <Shield className="w-4 h-4" />,
      isHighBetter: true, // 高いほうが良い（ハラスメントが少ない）
      warning: stress.職場のハラスメント !== null && stress.職場のハラスメント < 3.0,
      description: 'ハラスメントのない職場環境',
    },
    {
      label: '仕事満足度',
      value: stress.仕事満足度,
      benchmark: benchStress?.仕事満足度 ?? null,
      icon: <Heart className="w-4 h-4" />,
      isHighBetter: true,
      warning: stress.仕事満足度 !== null && stress.仕事満足度 < 2.8,
      description: '現在の仕事への満足感',
    },
    {
      label: '家庭満足度',
      value: stress.家庭満足度,
      benchmark: benchStress?.家庭満足度 ?? null,
      icon: <Home className="w-4 h-4" />,
      isHighBetter: true,
      warning: stress.家庭満足度 !== null && stress.家庭満足度 < 2.8,
      description: 'ワークライフバランス',
    },
    {
      label: '職場の一体感',
      value: stress.職場の一体感,
      benchmark: benchStress?.職場の一体感 ?? null,
      icon: <Users className="w-4 h-4" />,
      isHighBetter: true,
      warning: stress.職場の一体感 !== null && stress.職場の一体感 < 2.5,
      description: 'チームの結束力',
    },
    {
      label: 'ワークエンゲイジメント',
      value: stress.ワークエンゲイジメント,
      benchmark: benchStress?.ワークエンゲイジメント ?? null,
      icon: <Zap className="w-4 h-4" />,
      isHighBetter: true,
      warning: stress.ワークエンゲイジメント !== null && stress.ワークエンゲイジメント < 2.5,
      description: '仕事への没頭・活力',
    },
    {
      label: '身体愁訴',
      value: stress.身体愁訴,
      benchmark: benchStress?.身体愁訴 ?? null,
      icon: <AlertTriangle className="w-4 h-4" />,
      isHighBetter: false, // 低いほうが良い
      warning: stress.身体愁訴 !== null && stress.身体愁訴 > 2.8,
      description: '身体的な不調の訴え',
    },
  ];

  // 有効な指標のみフィルタ
  const validIndicators = indicators.filter(i => i.value !== null);

  if (validIndicators.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        追加リスク指標
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {validIndicators.map((indicator, idx) => (
          <IndicatorCard key={idx} {...indicator} />
        ))}
      </div>
    </div>
  );
}

function IndicatorCard({
  label,
  value,
  benchmark,
  icon,
  isHighBetter,
  warning,
  description,
}: {
  label: string;
  value: number | null;
  benchmark: number | null;
  icon: React.ReactNode;
  isHighBetter: boolean;
  warning: boolean;
  description: string;
}) {
  if (value === null) return null;

  const gap = benchmark !== null ? value - benchmark : 0;
  const isPositive = isHighBetter ? gap >= 0 : gap <= 0;

  return (
    <div className={`
      p-3 rounded-lg border transition-colors
      ${warning 
        ? 'bg-red-50 border-red-200' 
        : 'bg-gray-50 border-gray-200'
      }
    `}>
      <div className="flex items-start justify-between mb-1">
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center
          ${warning ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}
        `}>
          {icon}
        </div>
        {benchmark !== null && (
          <div className={`
            flex items-center gap-0.5 text-xs font-medium
            ${isPositive ? 'text-green-600' : 'text-red-500'}
          `}>
            {gap === 0 ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {gap >= 0 ? '+' : ''}{gap.toFixed(2)}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${warning ? 'text-red-700' : 'text-gray-900'}`}>
        {value.toFixed(2)}
      </div>
      <div className="text-xs text-gray-400 mt-1">{description}</div>
    </div>
  );
}

// 組織全体のリスクサマリー
export function OrganizationRiskSummary({ units }: { units: OrganizationUnit[] }) {
  // 部署単位でフィルタ
  const departmentUnits = units.filter(u => u.category === '部署');
  
  if (departmentUnits.length === 0) return null;

  // ハラスメントリスクの高い部署
  const harassmentRiskUnits = departmentUnits
    .filter(u => u.stress.職場のハラスメント !== null && u.stress.職場のハラスメント < 3.0)
    .sort((a, b) => (a.stress.職場のハラスメント ?? 4) - (b.stress.職場のハラスメント ?? 4));

  // 身体愁訴の高い部署
  const physicalRiskUnits = departmentUnits
    .filter(u => u.stress.身体愁訴 !== null && u.stress.身体愁訴 > 2.8)
    .sort((a, b) => (b.stress.身体愁訴 ?? 0) - (a.stress.身体愁訴 ?? 0));

  // 仕事満足度の低い部署
  const lowSatisfactionUnits = departmentUnits
    .filter(u => u.stress.仕事満足度 !== null && u.stress.仕事満足度 < 2.8)
    .sort((a, b) => (a.stress.仕事満足度 ?? 4) - (b.stress.仕事満足度 ?? 4));

  const hasRisks = harassmentRiskUnits.length > 0 || physicalRiskUnits.length > 0 || lowSatisfactionUnits.length > 0;

  if (!hasRisks) {
    return (
      <div className="p-4 rounded-xl bg-green-50 border border-green-200">
        <div className="flex items-center gap-2 text-green-700">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">特筆すべきリスクは検出されていません</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {harassmentRiskUnits.length > 0 && (
        <RiskAlert
          icon={<Shield className="w-4 h-4" />}
          title="ハラスメントリスク"
          color="red"
          units={harassmentRiskUnits.slice(0, 3)}
          metric="職場のハラスメント"
          getValue={(u) => u.stress.職場のハラスメント}
        />
      )}
      
      {physicalRiskUnits.length > 0 && (
        <RiskAlert
          icon={<AlertTriangle className="w-4 h-4" />}
          title="身体的不調リスク"
          color="amber"
          units={physicalRiskUnits.slice(0, 3)}
          metric="身体愁訴"
          getValue={(u) => u.stress.身体愁訴}
        />
      )}
      
      {lowSatisfactionUnits.length > 0 && (
        <RiskAlert
          icon={<Heart className="w-4 h-4" />}
          title="満足度低下"
          color="amber"
          units={lowSatisfactionUnits.slice(0, 3)}
          metric="仕事満足度"
          getValue={(u) => u.stress.仕事満足度}
        />
      )}
    </div>
  );
}

function RiskAlert({
  icon,
  title,
  color,
  units,
  metric,
  getValue,
}: {
  icon: React.ReactNode;
  title: string;
  color: 'red' | 'amber';
  units: OrganizationUnit[];
  metric: string;
  getValue: (u: OrganizationUnit) => number | null;
}) {
  const bgColor = color === 'red' ? 'bg-red-50' : 'bg-amber-50';
  const borderColor = color === 'red' ? 'border-red-200' : 'border-amber-200';
  const textColor = color === 'red' ? 'text-red-700' : 'text-amber-700';
  const iconBg = color === 'red' ? 'bg-red-100' : 'bg-amber-100';

  return (
    <div className={`p-3 rounded-lg border ${bgColor} ${borderColor}`}>
      <div className={`flex items-center gap-2 ${textColor} mb-2`}>
        <div className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="font-semibold text-sm">{title}</span>
        <span className="text-xs opacity-70">({units.length}部署)</span>
      </div>
      <div className="space-y-1">
        {units.map((unit) => (
          <div key={unit.id} className="flex items-center justify-between text-xs">
            <span className="text-gray-700">{unit.name}</span>
            <span className={`font-medium ${textColor}`}>
              {getValue(unit)?.toFixed(2) ?? 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

