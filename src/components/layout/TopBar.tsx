import { Search, Bell, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import { authService } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/receipts': 'Receipts',
  '/deliveries': 'Delivery Orders',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Stock Adjustments',
  '/products': 'Products',
  '/stock': 'Stock',
  '/move-history': 'Move History',
  '/warehouses': 'Warehouses',
  '/locations': 'Locations',
  '/profile': 'My Profile',
};

export const TopBar = () => {
  const { toggleSidebar } = useSidebar();
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    toast({ title: 'Logged out successfully' });
    navigate('/login');
  };

  const pageTitle = pageTitles[location.pathname as keyof typeof pageTitles] || 'StockMaster';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card shadow-sm transition-all duration-200">
      <div className="flex h-14 md:h-16 items-center gap-2 md:gap-4 px-3 md:px-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="lg:hidden transition-colors hover:bg-secondary/10"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-lg md:text-xl font-bold text-primary truncate">{pageTitle}</h1>

        <div className="hidden md:flex flex-1 justify-center max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, SKUs or documents..."
              className="pl-10 bg-background transition-all duration-200 focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {user && (
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
              {user.role}
            </span>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative transition-all duration-200 hover:bg-secondary/10"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 transition-all duration-200 hover:bg-secondary/10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
