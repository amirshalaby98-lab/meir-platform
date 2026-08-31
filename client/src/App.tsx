import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import InstallPrompt from "./components/InstallPrompt";

// Critical path - loaded eagerly (Home page)
import Home from "./pages/Home";

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">جاري التحميل...</p>
      </div>
    </div>
  );
}

// Lazy-loaded pages - Public
const NotFound = lazy(() => import("@/pages/NotFound"));
const AddReview = lazy(() => import("@/pages/AddReview"));
const MyPoints = lazy(() => import("@/pages/MyPoints"));
const Courses = lazy(() => import("@/pages/Courses"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const CourseLearn = lazy(() => import("@/pages/CourseLearn"));
const MyLearning = lazy(() => import("@/pages/MyLearning"));
const Certificate = lazy(() => import("@/pages/Certificate"));
const PriceCalculator = lazy(() => import("@/pages/PriceCalculator"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const MyInvoices = lazy(() => import("@/pages/MyInvoices"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Payment = lazy(() => import("@/pages/Payment"));
const VendorRegistration = lazy(() => import("@/pages/VendorRegistration"));
const OBDScanner = lazy(() => import("@/pages/OBDScanner"));
const AIDiagnosis = lazy(() => import("@/pages/AIDiagnosis"));
const DiagnosticHistory = lazy(() => import("@/pages/DiagnosticHistory"));
const BookingDetails = lazy(() => import("@/pages/BookingDetails"));
const Consultations = lazy(() => import("@/pages/Consultations"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const MarketplaceProduct = lazy(() => import("@/pages/MarketplaceProduct"));
const MarketplaceCheckout = lazy(() => import("@/pages/MarketplaceCheckout"));
const MyProductOrders = lazy(() => import("@/pages/MyProductOrders"));
const ProductsAdmin = lazy(() => import("@/pages/Admin/Products"));
const ProductOrdersAdmin = lazy(() => import("@/pages/Admin/ProductOrders"));
const ConsultationsAdmin = lazy(() => import("@/pages/Admin/Consultations"));
const Quizzes = lazy(() => import("@/pages/Quizzes"));
const ServiceRequest = lazy(() => import("@/pages/ServiceRequest"));
const RoleSelection = lazy(() => import("@/pages/RoleSelection"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const TechnicianJobCard = lazy(() => import("@/pages/TechnicianJobCard"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));

// Lazy-loaded pages - Instructor
const InstructorDashboard = lazy(() => import("@/pages/InstructorDashboard"));
const ManageCourses = lazy(() => import("@/pages/ManageCourses"));
const ManageLessons = lazy(() => import("@/pages/ManageLessons"));

// Lazy-loaded pages - Vendor
const VendorDashboard = lazy(() => import("@/pages/VendorDashboard"));
const VendorAnalytics = lazy(() => import("./pages/VendorAnalytics").then(m => ({ default: m.VendorAnalytics })));

// Lazy-loaded pages - Technician

// Lazy-loaded pages - Chat
const ChatList = lazy(() => import("./pages/ChatList").then(m => ({ default: m.ChatList })));
const Chat = lazy(() => import("./pages/Chat").then(m => ({ default: m.Chat })));

// Lazy-loaded pages - Admin
const Admin = lazy(() => import("@/pages/Admin"));
const UnifonicSettings = lazy(() => import("@/pages/UnifonicSettings"));
const PriceHistoryAdmin = lazy(() => import("@/pages/PriceHistoryAdmin"));
const LaborTimeAdmin = lazy(() => import("@/pages/LaborTimeAdmin"));
const PricingSettings = lazy(() => import("@/pages/PricingSettings"));
const PromotionsAdmin = lazy(() => import("@/pages/PromotionsAdmin"));
const AdminDashboard = lazy(() => import("@/pages/Admin/Dashboard"));
const BrandsManagement = lazy(() => import("@/pages/Admin/Brands"));
const ModelsManagement = lazy(() => import("@/pages/Admin/Models"));
const PartsManagement = lazy(() => import("@/pages/Admin/Parts"));
const UsersManagement = lazy(() => import("@/pages/Admin/Users"));
const Reports = lazy(() => import("@/pages/Admin/Reports"));
const LaborTimesAdvanced = lazy(() => import("@/pages/Admin/LaborTimesAdvanced"));
const PartPrices = lazy(() => import("@/pages/Admin/PartPrices"));
const NotificationsManagement = lazy(() => import("@/pages/Admin/Notifications"));
const InvoicesManagement = lazy(() => import("@/pages/Admin/Invoices"));
const VendorApprovals = lazy(() => import("@/pages/Admin/VendorApprovals"));
const AdvancedDashboard = lazy(() => import("@/pages/Admin/AdvancedDashboard"));
const BusinessIntelligence = lazy(() => import("@/pages/Admin/BusinessIntelligence"));
const RolesManagement = lazy(() => import("@/pages/Admin/Roles"));
const ServiceOrdersAdmin = lazy(() => import("@/pages/Admin/ServiceOrders"));
const UserDetail = lazy(() => import("@/pages/Admin/UserDetail"));
const SiteAnalytics = lazy(() => import("@/pages/Admin/SiteAnalytics"));

// Lazy-loaded pages - SEO Service Pages
const BatteryService = lazy(() => import("@/pages/services/BatteryService"));
const StarterService = lazy(() => import("@/pages/services/StarterService"));
const AlternatorService = lazy(() => import("@/pages/services/AlternatorService"));
const DiagnosticsService = lazy(() => import("@/pages/services/DiagnosticsService"));
const EmergencyService = lazy(() => import("@/pages/services/EmergencyService"));

// Lazy-loaded pages - SEO City Pages
const MakkahPage = lazy(() => import("@/pages/cities/MakkahPage"));
const JeddahPage = lazy(() => import("@/pages/cities/JeddahPage"));

// Lazy-loaded pages - Blog & About
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogPage = lazy(() => import("@/pages/blog/BlogPage"));
const BatterySignsArticle = lazy(() => import("@/pages/blog/BatterySignsArticle"));
const StarterAlternatorArticle = lazy(() => import("@/pages/blog/StarterAlternatorArticle"));
const MyVehicles = lazy(() => import("@/pages/MyVehicles"));
const MyOBDReports = lazy(() => import("@/pages/MyOBDReports"));
const AdminOBDReports = lazy(() => import("@/pages/Admin/OBDReports"));

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/index.html"} component={Home} />
        <Route path={"/home"} component={Home} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/add-review"} component={AddReview} />
        <Route path={"/my-points"} component={MyPoints} />
        <Route path={"/my-learning"} component={MyLearning} />
        <Route path={"/certificates/:id"} component={Certificate} />
        <Route path={"/instructor/dashboard"} component={InstructorDashboard} />
        <Route path={"/instructor/courses"} component={ManageCourses} />
        <Route path={"/instructor/courses/:courseId/lessons"} component={ManageLessons} />
        <Route path={"/courses"} component={Courses} />
        <Route path={"/courses/:slug"} component={CourseDetail} />
        <Route path={"/courses/:slug/learn"} component={CourseLearn} />
        <Route path={"/unifonic-settings"} component={UnifonicSettings} />
        <Route path={"/payment"} component={Payment} />
        <Route path={"/price-calculator"} component={PriceCalculator} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/about" component={AboutUs} />
        <Route path="/my-invoices" component={MyInvoices} />
        <Route path={"/terms-of-service"} component={TermsOfService} />
        <Route path={"/admin/price-history"} component={PriceHistoryAdmin} />
        <Route path={"/admin/labor-time"} component={LaborTimeAdmin} />
        <Route path={"/admin/pricing-settings"} component={PricingSettings} />
        <Route path={"/admin/promotions"} component={PromotionsAdmin} />
        <Route path={"/admin/dashboard"} component={AdminDashboard} />
        <Route path={"/admin/site-analytics"} component={SiteAnalytics} />
        <Route path={"/admin/brands"} component={BrandsManagement} />
        <Route path={"/admin/models"} component={ModelsManagement} />
        <Route path={"/admin/parts"} component={PartsManagement} />
        <Route path={"/admin/users"} component={UsersManagement} />
        <Route path={"/admin/reports"} component={Reports} />
        <Route path={"/admin/labor-times-advanced"} component={LaborTimesAdvanced} />
        <Route path={"/admin/part-prices"} component={PartPrices} />
        <Route path={"/admin/notifications"} component={NotificationsManagement} />
        <Route path="/admin/invoices" component={InvoicesManagement} />
        <Route path="/admin/vendor-approvals" component={VendorApprovals} />
        <Route path="/admin/monitoring" component={AdvancedDashboard} />
        <Route path="/vendor-registration" component={VendorRegistration} />
        <Route path="/vendor-dashboard" component={VendorDashboard} />
        <Route path="/vendor-analytics" component={VendorAnalytics} />
        <Route path="/chat" component={ChatList} />
        <Route path="/chat/:conversationId" component={Chat} />
        <Route path="/booking/:id" component={BookingDetails} />
        <Route path="/obd-scanner" component={OBDScanner} />
        <Route path="/ai-diagnosis" component={AIDiagnosis} />
        <Route path="/diagnostic-history" component={DiagnosticHistory} />
        <Route path="/consultations" component={Consultations} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/marketplace/products/:slug" component={MarketplaceProduct} />
        <Route path="/marketplace/checkout/:productId" component={MarketplaceCheckout} />
        <Route path="/my-product-orders" component={MyProductOrders} />
        <Route path="/admin/products" component={ProductsAdmin} />
        <Route path="/admin/product-orders" component={ProductOrdersAdmin} />
        <Route path="/admin/consultations" component={ConsultationsAdmin} />
        <Route path="/quizzes" component={Quizzes} />
        <Route path="/select-role" component={RoleSelection} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/service-request" component={ServiceRequest} />
        <Route path="/technician-orders" component={TechnicianJobCard} />
        <Route path="/my-orders" component={OrderTracking} />
        <Route path="/admin/bi" component={BusinessIntelligence} />
        <Route path="/admin/roles" component={RolesManagement} />
        <Route path="/admin/service-orders" component={ServiceOrdersAdmin} />
        <Route path="/admin/users/:id" component={UserDetail} />
        {/* SEO Service Pages */}
        <Route path="/services/battery" component={BatteryService} />
        <Route path="/services/starter" component={StarterService} />
        <Route path="/services/alternator" component={AlternatorService} />
        <Route path="/services/diagnostics" component={DiagnosticsService} />
        <Route path="/services/emergency" component={EmergencyService} />
        {/* SEO City Pages */}
        <Route path="/makkah" component={MakkahPage} />
        <Route path="/jeddah" component={JeddahPage} />
        {/* Blog & About Pages */}
        <Route path="/about-meir" component={AboutPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/battery-signs" component={BatterySignsArticle} />
        <Route path="/blog/starter-alternator" component={StarterAlternatorArticle} />
        <Route path="/my-vehicles" component={MyVehicles} />
        <Route path="/my-obd-reports" component={MyOBDReports} />
        <Route path="/admin/obd-reports" component={AdminOBDReports} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <InstallPrompt />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
