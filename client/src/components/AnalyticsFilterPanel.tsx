import React, { useState, useCallback } from 'react';
import { Filter, X, Calendar, User, BarChart3 } from 'lucide-react';

export interface FilterOptions {
  startDate: Date | null;
  endDate: Date | null;
  technicianId: number | null;
  technicianName: string | null;
  minRating: number;
  maxRating: number;
  minReviews: number;
  sortBy: 'rating' | 'jobs' | 'reviews' | 'name';
}

interface AnalyticsFilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  technicians?: Array<{ id: number; name: string }>;
  showAdvanced?: boolean;
}

export const AnalyticsFilterPanel: React.FC<AnalyticsFilterPanelProps> = ({
  onFilterChange,
  technicians = [],
  showAdvanced = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    technicianId: null,
    technicianName: null,
    minRating: 1,
    maxRating: 5,
    minReviews: 0,
    sortBy: 'rating',
  });

  const handleDateChange = useCallback(
    (field: 'startDate' | 'endDate', value: string) => {
      const newFilters = {
        ...filters,
        [field]: value ? new Date(value) : null,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleTechnicianChange = useCallback(
    (value: string) => {
      const selectedTech = technicians.find(t => t.id.toString() === value);
      const newFilters = {
        ...filters,
        technicianId: value ? parseInt(value) : null,
        technicianName: selectedTech?.name || null,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, technicians, onFilterChange]
  );

  const handleRatingChange = useCallback(
    (field: 'minRating' | 'maxRating', value: number) => {
      const newFilters = { ...filters, [field]: value };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleReviewsChange = useCallback(
    (value: number) => {
      const newFilters = { ...filters, minReviews: value };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters, sortBy: value as any };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const resetFilters = useCallback(() => {
    const defaultFilters: FilterOptions = {
      startDate: null,
      endDate: null,
      technicianId: null,
      technicianName: null,
      minRating: 1,
      maxRating: 5,
      minReviews: 0,
      sortBy: 'rating',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  }, [onFilterChange]);

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.technicianId ||
    filters.minRating > 1 ||
    filters.maxRating < 5 ||
    filters.minReviews > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-yellow-200">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="text-yellow-400" size={24} />
          <h3 className="text-lg font-bold text-black">الفلاتر المتقدمة</h3>
          {hasActiveFilters && (
            <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
              فلاتر نشطة
            </span>
          )}
        </div>
        <button
          className="text-gray-600 hover:text-black transition"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                <Calendar size={16} className="inline mr-2" />
                من التاريخ
              </label>
              <input
                type="date"
                value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                <Calendar size={16} className="inline mr-2" />
                إلى التاريخ
              </label>
              <input
                type="date"
                value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Technician Selection */}
          {technicians.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                <User size={16} className="inline mr-2" />
                اختر الفني
              </label>
              <select
                value={filters.technicianId || ''}
                onChange={(e) => handleTechnicianChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
              >
                <option value="">جميع الفنيين</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rating Range */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  الحد الأدنى للتقييم: {filters.minRating.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) => handleRatingChange('minRating', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  الحد الأقصى للتقييم: {filters.maxRating.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={filters.maxRating}
                  onChange={(e) => handleRatingChange('maxRating', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Minimum Reviews */}
          {showAdvanced && (
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                الحد الأدنى للتقييمات: {filters.minReviews}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.minReviews}
                onChange={(e) => handleReviewsChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <BarChart3 size={16} className="inline mr-2" />
              ترتيب حسب
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
            >
              <option value="rating">التقييم (الأعلى أولاً)</option>
              <option value="jobs">الوظائف المكتملة</option>
              <option value="reviews">عدد التقييمات</option>
              <option value="name">الاسم (أبجدي)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={resetFilters}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              <X size={18} />
              إعادة تعيين
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-1 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-semibold"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && !isExpanded && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 flex flex-wrap gap-2">
          {filters.startDate && (
            <span className="px-3 py-1 bg-yellow-200 text-black text-xs rounded-full">
              من: {filters.startDate.toLocaleDateString('ar-SA')}
            </span>
          )}
          {filters.endDate && (
            <span className="px-3 py-1 bg-yellow-200 text-black text-xs rounded-full">
              إلى: {filters.endDate.toLocaleDateString('ar-SA')}
            </span>
          )}
          {filters.technicianId && (
            <span className="px-3 py-1 bg-yellow-200 text-black text-xs rounded-full">
              الفني: {filters.technicianName}
            </span>
          )}
          {(filters.minRating > 1 || filters.maxRating < 5) && (
            <span className="px-3 py-1 bg-yellow-200 text-black text-xs rounded-full">
              التقييم: {filters.minRating.toFixed(1)} - {filters.maxRating.toFixed(1)}
            </span>
          )}
          {filters.minReviews > 0 && (
            <span className="px-3 py-1 bg-yellow-200 text-black text-xs rounded-full">
              التقييمات: +{filters.minReviews}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
