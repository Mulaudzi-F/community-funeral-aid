import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { QueryProvider } from "./providers/QueryProviders";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoutes";
import { AdminRoute } from "./routes/AdminRoute";
import { PublicRoute } from "./routes/PublicRoute";

// Layout components
import { Header } from "./layout/Headers";
import { Footer } from "./layout/Footer";
import { Alert } from "./components/ui/Alert";
import { Toaster } from "@/components/ui/sonner";
// Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/Dashboard";
import { Communities } from "./pages/Communities/Communities";
import { MySection } from "./pages/section/MySection";
import { DeathReports } from "./pages/death-reports/DeathReports";
import { ReportDeath } from "./pages/death-reports/ReportDeath";
import { DeathReportDetails } from "./pages/death-reports/DeathReportDetails";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <div className="flex flex-col min-h-screen">
                <Header />
                <Alert />
                <main className="flex-grow container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Home />} />

                    {/* Public routes */}
                    <Route element={<PublicRoute />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                    </Route>

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/communities" element={<Communities />} />
                      <Route path="/my-section" element={<MySection />} />
                      <Route path="/death-reports" element={<DeathReports />} />
                      <Route
                        path="/death-reports/new"
                        element={<ReportDeath />}
                      />
                      <Route
                        path="/death-reports/:id"
                        element={<DeathReportDetails />}
                      />
                    </Route>

                    {/* Admin routes */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                  </Routes>
                </main>

                <Footer />
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
