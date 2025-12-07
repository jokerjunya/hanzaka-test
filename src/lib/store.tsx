// =====================================================
// Global State Management (React Context)
// =====================================================

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { OrganizationUnit, DashboardSummary, FilterConfig } from '@/types';
import { loadAndMergeCSVFiles } from './data-parser';
import { generateDashboardSummary } from './analysis';

interface AppState {
  // Data
  units: OrganizationUnit[];
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: FilterConfig;
  selectedUnit: OrganizationUnit | null;
  
  // Computed
  overallAverage: OrganizationUnit | null;
  
  // Actions
  loadData: (engagementFile: File, stressFile: File) => Promise<void>;
  loadDemoData: (demoUnits: OrganizationUnit[]) => void;
  setFilters: (filters: Partial<FilterConfig>) => void;
  selectUnit: (unit: OrganizationUnit | null) => void;
  clearData: () => void;
}

const defaultFilters: FilterConfig = {
  categories: ['部署'],
  minHeadcount: 10,
  showOnlyRisk: false,
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<OrganizationUnit[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<FilterConfig>(defaultFilters);
  const [selectedUnit, setSelectedUnit] = useState<OrganizationUnit | null>(null);
  const [overallAverage, setOverallAverage] = useState<OrganizationUnit | null>(null);

  const loadData = useCallback(async (engagementFile: File, stressFile: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedUnits = await loadAndMergeCSVFiles(engagementFile, stressFile);
      setUnits(loadedUnits);
      
      // 全社平均を抽出
      const overall = loadedUnits.find(u => u.category === '全体' && u.name.includes('全体'));
      setOverallAverage(overall || null);
      
      const dashboardSummary = generateDashboardSummary(loadedUnits);
      setSummary(dashboardSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDemoData = useCallback((demoUnits: OrganizationUnit[]) => {
    setUnits(demoUnits);
    
    // 全社平均を抽出
    const overall = demoUnits.find(u => u.category === '全体' && u.name.includes('全体'));
    setOverallAverage(overall || null);
    
    const dashboardSummary = generateDashboardSummary(demoUnits);
    setSummary(dashboardSummary);
    setError(null);
  }, []);

  const setFilters = useCallback((newFilters: Partial<FilterConfig>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const selectUnit = useCallback((unit: OrganizationUnit | null) => {
    setSelectedUnit(unit);
  }, []);

  const clearData = useCallback(() => {
    setUnits([]);
    setSummary(null);
    setSelectedUnit(null);
    setOverallAverage(null);
    setError(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}

