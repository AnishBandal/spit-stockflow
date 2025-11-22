// Mock data for StockMaster

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Inventory Manager' | 'Warehouse Staff';
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  totalStock: number;
  reorderLevel: number;
  status: 'Normal' | 'Low' | 'Out of Stock';
}

export interface StockLocation {
  productId: string;
  warehouse: string;
  location: string;
  onHand: number;
  freeToUse: number;
  costPerUnit: number;
}

export interface Operation {
  id: string;
  reference: string;
  type: 'Receipt' | 'Delivery' | 'Internal Transfer' | 'Adjustment';
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  from: string;
  to: string;
  contact?: string;
  scheduleDate: string;
  responsible: string;
  products: { productId: string; quantity: number }[];
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
}

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Manager',
    email: 'demo.manager@stockmaster.test',
    role: 'Inventory Manager',
  },
  {
    id: '2',
    name: 'Jane Staff',
    email: 'staff@stockmaster.test',
    role: 'Warehouse Staff',
  },
];

// Mock Warehouses
export const mockWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'Main Warehouse', shortCode: 'WH', address: '123 Industrial Blvd, Suite 100' },
  { id: 'wh2', name: 'Storage Facility', shortCode: 'SF', address: '456 Storage Lane, Building B' },
];

// Mock Locations
export const mockLocations: Location[] = [
  { id: 'loc1', name: 'Stock Area 1', shortCode: 'Stock1', warehouseId: 'wh1' },
  { id: 'loc2', name: 'Stock Area 2', shortCode: 'Stock2', warehouseId: 'wh1' },
  { id: 'loc3', name: 'Cold Storage', shortCode: 'Cold1', warehouseId: 'wh2' },
];

// Mock Products
export const mockProducts: Product[] = [
  { id: 'p1', name: 'Office Chair Executive', sku: 'OC-001', category: 'Furniture', unitOfMeasure: 'Unit', totalStock: 45, reorderLevel: 20, status: 'Normal' },
  { id: 'p2', name: 'Desk Lamp LED', sku: 'DL-002', category: 'Lighting', unitOfMeasure: 'Unit', totalStock: 12, reorderLevel: 15, status: 'Low' },
  { id: 'p3', name: 'Keyboard Mechanical', sku: 'KB-003', category: 'Electronics', unitOfMeasure: 'Unit', totalStock: 0, reorderLevel: 10, status: 'Out of Stock' },
  { id: 'p4', name: 'Monitor 27inch', sku: 'MN-004', category: 'Electronics', unitOfMeasure: 'Unit', totalStock: 28, reorderLevel: 15, status: 'Normal' },
  { id: 'p5', name: 'Standing Desk', sku: 'SD-005', category: 'Furniture', unitOfMeasure: 'Unit', totalStock: 8, reorderLevel: 10, status: 'Low' },
];

// Mock Stock Locations
export const mockStockLocations: StockLocation[] = [
  { productId: 'p1', warehouse: 'Main Warehouse', location: 'Stock1', onHand: 45, freeToUse: 40, costPerUnit: 150 },
  { productId: 'p2', warehouse: 'Main Warehouse', location: 'Stock1', onHand: 12, freeToUse: 10, costPerUnit: 35 },
  { productId: 'p4', warehouse: 'Main Warehouse', location: 'Stock2', onHand: 28, freeToUse: 25, costPerUnit: 320 },
  { productId: 'p5', warehouse: 'Storage Facility', location: 'Cold1', onHand: 8, freeToUse: 5, costPerUnit: 450 },
];

// Mock Operations
export const mockOperations: Operation[] = [
  {
    id: 'op1',
    reference: 'WH/IN/0001',
    type: 'Receipt',
    status: 'Ready',
    from: 'Azure Interior',
    to: 'WH/Stock1',
    contact: 'Azure Interior',
    scheduleDate: '2025-11-25',
    responsible: 'John Manager',
    products: [{ productId: 'p1', quantity: 20 }],
  },
  {
    id: 'op2',
    reference: 'WH/OUT/0001',
    type: 'Delivery',
    status: 'Waiting',
    from: 'WH/Stock1',
    to: 'Customer ABC',
    contact: 'Customer ABC',
    scheduleDate: '2025-11-23',
    responsible: 'Jane Staff',
    products: [{ productId: 'p2', quantity: 5 }],
  },
  {
    id: 'op3',
    reference: 'WH/INT/0001',
    type: 'Internal Transfer',
    status: 'Draft',
    from: 'WH/Stock1',
    to: 'SF/Cold1',
    scheduleDate: '2025-11-26',
    responsible: 'John Manager',
    products: [{ productId: 'p5', quantity: 3 }],
  },
  {
    id: 'op4',
    reference: 'WH/IN/0002',
    type: 'Receipt',
    status: 'Done',
    from: 'TechSupply Co',
    to: 'WH/Stock2',
    contact: 'TechSupply Co',
    scheduleDate: '2025-11-20',
    responsible: 'John Manager',
    products: [{ productId: 'p4', quantity: 15 }],
  },
  {
    id: 'op5',
    reference: 'WH/OUT/0002',
    type: 'Delivery',
    status: 'Ready',
    from: 'WH/Stock2',
    to: 'Office Solutions Ltd',
    contact: 'Office Solutions Ltd',
    scheduleDate: '2025-11-24',
    responsible: 'Jane Staff',
    products: [{ productId: 'p4', quantity: 8 }],
  },
  {
    id: 'op6',
    reference: 'WH/ADJ/0001',
    type: 'Adjustment',
    status: 'Done',
    from: 'WH/Stock1',
    to: 'WH/Stock1',
    scheduleDate: '2025-11-21',
    responsible: 'John Manager',
    products: [{ productId: 'p2', quantity: -3 }],
  },
];
