import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactsPage() {
  const { t } = useLocale();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки формы
  };

  return (
    <Layout title={t("pages.contacts")}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t("contacts.title")}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Контактная информация */}
          <div>
            <h2 className="text-xl font-semibold mb-6">{t("contacts.info")}</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-medium">{t("contacts.email")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">support@dashly.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-medium">{t("contacts.phone")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">+7 (999) 123-45-67</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-medium">{t("contacts.address")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("contacts.addressLine1")}<br />
                    {t("contacts.addressLine2")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div>
            <h2 className="text-xl font-semibold mb-6">{t("contacts.form.title")}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("contacts.form.name")}</Label>
                <Input
                  id="name"
                  placeholder={t("contacts.form.namePlaceholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("contacts.form.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("contacts.form.emailPlaceholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("contacts.form.message")}</Label>
                <Textarea
                  id="message"
                  placeholder={t("contacts.form.messagePlaceholder")}
                  required
                  className="min-h-[150px]"
                />
              </div>

              <Button type="submit" className="w-full">
                {t("contacts.form.submit")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 