import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { Business, InsertBusiness } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type BusinessContextType = {
  businesses: Business[];
  currentBusiness: Business | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentBusiness: (business: Business) => void;
  createBusinessMutation: UseMutationResult<Business, Error, Partial<InsertBusiness>>;
  updateBusinessMutation: UseMutationResult<Business, Error, { id: number; data: Partial<InsertBusiness> }>;
  deleteBusinessMutation: UseMutationResult<void, Error, number>;
};

export const BusinessContext = createContext<BusinessContextType | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);

  // Fetch all businesses
  const {
    data: businesses = [],
    error,
    isLoading,
  } = useQuery<Business[], Error>({
    queryKey: ["/api/businesses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/businesses");
      return await response.json();
    },
    enabled: !!user,
  });

  // Fetch default business when no current business is selected
  useEffect(() => {
    if (businesses.length > 0 && !currentBusiness) {
      // Find default business
      const defaultBusiness = businesses.find(b => b.isDefault);
      if (defaultBusiness) {
        setCurrentBusiness(defaultBusiness);
      } else {
        // If no default business, use the first one
        setCurrentBusiness(businesses[0]);
      }
    }
  }, [businesses, currentBusiness]);

  // Create business mutation
  const createBusinessMutation = useMutation({
    mutationFn: async (businessData: Partial<InsertBusiness>): Promise<Business> => {
      const response = await apiRequest("POST", "/api/businesses", businessData);
      return await response.json();
    },
    onSuccess: (newBusiness: Business) => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Бизнес создан",
        description: `Бизнес "${newBusiness.name}" успешно создан`,
        variant: "default",
      });
      
      // If this is the first business or marked as default, set it as current
      if (businesses.length === 0 || newBusiness.isDefault) {
        setCurrentBusiness(newBusiness);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать бизнес",
        variant: "destructive",
      });
    },
  });

  // Update business mutation
  const updateBusinessMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBusiness> }): Promise<Business> => {
      const response = await apiRequest("PUT", `/api/businesses/${id}`, data);
      return await response.json();
    },
    onSuccess: (updatedBusiness: Business) => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Бизнес обновлен",
        description: `Информация о бизнесе "${updatedBusiness.name}" обновлена`,
        variant: "default",
      });
      
      // If updated business is current or new default, update current business
      if (currentBusiness?.id === updatedBusiness.id || updatedBusiness.isDefault) {
        setCurrentBusiness(updatedBusiness);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить бизнес",
        variant: "destructive",
      });
    },
  });

  // Delete business mutation
  const deleteBusinessMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/businesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Бизнес удален",
        description: "Бизнес успешно удален",
        variant: "default",
      });
      
      // Reset current business to let it be selected from the updated list
      setCurrentBusiness(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить бизнес",
        variant: "destructive",
      });
    },
  });

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        isLoading,
        error,
        setCurrentBusiness,
        createBusinessMutation,
        updateBusinessMutation,
        deleteBusinessMutation,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
} 