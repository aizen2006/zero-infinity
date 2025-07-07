
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Puzzle, 
  Brain, 
  Bell, 
  CreditCard, 
  Settings,
  Zap
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/integrations', icon: Puzzle, label: 'Integrations' },
  { to: '/insights', icon: Brain, label: 'AI Insights' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-gradient-primary">
              ZERO
            </span>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.to} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.label}</span>}
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
};
