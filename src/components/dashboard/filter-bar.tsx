// =====================================================
// Dashboard Filter Bar
// =====================================================

'use client';

import { FilterConfig } from '@/types';
import { 
  Filter, 
  Building2, 
  Briefcase, 
  BadgeCheck, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
  availableCategories: string[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '部署': <Building2 className="w-3.5 h-3.5" />,
  '役職': <Briefcase className="w-3.5 h-3.5" />,
  '雇用形態': <BadgeCheck className="w-3.5 h-3.5" />,
  '拠点': <MapPin className="w-3.5 h-3.5" />,
  '年代': <Calendar className="w-3.5 h-3.5" />,
};

const CATEGORY_OPTIONS = ['部署', '役職', '雇用形態', '拠点', '年代'];

export function FilterBar({ filters, onFilterChange, availableCategories }: FilterBarProps) {
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleRiskOnly = () => {
    onFilterChange({ ...filters, showOnlyRisk: !filters.showOnlyRisk });
  };

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Filter className="w-4 h-4" />
        <span>表示切替</span>
      </div>

      <div className="flex items-center gap-2">
        {CATEGORY_OPTIONS.map((category) => {
          const isAvailable = availableCategories.includes(category);
          const isActive = filters.categories.includes(category);
          
          return (
            <button
              key={category}
              onClick={() => isAvailable && toggleCategory(category)}
              disabled={!isAvailable}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${!isAvailable 
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                  : isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {CATEGORY_ICONS[category]}
              {category}
            </button>
          );
        })}
      </div>

      <div className="w-px h-6 bg-gray-200" />

      <button
        onClick={toggleRiskOnly}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
          ${filters.showOnlyRisk
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        要注意のみ
      </button>
    </div>
  );
}
