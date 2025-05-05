import { Layout } from "@/components/layout";
import { CSVUpload } from "@/components/csv-upload";
import { useLocale } from "@/hooks/use-locale.tsx";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function UploadPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Query to check if there are existing sales
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ["/api/sales"],
  });
  
  // Handle CSV upload success
  const handleUploadSuccess = () => {
    toast({
      title: t("upload.redirectTitle"),
      description: t("upload.redirectDesc"),
    });
    
    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
      setLocation("/dashboard");
    }, 1500);
  };
  
  return (
    <Layout title={t("pages.upload")}>
      <div className="w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-6">{t("upload.pageTitle")}</h1>
          
          {/* Show information for first-time users */}
          {!isLoading && salesData.length === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
                {t("upload.firstTimeTitle")}
              </h2>
              <p className="text-blue-700 dark:text-blue-400 mb-4">
                {t("upload.firstTimeDesc")}
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                >
                  {t("upload.exploreDashboard")}
                </Button>
              </div>
            </div>
          )}
          
          {/* CSV Upload Component */}
          <CSVUpload onSuccess={handleUploadSuccess} />
          
          {/* Additional Instructions */}
          <div className="mt-12">
            <h2 className="text-xl font-medium mb-4">{t("upload.instructionsTitle")}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
                <li>
                  <span className="font-medium">{t("upload.step1Title")}</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-400 pl-5">
                    {t("upload.step1Desc")}
                  </p>
                </li>
                <li>
                  <span className="font-medium">{t("upload.step2Title")}</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-400 pl-5">
                    {t("upload.step2Desc")}
                  </p>
                </li>
                <li>
                  <span className="font-medium">{t("upload.step3Title")}</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-400 pl-5">
                    {t("upload.step3Desc")}
                  </p>
                </li>
                <li>
                  <span className="font-medium">{t("upload.step4Title")}</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-400 pl-5">
                    {t("upload.step4Desc")}
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
