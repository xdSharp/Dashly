
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./hooks/use-theme.tsx";
import { I18nProvider } from "./lib/i18n.tsx";
import { AuthProvider } from "./hooks/use-auth";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster position="bottom-right" />
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  </QueryClientProvider>
);
