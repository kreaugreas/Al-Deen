import { Layout } from "@/Top/Component/Layout/Layout";
import { NavCard } from "@/Top/Component/Nav-Card";
import { Clock, Compass, Calendar, Calculator, BookOpen, HandHeart } from "lucide-react";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

const Aid = () => {
  const { t, isRtl } = useTranslation();

  return (
    <Layout>
      <section className="py-8 md:py-12" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <NavCard
              title="Prayers"
              description="Prayer times by location"
              icon={Clock}
              to="/Aid/Prayers"
            />
            <NavCard
              title="Qibla"
              description="Find Qibla direction"
              icon={Compass}
              to="/Aid/Qibla"
            />
            <NavCard
              title="Hijri Calendar"
              description="Islamic calendar dates"
              icon={Calendar}
              to="/Aid/Hijri-Calendar"
            />
            <NavCard
              title="Zakat Calculator"
              description="Calculate your Zakat"
              icon={Calculator}
              to="/Aid/Zakat-Calculator"
            />
            <NavCard
              title="Duas"
              description="Supplications from Quran and Hadith"
              icon={HandHeart}
              to="/Aid/Dua"
            />
            <NavCard
              title="Alphabet"
              description="Arabic alphabet and Tajweed"
              icon={BookOpen}
              to="/Aid/Alphabet"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Aid;