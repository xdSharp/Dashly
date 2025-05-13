import { Layout } from "@/components/layout";
import { useLocale } from "@/hooks/use-locale";

export default function TermsPage() {
  const { t } = useLocale();

  return (
    <Layout title={t("pages.terms")}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t("terms.title")}</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("terms.introduction.title")}</h2>
            <p className="mb-4">{t("terms.introduction.description")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("terms.usage.title")}</h2>
            <p className="mb-4">{t("terms.usage.description")}</p>
            <ul className="list-disc pl-6 mb-4">
              <li>{t("terms.usage.item1")}</li>
              <li>{t("terms.usage.item2")}</li>
              <li>{t("terms.usage.item3")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("terms.account.title")}</h2>
            <p className="mb-4">{t("terms.account.description")}</p>
            <ul className="list-disc pl-6 mb-4">
              <li>{t("terms.account.item1")}</li>
              <li>{t("terms.account.item2")}</li>
              <li>{t("terms.account.item3")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("terms.content.title")}</h2>
            <p className="mb-4">{t("terms.content.description")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("terms.intellectual.title")}</h2>
            <p className="mb-4">{t("terms.intellectual.description")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("terms.liability.title")}</h2>
            <p className="mb-4">{t("terms.liability.description")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("terms.termination.title")}</h2>
            <p className="mb-4">{t("terms.termination.description")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t("terms.changes.title")}</h2>
            <p className="mb-4">{t("terms.changes.description")}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
} 