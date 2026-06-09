import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

export function AppLayout() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border/60 bg-card px-4 md:px-6 shrink-0 transition-all">
            <div className="flex items-center h-full">
              {/* Trigger solo visible en móvil para no romper la navegación */}
              <div className="md:hidden flex items-center h-full">
                <SidebarTrigger className="mr-2" />
              </div>
            </div>

            <div className="flex items-center h-full gap-4">
              {session && (
                <div className="flex items-center gap-3 h-full">
                  <span className="text-sm font-medium text-foreground/80 hidden md:inline-block leading-none">
                    {session.user.email}
                  </span>
                  <div className="h-4 w-px bg-border hidden md:block"></div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
