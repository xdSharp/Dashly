import { useState } from "react";
import { useBusiness } from "@/hooks/use-business";
import { useLocale } from "@/hooks/use-locale";
import { BusinessModal } from "./business-modal";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus, Edit, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function BusinessSwitcher() {
  const { t } = useLocale();
  const { 
    businesses, 
    currentBusiness, 
    setCurrentBusiness,
    createBusinessMutation,
    updateBusinessMutation,
    deleteBusinessMutation
  } = useBusiness();
  
  const [open, setOpen] = useState(false);
  const [showNewBusinessModal, setShowNewBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [businessToManage, setBusinessToManage] = useState<typeof currentBusiness>(null);

  const handleCreateBusiness = (data: any) => {
    createBusinessMutation.mutate(data, {
      onSuccess: () => setShowNewBusinessModal(false)
    });
  };

  const handleUpdateBusiness = (data: any) => {
    if (businessToManage) {
      updateBusinessMutation.mutate({ 
        id: businessToManage.id, 
        data 
      }, {
        onSuccess: () => setShowEditBusinessModal(false)
      });
    }
  };

  const handleDeleteBusiness = () => {
    if (businessToManage) {
      deleteBusinessMutation.mutate(businessToManage.id, {
        onSuccess: () => setShowDeleteDialog(false)
      });
    }
  };

  const handleEditClick = (business: any) => {
    setBusinessToManage(business);
    setShowEditBusinessModal(true);
    setOpen(false);
  };

  const handleDeleteClick = (business: any) => {
    setBusinessToManage(business);
    setShowDeleteDialog(true);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={t("select_business")}
            className="w-full justify-between text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            {currentBusiness ? currentBusiness.name : t("select_business")}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={t("search_business")} className="h-9" />
            <CommandList>
              <CommandEmpty>{t("no_business_found")}</CommandEmpty>
              <CommandGroup heading={t("your_businesses")}>
                {businesses.map((business) => (
                  <CommandItem
                    key={business.id}
                    onSelect={() => {
                      setCurrentBusiness(business);
                      setOpen(false);
                    }}
                    className="text-sm flex justify-between group text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center">
                      {currentBusiness?.id === business.id && (
                        <Check className="mr-2 h-4 w-4 text-primary" />
                      )}
                      <span>{business.name}</span>
                      {business.isDefault && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {t("default")}
                        </span>
                      )}
                    </div>
                    <div className="ml-2 flex items-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(business);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{t("common.edit")}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(business);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("common.delete")}</span>
                      </Button>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setShowNewBusinessModal(true);
                    setOpen(false);
                  }}
                  className="text-sm text-primary hover:bg-primary/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("create_business")}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <BusinessModal
        isOpen={showEditBusinessModal}
        onClose={() => setShowEditBusinessModal(false)}
        onSave={handleUpdateBusiness}
        business={businessToManage}
      />

      <BusinessModal
        isOpen={showNewBusinessModal}
        onClose={() => setShowNewBusinessModal(false)}
        onSave={handleCreateBusiness}
        business={null}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_business")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_business_confirmation", { name: businessToManage?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBusiness}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 