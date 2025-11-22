import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/StatusPill';
import { mockOperations } from '@/lib/mockData';

export default function Receipts() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const receipts = mockOperations.filter(op => op.type === 'Receipt');

  const filteredReceipts = receipts.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.contact?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Receipts</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          NEW
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
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
                  <td>{receipt.from}</td>
                  <td>{receipt.to}</td>
                  <td>{receipt.contact}</td>
                  <td>{new Date(receipt.scheduleDate).toLocaleDateString()}</td>
                  <td><StatusPill status={receipt.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
