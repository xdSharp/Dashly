import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User, insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword, verifyPassword } from "./password-utils";

declare global {
  namespace Express {
    // Define the User interface for Express using imported type 
    interface User {
      id: number;
      username: string;
      password: string;
      email: string;
      name: string;
      role: string;
      createdAt: Date | null | undefined;
    }
  }
}

export function setupAuth(app: Express) {
  // Session settings
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "sales-dashboard-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true в production, false в dev
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax', // 'lax' для лучшей совместимости с браузерами
    }
  };

  // Настройки для разработки с разными портами
  if (process.env.NODE_ENV !== 'production') {
    // В режиме разработки указываем домен для cookie
    if (sessionSettings.cookie) {
      sessionSettings.cookie.domain = 'localhost';
    }
  }

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate input
      const validatedUser = insertUserSchema.parse(req.body);
      
      console.log("Регистрация - входные данные:", req.body);
      console.log("Регистрация - валидированные данные:", validatedUser);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedUser.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedUser.password);

      // ПРИНУДИТЕЛЬНО устанавливаем роль "user" при регистрации
      // Это переопределит что угодно из клиента
      const role = "user";
      
      console.log("Регистрация - принудительно установленная роль:", role);

      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedUser,
        password: hashedPassword,
        role: role
      });
      
      console.log("Регистрация - созданный пользователь:", { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        name: user.name,
        email: user.email
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Log in the user
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Validate login data
      loginSchema.parse(req.body);

      passport.authenticate("local", (err: Error, user: User, info: { message: string }) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message || "Authentication failed" });

        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          return res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Endpoint for changing password
  app.post("/api/change-password", isAuthenticated, async (req, res) => {
    try {
      // isAuthenticated middleware гарантирует, что req.user существует
      if (!req.user) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Оба пароля обязательны" });
      }
      
      // Get the user to check current password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      
      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Текущий пароль неверен" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user password
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
      if (!updatedUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Ошибка при изменении пароля:", error);
      res.status(500).json({ message: "Не удалось изменить пароль" });
    }
  });

  // Middleware for checking if user is admin
  app.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    next();
  });
}

// Middleware for checking authentication
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};
