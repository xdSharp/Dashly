import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale";

export default function PrivacyPage() {
  const { t } = useLocale();

  return (
    <Layout title={t("pages.privacy")}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t("privacy.title")}</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("privacy.introduction.title")}</h2>
            <p className="mb-4">{t("privacy.introduction.description")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("privacy.dataCollection.title")}</h2>
            <p className="mb-4">{t("privacy.dataCollection.description")}</p>
            <ul className="list-disc pl-6 mb-4">
              <li>{t("privacy.dataCollection.item1")}</li>
              <li>{t("privacy.dataCollection.item2")}</li>
              <li>{t("privacy.dataCollection.item3")}</li>
              <li>{t("privacy.dataCollection.item4")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("privacy.dataUsage.title")}</h2>
            <p className="mb-4">{t("privacy.dataUsage.description")}</p>
            <ul className="list-disc pl-6 mb-4">
              <li>{t("privacy.dataUsage.item1")}</li>
              <li>{t("privacy.dataUsage.item2")}</li>
              <li>{t("privacy.dataUsage.item3")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("privacy.dataSecurity.title")}</h2>
            <p className="mb-4">{t("privacy.dataSecurity.description")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("privacy.cookies.title")}</h2>
            <p className="mb-4">{t("privacy.cookies.description")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("privacy.thirdParty.title")}</h2>
            <p className="mb-4">{t("privacy.thirdParty.description")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("privacy.changes.title")}</h2>
            <p className="mb-4">{t("privacy.changes.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("privacy.contact.title")}</h2>
            <p className="mb-4">{t("privacy.contact.description")}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
} 