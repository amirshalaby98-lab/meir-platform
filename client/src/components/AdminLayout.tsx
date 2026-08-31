import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  Calendar,
  Package,
  Clock,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowRight,
  DollarSign,
  Tag,
  Bell,
  FileText,
  Activity,
  PieChart,
  Search,
  Home,
  GraduationCap,
  Shield,
  UserPlus,
  ShoppingBag,
  MessageCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    title: "الرئيسية",
    icon: Home,
    defaultOpen: true,
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
      { href: "/admin/site-analytics", icon: BarChart3, label: "إحصائيات الزوار" },
      { href: "/admin/monitoring", icon: Activity, label: "المراقبة المتقدمة" },
      { href: "/admin/bi", icon: PieChart, label: "ذكاء الأعمال" },
    ],
  },
  {
    title: "العمليات",
    icon: Calendar,
    defaultOpen: true,
    items: [
      { href: "/admin/invoices", icon: FileText, label: "الفواتير" },
      { href: "/admin/notifications", icon: Bell, label: "الإشعارات" },
    ],
  },
  {
    title: "الأشخاص",
    icon: Users,
    defaultOpen: false,
    items: [
      { href: "/admin/users", icon: Users, label: "العملاء" },
      { href: "/admin/vendor-approvals", icon: UserPlus, label: "موافقات البائعين" },
    ],
  },
  {
    title: "السيارات والقطع",
    icon: Car,
    defaultOpen: false,
    items: [
      { href: "/admin/brands", icon: Car, label: "الماركات" },
      { href: "/admin/models", icon: Package, label: "الموديلات" },
      { href: "/admin/parts", icon: Wrench, label: "القطع" },
      { href: "/admin/labor-times-advanced", icon: Clock, label: "أوقات العمل" },
      { href: "/admin/part-prices", icon: DollarSign, label: "أسعار القطع" },
    ],
  },
  {
    title: "التسعير والعروض",
    icon: DollarSign,
    defaultOpen: false,
    items: [
      { href: "/admin/pricing-settings", icon: Settings, label: "إعدادات الأسعار" },
      { href: "/admin/promotions", icon: Tag, label: "العروض والخصومات" },
      { href: "/admin/price-history", icon: DollarSign, label: "تاريخ الأسعار" },
      { href: "/admin/reports", icon: BarChart3, label: "التقارير" },
    ],
  },
  {
    title: "تشخيص OBD",
    icon: Activity,
    defaultOpen: true,
    items: [
      { href: "/admin/obd-reports", icon: FileText, label: "تقارير الفحص" },
    ],
  },
  {
    title: "المتجر",
    icon: ShoppingBag,
    defaultOpen: false,
    items: [
      { href: "/admin/products", icon: Package, label: "المنتجات" },
      { href: "/admin/product-orders", icon: Truck, label: "طلبات المنتجات" },
    ],
  },
  {
    title: "الاستشارات",
    icon: MessageCircle,
    defaultOpen: false,
    items: [
      { href: "/admin/consultations", icon: MessageCircle, label: "طلبات الاستشارات" },
    ],
  },
  {
    title: "التدريب",
    icon: GraduationCap,
    defaultOpen: false,
    items: [
      { href: "/instructor/dashboard", icon: GraduationCap, label: "لوحة المدرب" },
    ],
  },
];

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const dynamicNavGroups = navGroups;

  // تهيئة المجموعات المفتوحة
  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    dynamicNavGroups.forEach((group) => {
      // فتح المجموعة إذا كانت تحتوي على الصفحة الحالية أو defaultOpen
      const hasActiveItem = group.items.some((item) => location === item.href);
      initialOpen[group.title] = hasActiveItem || (group.defaultOpen ?? false);
    });
    setOpenGroups(initialOpen);
  }, [location]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // فلترة العناصر حسب البحث
  const filteredGroups = searchQuery
    ? dynamicNavGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            item.label.includes(searchQuery)
          ),
        }))
        .filter((group) => group.items.length > 0)
    : dynamicNavGroups;

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: "الرئيسية", href: "/" }, { label: "لوحة الإدارة", href: "/admin/dashboard" }];
    
    for (const group of dynamicNavGroups) {
      const currentNav = group.items.find((item) => item.href === location);
      if (currentNav && currentNav.href !== "/admin/dashboard") {
        breadcrumbs.push({ label: currentNav.label, href: location });
        break;
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <h1 className="text-lg font-bold text-gray-900">Meir - لوحة الإدارة</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          title="رجوع"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-40 h-screen transition-transform bg-white border-l border-gray-200 shadow-lg",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
          "w-72"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-4 py-5 border-b border-gray-100">
            <Link href="/">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">م</span>
                </div>
                <div className="mr-3">
                  <h2 className="text-lg font-bold text-gray-900">Meir</h2>
                  <p className="text-xs text-gray-500">لوحة الإدارة الشاملة</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث سريع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {filteredGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = searchQuery ? true : openGroups[group.title];
              const hasActiveItem = group.items.some((item) => location === item.href);

              return (
                <div key={group.title} className="mb-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all",
                      hasActiveItem
                        ? "text-yellow-700 bg-yellow-50"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <GroupIcon className={cn("w-4 h-4 ml-2", hasActiveItem ? "text-yellow-600" : "text-gray-400")} />
                    <span className="flex-1 text-right">{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform text-gray-400",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Group Items */}
                  {isOpen && (
                    <div className="mt-1 mr-4 space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href;

                        return (
                          <Link key={item.href} href={item.href}>
                            <a
                              className={cn(
                                "flex items-center px-3 py-2 text-sm rounded-lg transition-all",
                                isActive
                                  ? "bg-yellow-100 text-yellow-800 font-medium border-r-3 border-yellow-500"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <Icon
                                className={cn(
                                  "w-4 h-4 ml-2.5",
                                  isActive ? "text-yellow-600" : "text-gray-400"
                                )}
                              />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && item.badge > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                  {item.badge}
                                </span>
                              )}
                            </a>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-100 px-3 py-3 space-y-1">
            <Link href="/admin/roles">
              <a className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <Shield className="w-4 h-4 ml-2.5 text-gray-400" />
                <span>الصلاحيات والأدوار</span>
              </a>
            </Link>
            <Link href="/unifonic-settings">
              <a className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <Settings className="w-4 h-4 ml-2.5 text-gray-400" />
                <span>الإعدادات</span>
              </a>
            </Link>
            <Link href="/">
              <a className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all">
                <LogOut className="w-4 h-4 ml-2.5" />
                <span>العودة للموقع</span>
              </a>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:mr-72 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-20">
          {/* Back Button + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-yellow-600 hover:bg-yellow-50"
              title="رجوع"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          <nav className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />}
                <Link href={crumb.href}>
                  <a
                    className={cn(
                      "hover:text-yellow-600 transition-colors",
                      index === breadcrumbs.length - 1 && "text-gray-900 font-medium"
                    )}
                  >
                    {crumb.label}
                  </a>
                </Link>
              </div>
            ))}
          </nav>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">م</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">المدير</p>
                <p className="text-xs text-gray-500">مدير النظام</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{title}</h1>
            {description && <p className="text-gray-500 text-sm">{description}</p>}
          </div>

          {/* Content */}
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
