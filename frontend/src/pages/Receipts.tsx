import { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/StatusPill';
import { operationService } from '@/lib/operationService';
import { locationService } from '@/lib/locationService';
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

type ReceiptStatus = 'Draft' | 'Ready' | 'Done';

export default function Receipts() {
  const [statusFilter, setStatusFilter] = useState<'all' | ReceiptStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for new receipt
  const [reference, setReference] = useState('');
  const [source_location_id, setSourceLocationId] = useState('');
  const [destination_location_id, setDestinationLocationId] = useState('');
  const [contact, setContact] = useState('');
  const [scheduled_date, setScheduleDate] = useState('');
  const [status, setStatus] = useState<ReceiptStatus>('Draft');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receiptData, locationData] = await Promise.all([
        operationService.getAll({ 
          type: 'Receipt',
          ...(statusFilter !== 'all' ? { status: statusFilter } : {})
        }),
        locationService.getAll()
      ]);
      setReceipts(receiptData);
      setLocations(locationData);
    } catch (error: any) {
      toast({
        title: 'Failed to load receipts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.contact?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const openNewDialog = () => {
    const nextNumber = receipts.length + 1;
    const nextRef = `WH/IN/${String(nextNumber).padStart(4, '0')}`;

    setReference(nextRef);
    setSourceLocationId('');
    setDestinationLocationId('');
    setContact('');
    setScheduleDate('');
    setStatus('Draft');
    setIsNewOpen(true);
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await operationService.create({
        type: 'Receipt',
        from_location: source_location_id || '',
        to_location: destination_location_id || '',
        contact,
        schedule_date: scheduled_date || new Date().toISOString().split('T')[0],
        status,
      });
      toast({ title: 'Receipt created successfully' });
      setIsNewOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Failed to create receipt',
        description: error.message,
        variant: 'destructive',
      });
    }
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
        <h2 className="text-2xl font-bold">Receipts</h2>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          NEW
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Tabs
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as 'all' | ReceiptStatus)
            }
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Draft">Draft</TabsTrigger>
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
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="cursor-pointer">
                  <td className="font-medium">{receipt.reference}</td>
                  <td>{receipt.from_location || '-'}</td>
                  <td>{receipt.to_location || '-'}</td>
                  <td>{receipt.contact}</td>
                  <td>
                    {new Date(receipt.schedule_date).toLocaleDateString()}
                  </td>
                  <td>
                    <StatusPill status={receipt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Receipt Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Receipt</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateReceipt} className="space-y-4 mt-2">
            {/* Reference (auto-generated, but you can make it editable by removing readOnly) */}
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
              <Label htmlFor="source">Source Location</Label>
              <Select
                value={source_location_id}
                onValueChange={setSourceLocationId}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination Location</Label>
              <Select
                value={destination_location_id}
                onValueChange={setDestinationLocationId}
              >
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select destination location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                value={scheduled_date}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ReceiptStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
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
              <Button type="submit">Create Receipt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}