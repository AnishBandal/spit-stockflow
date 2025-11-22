import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusPill } from '@/components/StatusPill';
import { mockOperations } from '@/lib/mockData';
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

type Adjustment = {
  id: string;
  type: 'Adjustment';
  reference: string;
  product: string;
  location: string;
  quantityChange: number;
  date: string;
  responsible: string;
  status: AdjustmentStatus;
};

export default function StockAdjustments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);

  // keep existing mock + add 3 demo rows, all coerced to Adjustment type
  const [adjustments, setAdjustments] = useState<Adjustment[]>(() => {
    const base: Adjustment[] = mockOperations
      .filter((op) => op.type === 'Adjustment')
      .map((op: any) => ({
        id: op.id,
        type: 'Adjustment',
        reference: op.reference,
        product: op.product,
        location: op.location,
        quantityChange: op.quantityChange,
        date: op.date,
        responsible: op.responsible,
        status: op.status as AdjustmentStatus,
      }));

    const extra: Adjustment[] = [
      {
        id: 'demo-adj-2',
        type: 'Adjustment',
        reference: 'WH/ADJ/0002',
        product: 'Office Chair',
        location: 'WH/Stock2',
        quantityChange: 5,
        date: '2025-11-22',
        responsible: 'Warehouse Staff',
        status: 'Draft',
      },
      {
        id: 'demo-adj-3',
        type: 'Adjustment',
        reference: 'WH/ADJ/0003',
        product: 'LED Monitor',
        location: 'WH/Stock1',
        quantityChange: -2,
        date: '2025-11-23',
        responsible: 'Inventory Manager',
        status: 'Done',
      },
      {
        id: 'demo-adj-4',
        type: 'Adjustment',
        reference: 'WH/ADJ/0004',
        product: 'Keyboard',
        location: 'WH/Stock3',
        quantityChange: 10,
        date: '2025-11-24',
        responsible: 'John Manager',
        status: 'Draft',
      },
    ];

    return [...base, ...extra];
  });

  // form state
  const [reference, setReference] = useState('');
  const [product, setProduct] = useState('');
  const [location, setLocation] = useState('');
  const [quantityChange, setQuantityChange] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [status, setStatus] = useState<AdjustmentStatus>('Draft');

  const filteredAdjustments = adjustments.filter((a) =>
    a.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewDialog = () => {
    const nextNumber = adjustments.length + 1;
    setReference(`WH/ADJ/${String(nextNumber).padStart(4, '0')}`);
    setProduct('');
    setLocation('');
    setQuantityChange('');
    setDate('');
    setResponsible('');
    setStatus('Draft');
    setIsNewOpen(true);
  };

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();

    const newAdj: Adjustment = {
      id: `adj-${Date.now()}`,
      type: 'Adjustment',
      reference,
      product,
      location,
      quantityChange: typeof quantityChange === 'string' ? 0 : quantityChange,
      date: date || new Date().toISOString(),
      responsible,
      status,
    };

    setAdjustments((prev) => [...prev, newAdj]);
    setIsNewOpen(false);
  };

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
              {filteredAdjustments.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.reference}</td>
                  <td>{a.product}</td>
                  <td>{a.location}</td>
                  <td
                    className={
                      a.quantityChange < 0 ? 'text-red-500' : 'text-emerald-600'
                    }
                  >
                    {a.quantityChange}
                  </td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.responsible}</td>
                  <td>
                    <StatusPill status={a.status} />
                  </td>
                </tr>
              ))}
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
              <Input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsible</Label>
              <Input
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
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
                onClick={() => setIsNewOpen(false)} //button toggled
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