import { ReactNode, lazy, Suspense } from "react";
import { Header } from "./Header";
import { LiquidGlassFilters } from "@/Top/Component/Liquid-Glass-Filters";
import { PageTransition } from "@/Top/Component/Page-Transition";

const SettingsSidebar = lazy(() => import("@/Top/Component/Settings/Sidebar").then(m => ({ default: m.SettingsSidebar })));
const SpotlightSearch = lazy(() => import("@/Top/Component/Search").then(m => ({ default: m.SpotlightSearch })));

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LiquidGlassFilters />
      <Header />
      <PageTransition>
        <main className="flex-1 pt-20 md:pt-24">
          {children}
        </main>
      </PageTransition>
      <Suspense fallback={null}>
        <SettingsSidebar />
        <SpotlightSearch />
      </Suspense>
    </div>
  );
}
