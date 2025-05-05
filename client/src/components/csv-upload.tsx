import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/hooks/use-locale";
import { Upload, FileUp, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";

interface CSVUploadProps {
  onSuccess?: () => void;
}

export function CSVUpload({ onSuccess }: CSVUploadProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'reading' | 'validating' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: string) => {
      const response = await apiRequest("POST", "/api/upload-csv", { data });
      return response.json();
    },
    onSuccess: (data) => {
      setUploadStatus('success');
      setProgressValue(100);
      
      // Show success toast
      toast({
        title: t('upload.successTitle'),
        description: t('upload.successDescription', { count: data.processed.toString() }),
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
        
        // Invalidate queries that depend on this data
        queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    },
    onError: (error: Error) => {
      setUploadStatus('error');
      setErrorMessage(error.message || t('upload.genericError'));
      
      // Show error toast
      toast({
        title: t('upload.errorTitle'),
        description: error.message || t('upload.genericError'),
        variant: "destructive",
      });
    }
  });
  
  // Reset the form state
  const resetForm = () => {
    setFile(null);
    setCsvData(null);
    setUploadStatus('idle');
    setErrorMessage(null);
    setProgressValue(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setErrorMessage(t('upload.invalidFileType'));
        return;
      }
      
      setFile(selectedFile);
      readFile(selectedFile);
    }
  };
  
  // Handle click on upload area
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Read the file content
  const readFile = (file: File) => {
    setUploadStatus('reading');
    setProgressValue(20);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      setUploadStatus('validating');
      setProgressValue(50);
      
      // Validate and upload after a short delay (to show progress)
      setTimeout(() => {
        if (content) {
          setUploadStatus('uploading');
          setProgressValue(75);
          uploadMutation.mutate(content);
        } else {
          setUploadStatus('error');
          setErrorMessage(t('upload.emptyFile'));
        }
      }, 500);
    };
    
    reader.onerror = () => {
      setUploadStatus('error');
      setErrorMessage(t('upload.readError'));
    };
    
    reader.readAsText(file);
  };
  
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropping(true);
  };
  
  const handleDragLeave = () => {
    setIsDropping(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropping(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
        setErrorMessage(t('upload.invalidFileType'));
        return;
      }
      
      setFile(droppedFile);
      readFile(droppedFile);
    }
  };
  
  // Get status text and icon based on current state
  const getStatusContent = () => {
    switch (uploadStatus) {
      case 'reading':
        return { text: t('upload.reading'), icon: <Upload className="w-6 h-6 animate-pulse text-primary" /> };
      case 'validating':
        return { text: t('upload.validating'), icon: <Upload className="w-6 h-6 animate-pulse text-primary" /> };
      case 'uploading':
        return { text: t('upload.uploading'), icon: <Upload className="w-6 h-6 animate-pulse text-primary" /> };
      case 'success':
        return { text: t('upload.success'), icon: <CheckCircle2 className="w-6 h-6 text-green-500" /> };
      case 'error':
        return { text: errorMessage || t('upload.error'), icon: <XCircle className="w-6 h-6 text-red-500" /> };
      default:
        return { text: t('upload.dropzoneText'), icon: <FileUp className="w-6 h-6 text-gray-400" /> };
    }
  };
  
  const { text, icon } = getStatusContent();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('upload.title')}</CardTitle>
        <CardDescription>{t('upload.description')}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            ${isDropping ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'} 
            ${uploadStatus === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
            ${uploadStatus === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}
            transition-colors duration-200
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={uploadStatus === 'idle' ? handleUploadClick : undefined}
          style={{ cursor: uploadStatus === 'idle' ? 'pointer' : 'default' }}
        >
          <input 
            type="file" 
            accept=".csv"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={uploadStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-3"
              >
                {icon}
              </motion.div>
            </AnimatePresence>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{text}</p>
            
            {file && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
            
            {uploadStatus !== 'idle' && (
              <div className="w-full mt-4">
                <Progress value={progressValue} className="h-2" />
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions for CSV format */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">{t('upload.formatTitle')}</h3>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 overflow-x-auto">
            <code className="text-xs text-gray-800 dark:text-gray-200">
              product_name,category_name,price,quantity,amount,date,employee
            </code>
          </div>
          <p className="text-xs text-gray-500 mt-2">{t('upload.formatDescription')}</p>
          
          {/* Example */}
          <h3 className="text-sm font-medium mt-4 mb-2">{t('upload.exampleTitle')}</h3>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 overflow-x-auto">
            <code className="text-xs text-gray-800 dark:text-gray-200">
              "Молоко","Продукты",50,2,100,"2023-04-01","Иван"<br />
              "Хлеб","Продукты",30,1,30,"2023-04-01","Ольга"
            </code>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={resetForm}
          disabled={uploadStatus === 'idle' || uploadStatus === 'uploading'}
        >
          {t('common.reset')}
        </Button>
        
        {uploadStatus === 'error' && (
          <Button onClick={handleUploadClick}>
            {t('upload.tryAgain')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
