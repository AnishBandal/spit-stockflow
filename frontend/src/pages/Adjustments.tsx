import { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusPill } from '@/components/StatusPill';
import { operationService, Operation } from '@/lib/operationService';
import { locationService } from '@/lib/locationService';
import { productService } from '@/lib/productService';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AdjustmentStatus = 'Draft' | 'Done';

export default function StockAdjustments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<Operation[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // form state
  const [reference, setReference] = useState('');
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [quantityChange, setQuantityChange] = useState<number | ''>('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [status, setStatus] = useState<AdjustmentStatus>('Draft');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [operations, products, locations] = await Promise.all([
        operationService.getAll({ type: 'Adjustment' }),
        productService.getAll(),
        locationService.getAll()
      ]);
      
      setAdjustments(operations || []);
      setProducts(products || []);
      setLocations(locations || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load adjustments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAdjustments = adjustments.filter((a) =>
    a.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewDialog = () => {
    const nextNumber = adjustments.length + 1;
    setReference(`WH/ADJ/${String(nextNumber).padStart(4, '0')}`);
    setProductId('');
    setLocationId('');
    setQuantityChange('');
    setScheduleDate('');
    setResponsible('');
    setStatus('Draft');
    setIsNewOpen(true);
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await operationService.create({
        type: 'Adjustment',
        from_location: '',
        to_location: '',
        schedule_date: scheduleDate || new Date().toISOString().split('T')[0],
        status,
      });

      toast({
        title: 'Success',
        description: 'Adjustment created successfully'
      });

      setIsNewOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create adjustment',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock Adjustments</h2>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      <Card className="p-6">
        {/* search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Product</th>
                <th>Location</th>
                <th>Quantity Change</th>
                <th>Date</th>
                <th>Responsible</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-8">
                    No adjustments found
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.reference}</td>
                    <td>{a.items?.[0]?.product_name || '-'}</td>
                    <td>{a.from_location || a.to_location || '-'}</td>
                    <td
                      className={
                        (a.items?.[0]?.quantity || 0) < 0 ? 'text-red-500' : 'text-emerald-600'
                      }
                    >
                      {a.items?.[0]?.quantity || 0}
                    </td>
                    <td>{new Date(a.schedule_date).toLocaleDateString()}</td>
                    <td>{a.responsible_name || '-'}</td>
                    <td>
                      <StatusPill status={a.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Adjustment</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateAdjustment} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input value={reference} readOnly />
            </div>

            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id.toString()}>
                      {prod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={locationId} onValueChange={setLocationId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name} ({loc.warehouse_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity Change</Label>
              <Input
                type="number"
                value={quantityChange}
                onChange={(e) =>
                  setQuantityChange(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                placeholder="Use negative for decrease"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsible</Label>
              <Input
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as AdjustmentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Adjustment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
