import { Layout } from "@/Top/Component/Layout/Layout";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container py-12 max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8">{t.footer.privacy}</h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Al-Deen.org ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">2. Information We Collect</h2>
              <p className="text-muted-foreground">We may collect information about you in various ways:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Personal Data:</strong> Name, email address, and other contact information you provide when creating an account.</li>
                <li><strong className="text-foreground">Usage Data:</strong> Information about how you use our website, including pages visited, time spent, and reading preferences.</li>
                <li><strong className="text-foreground">Device Data:</strong> Information about your device, browser type, and IP address.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the collected information to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and maintain our services</li>
                <li>Personalize your reading experience</li>
                <li>Save your bookmarks and reading progress</li>
                <li>Send you updates and notifications (with your consent)</li>
                <li>Improve our website and services</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">5. Your Rights</h2>
              <p className="text-muted-foreground">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">6. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@al-deen.org" className="text-primary hover:underline">
                  privacy@al-deen.org
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
