import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mockWarehouses, Warehouse } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState(mockWarehouses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    address: '',
  });

  const handleSave = () => {
    const newWarehouse: Warehouse = {
      id: `wh${warehouses.length + 1}`,
      ...formData,
    };
    setWarehouses([...warehouses, newWarehouse]);
    toast({ title: 'Warehouse created successfully' });
    setDialogOpen(false);
    setFormData({ name: '', shortCode: '', address: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Warehouses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This page contains the warehouse details & location
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Warehouse</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Warehouse Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Main Warehouse"
                />
              </div>
              <div className="space-y-2">
                <Label>Short Code</Label>
                <Input
                  value={formData.shortCode}
                  onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                  placeholder="WH"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Industrial Blvd, Suite 100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Short Code</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <td className="font-medium">{warehouse.name}</td>
                  <td>{warehouse.shortCode}</td>
                  <td>{warehouse.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
