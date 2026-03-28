import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="font-semibold text-sm text-foreground">SerigrafíaPro CRM</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden md:inline-block">
                    {user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => navigate("/auth")}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
