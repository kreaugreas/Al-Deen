import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { duaCategories } from "@/Bottom/API/Aid";
import { Button } from "@/Top/Component/UI/Button";

const Dua = () => {
  return (
    <Layout>
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {duaCategories.map((category) => (
            <Link key={category.id} to={`/Aid/Dua/${category.id}`} className="block">
              <Button fullWidth className="p-4 text-center group">
                <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">
                  {category.name}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dua;