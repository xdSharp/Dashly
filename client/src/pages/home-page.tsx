import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/ui/footer";

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setLocation("/auth")}
                className="text-sm font-medium mr-2"
              >
                Вход
              </Button>
              <Button
                onClick={() => {
                  setLocation("/auth");
                  // Set register tab as active in localStorage
                  localStorage.setItem("authTab", "register");
                }}
              >
                Регистрация
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-grow flex items-center justify-center bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl md:text-6xl">
              Dashly
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-400">
              Мощная аналитика для вашего бизнеса
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                onClick={() => setLocation("/auth")}
                className="px-8 py-3 text-base font-medium"
              >
                Начать работу
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}