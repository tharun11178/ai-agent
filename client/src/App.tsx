import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { ErrorPage } from "@/pages/ErrorPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { RefreshCw } from "lucide-react";

// Lazy-loaded components and routes for instant initial page render & code splitting
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Events = lazy(() => import("./pages/Events"));
const Rules = lazy(() => import("./pages/Rules"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Schedule = lazy(() => import("./pages/Schedule"));
const ControlCenter = lazy(() => import("./pages/ControlCenter"));
const ProblemStatementPage = lazy(() => import("./pages/ProblemStatementPage"));
const AnimatedBackground = lazy(() => import("./components/AnimatedBackground").then((m) => ({ default: m.AnimatedBackground })));
const CursorGlow = lazy(() => import("./components/CursorGlow").then((m) => ({ default: m.CursorGlow })));

function PageFallback() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary animate-pulse">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
      <p className="text-sm font-semibold text-foreground/70 uppercase tracking-widest">
        Loading Section...
      </p>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/about"} component={About} />
        <Route path={"/events"} component={Events} />
        <Route path={"/rules"} component={Rules} />
        <Route path={"/faq"} component={FAQ} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/schedule"} component={Schedule} />
        <Route path={"/ps/:token"} component={ProblemStatementPage} />
        <Route path={"/problem-statement"} component={ProblemStatementPage} />
        <Route path={"/problem-statement/:id"} component={ProblemStatementPage} />
        <Route path={"/control-center"} component={ControlCenter} />
        <Route path={"/403"} component={() => <ErrorPage code="403" />} />
        <Route path={"/500"} component={() => <ErrorPage code="500" />} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={null}>
            <AnimatedBackground />
            <CursorGlow />
          </Suspense>
          <Navigation />
          <main className="relative z-10">
            <Router />
          </main>
          <Footer />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
