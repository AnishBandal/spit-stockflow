import { useState } from 'react';
import { Search, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusPill } from '@/components/StatusPill';
import { mockOperations } from '@/lib/mockData';

export default function MoveHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const filteredOperations = mockOperations.filter(op => {
    const matchesType = typeFilter === 'all' || op.type === typeFilter;
    const matchesSearch = op.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (op.contact?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const ViewModeButtons = () => (
    <div className="flex gap-2">
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('list')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'kanban' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('kanban')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );

  if (viewMode === 'kanban') {
    const statusGroups = {
      Draft: filteredOperations.filter(op => op.status === 'Draft'),
      Waiting: filteredOperations.filter(op => op.status === 'Waiting'),
      Ready: filteredOperations.filter(op => op.status === 'Ready'),
      Done: filteredOperations.filter(op => op.status === 'Done'),
      Canceled: filteredOperations.filter(op => op.status === 'Canceled'),
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Move History</h2>
          <ViewModeButtons />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(statusGroups).map(([status, ops]) => (
            <div key={status}>
              <h3 className="font-semibold mb-3 px-2">{status}</h3>
              <div className="space-y-2">
                {ops.map(op => (
                  <Card key={op.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <p className="font-medium text-sm mb-2">{op.reference}</p>
                    <p className="text-xs text-muted-foreground mb-1">{op.type}</p>
                    <p className="text-xs">{op.from} → {op.to}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(op.scheduleDate).toLocaleDateString()}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Move History</h2>
        <ViewModeButtons />
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Receipt">Receipts</SelectItem>
              <SelectItem value="Delivery">Deliveries</SelectItem>
              <SelectItem value="Internal Transfer">Internal Transfers</SelectItem>
              <SelectItem value="Adjustment">Adjustments</SelectItem>
            </SelectContent>
          </Select>

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
                <th>Date</th>
                <th>Type</th>
                <th>Contact</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperations.map((op) => (
                <tr key={op.id}>
                  <td className="font-medium">{op.reference}</td>
                  <td>{new Date(op.scheduleDate).toLocaleDateString()}</td>
                  <td>{op.type}</td>
                  <td>{op.contact || '-'}</td>
                  <td>{op.from}</td>
                  <td>{op.to}</td>
                  <td><StatusPill status={op.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
