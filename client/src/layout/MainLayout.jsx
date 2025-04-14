import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

import { Toaster } from "@/components/ui/sonner";
import { NotificationHandler } from "../notifications/NotificationHandler";

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      <NotificationHandler />
    </div>
  );
};
