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

// 👇 Status union – use what StatusPill supports
type TransferStatus = 'Draft' | 'Ready' | 'Done';

// 👇 Strong type for a transfer row
type Transfer = {
  id: string;
  type: 'Internal Transfer';
  reference: string;
  from: string;
  to: string;
  scheduleDate: string;
  responsible: string;
  status: TransferStatus;
};

export default function InternalTransfers() {
  // 👇 statusFilter is now 'all' or one of the statuses, not generic string
  const [statusFilter, setStatusFilter] = useState<'all' | TransferStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);

  // ⬇️ KEEP existing mock + ADD 3 more rows, but typed as Transfer[]
  const [transfers, setTransfers] = useState<Transfer[]>(() => {
    const base = mockOperations
      .filter((op) => op.type === 'Internal Transfer')
      .map((op: any): Transfer => ({
        id: op.id,
        type: 'Internal Transfer',
        reference: op.reference,
        from: op.from,
        to: op.to,
        scheduleDate: op.scheduleDate,
        responsible: op.responsible,
        status: op.status as TransferStatus,
      }));

    const extra: Transfer[] = [
      {
        id: 'demo-transfer-2',
        type: 'Internal Transfer',
        reference: 'WH/INT/0002',
        from: 'SF/Cold1',
        to: 'WH/Stock3',
        scheduleDate: '2025-11-27',
        responsible: 'John Manager',
        status: 'Ready',
      },
      {
        id: 'demo-transfer-3',
        type: 'Internal Transfer',
        reference: 'WH/INT/0003',
        from: 'WH/Stock2',
        to: 'WH/Stock1',
        scheduleDate: '2025-11-28',
        responsible: 'Warehouse Staff',
        status: 'Done',
      },
      {
        id: 'demo-transfer-4',
        type: 'Internal Transfer',
        reference: 'WH/INT/0004',
        from: 'WH/ColdStorage',
        to: 'WH/Stock2',
        scheduleDate: '2025-11-29',
        responsible: 'Inventory Manager',
        status: 'Draft',
      },
    ];

    return [...base, ...extra];
  });

  // Form state
  const [reference, setReference] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [status, setStatus] = useState<TransferStatus>('Draft');

  const filteredTransfers = transfers.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = t.reference
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openNewDialog = () => {
    const nextNumber = transfers.length + 1;
    setReference(`WH/INT/${String(nextNumber).padStart(4, '0')}`);
    setFrom('');
    setTo('');
    setScheduleDate('');
    setResponsible('');
    setStatus('Draft');
    setIsNewOpen(true);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransfer: Transfer = {
      id: `transfer-${Date.now()}`,
      type: 'Internal Transfer',
      reference,
      from,
      to,
      scheduleDate: scheduleDate || new Date().toISOString(),
      responsible,
      status,
    };

    setTransfers((prev) => [...prev, newTransfer]);
    setIsNewOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Internal Transfers</h2>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      </div>

      {/* Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | TransferStatus)}>
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
              placeholder="Search by Reference..."
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
                <th>Schedule Date</th>
                <th>Responsible</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.reference}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td>{new Date(t.scheduleDate).toLocaleDateString()}</td>
                  <td>{t.responsible}</td>
                  <td>
                    {/* 👇 now TS knows t.status is TransferStatus, which is compatible with StatusPill */}
                    <StatusPill status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog (unchanged except for types) */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Internal Transfer</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTransfer} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input value={reference} readOnly />
            </div>

            <div className="space-y-2">
              <Label>From</Label>
              <Input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Schedule Date</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TransferStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}