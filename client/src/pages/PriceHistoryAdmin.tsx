import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Filter, TrendingUp, Car, Wrench, DollarSign, Calendar, BarChart3, Download } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PriceHistoryAdmin() {
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedPart, setSelectedPart] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Queries
  const { data: brands } = trpc.pricing.getBrands.useQuery();
  const { data: parts } = trpc.pricing.getParts.useQuery();
  const { data: calculations, isLoading } = trpc.pricing.getPriceCalculations.useQuery({ limit: 1000, offset: 0 });
  const { data: stats } = trpc.pricing.getPriceStats.useQuery();

  // Filter calculations
  const filteredCalculations = useMemo(() => {
    if (!calculations) return [];

    return calculations.filter((calc) => {
      // Brand filter
      if (selectedBrand !== "all" && calc.brandId.toString() !== selectedBrand) {
        return false;
      }

      // Part filter
      if (selectedPart !== "all" && calc.partId.toString() !== selectedPart) {
        return false;
      }

      // Date filter
      if (dateFrom && new Date(calc.createdAt) < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && new Date(calc.createdAt) > new Date(dateTo)) {
        return false;
      }

      return true;
    });
  }, [calculations, selectedBrand, selectedPart, dateFrom, dateTo]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    if (filteredCalculations.length === 0) {
      return {
        totalCalculations: 0,
        averagePrice: 0,
        totalRevenue: 0,
        topPart: null,
        topBrand: null,
      };
    }

    const totalCalculations = filteredCalculations.length;
    const totalRevenue = filteredCalculations.reduce((sum, calc) => sum + parseFloat(calc.totalCost.toString()), 0);
    const averagePrice = totalRevenue / totalCalculations;

    // Count parts
    const partCounts: Record<string, number> = {};
    filteredCalculations.forEach((calc) => {
      partCounts[calc.partName] = (partCounts[calc.partName] || 0) + 1;
    });
    const topPart = Object.entries(partCounts).sort((a, b) => b[1] - a[1])[0];

    // Count brands
    const brandCounts: Record<string, number> = {};
    filteredCalculations.forEach((calc) => {
      brandCounts[calc.brandName] = (brandCounts[calc.brandName] || 0) + 1;
    });
    const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalCalculations,
      averagePrice,
      totalRevenue,
      topPart,
      topBrand,
    };
  }, [filteredCalculations]);

  // Export to CSV
  const handleExport = () => {
    if (filteredCalculations.length === 0) return;

    const headers = [
      "التاريخ",
      "الماركة",
      "الموديل",
      "القطعة",
      "المسافة (كم)",
      "ساعات العمل",
      "تكلفة العمل (ريال)",
      "تكلفة المسافة (ريال)",
      "الإجمالي (ريال)",
    ];

    const rows = filteredCalculations.map((calc) => [
      new Date(calc.createdAt).toLocaleDateString("ar-SA"),
      calc.brandName,
      calc.modelName,
      calc.partName,
      calc.distance.toString(),
      calc.laborHours,
      calc.laborCost.toString(),
      calc.distanceCost.toString(),
      calc.totalCost,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `price-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedBrand("all");
    setSelectedPart("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-black flex items-center gap-3 mb-2">
                  <History className="w-8 h-8 text-yellow-400" />
                  سجل حسابات الأسعار
                </h1>
                <p className="text-gray-600">
                  عرض وتحليل جميع حسابات الأسعار التي تم إجراؤها
                </p>
              </div>
              <Link href="/admin">
                <Button variant="outline">
                  عودة إلى لوحة التحكم
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">إجمالي الحسابات</p>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-black">{filteredStats.totalCalculations}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.totalCalculations ? `من أصل ${stats.totalCalculations}` : ""}
              </p>
            </Card>

            <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">متوسط السعر</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-black">{filteredStats.averagePrice.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">ريال</p>
            </Card>

            <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">أكثر قطعة طلباً</p>
                <Wrench className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-xl font-bold text-black">
                {filteredStats.topPart ? filteredStats.topPart[0] : "-"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {filteredStats.topPart ? `${filteredStats.topPart[1]} مرة` : "لا توجد بيانات"}
              </p>
            </Card>

            <Card className="p-6 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">أكثر ماركة طلباً</p>
                <Car className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-xl font-bold text-black">
                {filteredStats.topBrand ? filteredStats.topBrand[0] : "-"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {filteredStats.topBrand ? `${filteredStats.topBrand[1]} مرة` : "لا توجد بيانات"}
              </p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8 border-2 border-gray-200">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-yellow-400" />
              تصفية النتائج
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Brand Filter */}
              <div>
                <Label className="text-black mb-2 block">الماركة</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الماركات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الماركات</SelectItem>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Part Filter */}
              <div>
                <Label className="text-black mb-2 block">القطعة</Label>
                <Select value={selectedPart} onValueChange={setSelectedPart}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع القطع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع القطع</SelectItem>
                    {parts?.map((part) => (
                      <SelectItem key={part.id} value={part.id.toString()}>
                        {part.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div>
                <Label className="text-black mb-2 block">من تاريخ</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <Label className="text-black mb-2 block">إلى تاريخ</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleResetFilters} variant="outline">
                إعادة تعيين
              </Button>
              <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                تصدير CSV
              </Button>
            </div>
          </Card>

          {/* Data Table */}
          <Card className="p-6 border-2 border-gray-200">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              سجل الحسابات ({filteredCalculations.length})
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">جاري التحميل...</p>
              </div>
            ) : filteredCalculations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">لا توجد حسابات مطابقة للفلاتر المحددة</p>
                <Button onClick={handleResetFilters} variant="outline">
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الماركة</TableHead>
                      <TableHead className="text-right">الموديل</TableHead>
                      <TableHead className="text-right">القطعة</TableHead>
                      <TableHead className="text-right">المسافة</TableHead>
                      <TableHead className="text-right">ساعات العمل</TableHead>
                      <TableHead className="text-right">تكلفة العمل</TableHead>
                      <TableHead className="text-right">تكلفة المسافة</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalculations.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell className="text-right">
                          {new Date(calc.createdAt).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">{calc.brandName}</TableCell>
                        <TableCell className="text-right">{calc.modelName}</TableCell>
                        <TableCell className="text-right">{calc.partName}</TableCell>
                        <TableCell className="text-right">{calc.distance} كم</TableCell>
                        <TableCell className="text-right">{calc.laborHours} ساعة</TableCell>
                        <TableCell className="text-right">{parseFloat(calc.laborCost.toString()).toFixed(2)} ريال</TableCell>
                        <TableCell className="text-right">{parseFloat(calc.distanceCost.toString()).toFixed(2)} ريال</TableCell>
                        <TableCell className="text-right font-bold text-yellow-600">
                          {parseFloat(calc.totalCost.toString()).toFixed(2)} ريال
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          {/* Additional Insights */}
          {filteredCalculations.length > 0 && (
            <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                رؤى إضافية
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات المتوقعة</p>
                  <p className="text-2xl font-bold text-black">{filteredStats.totalRevenue.toFixed(2)} ريال</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">متوسط المسافة</p>
                  <p className="text-2xl font-bold text-black">
                    {(
                      filteredCalculations.reduce((sum, calc) => sum + calc.distance, 0) /
                      filteredCalculations.length
                    ).toFixed(1)}{" "}
                    كم
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">متوسط ساعات العمل</p>
                  <p className="text-2xl font-bold text-black">
                    {(
                      filteredCalculations.reduce((sum, calc) => sum + parseFloat(calc.laborHours), 0) /
                      filteredCalculations.length
                    ).toFixed(2)}{" "}
                    ساعة
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
