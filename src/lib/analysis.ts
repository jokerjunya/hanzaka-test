// =====================================================
// Analysis & Insights Engine
// =====================================================

import type { 
  OrganizationUnit, 
  DashboardSummary, 
  DriverAnalysis,
  Driver,
  SimulationResult
} from '@/types';

/** 全体平均を取得 */
function getOverallAverage(units: OrganizationUnit[]): OrganizationUnit | undefined {
  return units.find(u => u.category === '全体' && u.name.includes('全体'));
}

/** ダッシュボードサマリーを生成 */
export function generateDashboardSummary(units: OrganizationUnit[]): DashboardSummary {
  const overall = getOverallAverage(units);
  
  // 部署単位のみをフィルタ（分析対象）
  const departmentUnits = units.filter(u => u.category === '部署');
  
  // リスクレベルでソート
  const criticalUnits = departmentUnits
    .filter(u => u.riskLevel === 'critical' || u.riskLevel === 'warning')
    .sort((a, b) => {
      // バーンアウト象限を優先、次にストレススコア順
      if (a.quadrant === 'burnout' && b.quadrant !== 'burnout') return -1;
      if (b.quadrant === 'burnout' && a.quadrant !== 'burnout') return 1;
      return (b.stressScore || 0) - (a.stressScore || 0);
    })
    .slice(0, 5);
  
  const healthyUnits = departmentUnits
    .filter(u => u.riskLevel === 'healthy')
    .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
    .slice(0, 5);

  return {
    totalHeadcount: overall?.headcount || 0,
    averageEngagement: overall?.engagementScore || 0,
    averageStress: overall?.stressScore || 0,
    criticalUnits,
    healthyUnits,
    trendDirection: 'stable', // 時系列データがあれば計算
  };
}

/** 要因分析の係数（簡易版、実際は回帰分析等で算出） */
const FACTOR_WEIGHTS: Record<string, { engagement: number; stress: number }> = {
  '上司のサポート': { engagement: 0.35, stress: -0.40 },
  '上司のリーダーシップ': { engagement: 0.30, stress: -0.25 },
  'ほめてもらえる職場': { engagement: 0.40, stress: -0.30 },
  '失敗を認める職場': { engagement: 0.25, stress: -0.35 },
  '役割葛藤': { engagement: -0.30, stress: 0.45 },
  '仕事の量的負担': { engagement: -0.15, stress: 0.50 },
  '仕事の質的負担': { engagement: -0.10, stress: 0.35 },
  '情緒的負担': { engagement: -0.20, stress: 0.40 },
  '期待明確化': { engagement: 0.45, stress: -0.20 },
  'フィードバック': { engagement: 0.35, stress: -0.15 },
  '成長機会': { engagement: 0.40, stress: -0.10 },
  '心理的安全性': { engagement: 0.38, stress: -0.32 },
};

/** ベンチマーク値（全体平均） */
const BENCHMARKS: Record<string, number> = {
  '上司のサポート': 2.58,
  '上司のリーダーシップ': 2.75,
  'ほめてもらえる職場': 2.75,
  '失敗を認める職場': 2.89,
  '役割葛藤': 2.82,
  '仕事の量的負担': 2.17,
  '仕事の質的負担': 2.11,
  '情緒的負担': 2.67,
  '期待明確化': 3.3,
  'フィードバック': 3.0,
  '成長機会': 3.4,
  '心理的安全性': 3.5,
};

/** 施策レコメンデーション */
const RECOMMENDATIONS: Record<string, string> = {
  '上司のサポート': '1on1ミーティングの頻度向上、傾聴スキル研修の実施',
  '上司のリーダーシップ': 'マネジメント研修の実施、リーダーシップ360度評価の導入',
  'ほめてもらえる職場': '称賛文化の醸成、ピアボーナス制度の導入',
  '失敗を認める職場': '心理的安全性ワークショップ、失敗共有会の実施',
  '役割葛藤': '役割の明確化ミーティング、ジョブディスクリプションの整備',
  '仕事の量的負担': '業務棚卸し、タスクの優先順位付け支援',
  '仕事の質的負担': '業務プロセスの見直し、スキルアップ研修',
  '情緒的負担': 'メンタルヘルスサポート、レジリエンス研修',
  '期待明確化': '目標設定面談の充実、期待役割のすり合わせ',
  'フィードバック': '定期的なフィードバック面談、成長機会の可視化',
  '成長機会': 'キャリア開発プログラム、社内公募制度の活用',
  '心理的安全性': 'チームビルディング、オープンコミュニケーション研修',
};

