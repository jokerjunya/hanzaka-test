// =====================================================
// CSV Parser & Data Transformer
// =====================================================

import Papa from 'papaparse';
import type { 
  OrganizationUnit, 
  EngagementDetails, 
  StressDetails,
  RiskLevel,
  Quadrant 
} from '@/types';

/** CSVの列名マッピング（エンゲージメント） */
const ENGAGEMENT_COLUMN_MAP: Record<string, string> = {
  '区分': 'category',
  '名称': 'name',
  '人数': 'headcount',
  'eNps(%)　　': 'eNps',
  'エンゲージメント総合指数': 'engagementScore',
  'エンゲージメント/ 02_期待明確化': '期待明確化',
  'エンゲージメント / 03_環境・資源': '環境資源',
  'エンゲージメント / 04_スキル適正': 'スキル適正',
  'エンゲージメント / 05_褒められ度': '褒められ度',
  'エンゲージメント / 06_気にかけ度': '気にかけ度',
  'エンゲージメント / 07_成長サポート': '成長サポート',
  'エンゲージメント / 08_個人の尊重': '個人の尊重',
  'エンゲージメント / 09_ミッション': 'ミッション',
  'エンゲージメント / 10_質の高い仕事': '質の高い仕事',
  'エンゲージメント / 11_信頼関係': '信頼関係',
  'エンゲージメント / 12_フィードバック': 'フィードバック',
  'エンゲージメント / 13_成長機会': '成長機会',
  'コミュニケーション/心理的安全性': '心理的安全性',
  'コミュニケーション/リーダーシップ': 'リーダーシップ',
};

/** CSVの列名マッピング（ストレスチェック） */
const STRESS_COLUMN_MAP: Record<string, string> = {
  '区分': 'category',
  '名称': 'name',
  '人数': 'headcount',
  '仕事の量的負担': '仕事の量的負担',
  '仕事の質的負担': '仕事の質的負担',
  '役割葛藤': '役割葛藤',
  '情緒的負担': '情緒的負担',
  '上司のサポート': '上司のサポート',
  '同僚のサポート': '同僚のサポート',
  '上司のリーダーシップ': '上司のリーダーシップ',
  'ほめてもらえる職場': 'ほめてもらえる職場',
  '失敗を認める職場': '失敗を認める職場',
  '活気': '活気',
  'イライラ感': 'イライラ感',
  '疲労感': '疲労感',
  '不安感': '不安感',
  '抑うつ感': '抑うつ感',
  '心理的ストレス反応合計': 'stressScore',
};

/** 数値パース（"-"や空文字をnullに） */
function parseNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === '' || value === '-') {
    return null;
  }
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? null : num;
}

/** カテゴリを正規化 */
function normalizeCategory(category: string): string {
  if (category.includes('全体')) return '全体';
  if (category.includes('役職')) return '役職';
  if (category.includes('雇用形態')) return '雇用形態';
  if (category.includes('拠点')) return '拠点';
  if (category.includes('性別')) return '性別';
  if (category.includes('年代')) return '年代';
  return '部署';
}

/** ユニークIDを生成 */
function generateId(category: string, name: string): string {
  return `${category}_${name}`.replace(/\s+/g, '_').replace(/[\/\\]/g, '_');
}

/** 4象限を判定 */
function determineQuadrant(
  engagement: number | null, 
  stress: number | null,
  engagementThreshold = 3.2,
  stressThreshold = 2.65
): Quadrant {
  if (engagement === null || stress === null) return 'disengaged';
  
  const highEngagement = engagement >= engagementThreshold;
  const highStress = stress >= stressThreshold;
  
  if (highEngagement && highStress) return 'burnout';
  if (highEngagement && !highStress) return 'thriving';
  if (!highEngagement && highStress) return 'distressed';
  return 'disengaged';
}

/** リスクレベルを判定 */
function determineRiskLevel(
  quadrant: Quadrant,
  engagement: number | null,
  stress: number | null
): RiskLevel {
  if (quadrant === 'burnout') {
    // 高エンゲージメント・高ストレスは最も危険（バーンアウト予備軍）
    if (stress && stress > 2.9) return 'critical';
    return 'warning';
  }
  if (quadrant === 'distressed') {
    // 低エンゲージメント・高ストレスも要注意
    return 'warning';
  }
  if (quadrant === 'disengaged') {
    // 低エンゲージメント・低ストレスは静かな退職リスク
    if (engagement && engagement < 2.8) return 'caution';
    return 'caution';
  }
  return 'healthy';
}

