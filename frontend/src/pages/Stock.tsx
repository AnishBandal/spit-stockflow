import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockStockLocations, mockProducts, mockWarehouses } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { Edit2, Check, X } from 'lucide-react';

export default function Stock() {
  const [stockData, setStockData] = useState(mockStockLocations);
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ onHand: 0, freeToUse: 0 });

  const filteredStock = stockData.filter(s => 
    warehouseFilter === 'all' || s.warehouse === warehouseFilter
  );

  const getProductName = (productId: string) => {
    return mockProducts.find(p => p.id === productId)?.name || productId;
  };

  const startEdit = (productId: string, onHand: number, freeToUse: number) => {
    setEditingRow(productId);
    setEditValues({ onHand, freeToUse });
  };

  const saveEdit = (productId: string, warehouse: string, location: string) => {
    setStockData(stockData.map(s => 
      s.productId === productId && s.warehouse === warehouse && s.location === location
        ? { ...s, ...editValues }
        : s
    ));
    setEditingRow(null);
    toast({ title: 'Stock updated successfully', description: 'Changes have been logged in Move History' });
  };

  const cancelEdit = () => {
    setEditingRow(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stock</h2>
          <p className="text-sm text-muted-foreground mt-1">View and update on-hand quantities per product</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {mockWarehouses.map(wh => (
                <SelectItem key={wh.id} value={wh.name}>{wh.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Location</th>
                <th>Per Unit Cost</th>
                <th>On Hand</th>
                <th>Free to Use</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((stock) => {
                const isEditing = editingRow === stock.productId;
                return (
                  <tr key={`${stock.productId}-${stock.warehouse}-${stock.location}`}>
                    <td className="font-medium">{getProductName(stock.productId)}</td>
                    <td>{stock.warehouse}</td>
                    <td>{stock.location}</td>
                    <td>${stock.costPerUnit}</td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.onHand}
                          onChange={(e) => setEditValues({ ...editValues, onHand: parseInt(e.target.value) || 0 })}
                          className="w-24"
                        />
                      ) : (
                        stock.onHand
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.freeToUse}
                          onChange={(e) => setEditValues({ ...editValues, freeToUse: parseInt(e.target.value) || 0 })}
                          className="w-24"
                        />
                      ) : (
                        stock.freeToUse
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveEdit(stock.productId, stock.warehouse, stock.location)}
                          >
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(stock.productId, stock.onHand, stock.freeToUse)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Changes are logged in Stock Adjustments / Move History
        </p>
      </Card>
    </div>
  );
}
