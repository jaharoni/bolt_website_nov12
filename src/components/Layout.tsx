import React, { lazy, Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { BackgroundRoot } from './bg/BackgroundRoot';
import { useLocation } from "react-router-dom";

const ChatWidget = lazy(() => import("./ChatWidget"));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/admin");
  const aiWidgetEnabled = import.meta.env.VITE_AI_WIDGET_ENABLED === 'true';

  return (
    <div className="min-h-screen relative">
      <BackgroundRoot />
      <Navbar />
      <main className={`relative ${isHome ? '' : 'min-h-screen pt-16 z-10'}`}>
        {children}
      </main>
      <Footer />

      {aiWidgetEnabled && !isAdmin && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
    </div>
  );
};

export default Layout;