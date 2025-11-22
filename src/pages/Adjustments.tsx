import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusPill } from '@/components/StatusPill';
import { mockOperations, mockProducts } from '@/lib/mockData';

export default function Adjustments() {
  const [searchTerm, setSearchTerm] = useState('');

  const adjustments = mockOperations.filter(op => op.type === 'Adjustment');

  const getProductName = (productId: string) => {
    return mockProducts.find(p => p.id === productId)?.name || '';
  };

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = adj.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stock Adjustments</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
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
                <th>Product</th>
                <th>Location</th>
                <th>Quantity Change</th>
                <th>Date</th>
                <th>Responsible</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.map((adj) => (
                <tr key={adj.id} className="cursor-pointer">
                  <td className="font-medium">{adj.reference}</td>
                  <td>{adj.products.map(p => getProductName(p.productId)).join(', ')}</td>
                  <td>{adj.from}</td>
                  <td>
                    <span className={adj.products[0]?.quantity < 0 ? 'text-destructive' : 'text-success'}>
                      {adj.products[0]?.quantity > 0 ? '+' : ''}{adj.products[0]?.quantity}
                    </span>
                  </td>
                  <td>{new Date(adj.scheduleDate).toLocaleDateString()}</td>
                  <td>{adj.responsible}</td>
                  <td><StatusPill status={adj.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
