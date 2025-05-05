import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      <Route path="/">
        <HomePage />
      </Route>
      
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/upload" component={UploadPage} />
      <ProtectedRoute path="/sales" component={SalesPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      <ProtectedRoute path="/categories" component={CategoriesPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/feedback" component={FeedbackPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
