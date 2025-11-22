import {
  Package,
  LayoutDashboard,
  FileText,
  Truck,
  ArrowLeftRight,
  Settings as SettingsIcon,
  Warehouse,
  MapPin,
  ClipboardList,
  History,
  TrendingDown,
  LogOut,
  User,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { permissions, getCurrentUser } from '@/lib/permissions';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const collapsed = state === 'collapsed';
  const userRole = user?.role || 'Warehouse Staff';

  const handleLogout = () => {
    authService.logout();
    toast({ title: 'Logged out successfully' });
    navigate('/login');
  };

  const mainNavItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  ];

  // Staff can only access: Transfers and Adjustments (for counting)
  const operationsItems = [
    { title: 'Receipts', url: '/receipts', icon: FileText, roles: ['Inventory Manager', 'Admin'] },
    { title: 'Deliveries', url: '/deliveries', icon: Truck, roles: ['Inventory Manager', 'Admin'] },
    { title: 'Internal Transfers', url: '/transfers', icon: ArrowLeftRight, roles: ['Inventory Manager', 'Admin', 'Warehouse Staff'] },
    { title: 'Stock Adjustments', url: '/adjustments', icon: TrendingDown, roles: ['Inventory Manager', 'Admin', 'Warehouse Staff'] },
  ].filter(item => !item.roles || item.roles.includes(userRole));

  // Staff can only access Stock (for counting)
  const inventoryItems = [
    { title: 'Products', url: '/products', icon: Package, roles: ['Inventory Manager', 'Admin'] },
    { title: 'Stock', url: '/stock', icon: ClipboardList, roles: ['Inventory Manager', 'Admin', 'Warehouse Staff'] },
    { title: 'Move History', url: '/move-history', icon: History, roles: ['Inventory Manager', 'Admin'] },
  ].filter(item => !item.roles || item.roles.includes(userRole));

  // Staff cannot access Settings
  const settingsItems = [
    { title: 'Warehouses', url: '/warehouses', icon: Warehouse, roles: ['Inventory Manager', 'Admin'] },
    { title: 'Locations', url: '/locations', icon: MapPin, roles: ['Inventory Manager', 'Admin'] },
  ].filter(item => !item.roles || item.roles.includes(userRole));

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border transition-all duration-300">
      <SidebarContent>
        <div className="px-4 py-5 md:py-6">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-secondary transition-colors" />
            {!collapsed && (
              <span className="text-lg font-bold text-primary">StockMaster</span>
            )}
          </div>
        </div>

        <Separator className="bg-border" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {inventoryItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Inventory</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {inventoryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {operationsItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Operations</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {operationsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {settingsItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Settings</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/profile')}>
              <NavLink to="/profile" className="gap-3">
                <User className="h-4 w-4" />
                {!collapsed && <span>My Profile</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="gap-3 text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{user.name}</div>
            <div className="truncate">{user.email}</div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
