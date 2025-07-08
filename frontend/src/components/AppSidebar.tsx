
import {
  Database,
  BarChart,
  Settings,
  Calendar,
  Link,
  PieChart,
  Plus,
  Zap,
  Clock,
  Code
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart,
  },
  {
    title: "Data Jobs",
    url: "/data-jobs",
    icon: Database,
  },
  {
    title: "Create Job",
    url: "/create-job",
    icon: Plus,
  },
  {
    title: "Enrichment Pipelines",
    url: "/enrichment",
    icon: Calendar,
  },
  {
    title: "Data Enrichment",
    url: "/data-enrichment",
    icon: Zap,
  },
  {
    title: "Workflow Automation",
    url: "/workflow-automation",
    icon: Clock,
  },
  {
    title: "Integration Hub",
    url: "/integration-hub",
    icon: Code,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Link,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: PieChart,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sidebar className="bg-navy-800 border-navy-700">
      <SidebarHeader className="border-b border-navy-700 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">DataFlow Pro</h2>
            <p className="text-xs text-teal-200">Data Automation</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-teal-200 font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={`text-gray-300 hover:text-white hover:bg-navy-700 transition-colors ${
                      location.pathname === item.url 
                        ? 'bg-teal-600 text-white' 
                        : ''
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-navy-700 p-4">
        <div className="text-xs text-teal-200 text-center">
          © 2024 DataFlow Pro
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
