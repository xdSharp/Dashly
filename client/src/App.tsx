import { Route, Switch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { BusinessProvider } from "@/hooks/use-business";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "./pages/dashboard-page";
import UploadPage from "./pages/upload-page";
import SalesPage from "./pages/sales-page";
import ProductsPage from "./pages/products-page";
import CategoriesPage from "./pages/categories-page";
import ReportsPage from "./pages/reports-page";
import FeedbackPage from "./pages/feedback-page";
import ProfilePage from "./pages/profile-page";
import UsersPage from "./pages/users-page";
import { AuthProvider } from "./hooks/use-auth";
import { I18nProvider } from "./lib/i18n";
import { ThemeProvider } from "./hooks/use-theme";
import CustomersPage from "./pages/customers-page";
import AnalyticsPage from "./pages/analytics-page";
import BusinessPage from "./pages/business-page";
import PrivacyPage from "@/pages/privacy-page";
import TermsPage from "@/pages/terms-page";
import ContactsPage from "@/pages/contacts-page";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Функция для защиты маршрутов
  const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => {
    return user ? <Component /> : <AuthPage />;
  };

  // Функция для защиты маршрутов администратора
  const AdminRoute = ({ component: Component }: { component: React.ComponentType }) => {
    return user && user.role === "admin" ? (
      <Component />
    ) : user ? (
      <DashboardPage />
    ) : (
      <AuthPage />
  );
  };

  return (
    <I18nProvider>
    <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BusinessProvider>
              <AnimatePresence mode="wait">
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/auth" component={AuthPage} />

                  {/* Защищенные маршруты */}
                  <Route path="/dashboard">
                    <ProtectedRoute component={DashboardPage} />
                  </Route>
                  <Route path="/products">
                    <ProtectedRoute component={ProductsPage} />
                  </Route>
                  <Route path="/categories">
                    <ProtectedRoute component={CategoriesPage} />
                  </Route>
                  <Route path="/sales">
                    <ProtectedRoute component={SalesPage} />
                  </Route>
                  <Route path="/customers">
                    <ProtectedRoute component={CustomersPage} />
                  </Route>
                  <Route path="/profile">
                    <ProtectedRoute component={ProfilePage} />
                  </Route>
                  <Route path="/upload">
                    <ProtectedRoute component={UploadPage} />
                  </Route>
                  <Route path="/reports">
                    <ProtectedRoute component={ReportsPage} />
                  </Route>
                  <Route path="/analytics">
                    <ProtectedRoute component={AnalyticsPage} />
                  </Route>
                  <Route path="/feedback">
                    <ProtectedRoute component={FeedbackPage} />
                  </Route>
                  <Route path="/business">
                    <ProtectedRoute component={BusinessPage} />
                  </Route>
                  <Route path="/privacy">
                    <ProtectedRoute component={PrivacyPage} />
                  </Route>
                  <Route path="/terms">
                    <ProtectedRoute component={TermsPage} />
                  </Route>
                  <Route path="/contacts">
                    <ProtectedRoute component={ContactsPage} />
                  </Route>

                  {/* Маршруты администратора */}
                  <Route path="/users">
                    <AdminRoute component={UsersPage} />
                  </Route>

                  {/* Обработка неизвестных маршрутов */}
                  <Route component={NotFound} />
                </Switch>
              </AnimatePresence>
            </BusinessProvider>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
      </I18nProvider>
  );
}

export default App;