/** エンゲージメントCSVをパース */
export function parseEngagementCSV(csvContent: string): Map<string, Partial<OrganizationUnit>> {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const dataMap = new Map<string, Partial<OrganizationUnit>>();

  for (const row of result.data as Record<string, string>[]) {
    const category = normalizeCategory(row['区分'] || '');
    const name = row['名称'] || '';
    const headcount = parseNumber(row['人数']);
    
    // サンプル9以下は除外
    if (headcount === null || headcount <= 9) continue;
    
    const id = generateId(category, name);
    const engagementScore = parseNumber(row['エンゲージメント総合指数']);
    
    const engagement: EngagementDetails = {
      eNps: parseNumber(row['eNps(%)　　']),
      期待明確化: parseNumber(row['エンゲージメント/ 02_期待明確化']),
      環境資源: parseNumber(row['エンゲージメント / 03_環境・資源']),
      スキル適正: parseNumber(row['エンゲージメント / 04_スキル適正']),
      褒められ度: parseNumber(row['エンゲージメント / 05_褒められ度']),
      気にかけ度: parseNumber(row['エンゲージメント / 06_気にかけ度']),
      成長サポート: parseNumber(row['エンゲージメント / 07_成長サポート']),
      個人の尊重: parseNumber(row['エンゲージメント / 08_個人の尊重']),
      ミッション: parseNumber(row['エンゲージメント / 09_ミッション']),
      質の高い仕事: parseNumber(row['エンゲージメント / 10_質の高い仕事']),
      信頼関係: parseNumber(row['エンゲージメント / 11_信頼関係']),
      フィードバック: parseNumber(row['エンゲージメント / 12_フィードバック']),
      成長機会: parseNumber(row['エンゲージメント / 13_成長機会']),
      心理的安全性: parseNumber(row['コミュニケーション/心理的安全性']),
      リーダーシップ: parseNumber(row['コミュニケーション/リーダーシップ']),
    };

    dataMap.set(id, {
      id,
      category,
      name,
      headcount: headcount || 0,
      engagementScore,
      engagement,
    });
  }

  return dataMap;
}

/** ストレスチェックCSVをパース */
export function parseStressCheckCSV(csvContent: string): Map<string, Partial<OrganizationUnit>> {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const dataMap = new Map<string, Partial<OrganizationUnit>>();

  for (const row of result.data as Record<string, string>[]) {
    const category = normalizeCategory(row['区分'] || '');
    const name = row['名称'] || '';
    const headcount = parseNumber(row['人数']);
    
    // サンプル9以下は除外
    if (headcount === null || headcount <= 9) continue;
    
    const id = generateId(category, name);
    const stressScore = parseNumber(row['心理的ストレス反応合計']);
    
    const stress: StressDetails = {
      仕事の量的負担: parseNumber(row['仕事の量的負担']),
      仕事の質的負担: parseNumber(row['仕事の質的負担']),
      役割葛藤: parseNumber(row['役割葛藤']),
      情緒的負担: parseNumber(row['情緒的負担']),
      上司のサポート: parseNumber(row['上司のサポート']),
      同僚のサポート: parseNumber(row['同僚のサポート']),
      上司のリーダーシップ: parseNumber(row['上司のリーダーシップ']),
      ほめてもらえる職場: parseNumber(row['ほめてもらえる職場']),
      失敗を認める職場: parseNumber(row['失敗を認める職場']),
      活気: parseNumber(row['活気']),
      イライラ感: parseNumber(row['イライラ感']),
      疲労感: parseNumber(row['疲労感']),
      不安感: parseNumber(row['不安感']),
      抑うつ感: parseNumber(row['抑うつ感']),
    };

    dataMap.set(id, {
      id,
      category,
      name,
      headcount: headcount || 0,
      stressScore,
      stress,
    });
  }

  return dataMap;
}

/** 2つのデータを統合 */
export function mergeData(
  engagementData: Map<string, Partial<OrganizationUnit>>,
  stressData: Map<string, Partial<OrganizationUnit>>
): OrganizationUnit[] {
  const result: OrganizationUnit[] = [];
  
  // エンゲージメントデータをベースに統合
  for (const [id, engUnit] of engagementData) {
    const stressUnit = stressData.get(id);
    
    if (!stressUnit) continue; // 両方にデータがある場合のみ
    
    const engagementScore = engUnit.engagementScore ?? null;
    const stressScore = stressUnit.stressScore ?? null;
    const quadrant = determineQuadrant(engagementScore, stressScore);
    const riskLevel = determineRiskLevel(quadrant, engagementScore, stressScore);
    
    const unit: OrganizationUnit = {
      id,
      category: engUnit.category || '',
      name: engUnit.name || '',
      headcount: engUnit.headcount || 0,
      engagementScore,
      stressScore,
      engagement: engUnit.engagement || {} as EngagementDetails,
      stress: stressUnit.stress || {} as StressDetails,
      riskLevel,
      quadrant,
    };
    
    result.push(unit);
  }
  
  return result;
}

/** ファイルからデータを読み込み統合 */
export async function loadAndMergeCSVFiles(
  engagementFile: File,
  stressFile: File
): Promise<OrganizationUnit[]> {
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const [engagementContent, stressContent] = await Promise.all([
    readFile(engagementFile),
    readFile(stressFile),
  ]);

  const engagementData = parseEngagementCSV(engagementContent);
  const stressData = parseStressCheckCSV(stressContent);
  
  return mergeData(engagementData, stressData);
}



