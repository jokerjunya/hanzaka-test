// =====================================================
// Organization Vitality Grid - Type Definitions
// =====================================================

/** 区分カテゴリ */
export type SegmentCategory = 
  | '部署'
  | '役職'
  | '雇用形態'
  | '拠点'
  | '性別'
  | '年代'
  | '全体';

/** エンゲージメントサーベイのrawデータ */
export interface EngagementRawData {
  区分: string;
  名称: string;
  人数: number;
  eNps: number | null;
  エンゲージメント総合指数: number | null;
  階層モデル_パフォーマンス: number | null;
  階層モデル_チームワーク: number | null;
  階層モデル_個人要因: number | null;
  階層モデル_環境: number | null;
  期待明確化: number | null;
  環境資源: number | null;
  スキル適正: number | null;
  褒められ度: number | null;
  気にかけ度: number | null;
  成長サポート: number | null;
  個人の尊重: number | null;
  ミッション: number | null;
  質の高い仕事: number | null;
  信頼関係: number | null;
  フィードバック: number | null;
  成長機会: number | null;
  コミュニケーション_課題設定: number | null;
  コミュニケーション_業務指示: number | null;
  コミュニケーション_リーダーシップ: number | null;
  コミュニケーション_心理的安全性: number | null;
  コミュニケーション_キャリア相談: number | null;
  コミュニケーション_プライベート: number | null;
  キャリア意向: number | null;
}

/** ストレスチェックのrawデータ */
export interface StressCheckRawData {
  区分: string;
  名称: string;
  人数: number;
  仕事の量的負担: number | null;
  仕事の質的負担: number | null;
  身体的負担度: number | null;
  職場での対人関係: number | null;
  職場環境: number | null;
  情緒的負担: number | null;
  役割葛藤: number | null;
  ワークセルフバランス_ネガティブ: number | null;
  仕事の負担合計: number | null;
  仕事のコントロール: number | null;
  仕事の適性: number | null;
  技能の活用: number | null;
  仕事の意義: number | null;
  役割明確さ: number | null;
  成長の機会: number | null;
  仕事の資源_作業レベル合計: number | null;
  上司のサポート: number | null;
  同僚のサポート: number | null;
  家族友人のサポート: number | null;
  経済地位報酬: number | null;
  尊重報酬: number | null;
  安定報酬: number | null;
  上司のリーダーシップ: number | null;
  上司の公正な態度: number | null;
  ほめてもらえる職場: number | null;
  失敗を認める職場: number | null;
  仕事の資源_部署レベル合計: number | null;
  経営層との信頼関係: number | null;
  変化への対応: number | null;
  個人の尊重: number | null;
  公正な人事評価: number | null;
  多様な労働者への対応: number | null;
  キャリア形成: number | null;
  ワークセルフバランス_ポジティブ: number | null;
  仕事の資源_事業場レベル合計: number | null;
  ワークエンゲイジメント: number | null;
  職場の一体感: number | null;
  活気: number | null;
  イライラ感: number | null;
  疲労感: number | null;
  不安感: number | null;
  抑うつ感: number | null;
  心理的ストレス反応合計: number | null;
  身体愁訴: number | null;
  職場のハラスメント: number | null;
  仕事満足度: number | null;
  家庭満足度: number | null;
}

/** 統合された組織データ */
export interface OrganizationUnit {
  id: string;
  category: string;
  name: string;
  headcount: number;
  
  // マトリクス軸
  engagementScore: number | null;  // X軸: エンゲージメント総合指数
  stressScore: number | null;       // Y軸: 心理的ストレス反応合計
  
  // 詳細スコア
  engagement: EngagementDetails;
  stress: StressDetails;
  
  // 算出値
  riskLevel: RiskLevel;
  quadrant: Quadrant;
}

/** エンゲージメント詳細 */
export interface EngagementDetails {
  eNps: number | null;
  期待明確化: number | null;
  環境資源: number | null;
  スキル適正: number | null;
  褒められ度: number | null;
  気にかけ度: number | null;
  成長サポート: number | null;
  個人の尊重: number | null;
  ミッション: number | null;
  質の高い仕事: number | null;
  信頼関係: number | null;
  フィードバック: number | null;
  成長機会: number | null;
  心理的安全性: number | null;
  リーダーシップ: number | null;
}

/** ストレス詳細 */
export interface StressDetails {
  仕事の量的負担: number | null;
  仕事の質的負担: number | null;
  役割葛藤: number | null;
  情緒的負担: number | null;
  上司のサポート: number | null;
  同僚のサポート: number | null;
  上司のリーダーシップ: number | null;
  ほめてもらえる職場: number | null;
  失敗を認める職場: number | null;
  活気: number | null;
  イライラ感: number | null;
  疲労感: number | null;
  不安感: number | null;
  抑うつ感: number | null;
}

/** リスクレベル */
export type RiskLevel = 'critical' | 'warning' | 'caution' | 'healthy';

/** 4象限 */
export type Quadrant = 
  | 'burnout'      // 高エンゲージメント・高ストレス（バーンアウト予備軍）
  | 'thriving'     // 高エンゲージメント・低ストレス（理想状態）
  | 'disengaged'   // 低エンゲージメント・低ストレス（静かな退職）
  | 'distressed';  // 低エンゲージメント・高ストレス（要ケア）

/** 要因分析結果 */
export interface DriverAnalysis {
  unitId: string;
  unitName: string;
  topDrivers: Driver[];
  insights: string[];
}

/** 要因 */
export interface Driver {
  factor: string;
  correlation: number;
  impact: 'positive' | 'negative';
  currentValue: number | null;
  benchmarkValue: number;
  gap: number;
  recommendation: string;
}

/** シミュレーション結果 */
export interface SimulationResult {
  factor: string;
  originalValue: number;
  newValue: number;
  predictedEngagementChange: number;
  predictedStressChange: number;
  confidence: number;
}

/** ダッシュボードサマリー */
export interface DashboardSummary {
  totalHeadcount: number;
  averageEngagement: number;
  averageStress: number;
  criticalUnits: OrganizationUnit[];
  healthyUnits: OrganizationUnit[];
  trendDirection: 'improving' | 'stable' | 'declining';
}

/** フィルター設定 */
export interface FilterConfig {
  categories: string[];
  minHeadcount: number;
  showOnlyRisk: boolean;
}



