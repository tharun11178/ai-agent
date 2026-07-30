import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { ErrorPage } from "@/pages/ErrorPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Rules from "./pages/Rules";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import ControlCenter from "./pages/ControlCenter";
import ProblemStatementPage from "./pages/ProblemStatementPage";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { CursorGlow } from "./components/CursorGlow";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/events"} component={Events} />
      <Route path={"/rules"} component={Rules} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/schedule"} component={Schedule} />
      <Route path={"/problem-statement"} component={ProblemStatementPage} />
      <Route path={"/control-center"} component={ControlCenter} />
      <Route path={"/403"} component={() => <ErrorPage code="403" />} />
      <Route path={"/500"} component={() => <ErrorPage code="500" />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AnimatedBackground />
          <CursorGlow />
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
