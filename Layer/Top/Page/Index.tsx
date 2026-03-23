import { Layout } from "@/Top/Component/Layout/Layout";
import { NavCard } from "@/Top/Component/Nav-Card";
import { Book, BookOpen, Wrench } from "lucide-react";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

const Index = () => {
  const { t, isRtl } = useTranslation();

  return (
    <Layout>
      {/* Navigation Cards - iOS Style Grid */}
      <section className="py-8 md:py-12" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <NavCard
              title={t.nav.quran}
              description={t.home.exploreQuran}
              icon={Book}
              to="/Quran"
            />
            <NavCard
              title={t.nav.hadiths}
              description={t.home.exploreHadiths}
              icon={BookOpen}
              to="/Hadiths"
            />
            <NavCard
              title="Aid"
              description="Prayer times, Qibla & more"
              icon={Wrench}
              to="/Aid"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
