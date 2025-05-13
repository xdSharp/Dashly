import { useState, ReactNode, useMemo, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Footer } from "@/components/ui/footer";
import { NeuralBackground } from "@/components/neural-background";
import { useTheme } from "@/hooks/use-theme";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDarkMode = theme === 'dark';

  // При каждой загрузке страницы запрашиваем обновление данных
  useEffect(() => {
    // Если пользователь авторизован, обновляем данные
    if (user) {
      // Обновляем уведомления
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      // Если администратор, обновляем и админские данные
      if (user.role === 'admin') {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      }
    }
  }, [user]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Мемоизируем нейронный фон, чтобы предотвратить перерисовки при вводе текста
  const backgroundComponent = useMemo(() => (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <NeuralBackground 
        darkMode={isDarkMode} 
        density={100} 
        opacity={0.3} 
        speed={1} 
        interactive={true}
      />
    </div>
  ), [isDarkMode]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Нейронный фон */}
      {backgroundComponent}
      
      <div className="relative z-10 flex h-screen w-full overflow-hidden">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden md:flex md:w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile menu backdrop and panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
              />

              {/* Sidebar panel */}
              <motion.div
                className="fixed inset-y-0 left-0 max-w-xs w-full z-40"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <Sidebar isMobile={true} onClose={closeMobileMenu} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content container */}
        <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
          {/* Header with mobile menu button */}
          <Header onMenuClick={toggleMobileMenu} title={title} isMenuOpen={isMobileMenuOpen} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-transparent backdrop-blur-sm p-4 sm:p-6 lg:p-8 pb-20">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}