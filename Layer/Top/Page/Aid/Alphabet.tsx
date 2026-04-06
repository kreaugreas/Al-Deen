import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getLetters } from "@/Bottom/API/Aid";
import { Container } from "@/Top/Component/UI/Container";

const AlphabetIndex = () => {
  const letters = getLetters();

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-4xl mx-auto">
          {/* Alphabet Table */}
          <Container className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Transliteration</th>
                    <th className="px-4 py-3 font-medium">Isolated</th>
                    <th className="px-4 py-3 font-medium">Initial</th>
                    <th className="px-4 py-3 font-medium">Medial</th>
                    <th className="px-4 py-3 font-medium">End</th>
                  </tr>
                </thead>
                <tbody>
                  {letters.map((letter) => (
                    <tr
                      key={letter.id}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          to={`/Aid/Alphabet/${letter.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {letter.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-arabic text-xl" dir="rtl">
                        {letter.forms.isolated}
                      </td>
                      <td className="px-4 py-3 font-arabic text-xl" dir="rtl">
                        {letter.forms.initial}
                      </td>
                      <td className="px-4 py-3 font-arabic text-xl" dir="rtl">
                        {letter.forms.medial}
                      </td>
                      <td className="px-4 py-3 font-arabic text-xl" dir="rtl">
                        {letter.forms.final}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </div>
      </section>
    </Layout>
  );
};

export default AlphabetIndex;