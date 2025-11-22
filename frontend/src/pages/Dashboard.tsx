import { useNavigate } from 'react-router-dom';
import { Package, TrendingDown, TrendingUp, FileText, Truck, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/StatusPill';
import { mockOperations, mockProducts } from '@/lib/mockData';

export default function Dashboard() {
  const navigate = useNavigate();

  const kpis = [
    { label: 'Total Products', value: mockProducts.length, icon: Package, trend: '+12%', onClick: () => navigate('/products') },
    { label: 'Low Stock Items', value: mockProducts.filter(p => p.status === 'Low').length, icon: TrendingDown, trend: '3 items', onClick: () => navigate('/products') },
    { label: 'Out of Stock', value: mockProducts.filter(p => p.status === 'Out of Stock').length, icon: TrendingUp, trend: '1 item', onClick: () => navigate('/products') },
    { label: 'Pending Receipts', value: mockOperations.filter(o => o.type === 'Receipt' && o.status !== 'Done').length, icon: FileText, trend: '4 items', onClick: () => navigate('/receipts') },
    { label: 'Pending Deliveries', value: mockOperations.filter(o => o.type === 'Delivery' && o.status !== 'Done').length, icon: Truck, trend: '2 items', onClick: () => navigate('/deliveries') },
  ];

  const receiptsToReceive = mockOperations.filter(o => o.type === 'Receipt' && (o.status === 'Waiting' || o.status === 'Ready')).length;
  const deliveriesToDeliver = mockOperations.filter(o => o.type === 'Delivery' && o.status !== 'Done' && o.status !== 'Canceled').length;
  
  const recentOperations = mockOperations.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={kpi.onClick}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-3xl font-bold mt-2">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{kpi.trend}</p>
              </div>
              <kpi.icon className="h-8 w-8 text-primary opacity-80" />
            </div>
          </Card>
        ))}
      </div>

      {/* Receipt & Delivery Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Receipts</h3>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/receipts')}
              >
                {receiptsToReceive} to receive
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <FileText className="h-8 w-8 text-primary opacity-80" />
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• 1 late</p>
            <p>• 6 operations total</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Deliveries</h3>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/deliveries')}
              >
                {deliveriesToDeliver} to deliver
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <Truck className="h-8 w-8 text-primary opacity-80" />
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• 1 late</p>
            <p>• 2 waiting</p>
            <p>• 6 operations total</p>
          </div>
        </Card>
      </div>

      {/* Recent Operations */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Operations</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Schedule Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOperations.map((op) => (
                  <tr key={op.id} className="cursor-pointer" onClick={() => navigate(`/${op.type.toLowerCase().replace(' ', '-')}s`)}>
                    <td className="font-medium">{op.reference}</td>
                    <td>{op.type}</td>
                    <td><StatusPill status={op.status} /></td>
                    <td>{op.from}</td>
                    <td>{op.to}</td>
                    <td>{new Date(op.scheduleDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
