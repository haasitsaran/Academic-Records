import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Achievements from "./pages/Achievements";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Faculty from "./pages/Faculty";
import AcademicResults from "./pages/AcademicResults";
import CareerGuidance from "./pages/CareerGuidance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create a router with future flags
// For now, we'll use the older API to avoid type errors
// Once you upgrade to React Router v7, you can switch to the new API with future flags
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <Dashboard />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/achievements" 
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <Achievements />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/academic-results" 
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <AcademicResults />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/career-guidance" 
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <CareerGuidance />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/portfolio" 
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <Portfolio />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/profile" 
      element={
        <ProtectedRoute allowedRoles={['student', 'teacher']}>
          <Profile />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/faculty" 
      element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <Faculty />
        </ProtectedRoute>
      } 
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