/** 要因特定分析を実行 */
export function analyzeDrivers(unit: OrganizationUnit): DriverAnalysis {
  const drivers: Driver[] = [];
  
  // ストレス要因の分析
  const stressFactors: Array<{ key: string; value: number | null }> = [
    { key: '役割葛藤', value: unit.stress.役割葛藤 },
    { key: '仕事の量的負担', value: unit.stress.仕事の量的負担 },
    { key: '仕事の質的負担', value: unit.stress.仕事の質的負担 },
    { key: '情緒的負担', value: unit.stress.情緒的負担 },
    { key: '上司のサポート', value: unit.stress.上司のサポート },
    { key: '上司のリーダーシップ', value: unit.stress.上司のリーダーシップ },
    { key: 'ほめてもらえる職場', value: unit.stress.ほめてもらえる職場 },
    { key: '失敗を認める職場', value: unit.stress.失敗を認める職場 },
  ];
  
  // エンゲージメント要因の分析
  const engagementFactors: Array<{ key: string; value: number | null }> = [
    { key: '期待明確化', value: unit.engagement.期待明確化 },
    { key: 'フィードバック', value: unit.engagement.フィードバック },
    { key: '成長機会', value: unit.engagement.成長機会 },
    { key: '心理的安全性', value: unit.engagement.心理的安全性 },
  ];
  
  // ギャップ分析
  const allFactors = [...stressFactors, ...engagementFactors];
  
  for (const factor of allFactors) {
    if (factor.value === null) continue;
    
    const benchmark = BENCHMARKS[factor.key];
    if (benchmark === undefined) continue;
    
    const gap = factor.value - benchmark;
    const weights = FACTOR_WEIGHTS[factor.key];
    if (!weights) continue;
    
    // ストレス要因は高いほど悪い、リソース要因は低いほど悪い
    const isNegativeFactor = ['役割葛藤', '仕事の量的負担', '仕事の質的負担', '情緒的負担'].includes(factor.key);
    const isProblematic = isNegativeFactor ? gap > 0.1 : gap < -0.1;
    
    if (isProblematic) {
      const impact = Math.abs(gap * (weights.stress || weights.engagement));
      drivers.push({
        factor: factor.key,
        correlation: weights.stress || weights.engagement,
        impact: isNegativeFactor ? 'negative' : 'positive',
        currentValue: factor.value,
        benchmarkValue: benchmark,
        gap,
        recommendation: RECOMMENDATIONS[factor.key] || '個別対応を検討',
      });
    }
  }
  
  // 影響度でソート
  drivers.sort((a, b) => Math.abs(b.gap * b.correlation) - Math.abs(a.gap * a.correlation));
  
  // インサイト生成
  const insights = generateInsights(unit, drivers.slice(0, 3));
  
  return {
    unitId: unit.id,
    unitName: unit.name,
    topDrivers: drivers.slice(0, 3),
    insights,
  };
}

/** インサイトを生成 */
function generateInsights(unit: OrganizationUnit, topDrivers: Driver[]): string[] {
  const insights: string[] = [];
  
  // 象限に基づく基本インサイト
  if (unit.quadrant === 'burnout') {
    insights.push(
      `${unit.name}はエンゲージメントが高い一方でストレスも高く、バーンアウトのリスクがあります。`
    );
  } else if (unit.quadrant === 'distressed') {
    insights.push(
      `${unit.name}はエンゲージメントが低くストレスが高い状態です。早急な介入が必要です。`
    );
  } else if (unit.quadrant === 'disengaged') {
    insights.push(
      `${unit.name}は「静かな退職」状態の可能性があります。モチベーション向上施策を検討してください。`
    );
  }
  
  // 要因に基づくインサイト
  if (topDrivers.length > 0) {
    const primaryDriver = topDrivers[0];
    if (primaryDriver.impact === 'negative') {
      insights.push(
        `主な課題は「${primaryDriver.factor}」です（現在値: ${primaryDriver.currentValue?.toFixed(2)}、基準値: ${primaryDriver.benchmarkValue.toFixed(2)}）。`
      );
    } else {
      insights.push(
        `「${primaryDriver.factor}」が基準値を下回っています（現在値: ${primaryDriver.currentValue?.toFixed(2)}、基準値: ${primaryDriver.benchmarkValue.toFixed(2)}）。`
      );
    }
    
    insights.push(`推奨アクション: ${primaryDriver.recommendation}`);
  }
  
  return insights;
}

/** What-ifシミュレーション */
export function simulateChange(
  unit: OrganizationUnit,
  factor: string,
  newValue: number
): SimulationResult {
  const weights = FACTOR_WEIGHTS[factor];
  if (!weights) {
    return {
      factor,
      originalValue: 0,
      newValue,
      predictedEngagementChange: 0,
      predictedStressChange: 0,
      confidence: 0,
    };
  }
  
  // 現在値を取得
  let originalValue = 0;
  const stressKeys = ['役割葛藤', '仕事の量的負担', '仕事の質的負担', '情緒的負担', 
                      '上司のサポート', '上司のリーダーシップ', 'ほめてもらえる職場', '失敗を認める職場'];
  
  if (stressKeys.includes(factor)) {
    originalValue = unit.stress[factor as keyof typeof unit.stress] as number || 0;
  } else {
    originalValue = unit.engagement[factor as keyof typeof unit.engagement] as number || 0;
  }
  
  const change = newValue - originalValue;
  
  return {
    factor,
    originalValue,
    newValue,
    predictedEngagementChange: change * weights.engagement,
    predictedStressChange: change * weights.stress,
    confidence: 0.75, // 簡易モデルのため固定
  };
}

/** 部署をカテゴリでグループ化 */
export function groupByCategory(units: OrganizationUnit[]): Map<string, OrganizationUnit[]> {
  const groups = new Map<string, OrganizationUnit[]>();
  
  for (const unit of units) {
    const existing = groups.get(unit.category) || [];
    existing.push(unit);
    groups.set(unit.category, existing);
  }
  
  return groups;
}

/** 統計情報を計算 */
export function calculateStatistics(units: OrganizationUnit[]): {
  engagementMean: number;
  engagementStd: number;
  stressMean: number;
  stressStd: number;
} {
  const engagements = units.map(u => u.engagementScore).filter((v): v is number => v !== null);
  const stresses = units.map(u => u.stressScore).filter((v): v is number => v !== null);
  
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = (arr: number[]) => {
    const m = mean(arr);
    return Math.sqrt(arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / arr.length);
  };
  
  return {
    engagementMean: mean(engagements),
    engagementStd: std(engagements),
    stressMean: mean(stresses),
    stressStd: std(stresses),
  };
}



