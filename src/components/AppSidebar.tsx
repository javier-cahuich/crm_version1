import { LayoutDashboard, Users, Truck, Kanban, ClipboardList, BarChart2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Proveedores", url: "/proveedores", icon: Truck },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Pedidos", url: "/pedidos", icon: ClipboardList },
  { title: "Reportes", url: "/reportes", icon: BarChart2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-5">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img
              src="/img/logo1.jpeg"
              alt="Logo"
              className="h-9 w-9 shrink-0 rounded-md object-cover shadow-sm"
            />
            <div className="flex flex-col">
              <h2 className="font-bold text-sm leading-tight text-sidebar-foreground">ProyecsionCRM</h2>
              <p className="text-[11px] leading-tight text-sidebar-foreground/70 font-medium tracking-wide uppercase mt-0.5">Gestión de Taller</p>
            </div>
          </div>
        )}
        {collapsed && (
          <img
            src="/img/logo1.jpeg"
            alt="Logo"
            className="h-9 w-9 shrink-0 rounded-md object-cover shadow-sm mx-auto"
          />
        )}
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50 uppercase mb-2">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 px-0 hover:bg-transparent">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center w-full px-3 py-2 rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground transition-all duration-200"
                      activeClassName="bg-[#2a303c] text-white font-medium border-l-[4px] border-primary rounded-l-none"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
