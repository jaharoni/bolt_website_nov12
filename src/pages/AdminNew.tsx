import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import AdminShell from "../components/admin/AdminShell";
import ErrorBoundary from "../components/ErrorBoundary";
import { SelectionProvider } from "../components/admin/SelectionBus";

const Dashboard = lazy(() => import("../components/admin/Dashboard"));
const MediaLibraryPro = lazy(() => import("../components/admin/MediaLibraryPro"));
const EssaysManager = lazy(() => import("../components/admin/EssaysManager"));
const PagesManager = lazy(() => import("../components/admin/PagesManager"));
const ShopManagerNew = lazy(() => import("../components/admin/ShopManagerNew"));
const LTOCampaignManager = lazy(() => import("../components/admin/LTOCampaignManager"));
const GalleriesManager = lazy(() => import("../components/admin/GalleriesManager"));
const GalleryProjectsManager = lazy(() => import("../components/admin/GalleryProjectsManager"));
const ZonesManager = lazy(() => import("../components/admin/ZonesManager"));
const TextBlocksManager = lazy(() => import("../components/admin/TextBlocksManager"));
const SettingsManager = lazy(() => import("../components/admin/SettingsManager"));
const SearchMappingsManager = lazy(() => import("../components/admin/SearchMappingsManager"));

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
  .split(",")
  .map((s: string) => s.trim().toLowerCase())
  .filter(Boolean);

export default function AdminNew() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // DEVELOPMENT MODE: Skip authentication when VITE_ADMIN_EMAILS is empty
    if (ADMIN_EMAILS.length === 0) {
      console.log("DEV MODE: Admin authentication disabled");
      setUser({ email: "dev@localhost" } as any);
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error && error.message !== "Auth session missing!") {
          console.error("Auth error:", error);
          setAuthError(error.message);
        }

        console.log("Admin auth check:", { user, email: user?.email });
        setUser(user);
      } catch (err) {
        console.error("Auth check failed:", err);
        if (err instanceof Error && err.message !== "Auth session missing!") {
          setAuthError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
    } catch (err) {
      console.error("Login error:", err);
      setAuthError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        setAuthError(null);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setAuthError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase();
    console.log("Admin check:", { email, ADMIN_EMAILS, hasUser: !!user });

    if (!email) return false;
    if (ADMIN_EMAILS.length === 0) {
      console.log("No admin emails configured - allowing access");
      return true;
    }
    if (ADMIN_EMAILS.includes(email)) {
      console.log("Email matched admin list");
      return true;
    }
    console.log("Email not in admin list");
    return false;
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-10">
        <div className="text-white/70">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] grid place-items-center p-10">
        <div className="w-full max-w-md">
          <div className="glass-card p-8">
            <h1 className="text-3xl font-display text-white mb-2 text-center">Admin Access</h1>
            <p className="text-white/60 text-center mb-6">
              {loginMode === "login" ? "Sign in to access the admin panel" : "Create an admin account"}
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={loginMode === "login" ? handleLogin : handleSignup}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-white/80 text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass-dark w-full"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-white/80 text-sm mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass-dark w-full"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary w-full mb-4"
              >
                {authLoading ? "Processing..." : loginMode === "login" ? "Sign In" : "Sign Up"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode(loginMode === "login" ? "signup" : "login");
                    setAuthError(null);
                  }}
                  className="text-white/60 hover:text-white text-sm"
                >
                  {loginMode === "login"
                    ? "Need an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <a href="/" className="text-white/50 hover:text-white/80 text-sm">
                Return to Home
              </a>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white/5 rounded-lg text-sm text-white/50">
            <p className="mb-2">Admin Email Configuration:</p>
            <p className="font-mono text-xs">
              {ADMIN_EMAILS.length === 0
                ? "All authenticated users allowed"
                : ADMIN_EMAILS.join(", ")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-10 text-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-white">Access Restricted</h1>
          <p className="text-white/70 mb-6">This area is for administrators only.</p>
          <div className="mt-4 p-4 bg-white/5 rounded-lg text-left max-w-md mx-auto">
            <p className="text-white/50 text-sm mb-2">Current email: <span className="text-white font-mono">{user?.email}</span></p>
            <p className="text-white/50 text-sm mb-2">Configured admin emails: <span className="text-white font-mono">{ADMIN_EMAILS.length === 0 ? "(none - all authenticated users allowed)" : ADMIN_EMAILS.join(", ")}</span></p>
            <p className="text-white/50 text-sm mt-4">To grant access, add your email to VITE_ADMIN_EMAILS in .env file</p>
          </div>
          <div className="flex gap-4 justify-center mt-6">
            <button onClick={handleLogout} className="btn-secondary">
              Sign Out
            </button>
            <a href="/" className="btn-secondary">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative z-10 min-h-screen pt-16">
        <ErrorBoundary>
          <SelectionProvider>
            <AdminShell
              sections={[
                {
                  key: "dashboard",
                  label: "Dashboard",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <Dashboard />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "media",
                  label: "Media",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <MediaLibraryPro />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "essays",
                  label: "Essays",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <EssaysManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "pages",
                  label: "Pages",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <PagesManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "galleries",
                  label: "Galleries",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <GalleriesManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "projects",
                  label: "Projects",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <GalleryProjectsManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "shop",
                  label: "Shop",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <ShopManagerNew />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "lto",
                  label: "LTO",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <LTOCampaignManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "zones",
                  label: "Zones",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <ZonesManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "text",
                  label: "Text",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <TextBlocksManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "settings",
                  label: "Settings",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <SettingsManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
                {
                  key: "search",
                  label: "Search Logic",
                  element: (
                    <ErrorBoundary>
                      <Suspense fallback={<Loading />}>
                        <SearchMappingsManager />
                      </Suspense>
                    </ErrorBoundary>
                  ),
                },
              ]}
              defaultKey="dashboard"
            />
          </SelectionProvider>
        </ErrorBoundary>
      </div>
    </>
  );
}

function Loading() {
  return (
    <div className="p-8 text-sm text-white/70">Loading...</div>
  );
}
