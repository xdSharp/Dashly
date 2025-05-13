import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { NeuralBackground } from "@/components/neural-background";
import { useTheme } from "@/hooks/use-theme";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="relative min-h-screen">
      {/* Нейронный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <NeuralBackground darkMode={isDarkMode} />
      </div>
      
      {/* Контент поверх фона */}
      <div className="relative flex flex-col min-h-screen pointer-events-none">
        {/* Новая навигация - минималистичная с размытием */}
        <nav className="backdrop-blur-lg bg-transparent border-b border-gray-200 dark:border-white/10 pointer-events-auto">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Logo />
            </div>
              <div className="flex items-center space-x-4">
                <button 
                onClick={() => setLocation("/auth")}
                  className="group flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                  <span className="mr-2">Вход</span>
                  <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              <Button
                onClick={() => {
                  setLocation("/auth");
                  localStorage.setItem("authTab", "register");
                }}
                  className="bg-blue-500/80 hover:bg-blue-500 text-white rounded-full backdrop-blur-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                Регистрация
              </Button>
            </div>
          </div>
        </div>
      </nav>

        {/* Hero секция с обновленным дизайном */}
        <div className="flex-grow flex items-center justify-center pb-20">
          <div className="max-w-5xl mx-auto px-6 pointer-events-auto">
          <div className="text-center">
              <div className="inline-block p-1.5 px-4 mb-4 rounded-full bg-blue-100/80 dark:bg-white/10 backdrop-blur-md border border-blue-200 dark:border-white/20">
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Аналитика нового поколения
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-800 dark:text-white">
                <span className="dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-blue-200 dark:via-blue-100 dark:to-white text-blue-600">
              Dashly
                </span>
            </h1>
              <p className="mt-8 text-xl text-gray-700 dark:text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
                Мощная аналитика для вашего бизнеса с интерактивными дашбордами 
                и глубокой аналитикой данных
            </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/auth")}
                  className="px-8 py-6 text-base font-medium rounded-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
              >
                Начать работу
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
                <button
                  onClick={() => setLocation("/docs")}
                  className="text-gray-700 dark:text-blue-200 hover:text-blue-700 dark:hover:text-white px-6 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
                >
                  Узнать больше
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}