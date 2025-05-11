import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
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
import { MyProfile } from "./pages/profile/MyProfile";
import { CommunityDetail } from "./pages/Communities/CommunityDetail";
import { CommunitySettings } from "./pages/Communities/CommunitySettings";
import { VerifyEmail } from "./pages/VerifyEmail";
import { AddBeneficiary } from "./pages/beneficiaries/AddBeneficiary";
import { DeathReportReview } from "./pages/admin/DeathReportReview";
import { PendingReports } from "./pages/admin/PendingReports";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PaymentSuccess } from "./pages/payments/Success";
import { PaymentCancel } from "./pages/payments/Cancel";
import { PaymentHistory } from "./pages/payments/PaymentHistory";

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
                    <Route path="*" element={<NotFoundPage />} />
                    {/* Public routes */}
                    <Route element={<PublicRoute />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                    </Route>

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/communities" element={<Communities />} />
                      <Route
                        path="/communities/:id"
                        element={<CommunityDetail />}
                      />
                      <Route path="/verify-email" element={<VerifyEmail />} />

                      {/* <Route
                        path="/communities/create"
                        element={<CreateCommunity />}
                      /> */}
                      <Route
                        path="/communities/:id/settings"
                        element={<CommunitySettings />}
                      />
                      <Route path="/my-section" element={<MySection />} />
                      <Route path="/death-reports" element={<DeathReports />} />
                      <Route path="/profile" element={<MyProfile />} />
                      <Route
                        path="/profile/beneficiaries/add"
                        element={<AddBeneficiary />}
                      />
                      <Route
                        path="/death-reports/new"
                        element={<ReportDeath />}
                      />
                      <Route
                        path="/death-reports/:id"
                        element={<DeathReportDetails />}
                      />
                      <Route
                        path="/payments/success"
                        element={<PaymentSuccess />}
                      />
                      <Route
                        path="/payments/cancel"
                        element={<PaymentCancel />}
                      />
                      <Route
                        path="/payments/history"
                        element={<PaymentHistory />}
                      />
                    </Route>

                    {/* Admin routes */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route
                        path="/admin/pendingReports"
                        element={<PendingReports />}
                      />

                      {/* <Route
                        path="/communities/:id/manage"
                        element={<CommunityManagement />}
                      /> */}
                    </Route>
                  </Routes>
                </main>

                <Footer />
              </div>
            </Router>
            <Toaster />
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
