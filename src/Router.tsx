import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AppLayout from "./components/AppLayout";
import PageScrollHandler from "./components/PageScrollHandler";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load all page components for automatic code splitting
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Gallery = lazy(() => import("./pages/GalleryNew"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AdminNew = lazy(() => import("./pages/AdminNew"));
const Essays = lazy(() => import("./pages/Essays"));
const EssayDetail = lazy(() => import("./pages/EssayDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Test = lazy(() => import("./pages/Test"));
const LTOPrint = lazy(() => import("./pages/LTOPrint"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-[40vh] grid place-items-center p-8">
    <div className="animate-pulse text-white/70">Loading...</div>
  </div>
);

const AppRouter = () => {
  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<PageScrollHandler><Home /></PageScrollHandler>} />
              <Route path="/gallery" element={<PageScrollHandler><Gallery /></PageScrollHandler>} />
              <Route path="/gallery/:slug" element={<PageScrollHandler><Gallery /></PageScrollHandler>} />
              <Route path="/about" element={<PageScrollHandler><About /></PageScrollHandler>} />
              <Route path="/contact" element={<PageScrollHandler><Contact /></PageScrollHandler>} />
              <Route path="/shop" element={<PageScrollHandler><Shop /></PageScrollHandler>} />
              <Route path="/shop/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/lto/:slug" element={<LTOPrint />} />
              <Route path="/essays" element={<Essays />} />
              <Route path="/essays/:slug" element={<EssayDetail />} />
              <Route path="/test" element={<Test />} />
              <Route path="/admin" element={<AdminNew />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
};

export default AppRouter;