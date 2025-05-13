import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Business } from "@shared/schema";
import { useLocale } from "@/hooks/use-locale";

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Business>) => void;
  business?: Business | null;
}

export function BusinessModal({ isOpen, onClose, onSave, business }: BusinessModalProps) {
  const { t } = useLocale();
  const [formData, setFormData] = useState<Partial<Business>>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    industry: "",
    foundedYear: undefined,
    isDefault: false,
  });

  // When the business prop changes, update the form data
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        description: business.description || "",
        address: business.address || "",
        phone: business.phone || "",
        email: business.email || "",
        website: business.website || "",
        industry: business.industry || "",
        foundedYear: business.foundedYear,
        isDefault: business.isDefault,
      });
    } else {
      // Reset form for new business
      setFormData({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        industry: "",
        foundedYear: undefined,
        isDefault: false,
      });
    }
  }, [business]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "foundedYear") {
      const yearValue = value === "" ? undefined : parseInt(value);
      setFormData((prev) => ({ ...prev, [name]: yearValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {business ? t("edit_business") : t("create_business")}
            </DialogTitle>
            <DialogDescription>
              {business 
                ? t("edit_business_description") 
                : t("create_business_description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="name" className="text-right">
                {t("business_name")}*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="description" className="text-right">
                {t("description")}
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="industry" className="text-right">
                {t("industry")}
              </Label>
              <Input
                id="industry"
                name="industry"
                value={formData.industry || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="foundedYear" className="text-right">
                {t("founded_year")}
              </Label>
              <Input
                id="foundedYear"
                name="foundedYear"
                type="number"
                max={new Date().getFullYear()}
                min={1800}
                value={formData.foundedYear || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="address" className="text-right">
                {t("address")}
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="col-span-3"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="phone" className="text-right">
                {t("phone")}
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="email" className="text-right">
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="website" className="text-right">
                {t("website")}
              </Label>
              <Input
                id="website"
                name="website"
                value={formData.website || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">{t("default_business")}</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox 
                  id="isDefault" 
                  checked={formData.isDefault} 
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="isDefault" className="font-normal">
                  {t("set_as_default")}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}