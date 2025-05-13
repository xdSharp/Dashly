import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2, ArrowLeft, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { registrationSettings } from "@/config";
import { Footer } from "@/components/ui/footer";
import { NeuralBackground } from "@/components/neural-background";
import { useTheme } from "@/hooks/use-theme";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Form states
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: registrationSettings.defaultRole // Получаем роль из настроек
  });
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);
  
  // Оптимизированный обработчик ввода для формы входа
  const handleLoginChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);
  
  // Оптимизированный обработчик ввода для формы регистрации
  const handleRegisterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('register-', '');
    setRegisterData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);
  
  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  }, [loginData, loginMutation]);
  
  const handleRegister = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log("Отправка формы регистрации с данными:", registerData);
    registerMutation.mutate(registerData);
  }, [registerData, registerMutation]);

  return (
    <div className="relative min-h-screen">
      {/* Нейронный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <NeuralBackground darkMode={isDarkMode} />
      </div>
      
      {/* Контент поверх фона */}
      <div className="relative flex flex-col min-h-screen pointer-events-none">
        {/* Навигация с улучшенной видимостью */}
        <nav className={`backdrop-blur-sm border-b pointer-events-auto ${
          isDarkMode 
            ? "bg-transparent border-white/10" 
            : "bg-white/40 border-gray-200"
        }`}>
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Logo />
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => setLocation("/")}
                  className={`group flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isDarkMode
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-200/50"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  <span>На главную</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="flex flex-1 pb-20">
          {/* Left side - Auth form */}
          <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-5 pointer-events-auto">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold ${
                  isDarkMode 
                    ? "text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-blue-100 to-white" 
                    : "text-blue-800"
                }`}>
                  Добро пожаловать
                </h2>
                <p className={`mt-2 ${
                  isDarkMode 
                    ? "text-blue-100/80" 
                    : "text-blue-700"
                }`}>
                  Войдите или создайте новый аккаунт
                </p>
              </div>

              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className={`grid w-full grid-cols-2 mb-8 p-1 rounded-full ${
                  isDarkMode 
                    ? "bg-white/10 backdrop-blur-md" 
                    : "bg-gray-100 backdrop-blur-md"
                }`}>
                  <TabsTrigger 
                    value="login" 
                    className={`rounded-full ${
                      isDarkMode
                        ? "data-[state=active]:bg-blue-500/80 data-[state=active]:text-white text-white/80" 
                        : "data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600"
                    }`}
                  >
                    Вход
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className={`rounded-full ${
                      isDarkMode
                        ? "data-[state=active]:bg-blue-500/80 data-[state=active]:text-white text-white/80" 
                        : "data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600"
                    }`}
                  >
                    Регистрация
                  </TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <Card className={`shadow-2xl rounded-2xl ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10" 
                      : "bg-white/90 border-gray-200"
                  }`}>
                    <CardHeader>
                      <CardTitle className={isDarkMode ? "text-white" : "text-gray-800"}>
                        Вход в систему
                      </CardTitle>
                      <CardDescription className={
                        isDarkMode ? "text-blue-100/70" : "text-gray-600"
                      }>
                        Введите ваши учетные данные для входа в Dashly
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label 
                            htmlFor="username" 
                            className={isDarkMode ? "text-blue-100" : "text-gray-700"}
                          >
                            Имя пользователя
                          </Label>
                          <Input
                            id="username"
                            placeholder="Введите имя пользователя"
                            value={loginData.username}
                            onChange={handleLoginChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label 
                            htmlFor="password" 
                            className={isDarkMode ? "text-blue-100" : "text-gray-700"}
                          >
                            Пароль
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Введите пароль"
                              value={loginData.password}
                              onChange={handleLoginChange}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`absolute right-0 top-0 h-full px-3 ${
                                isDarkMode 
                                  ? "text-blue-100/70 hover:text-blue-100" 
                                  : "text-gray-600 hover:text-gray-800"
                              }`}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showPassword ? "Скрыть пароль" : "Показать пароль"}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          type="submit"
                          className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-white"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Выполняется вход...
                            </>
                          ) : (
                            "Войти"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>

                {/* Register Form с аналогичными стилями */}
                <TabsContent value="register">
                  <Card className={`shadow-2xl rounded-2xl ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10" 
                      : "bg-white/90 border-gray-200"
                  }`}>
                    <CardHeader>
                      <CardTitle className={isDarkMode ? "text-white" : "text-gray-800"}>
                        Создать аккаунт
                      </CardTitle>
                      <CardDescription className={
                        isDarkMode ? "text-blue-100/70" : "text-gray-600"
                      }>
                        Заполните форму для регистрации
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleRegister}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label 
                            htmlFor="register-name"
                            className={isDarkMode ? "text-blue-100" : "text-gray-700"}
                          >
                            Полное имя
                          </Label>
                          <Input
                            id="register-name"
                            placeholder="Введите ваше полное имя"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label 
                            htmlFor="register-email"
                            className={isDarkMode ? "text-blue-100" : "text-gray-700"}
                          >
                            Email
                          </Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="Введите ваш email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label 
                            htmlFor="register-username"
                            className={isDarkMode ? "text-blue-100" : "text-gray-700"}
                          >
                            Имя пользователя
                          </Label>
                          <Input
                            id="register-username"
                            placeholder="Придумайте имя пользователя"
                            value={registerData.username}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label 
                            htmlFor="register-password"
                            className={isDarkMode ? "text-blue-100" : "text-gray-700"}
                          >
                            Пароль
                          </Label>
                          <div className="relative">
                            <Input
                              id="register-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Придумайте пароль"
                              value={registerData.password}
                              onChange={handleRegisterChange}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`absolute right-0 top-0 h-full px-3 ${
                                isDarkMode 
                                  ? "text-blue-100/70 hover:text-blue-100" 
                                  : "text-gray-600 hover:text-gray-800"
                              }`}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showPassword ? "Скрыть пароль" : "Показать пароль"}
                              </span>
                            </Button>
                          </div>
                        </div>
                        
                        {/* Информационный блок о регистрации */}
                        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
                          <div className="flex items-start space-x-2">
                            <Shield className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-700 dark:text-blue-300">
                              Регистрация доступна только с правами обычного пользователя. 
                              Права администратора могут быть назначены только существующим администратором системы.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          type="submit"
                          className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-white"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Регистрация...
                            </>
                          ) : (
                            "Зарегистрироваться"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Right side - Information and Features */}
          <div className="hidden lg:flex lg:w-1/2 justify-center items-center p-12">
            <div className="max-w-xl">
              <h2 className={`text-4xl font-bold mb-6 ${
                isDarkMode 
                  ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-blue-100 to-white" 
                  : "text-blue-800"
              }`}>
                Добро пожаловать
              </h2>
              <p className={`text-xl mb-12 ${
                isDarkMode 
                  ? "text-white/60" 
                  : "text-gray-700"
              }`}>
                Аналитическая платформа нового поколения для вашего бизнеса
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-3 rounded-full ${
                    isDarkMode 
                      ? "bg-blue-500/30" 
                      : "bg-blue-100"
                  }`}>
                    <svg className={
                      isDarkMode 
                        ? "w-6 h-6 text-blue-300" 
                        : "w-6 h-6 text-blue-600"
                    } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-medium ${
                      isDarkMode 
                        ? "text-white" 
                        : "text-gray-800"
                    }`}>
                      Полная аналитика бизнеса в реальном времени
                    </h3>
                    <p className={
                      isDarkMode 
                        ? "text-white/60 mt-1" 
                        : "text-gray-600 mt-1"
                    }>
                      Получите детальные отчеты и ключевые показатели для принятия лучших решений
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-3 rounded-full ${
                    isDarkMode 
                      ? "bg-purple-500/30" 
                      : "bg-purple-100"
                  }`}>
                    <svg className={
                      isDarkMode 
                        ? "w-6 h-6 text-purple-300" 
                        : "w-6 h-6 text-purple-600"
                    } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-medium ${
                      isDarkMode 
                        ? "text-white" 
                        : "text-gray-800"
                    }`}>
                      Оптимизация процессов с помощью AI
                    </h3>
                    <p className={
                      isDarkMode 
                        ? "text-white/60 mt-1" 
                        : "text-gray-600 mt-1"
                    }>
                      Интеллектуальные рекомендации и автоматизация для роста эффективности
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-3 rounded-full ${
                    isDarkMode 
                      ? "bg-green-500/30" 
                      : "bg-green-100"
                  }`}>
                    <svg className={
                      isDarkMode 
                        ? "w-6 h-6 text-green-300" 
                        : "w-6 h-6 text-green-600"
                    } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-medium ${
                      isDarkMode 
                        ? "text-white" 
                        : "text-gray-800"
                    }`}>
                      Безопасность и конфиденциальность
                    </h3>
                    <p className={
                      isDarkMode 
                        ? "text-white/60 mt-1" 
                        : "text-gray-600 mt-1"
                    }>
                      Шифрование данных, многофакторная аутентификация и соответствие стандартам
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="pointer-events-auto">
          <Footer />
        </footer>
      </div>
    </div>
  );
}