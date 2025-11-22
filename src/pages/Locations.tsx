import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockLocations, mockWarehouses, Location } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

export default function Locations() {
  const [locations, setLocations] = useState(mockLocations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    warehouseId: '',
  });

  const getWarehouseName = (warehouseId: string) => {
    return mockWarehouses.find(w => w.id === warehouseId)?.name || warehouseId;
  };

  const handleSave = () => {
    const newLocation: Location = {
      id: `loc${locations.length + 1}`,
      ...formData,
    };
    setLocations([...locations, newLocation]);
    toast({ title: 'Location created successfully' });
    setDialogOpen(false);
    setFormData({ name: '', shortCode: '', warehouseId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Locations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This holds the multiple locations of warehouses, rooms, etc.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Location</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Location Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Stock Area 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Short Code</Label>
                <Input
                  value={formData.shortCode}
                  onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                  placeholder="Stock1"
                />
              </div>
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={formData.warehouseId} onValueChange={(v) => setFormData({ ...formData, warehouseId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <th>Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td className="font-medium">{location.name}</td>
                  <td>{location.shortCode}</td>
                  <td>{getWarehouseName(location.warehouseId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
