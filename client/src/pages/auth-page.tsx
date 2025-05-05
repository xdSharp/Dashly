import { useState, useEffect } from "react";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { registrationSettings } from "@/config";
import { Footer } from "@/components/ui/footer";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState(false);
  
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
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('register-', '');
    setRegisterData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Отправка формы регистрации с данными:", registerData);
    registerMutation.mutate(registerData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1">
        {/* Left side - Auth form */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-5">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-8">
              <Logo size="lg" />
            </div>

            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Вход в систему</CardTitle>
                    <CardDescription>Введите ваши учетные данные для входа в Dashly</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Имя пользователя</Label>
                        <Input
                          id="username"
                          placeholder="Введите имя пользователя"
                          value={loginData.username}
                          onChange={handleLoginChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
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
                            className="absolute right-0 top-0 h-full px-3"
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
                        className="w-full"
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

              {/* Register Form */}
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Создать аккаунт</CardTitle>
                    <CardDescription>Заполните форму для регистрации</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Полное имя</Label>
                        <Input
                          id="register-name"
                          placeholder="Введите ваше полное имя"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
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
                        <Label htmlFor="register-username">
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
                        <Label htmlFor="register-password">
                          Пароль
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Создайте пароль"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
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
                      
                      {registrationSettings.allowRoleSelection && (
                        <div className="space-y-2">
                          <Label htmlFor="register-role">Тип аккаунта</Label>
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="register-role-user"
                                name="register-role"
                                value="user"
                                checked={registerData.role === "user"}
                                onChange={() => 
                                  setRegisterData(prev => ({...prev, role: "user"}))
                                }
                                className="mr-2"
                              />
                              <label htmlFor="register-role-user">Пользователь</label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="register-role-admin"
                                name="register-role"
                                value="admin"
                                checked={registerData.role === "admin"}
                                onChange={() => 
                                  setRegisterData(prev => ({...prev, role: "admin"}))
                                }
                                className="mr-2"
                              />
                              <label htmlFor="register-role-admin">Администратор</label>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full"
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

        {/* Right side - Hero section */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary-600 dark:bg-primary-900 text-white flex-col justify-center items-center p-12">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold mb-6">Добро пожаловать в Dashly</h1>
            <p className="text-xl mb-8">Мощная аналитическая платформа для вашего бизнеса</p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span>Полная аналитика продаж и поведения клиентов</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span>Интерактивные отчеты и визуализации данных</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span>Многопользовательский доступ и управление ролями</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}