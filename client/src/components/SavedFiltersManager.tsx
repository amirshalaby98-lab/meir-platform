import React, { useState, useEffect, useCallback } from 'react';
import { Save, Trash2, Star, Copy, AlertCircle, Loader } from 'lucide-react';
import { FilterOptions } from './AnalyticsFilterPanel';
import { SkeletonLoading } from './SkeletonLoading';
import { StaggeredAnimation, TransitionEffects } from './TransitionEffects';

interface SavedFilter {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  technicianId?: number;
  minRating: string;
  maxRating: string;
  minReviews: number;
  sortBy: 'rating' | 'jobs' | 'reviews' | 'name';
  isDefault: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

interface SavedFiltersManagerProps {
  currentFilters: FilterOptions;
  onLoadFilter: (filter: FilterOptions) => void;
  onFilterSaved?: () => void;
}

export const SavedFiltersManager: React.FC<SavedFiltersManagerProps> = ({
  currentFilters,
  onLoadFilter,
  onFilterSaved,
}) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch saved filters
  const fetchSavedFilters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/saved-filters');
      if (!response.ok) throw new Error('فشل تحميل الفلاتر المحفوظة');

      const data = await response.json();
      setSavedFilters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedFilters();
  }, [fetchSavedFilters]);

  const handleSaveFilter = useCallback(async () => {
    if (!filterName.trim()) {
      setError('الرجاء إدخال اسم للفلتر');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: filterName,
          description: filterDescription,
          startDate: currentFilters.startDate?.toISOString(),
          endDate: currentFilters.endDate?.toISOString(),
          technicianId: currentFilters.technicianId,
          minRating: currentFilters.minRating,
          maxRating: currentFilters.maxRating,
          minReviews: currentFilters.minReviews,
          sortBy: currentFilters.sortBy,
        }),
      });

      if (!response.ok) throw new Error('فشل حفظ الفلتر');

      await fetchSavedFilters();
      setShowSaveDialog(false);
      setFilterName('');
      setFilterDescription('');
      onFilterSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setSaving(false);
    }
  }, [currentFilters, filterName, filterDescription, fetchSavedFilters, onFilterSaved]);

  const handleLoadFilter = useCallback(
    async (filter: SavedFilter) => {
      try {
        // Update usage count
        await fetch(`/api/saved-filters/${filter.id}/use`, { method: 'POST' });

        // Convert filter data back to FilterOptions
        const loadedFilter: FilterOptions = {
          startDate: filter.startDate ? new Date(filter.startDate) : null,
          endDate: filter.endDate ? new Date(filter.endDate) : null,
          technicianId: filter.technicianId || null,
          technicianName: null,
          minRating: parseFloat(filter.minRating),
          maxRating: parseFloat(filter.maxRating),
          minReviews: filter.minReviews,
          sortBy: filter.sortBy,
        };

        onLoadFilter(loadedFilter);
        await fetchSavedFilters();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل الفلتر');
      }
    },
    [onLoadFilter, fetchSavedFilters]
  );

  const handleDeleteFilter = useCallback(
    async (filterId: number) => {
      if (!confirm('هل أنت متأكد من حذف هذا الفلتر؟')) return;

      try {
        const response = await fetch(`/api/saved-filters/${filterId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('فشل حذف الفلتر');

        await fetchSavedFilters();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل حذف الفلتر');
      }
    },
    [fetchSavedFilters]
  );

  const handleSetDefault = useCallback(
    async (filterId: number) => {
      try {
        const response = await fetch(`/api/saved-filters/${filterId}/default`, { method: 'POST' });
        if (!response.ok) throw new Error('فشل تعيين الفلتر الافتراضي');

        await fetchSavedFilters();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تعيين الفلتر الافتراضي');
      }
    },
    [fetchSavedFilters]
  );

  return (
    <TransitionEffects type="fade" duration={400}>
      <div className="bg-white rounded-lg shadow-lg border border-yellow-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-black flex items-center gap-2">
          <Save size={20} className="text-yellow-400" />
          الفلاتر المحفوظة
        </h3>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-semibold flex items-center gap-2 hover-lift"
          >
          <Save size={18} />
          حفظ الفلتر الحالي
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">اسم الفلتر</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="مثال: فلاتر التقييمات العالية"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-1">الوصف (اختياري)</label>
            <textarea
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              placeholder="وصف الفلتر..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 resize-none h-20"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveFilter}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-semibold disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Filters List */}
      {loading ? (
        <div className="space-y-2">
          <SkeletonLoading count={3} variant="filter-item" />
        </div>
      ) : savedFilters.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>لا توجد فلاتر محفوظة حتى الآن</p>
          <p className="text-sm mt-2">احفظ الفلاتر المفضلة لديك للوصول السريع إليها</p>
        </div>
      ) : (
        <div className="space-y-2">
          <StaggeredAnimation type="slide" staggerDelay={50}>
            {savedFilters.map((filter) => (
            <div
              key={filter.id}
              className={`p-3 rounded-lg border transition ${
                filter.isDefault
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200 hover:border-yellow-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">{filter.name}</h4>
                    {filter.isDefault && (
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    )}
                  </div>
                  {filter.description && (
                    <p className="text-sm text-gray-600 mt-1">{filter.description}</p>
                  )}
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    {filter.startDate && <span>من: {new Date(filter.startDate).toLocaleDateString('ar-SA')}</span>}
                    {filter.endDate && <span>إلى: {new Date(filter.endDate).toLocaleDateString('ar-SA')}</span>}
                    <span>استخدم {filter.usageCount} مرة</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleLoadFilter(filter)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition hover-scale"
                    title="تحميل هذا الفلتر"
                  >
                    <Copy size={18} />
                  </button>
                  {!filter.isDefault && (
                    <button
                      onClick={() => handleSetDefault(filter.id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition hover-scale"
                      title="جعل هذا الفلتر افتراضياً"
                    >
                      <Star size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteFilter(filter.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition hover-scale"
                    title="حذف هذا الفلتر"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
            ))}
          </StaggeredAnimation>
        </div>
      )}
      </div>
    </TransitionEffects>
  );
};
