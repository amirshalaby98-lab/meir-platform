import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { AnalyticsFilterPanel, FilterOptions } from './AnalyticsFilterPanel';
import { SavedFiltersManager } from './SavedFiltersManager';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { DetailedRatingsChart } from './DetailedRatingsChart';
import { RatingDistributionChart } from './RatingDistributionChart';

interface TechnicianStats {
  id: number;
  name: string;
  averageRating: number;
  totalReviews: number;
  completedJobs: number;
  successRate: number;
  responseTime: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  qualityRating: number;
  priceRating: number;
  serviceRating: number;
}

interface AnalyticsReport {
  totalTechnicians: number;
  totalReviews: number;
  averageRating: number;
  technicians: TechnicianStats[];
}

interface FilteredAnalyticsDashboardProps {
  technicianId?: number;
  showComparison?: boolean;
}

export const FilteredAnalyticsDashboard: React.FC<FilteredAnalyticsDashboardProps> = ({
  technicianId,
  showComparison = true,
}) => {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [filteredTechnicians, setFilteredTechnicians] = useState<TechnicianStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    technicianId: technicianId || null,
    technicianName: null,
    minRating: 1,
    maxRating: 5,
    minReviews: 0,
    sortBy: 'rating',
  });
  const [technicians, setTechnicians] = useState<Array<{ id: number; name: string }>>([]);

  // Fetch technicians list
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await fetch('/api/technicians');
        if (response.ok) {
          const data = await response.json();
          setTechnicians(data);
        }
      } catch (err) {
        console.error('Failed to fetch technicians:', err);
      }
    };

    fetchTechnicians();
  }, []);

  // Fetch filtered analytics
  const fetchFilteredAnalytics = useCallback(async (currentFilters: FilterOptions) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (currentFilters.startDate) {
        params.append('startDate', currentFilters.startDate.toISOString());
      }
      if (currentFilters.endDate) {
        params.append('endDate', currentFilters.endDate.toISOString());
      }
      if (currentFilters.technicianId) {
        params.append('technicianId', currentFilters.technicianId.toString());
      }
      if (currentFilters.minRating) {
        params.append('minRating', currentFilters.minRating.toString());
      }
      if (currentFilters.maxRating) {
        params.append('maxRating', currentFilters.maxRating.toString());
      }
      if (currentFilters.minReviews) {
        params.append('minReviews', currentFilters.minReviews.toString());
      }
      if (currentFilters.sortBy) {
        params.append('sortBy', currentFilters.sortBy);
      }

      const response = await fetch(`/api/analytics/filtered?${params}`);
      if (!response.ok) throw new Error('فشل تحميل البيانات');

      const data = await response.json();
      setReport(data);

      // Apply additional filtering
      let filtered = data.technicians || [];

      // Filter by rating range
      filtered = filtered.filter(
        (t: TechnicianStats) => t.averageRating >= currentFilters.minRating && t.averageRating <= currentFilters.maxRating
      );

      // Filter by minimum reviews
      filtered = filtered.filter((t: TechnicianStats) => t.totalReviews >= currentFilters.minReviews);

      // Sort
      if (currentFilters.sortBy === 'jobs') {
        filtered.sort((a: TechnicianStats, b: TechnicianStats) => b.completedJobs - a.completedJobs);
      } else if (currentFilters.sortBy === 'reviews') {
        filtered.sort((a: TechnicianStats, b: TechnicianStats) => b.totalReviews - a.totalReviews);
      } else if (currentFilters.sortBy === 'name') {
        filtered.sort((a: TechnicianStats, b: TechnicianStats) => a.name.localeCompare(b.name, 'ar'));
      } else {
        filtered.sort((a: TechnicianStats, b: TechnicianStats) => b.averageRating - a.averageRating);
      }

      setFilteredTechnicians(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
      setFilteredTechnicians([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFilteredAnalytics(filters);
  }, []);

  const handleFilterChange = useCallback(
    (newFilters: FilterOptions) => {
      setFilters(newFilters);
      fetchFilteredAnalytics(newFilters);
    },
    [fetchFilteredAnalytics]
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
        </div>
        <p className="text-gray-600 mt-4">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-red-900 mb-1">خطأ</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saved Filters Manager */}
      <SavedFiltersManager
        currentFilters={filters}
        onLoadFilter={(savedFilter) => {
          handleFilterChange({
            startDate: savedFilter.startDate ? new Date(savedFilter.startDate) : null,
            endDate: savedFilter.endDate ? new Date(savedFilter.endDate) : null,
            technicianId: savedFilter.technicianId || null,
            technicianName: null,
            minRating: Number(savedFilter.minRating) || 0,
            maxRating: Number(savedFilter.maxRating) || 5,
            minReviews: savedFilter.minReviews || 0,
            sortBy: savedFilter.sortBy || 'rating',
          });
        }}
        onFilterSaved={() => {
          // Optional: Show success message
        }}
      />

      {/* Filter Panel */}
      <AnalyticsFilterPanel
        onFilterChange={handleFilterChange}
        technicians={technicians}
        showAdvanced={true}
      />

      {/* Summary Statistics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-400">
            <p className="text-gray-600 text-sm mb-1">إجمالي الفنيين</p>
            <p className="text-3xl font-bold text-black">{report.totalTechnicians}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-400">
            <p className="text-gray-600 text-sm mb-1">إجمالي التقييمات</p>
            <p className="text-3xl font-bold text-black">{report.totalReviews}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-400">
            <p className="text-gray-600 text-sm mb-1">متوسط التقييم</p>
            <p className="text-3xl font-bold text-black">{report.averageRating.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Filtered Results */}
      {filteredTechnicians.length > 0 ? (
        <div className="space-y-6">
          {/* Results Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black">
                  <tr>
                    <th className="px-6 py-3 text-right font-bold">الفني</th>
                    <th className="px-6 py-3 text-right font-bold">التقييم</th>
                    <th className="px-6 py-3 text-right font-bold">التقييمات</th>
                    <th className="px-6 py-3 text-right font-bold">الوظائف</th>
                    <th className="px-6 py-3 text-right font-bold">معدل النجاح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTechnicians.map((tech, index) => (
                    <tr
                      key={tech.id}
                      className={`hover:bg-yellow-50 transition ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-black">{tech.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-black">
                            {tech.averageRating.toFixed(1)}
                          </span>
                          <span className="text-yellow-400">⭐</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-black">{tech.totalReviews}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-black">{tech.completedJobs}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${tech.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-black">
                            {tech.successRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Charts for First Technician */}
          {filteredTechnicians.length > 0 && showComparison && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-black">تفاصيل أفضل فني</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DetailedRatingsChart
                  qualityRating={filteredTechnicians[0].qualityRating}
                  priceRating={filteredTechnicians[0].priceRating}
                  serviceRating={filteredTechnicians[0].serviceRating}
                  overallRating={filteredTechnicians[0].averageRating}
                />
                <RatingDistributionChart
                  fiveStarCount={filteredTechnicians[0].fiveStarCount}
                  fourStarCount={filteredTechnicians[0].fourStarCount}
                  threeStarCount={filteredTechnicians[0].threeStarCount}
                  twoStarCount={filteredTechnicians[0].twoStarCount}
                  oneStarCount={filteredTechnicians[0].oneStarCount}
                  totalReviews={filteredTechnicians[0].totalReviews}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">لا توجد نتائج تطابق الفلاتر المحددة</p>
          <p className="text-gray-500 text-sm mt-2">حاول تعديل الفلاتر وحاول مجدداً</p>
        </div>
      )}
    </div>
  );
};
