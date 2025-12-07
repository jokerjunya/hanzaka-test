// =====================================================
// Organization Vitality Grid - Main Page
// =====================================================

'use client';

import { useMemo } from 'react';
import { 
  Activity, 
  BarChart3, 
  Sparkles, 
  Play, 
  Shield,
  TrendingUp,
  Upload,
  MousePointerClick,
  FileSearch,
  Lightbulb,
  Target,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  Lock,
  RefreshCw,
  PieChart,
  LineChart,
  Layers,
  GitBranch,
  ClipboardCheck,
  HeartPulse,
  Brain,
  Gauge,
  ChevronRight,
  LayoutDashboard,
  SlidersHorizontal,
  FileBarChart
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { CSVDropzone } from '@/components/upload/csv-dropzone';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { VitalityGrid } from '@/components/charts/vitality-grid';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { UnitDetailPanel } from '@/components/dashboard/unit-detail-panel';
import { CategoryComparison } from '@/components/charts/category-comparison';
import { DEMO_DATA } from '@/lib/demo-data';

export default function Home() {
  const {
    units,
    summary,
    isLoading,
    error,
    filters,
    selectedUnit,
    overallAverage,
    loadData,
    loadDemoData,
    setFilters,
    selectUnit,
    clearData,
  } = useAppState();

  const handleLoadDemo = () => {
    loadDemoData(DEMO_DATA);
  };

  // フィルタリングされたユニット
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      if (!filters.categories.includes(unit.category)) return false;
      if (unit.headcount < filters.minHeadcount) return false;
      if (filters.showOnlyRisk && (unit.riskLevel === 'healthy' || unit.riskLevel === 'caution')) {
        return false;
      }
      return true;
    });
  }, [units, filters]);

  // 利用可能なカテゴリ
  const availableCategories = useMemo(() => {
    return [...new Set(units.map(u => u.category))];
  }, [units]);

  // データがない場合はランディングページ
  if (units.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* ヘッダー */}
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Organization Vitality Grid</h1>
                  <p className="text-xs text-gray-500">組織バイタリティ・グリッド</p>
                </div>
              </div>
              <button
                onClick={handleLoadDemo}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Play className="w-4 h-4" />
                デモを見る
              </button>
            </div>
          </div>
        </header>

        {/* ヒーローセクション */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/30 to-transparent" />
          
          <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 mb-6">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">人事データ分析ソリューション</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                組織の健康状態を
                <br />
                <span className="text-blue-600">データで可視化</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl">
                エンゲージメントサーベイとストレスチェックの結果を統合分析。
                バーンアウト予備軍の早期発見から、効果的な改善施策の立案まで、
                人事担当者の意思決定を支援します。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <Upload className="w-5 h-5" />
                  データをアップロード
                </button>
                <button
                  onClick={handleLoadDemo}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  デモで体験する
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 課題提起セクション */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                こんな課題はありませんか？
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <ProblemCard
                icon={<FileSearch className="w-6 h-6" />}
                title="分析に時間がかかる"
                description="2つの調査結果をExcelで突合・集計するのに毎回数日かかっている"
              />
              <ProblemCard
                icon={<AlertTriangle className="w-6 h-6" />}
                title="予兆を見逃してしまう"
                description="「やる気はあるが限界」な社員の存在に気づけず、突然の休職・離職が発生"
              />
              <ProblemCard
                icon={<Target className="w-6 h-6" />}
                title="施策の優先順位が不明"
                description="課題は分かっても、どの部署に何をすべきかの判断に悩む"
              />
            </div>
          </div>
        </section>

        {/* ソリューション概要 */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 border border-green-200 mb-4">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">解決策</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Organization Vitality Grid が提供する価値
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                2つのCSVをアップロードするだけで、組織の状態を4象限で可視化。
                課題の特定から改善施策の提案まで、データに基づいた意思決定を実現します。
              </p>
            </div>
          </div>
        </section>

        {/* 3つの機能詳細 */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                3つのキラー機能
              </h2>
            </div>

            {/* 機能1: クロス分析 */}
            <div className="mb-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    クロス分析マトリクス
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    組織状態を4象限で<br />一目で把握
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    エンゲージメント（横軸）とストレス反応（縦軸）の2軸で、
                    各部署・チームを4つの象限にプロット。
                    「バーンアウト予備軍」をひと目で特定できます。
                  </p>
                  <ul className="space-y-3">
                    <FeaturePoint icon={<Layers />} text="部署・役職・年代など多角的な切り口で分析" />
                    <FeaturePoint icon={<MousePointerClick />} text="クリックで詳細にドリルダウン" />
                    <FeaturePoint icon={<Gauge />} text="人数に応じたバブルサイズで重要度を可視化" />
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <LayoutDashboard className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">4象限マトリクスイメージ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 機能2: 要因特定 */}
            <div className="mb-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">要因分析イメージ</p>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium mb-4">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    要因特定ドライバー
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    「なぜ？」を<br />データから自動解明
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    ストレスが高い部署の原因は「業務量」なのか「上司のサポート不足」なのか。
                    相関分析に基づき、課題の主要因をTop3でランキング表示します。
                  </p>
                  <ul className="space-y-3">
                    <FeaturePoint icon={<BarChart3 />} text="全社平均との比較で課題を明確化" />
                    <FeaturePoint icon={<Lightbulb />} text="AIによるインサイト・コメント生成" />
                    <FeaturePoint icon={<ClipboardCheck />} text="具体的な改善アクションを提案" />
                  </ul>
                </div>
              </div>
            </div>

            {/* 機能3: シミュレーション */}
            <div>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium mb-4">
                    <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                    処方箋シミュレーション
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    改善効果を<br />事前に予測
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「上司のサポートを強化したら、どれだけ改善するか？」
                    What-if分析で、施策の効果を定量的にシミュレーション。
                    投資対効果の高い施策を見極められます。
                  </p>
                  <ul className="space-y-3">
                    <FeaturePoint icon={<SlidersHorizontal />} text="スライダーで目標値を調整" />
                    <FeaturePoint icon={<TrendingUp />} text="エンゲージメント・ストレスの変化を予測" />
                    <FeaturePoint icon={<GitBranch />} text="複数シナリオの比較検討が可能" />
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">シミュレーションイメージ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                かんたん3ステップ
              </h2>
              <p className="text-gray-600">
                複雑な設定は不要。CSVをアップロードするだけですぐに分析開始
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number={1}
                icon={<Upload className="w-6 h-6" />}
                title="CSVをアップロード"
                description="エンゲージメントサーベイとストレスチェックの2つのCSVファイルをドラッグ＆ドロップ"
              />
              <StepCard
                number={2}
                icon={<Zap className="w-6 h-6" />}
                title="自動で統合・分析"
                description="部署名をキーに自動でデータを突合。4象限マトリクスを即座に生成"
              />
              <StepCard
                number={3}
                icon={<FileBarChart className="w-6 h-6" />}
                title="インサイトを確認"
                description="要注意部署の特定、課題の主要因、改善施策の提案をダッシュボードで確認"
              />
            </div>
          </div>
        </section>

        {/* アップロードセクション */}
        <section id="upload-section" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                今すぐ始める
              </h2>
              <p className="text-gray-600">
                お手元のデータで分析を開始できます
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <CSVDropzone onFilesUploaded={loadData} isLoading={isLoading} />
              
              {error && (
                <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm text-center">
                  {error}
                </div>
              )}
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-center text-gray-500 text-sm mb-4">
                  または、サンプルデータで機能をお試しください
                </p>
                <button
                  onClick={handleLoadDemo}
                  className="w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Play className="w-4 h-4" />
                  デモデータで体験
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* セキュリティ・信頼性 */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <TrustCard
                icon={<Lock className="w-5 h-5" />}
                title="データはブラウザ内で処理"
                description="アップロードしたCSVデータは外部サーバーに送信されません。すべての処理はお使いのブラウザ内で完結します。"
              />
              <TrustCard
                icon={<RefreshCw className="w-5 h-5" />}
                title="リアルタイム分析"
                description="データをアップロードした瞬間に分析完了。待ち時間なく、すぐに結果を確認できます。"
              />
              <TrustCard
                icon={<PieChart className="w-5 h-5" />}
                title="エビデンスベース"
                description="ストレス科学・組織心理学の知見に基づいた分析ロジック。信頼性の高いインサイトを提供します。"
              />
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="py-8 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <HeartPulse className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Organization Vitality Grid</span>
            </div>
            <p className="text-sm text-gray-500">
              組織の健康状態を可視化し、より良い職場づくりを支援します
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // ダッシュボード
  return (
    <div className="min-h-screen bg-pattern">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={clearData}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              title="トップページに戻る"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h1 className="font-semibold text-gray-900 text-sm">Organization Vitality Grid</h1>
                <p className="text-xs text-gray-500">組織バイタリティ・グリッド</p>
              </div>
            </button>
            
            <button
              onClick={clearData}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              新しいデータを読み込む
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {summary && (
          <section className="mb-6">
            <SummaryCards summary={summary} onUnitClick={selectUnit} />
          </section>
        )}

        <section className="mb-5">
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            availableCategories={availableCategories}
          />
        </section>

        <section className="card p-6 overflow-hidden relative isolate">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">バイタリティマトリクス</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                表示中: {filteredUnits.length}件 ｜ クリックで詳細分析
              </p>
            </div>
          </div>
          
          <div className="h-[450px] w-full overflow-hidden relative">
            <VitalityGrid
              units={filteredUnits}
              onUnitClick={selectUnit}
              selectedUnitId={selectedUnit?.id}
            />
          </div>
        </section>

        {/* カテゴリ別比較セクション */}
        <section className="card p-6 mt-8 overflow-hidden relative isolate">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">セグメント別比較分析</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              役職・雇用形態・拠点・年代ごとの傾向を比較
            </p>
          </div>
          
          <div className="overflow-hidden">
            <CategoryComparison 
              units={units} 
              overallAverage={overallAverage}
              onUnitClick={selectUnit}
            />
          </div>
        </section>
      </main>

      {selectedUnit && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/20 z-40 backdrop-blur-sm"
            onClick={() => selectUnit(null)}
          />
          <UnitDetailPanel
            unit={selectedUnit}
            benchmark={overallAverage}
            onClose={() => selectUnit(null)}
          />
        </>
      )}
    </div>
  );
}

// 課題カード
function ProblemCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

// 機能ポイント
function FeaturePoint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-5 h-5 rounded text-blue-600 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <span className="text-gray-700 text-sm">{text}</span>
    </li>
  );
}

// ステップカード
function StepCard({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            {number}
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      {number < 3 && (
        <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
          <ChevronRight className="w-6 h-6 text-gray-300" />
        </div>
      )}
    </div>
  );
}

// 信頼性カード
function TrustCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
