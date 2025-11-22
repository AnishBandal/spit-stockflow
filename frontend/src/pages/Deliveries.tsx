import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

type DeliveryStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done';

export default function DeliveryOrders() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);

  // ⬇️ KEEP existing mock data + ADD 2 demo rows
  const [deliveries, setDeliveries] = useState(() => {
    const base = mockOperations.filter(
      (op) => op.type === 'Delivery' // keep your original rows
    );

    // add two extra demo rows so all tabs show data
    const extra: Array<{
      id: string;
      type: 'Delivery Order';
      reference: string;
      from: string;
      to: string;
      contact: string;
      scheduleDate: string;
      status: DeliveryStatus;
    }> = [
      {
        id: 'demo-delivery-3',
        type: 'Delivery Order',
        reference: 'WH/OUT/0003',
        from: 'WH/Stock1',
        to: 'Customer XYZ',
        contact: 'Customer XYZ',
        scheduleDate: '2025-11-25',
        status: 'Draft',
      },
      {
        id: 'demo-delivery-4',
        type: 'Delivery Order',
        reference: 'WH/OUT/0004',
        from: 'WH/Stock2',
        to: 'Office Supplies Hub',
        contact: 'Office Supplies Hub',
        scheduleDate: '2025-11-26',
        status: 'Done',
      },
    ];

    return [...base, ...extra];
  });

  // form state
  const [reference, setReference] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [contact, setContact] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [status, setStatus] = useState<DeliveryStatus>('Draft');

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch =
      d.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.contact?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openNewDialog = () => {
    // next number based on how many rows (including hardcoded)
    const nextNumber = deliveries.length + 1;
    const nextRef = `WH/OUT/${String(nextNumber).padStart(4, '0')}`;

    setReference(nextRef);
    setFrom('');
    setTo('');
    setContact('');
    setScheduleDate('');
    setStatus('Draft');
    setIsNewOpen(true);
  };

  const handleCreateDelivery = (e: React.FormEvent) => {
    e.preventDefault();

    const newDelivery = {
      id: `delivery-${Date.now()}`,
      type: 'Delivery Order' as const,
      reference,
      from,
      to,
      contact,
      scheduleDate: scheduleDate || new Date().toISOString(),
      status,
    };

    setDeliveries((prev) => [...prev, newDelivery]);
    setIsNewOpen(false);
  };

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
            onValueChange={setStatusFilter}
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
                <th>Contact</th>
                <th>Schedule Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="cursor-pointer">
                  <td className="font-medium">{delivery.reference}</td>
                  <td>{delivery.from}</td>
                  <td>{delivery.to}</td>
                  <td>{delivery.contact}</td>
                  <td>
                    {new Date(delivery.scheduleDate).toLocaleDateString()}
                  </td>
                  <td>
                    <StatusPill status={delivery.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NEW dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Delivery Order</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateDelivery} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Source warehouse"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Customer / destination"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Contact name"
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

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Delivery Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}