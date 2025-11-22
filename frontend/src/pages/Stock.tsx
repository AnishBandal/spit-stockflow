import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stockService } from '@/lib/stockService';
import { warehouseService } from '@/lib/warehouseService';
import { toast } from '@/hooks/use-toast';
import { Edit2, Check, X, Loader2 } from 'lucide-react';

export default function Stock() {
  const [stockData, setStockData] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ on_hand: 0, free_to_use: 0 });

  useEffect(() => {
    loadData();
  }, [warehouseFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockRes, warehousesRes] = await Promise.all([
        stockService.getAll(warehouseFilter !== 'all' ? { warehouse_id: warehouseFilter } : {}),
        warehouseService.getAll()
      ]);
      setStockData(stockRes);
      setWarehouses(warehousesRes);
    } catch (error: any) {
      toast({
        title: 'Failed to load stock',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (stockId: string, onHand: number, freeToUse: number) => {
    setEditingRow(stockId);
    setEditValues({ on_hand: onHand, free_to_use: freeToUse });
  };

  const saveEdit = async (stockId: string) => {
    try {
      await stockService.updateQuantity(stockId, editValues);
      toast({ title: 'Stock updated successfully', description: 'Changes have been logged in Move History' });
      setEditingRow(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Failed to update stock',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const cancelEdit = () => {
    setEditingRow(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              {warehouses.map(wh => (
                <SelectItem key={wh.id} value={wh.id.toString()}>{wh.name}</SelectItem>
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
              {stockData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No stock data available. Stock will appear here after operations are completed.
                  </td>
                </tr>
              ) : (
                stockData.map((stock) => {
                  const isEditing = editingRow === stock.id.toString();
                  return (
                    <tr key={stock.id}>
                      <td className="font-medium">{stock.product_name || stock.product_id}</td>
                      <td>{stock.warehouse_name || stock.warehouse_id}</td>
                      <td>{stock.location_name || stock.location_id}</td>
                      <td>${stock.cost_per_unit || 0}</td>
                      <td>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.on_hand}
                            onChange={(e) => setEditValues({ ...editValues, on_hand: parseInt(e.target.value) || 0 })}
                            className="w-24"
                            min="0"
                          />
                        ) : (
                          stock.on_hand
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.free_to_use}
                            onChange={(e) => setEditValues({ ...editValues, free_to_use: parseInt(e.target.value) || 0 })}
                            className="w-24"
                            min="0"
                            max={editValues.on_hand}
                          />
                        ) : (
                          stock.free_to_use
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveEdit(stock.id.toString())}
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
                            onClick={() => startEdit(stock.id.toString(), stock.on_hand, stock.free_to_use)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
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
