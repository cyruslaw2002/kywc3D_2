import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Announcements from "./pages/Announcements";
import Gallery from "./pages/Gallery";
import Resources from "./pages/Resources";
import Committee from "./pages/Committee";
import SchoolInfo from "./pages/SchoolInfo";
import ExamInfo from "./pages/ExamInfo";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/resources" component={Resources} />
      <Route path="/committee" component={Committee} />
      <Route path="/info" component={SchoolInfo} />
      <Route path="/ad" component={ExamInfo} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
