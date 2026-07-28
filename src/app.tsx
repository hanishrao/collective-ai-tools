/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import BackToTop from './components/BackToTop';
import DiscoverPage from './components/discover/DiscoverPage';
import { capturePageview } from './lib/analytics';

// Route components are code-split so the landing bundle stays small —
// only the shell + DiscoverPage load up front; everything else on demand.
const ExternalTools = lazy(() => import('./components/ExternalTools'));
const MCPCatalog = lazy(() => import('./components/MCPCatalog'));
const MCPServerDetail = lazy(() => import('./components/MCPServerDetail'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const SubmitTool = lazy(() => import('./components/SubmitTool'));
const PatternStudio = lazy(() => import('./components/PatternStudio'));
const AdminGuard = lazy(() => import('./components/AdminGuard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminOverview = lazy(() => import('./components/admin/AdminOverview'));
const SubmissionList = lazy(() => import('./components/admin/SubmissionList'));
const AdminUsers = lazy(() => import('./components/admin/AdminUsers'));
const AdminPrompts = lazy(() => import('./components/admin/AdminPrompts'));
const AdminMCPServers = lazy(
  () => import('./components/admin/resources/AdminMCPServers')
);
const AdminMCPClients = lazy(
  () => import('./components/admin/resources/AdminMCPClients')
);
const AdminAITools = lazy(
  () => import('./components/admin/resources/AdminAITools')
);
const AdminCategories = lazy(
  () => import('./components/admin/resources/AdminCategories')
);
const AdminTiers = lazy(
  () => import('./components/admin/resources/AdminTiers')
);
const AdminLanguages = lazy(
  () => import('./components/admin/resources/AdminLanguages')
);
const AdminSkills = lazy(() => import('./components/admin/AdminSkills'));
const ComparisonPage = lazy(() => import('./components/ComparisonPage'));
const TrendingPage = lazy(() => import('./components/TrendingPage'));
const CommunityPromptsPage = lazy(
  () => import('./components/CommunityPromptsPage')
);
const SkillsMarketplace = lazy(() => import('./components/SkillsMarketplace'));
const SubmitSkill = lazy(() => import('./components/SubmitSkill'));

function RouteFallback() {
  return (
    <div className='flex min-h-[50vh] items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600' />
    </div>
  );
}

function App() {
  const location = useLocation();
  useEffect(() => {
    // Initialize theme from saved preference or system setting.
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    document.body.dataset.theme =
      savedTheme || (prefersDark ? 'dark' : 'light');
  }, []);

  // Cookieless analytics: record a pageview on every route change.
  // This lazily loads posthog-js after first paint, off the critical path.
  useEffect(() => {
    capturePageview(location.pathname);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col'>
        <Navigation currentPath={location.pathname} />
        <main className='flex-1'>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route index element={<DiscoverPage />} />
              <Route path='tools' element={<ExternalTools />} />
              <Route path='/trending' element={<TrendingPage />} />
              <Route path='/skills' element={<SkillsMarketplace />} />
              <Route path='/skills/submit' element={<SubmitSkill />} />
              <Route path='/prompts' element={<CommunityPromptsPage />} />
              <Route path='mcp-catalog' element={<MCPCatalog />} />
              <Route path='prompt-studio' element={<PatternStudio />} />
              <Route
                path='compare/:comparisonId'
                element={<ComparisonPage />}
              />

              <Route
                path='mcp-catalog/:serverId'
                element={<MCPServerDetail />}
              />
              <Route path='login' element={<Login />} />
              <Route path='register' element={<Register />} />
              <Route path='submit' element={<SubmitTool />} />

              {/* Admin Routes */}
              <Route path='admin' element={<AdminGuard />}>
                <Route element={<AdminDashboard />}>
                  <Route index element={<AdminOverview />} />
                  <Route path='submissions' element={<SubmissionList />} />
                  <Route path='users' element={<AdminUsers />} />
                  <Route path='prompts' element={<AdminPrompts />} />
                  <Route
                    path='resources/mcp-servers'
                    element={<AdminMCPServers />}
                  />
                  <Route
                    path='resources/mcp-clients'
                    element={<AdminMCPClients />}
                  />
                  <Route path='resources/ai-tools' element={<AdminAITools />} />
                  <Route
                    path='resources/categories'
                    element={<AdminCategories />}
                  />
                  <Route path='resources/tiers' element={<AdminTiers />} />
                  <Route
                    path='resources/languages'
                    element={<AdminLanguages />}
                  />
                  <Route path='skills' element={<AdminSkills />} />
                  <Route
                    path='settings'
                    element={<div>Settings coming soon...</div>}
                  />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </ErrorBoundary>
  );
}

export default App;
