import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/StatusPill';
import { operationService, Operation, OperationItem } from '@/lib/operationService';
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

type DeliveryStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done';

export default function DeliveryOrders() {
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<Operation[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // form state
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [contact, setContact] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [status, setStatus] = useState<DeliveryStatus>('Draft');
  const [items, setItems] = useState<OperationItem[]>([]);

  // Item form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [operations, locationData, productData] = await Promise.all([
        operationService.getAll({ type: 'Delivery' }),
        locationService.getAll(),
        productService.getAll()
      ]);
      
      setDeliveries(operations || []);
      setLocations(locationData || []);
      setProducts(productData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load deliveries',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch =
      d.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.contact?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openNewDialog = () => {
    setFromLocation('');
    setToLocation('');
    setContact('');
    setScheduleDate('');
    setStatus('Draft');
    setItems([]);
    setSelectedProduct('');
    setItemQuantity(1);
    setIsNewOpen(true);
  };

  const addItem = () => {
    if (!selectedProduct) {
      toast({
        title: 'Error',
        description: 'Please select a product',
        variant: 'destructive'
      });
      return;
    }

    const product = products.find(p => p.id.toString() === selectedProduct);
    if (!product) return;

    const newItem: OperationItem = {
      product_id: selectedProduct,
      product_name: product.name,
      sku: product.sku,
      quantity: itemQuantity
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setItemQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive'
      });
      return;
    }

    try {
      await operationService.create({
        type: 'Delivery',
        from_location: fromLocation,
        to_location: toLocation,
        contact,
        schedule_date: scheduleDate || new Date().toISOString().split('T')[0],
        status,
        items
      });

      toast({
        title: 'Success',
        description: 'Delivery created successfully'
      });

      setIsNewOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create delivery',
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
        <h2 className="text-2xl font-bold">Delivery Orders</h2>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          NEW
        </Button>
      </div>

      {/* filters + table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as 'all' | DeliveryStatus)}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Draft">Draft</TabsTrigger>
              <TabsTrigger value="Waiting">Waiting</TabsTrigger>
              <TabsTrigger value="Ready">Ready</TabsTrigger>
              <TabsTrigger value="Done">Done</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Reference or Contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>From</th>
                <th>To</th>
                <th>Items</th>
                <th>Contact</th>
                <th>Schedule Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-8">
                    No deliveries found
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="cursor-pointer">
                    <td className="font-medium">{delivery.reference}</td>
                    <td>{delivery.from_location}</td>
                    <td>{delivery.to_location}</td>
                    <td>{delivery.items?.length || 0} items</td>
                    <td>{delivery.contact || '-'}</td>
                    <td>
                      {new Date(delivery.schedule_date).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusPill status={delivery.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NEW dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Delivery Order</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateDelivery} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">From Location</Label>
                <Select value={fromLocation} onValueChange={setFromLocation} required>
                  <SelectTrigger id="from">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.name}>
                        {loc.name} ({loc.warehouse_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To (Customer/Destination)</Label>
                <Input
                  id="to"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="Customer name or address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Contact person (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduleDate">Schedule Date</Label>
                <Input
                  id="scheduleDate"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as DeliveryStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Waiting">Waiting</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items Section */}
            <div className="border-t pt-4">
              <Label className="text-lg font-semibold">Items</Label>
              
              {/* Add Item Form */}
              <div className="grid grid-cols-12 gap-2 mt-4">
                <div className="col-span-7">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id.toString()}>
                          {prod.name} ({prod.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-2">
                  <Button type="button" onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="mt-4 space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.sku} • Quantity: {item.quantity}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={items.length === 0}>
                Create Delivery ({items.length} items)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
