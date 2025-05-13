import { useState } from "react";
import { Layout } from "@/components/layout";
import { BusinessModal } from "@/components/business/business-modal";
import { useBusiness } from "@/hooks/use-business";
import { useLocale } from "@/hooks/use-locale";
import { Business } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Edit, Trash2, Star, StarOff, Building2 } from "lucide-react";

export default function BusinessPage() {
  const { t } = useLocale();
  const {
    businesses,
    createBusinessMutation,
    updateBusinessMutation,
    deleteBusinessMutation,
  } = useBusiness();

  const [showNewBusinessModal, setShowNewBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const handleCreateBusiness = (data: Partial<Business>) => {
    createBusinessMutation.mutate(data, {
      onSuccess: () => setShowNewBusinessModal(false)
    });
  };

  const handleUpdateBusiness = (data: Partial<Business>) => {
    if (selectedBusiness) {
      updateBusinessMutation.mutate({ 
        id: selectedBusiness.id, 
        data 
      }, {
        onSuccess: () => setShowEditBusinessModal(false)
      });
    }
  };

  const handleDeleteBusiness = () => {
    if (selectedBusiness) {
      deleteBusinessMutation.mutate(selectedBusiness.id, {
        onSuccess: () => setShowDeleteDialog(false)
      });
    }
  };

  const handleEdit = (business: Business) => {
    setSelectedBusiness(business);
    setShowEditBusinessModal(true);
  };

  const handleDelete = (business: Business) => {
    setSelectedBusiness(business);
    setShowDeleteDialog(true);
  };

  const handleSetDefault = (business: Business) => {
    if (!business.isDefault) {
      updateBusinessMutation.mutate({
        id: business.id,
        data: { isDefault: true }
      });
    }
  };

  return (
    <Layout title={t("businesses")}>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t("manage_businesses")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("manage_businesses_description")}
            </p>
          </div>
          <Button onClick={() => setShowNewBusinessModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("add_business")}
          </Button>
        </div>

        {businesses.length === 0 ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t("no_businesses")}</CardTitle>
              <CardDescription>
                {t("no_businesses_description")}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => setShowNewBusinessModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> {t("add_first_business")}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("your_businesses")}</CardTitle>
              <CardDescription>
                {t("businesses_list_description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>{t("total_businesses", { count: businesses.length })}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("industry")}</TableHead>
                    <TableHead>{t("website")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("phone")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>
                        {business.isDefault ? (
                          <Star className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSetDefault(business)}
                            title={t("set_as_default")}
                          >
                            <StarOff className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
                          {business.name}
                        </div>
                      </TableCell>
                      <TableCell>{business.industry || "-"}</TableCell>
                      <TableCell>
                        {business.website ? (
                          <a 
                            href={business.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {business.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {business.email ? (
                          <a 
                            href={`mailto:${business.email}`}
                            className="text-blue-500 hover:underline"
                          >
                            {business.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {business.phone ? (
                          <a 
                            href={`tel:${business.phone}`}
                            className="text-blue-500 hover:underline"
                          >
                            {business.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(business)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(business)}
                            disabled={business.isDefault && businesses.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <BusinessModal
        isOpen={showNewBusinessModal}
        onClose={() => setShowNewBusinessModal(false)}
        onSave={handleCreateBusiness}
      />

      <BusinessModal
        isOpen={showEditBusinessModal}
        onClose={() => setShowEditBusinessModal(false)}
        onSave={handleUpdateBusiness}
        business={selectedBusiness}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_business")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_business_confirmation", { name: selectedBusiness?.name || "" })}
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
    </Layout>
  );
} 