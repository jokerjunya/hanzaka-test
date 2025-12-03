// =====================================================
// Unit Detail Panel - Detailed Analysis View
// =====================================================

'use client';

import { useState, useMemo } from 'react';
import { OrganizationUnit, Driver } from '@/types';
import { analyzeDrivers, simulateChange } from '@/lib/analysis';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  SlidersHorizontal,
  BarChart3,
  ArrowRight,
  Sparkles,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Flame,
  Target,
  RefreshCw
} from 'lucide-react';

interface UnitDetailPanelProps {
  unit: OrganizationUnit;
  onClose: () => void;
}

type TabType = 'factors' | 'simulation';

export function UnitDetailPanel({ unit, onClose }: UnitDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('factors');
  const [simulationFactor, setSimulationFactor] = useState('上司のサポート');
  const [simulationTarget, setSimulationTarget] = useState(2.8);
  const [simulationResult, setSimulationResult] = useState<ReturnType<typeof simulateChange> | null>(null);

  const driverAnalysis = useMemo(() => analyzeDrivers(unit), [unit]);

  const handleSimulate = () => {
    const result = simulateChange(unit, simulationFactor, simulationTarget);
    setSimulationResult(result);
  };

  const getRiskConfig = () => {
    switch (unit.riskLevel) {
      case 'critical':
        return {
          icon: <Flame className="w-3 h-3" />,
          label: 'バーンアウト予備軍',
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3 h-3" />,
          label: '要注意',
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-200'
        };
      case 'caution':
        return {
          icon: <TrendingDown className="w-3 h-3" />,
          label: '注意',
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200'
        };
      default:
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          label: '健全',
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200'
        };
    }
  };

  const riskConfig = getRiskConfig();

  const simulationFactors = [
    '上司のサポート',
    '上司のリーダーシップ',
    'ほめてもらえる職場',
    '失敗を認める職場',
    '役割葛藤',
    '仕事の量的負担',
  ];

  const primaryDriver = driverAnalysis.topDrivers[0];

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${riskConfig.bg} ${riskConfig.text} ${riskConfig.border} border`}>
              {riskConfig.icon}
              {riskConfig.label}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{unit.name}</h2>
            <p className="text-sm text-gray-500">{unit.category} ・ {unit.headcount}名</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* スコアサマリー */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="text-xs font-medium text-blue-600 mb-1">エンゲージメント</div>
            <div className="text-2xl font-bold text-blue-700">
              {unit.engagementScore?.toFixed(2) || 'N/A'}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
            <div className="text-xs font-medium text-amber-600 mb-1">ストレス反応</div>
            <div className="text-2xl font-bold text-amber-700">
              {unit.stressScore?.toFixed(2) || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('factors')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'factors'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          要因分析
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'simulation'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          改善シミュレーション
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'factors' ? (
          <div className="space-y-6">
            {/* AIインサイト */}
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-5">
              <div className="flex items-center gap-2 text-amber-700 mb-3">
                <Lightbulb className="w-5 h-5" />
                <span className="font-semibold text-sm">分析インサイト</span>
              </div>
              <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                {driverAnalysis.insights.map((insight, idx) => (
                  <p key={idx} className={idx > 0 ? 'text-gray-600' : ''}>{insight}</p>
                ))}
              </div>
            </div>

            {/* 主要因リスト */}
            {driverAnalysis.topDrivers.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  課題の主要因
                </h3>
                <div className="space-y-4">
                  {driverAnalysis.topDrivers.map((driver, idx) => (
                    <DriverCard key={idx} driver={driver} rank={idx + 1} />
                  ))}
                </div>
              </div>
            )}

            {driverAnalysis.topDrivers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <p>特に課題は見つかりませんでした</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* シミュレーション設定 */}
            <div className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-700 mb-4">
                <RefreshCw className="w-5 h-5" />
                <span className="font-semibold text-sm">What-if 分析</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">改善する要因</label>
                  <select
                    value={simulationFactor}
                    onChange={(e) => setSimulationFactor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {simulationFactors.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">目標値</span>
                    <span className="text-sm font-semibold text-blue-600">{simulationTarget.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.1"
                    value={simulationTarget}
                    onChange={(e) => setSimulationTarget(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1.0</span>
                    <span>4.0</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulate}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  シミュレーション実行
                </button>
              </div>
            </div>

            {/* シミュレーション結果 */}
            {simulationResult && (
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-5">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-green-600" />
                  予測結果
                </h4>
                <div className="space-y-3">
                  <ResultRow label="元の値" value={simulationResult.originalValue.toFixed(2)} />
                  <ResultRow 
                    label="変更後" 
                    value={simulationResult.newValue.toFixed(2)} 
                    highlight 
                  />
                  <ResultRow 
                    label="エンゲージメント変化" 
                    value={`${simulationResult.predictedEngagementChange >= 0 ? '+' : ''}${simulationResult.predictedEngagementChange.toFixed(3)}`}
                    trend={simulationResult.predictedEngagementChange >= 0 ? 'positive' : 'negative'}
                  />
                  <ResultRow 
                    label="ストレス変化" 
                    value={`${simulationResult.predictedStressChange >= 0 ? '+' : ''}${simulationResult.predictedStressChange.toFixed(3)}`}
                    trend={simulationResult.predictedStressChange <= 0 ? 'positive' : 'negative'}
                  />
                  <ResultRow 
                    label="予測信頼度" 
                    value={`${Math.round(simulationResult.confidence * 100)}%`}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DriverCard({ driver, rank }: { driver: Driver; rank: number; }) {
  const diff = driver.gap;
  const isNegative = driver.impact === 'negative';

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">{driver.factor}</h4>
            <div className={`flex items-center gap-1 text-sm font-medium ${isNegative ? 'text-red-600' : 'text-amber-600'}`}>
              {isNegative ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
            </div>
          </div>
          
          {/* プログレスバー */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-12">現在値</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isNegative ? 'bg-red-400' : 'bg-amber-400'}`}
                  style={{ width: `${((driver.currentValue || 0) / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 w-10 text-right">{driver.currentValue?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-12">基準値</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${(driver.benchmarkValue / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500 w-10 text-right">{driver.benchmarkValue.toFixed(2)}</span>
            </div>
          </div>

          {/* 推奨アクション */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
            <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">{driver.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ 
  label, 
  value, 
  highlight,
  trend 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  trend?: 'positive' | 'negative';
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`
        text-sm font-semibold
        ${highlight ? 'text-blue-600' : ''}
        ${trend === 'positive' ? 'text-green-600' : ''}
        ${trend === 'negative' ? 'text-red-600' : ''}
        ${!highlight && !trend ? 'text-gray-900' : ''}
      `}>
        {value}
      </span>
    </div>
  );
}
