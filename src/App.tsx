import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, Component, type ReactNode } from "react";
import { PortfolioDataProvider } from "@/features/portfolio/PortfolioDataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SectionVisibilityProvider } from "@/contexts/SectionVisibilityContext";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminSkills = lazy(() => import("./pages/admin/AdminSkills"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminAbout = lazy(() => import("./pages/admin/AdminAbout"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminPageBuilder = lazy(() => import("./pages/admin/AdminPageBuilder"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminLicenses = lazy(() => import("./pages/admin/AdminLicenses"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    void error;
    void errorInfo;
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-4">
                {this.state.error?.message || "An unexpected error occurred."}
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Go Home
              </a>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

const RouteLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-muted-foreground text-sm">Loading...</div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SectionVisibilityProvider>
          <PortfolioDataProvider>
            <AuthProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <ErrorBoundary>
                <Suspense fallback={<RouteLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminOverview />} />
                      <Route path="services" element={<AdminServices />} />
                      <Route path="skills" element={<AdminSkills />} />
                      <Route path="projects" element={<AdminProjects />} />
                      <Route path="about" element={<AdminAbout />} />
                      <Route path="messages" element={<AdminMessages />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="page-builder" element={<AdminPageBuilder />} />
                      <Route path="pricing" element={<AdminPricing />} />
                      <Route path="testimonials" element={<AdminTestimonials />} />
                      <Route path="licenses" element={<AdminLicenses />} />
                    </Route>
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
            </AuthProvider>
          </PortfolioDataProvider>
        </SectionVisibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
