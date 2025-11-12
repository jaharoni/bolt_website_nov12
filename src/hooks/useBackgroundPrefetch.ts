import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { backgroundPreloader } from "../lib/backgroundPreloader";

const routeToPageKey = (path: string): string => {
  const cleanPath = path.replace(/\/+$/, "") || "/";
  if (cleanPath === "/") return "home";
  return cleanPath.slice(1).split("/")[0];
};

const getAdjacentPages = (currentPath: string): string[] => {
  const allRoutes = [
    { path: "/", key: "home" },
    { path: "/about", key: "about" },
    { path: "/gallery", key: "gallery" },
    { path: "/essays", key: "essays" },
    { path: "/shop", key: "shop" },
    { path: "/contact", key: "contact" },
  ];

  const currentPageKey = routeToPageKey(currentPath);

  return allRoutes
    .filter(route => route.key !== currentPageKey)
    .map(route => route.key);
};

export function useBackgroundPrefetch() {
  const location = useLocation();

  useEffect(() => {
    const currentPageKey = routeToPageKey(location.pathname);

    backgroundPreloader.preloadForPage(currentPageKey);

    const adjacentPages = getAdjacentPages(location.pathname);
    const prefetchTimer = setTimeout(() => {
      backgroundPreloader.preloadMultiple(adjacentPages);
    }, 500);

    return () => clearTimeout(prefetchTimer);
  }, [location.pathname]);
}

export function usePrefetchOnHover() {
  const handleLinkHover = (pageKey: string) => {
    backgroundPreloader.preloadForPage(pageKey);
  };

  return handleLinkHover;
}
