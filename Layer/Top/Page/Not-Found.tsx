import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/Top/Component/Layout/Layout";
import { Home, Search, Book } from "lucide-react";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="glass-icon-btn w-20 h-20 mx-auto mb-6 pointer-events-none">
            <span className="text-4xl font-bold text-primary">404</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="glass-btn w-full py-3 gap-2 justify-center bg-primary text-primary-foreground"
            >
              <Home className="h-4 w-4" />
              {t.nav.home}
            </Link>
            
            <Link
              to="/Quran"
              className="glass-btn w-full py-3 gap-2 justify-center"
            >
              <Book className="h-4 w-4" />
              {t.nav.quran}
            </Link>
            
            <Link
              to="/Search"
              className="glass-btn w-full py-3 gap-2 justify-center"
            >
              <Search className="h-4 w-4" />
              {t.nav.search}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
