// Role-based permissions utility

export type UserRole = 'Inventory Manager' | 'Warehouse Staff' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Permission checks
export const permissions = {
  // Products
  canViewProducts: (role: UserRole) => true, // All roles can view
  canCreateProduct: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),
  canUpdateProduct: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),
  canDeleteProduct: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),

  // Warehouses
  canViewWarehouses: (role: UserRole) => true,
  canCreateWarehouse: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),
  canUpdateWarehouse: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),
  canDeleteWarehouse: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),

  // Locations
  canViewLocations: (role: UserRole) => true,
  canCreateLocation: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),
  canUpdateLocation: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),
  canDeleteLocation: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),

  // Stock
  canViewStock: (role: UserRole) => true,
  canUpdateStock: (role: UserRole) => true, // All roles can update stock quantities
  canDeleteStock: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),

  // Operations (Receipts, Deliveries, Transfers, Adjustments)
  canViewOperations: (role: UserRole) => true,
  canCreateOperation: (role: UserRole) => true, // All roles can create operations
  canUpdateOperation: (role: UserRole) => true, // All roles can update operations
  canCompleteOperation: (role: UserRole) => true, // All roles can complete operations
  canDeleteOperation: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),

  // Dashboard
  canViewDashboard: (role: UserRole) => true,
  canViewReports: (role: UserRole) => ['Inventory Manager', 'Admin'].includes(role),

  // Admin
  isAdmin: (role: UserRole) => role === 'Admin',
  isManager: (role: UserRole) => role === 'Inventory Manager',
  isStaff: (role: UserRole) => role === 'Warehouse Staff',
};

// Get user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const authStr = localStorage.getItem('stockmaster_auth');
    if (!authStr) return null;
    const authData = JSON.parse(authStr);
    return authData.user || null;
  } catch {
    return null;
  }
};

// Check if user has permission
export const hasPermission = (permissionCheck: (role: UserRole) => boolean): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  return permissionCheck(user.role);
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  return role;
};

// Get role description
export const getRoleDescription = (role: UserRole): string => {
  switch (role) {
    case 'Admin':
      return 'Full system access and user management';
    case 'Inventory Manager':
      return 'Manage products, warehouses, locations, and operations';
    case 'Warehouse Staff':
      return 'Perform transfers, picking, shelving, and counting';
    default:
      return '';
  }
};

// Get allowed pages for a role
export const getAllowedPages = (role: UserRole): string[] => {
  switch (role) {
    case 'Admin':
    case 'Inventory Manager':
      return [
        '/dashboard',
        '/products',
        '/stock',
        '/receipts',
        '/deliveries',
        '/transfers',
        '/adjustments',
        '/move-history',
        '/warehouses',
        '/locations',
        '/profile'
      ];
    case 'Warehouse Staff':
      return [
        '/dashboard',
        '/stock',
        '/transfers',
        '/adjustments',
        '/profile'
      ];
    default:
      return ['/dashboard', '/profile'];
  }
};
