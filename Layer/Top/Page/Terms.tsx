import { Layout } from "@/Top/Component/Layout/Layout";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

export default function Terms() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container py-12 max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8">{t.footer.terms}</h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Al-Deen.org, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">2. Use of Services</h2>
              <p className="text-muted-foreground">Our services are provided for:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Reading and studying the Holy Quran</li>
                <li>Listening to Quran recitations</li>
                <li>Accessing translations and tafsir</li>
                <li>Personal spiritual development</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                When creating an account, you must provide accurate information. You are responsible for maintaining the security of your account and password.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">4. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The content on Al-Deen.org, including the Quran text, translations, and website design, is protected by intellectual property laws. You may use the content for personal, non-commercial purposes only.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">5. Prohibited Activities</h2>
              <p className="text-muted-foreground">You may not:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Use the service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the website</li>
                <li>Copy or redistribute content without permission</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">6. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Al-Deen.org is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">8. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, please contact us at{" "}
                <a href="mailto:support@al-deen.org" className="text-primary hover:underline">
                  support@al-deen.org
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
