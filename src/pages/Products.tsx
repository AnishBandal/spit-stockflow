import { useState } from 'react';
import { Plus, Search, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mockProducts, Product } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

export default function Products() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitOfMeasure: 'Unit',
    totalStock: 0,
    reorderLevel: 0,
    description: '',
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
      toast({ title: 'Product updated successfully' });
    } else {
      const newProduct: Product = {
        id: `p${products.length + 1}`,
        ...formData,
        status: formData.totalStock === 0 ? 'Out of Stock' : formData.totalStock <= formData.reorderLevel ? 'Low' : 'Normal'
      };
      setProducts([...products, newProduct]);
      toast({ title: 'Product created successfully' });
    }
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      unitOfMeasure: 'Unit',
      totalStock: 0,
      reorderLevel: 0,
      description: '',
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitOfMeasure: product.unitOfMeasure,
      totalStock: product.totalStock,
      reorderLevel: product.reorderLevel,
      description: '',
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>SKU / Code</Label>
                  <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Unit of Measure</Label>
                  <Select value={formData.unitOfMeasure} onValueChange={(v) => setFormData({ ...formData, unitOfMeasure: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unit">Unit</SelectItem>
                      <SelectItem value="Box">Box</SelectItem>
                      <SelectItem value="Pack">Pack</SelectItem>
                      <SelectItem value="Kg">Kilogram</SelectItem>
                      <SelectItem value="Liter">Liter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Initial Stock</Label>
                  <Input type="number" value={formData.totalStock} onChange={(e) => setFormData({ ...formData, totalStock: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Level</Label>
                  <Input type="number" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProduct}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.filter(c => c !== 'All').map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Total Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium">{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{product.unitOfMeasure}</td>
                  <td>{product.totalStock}</td>
                  <td>{product.reorderLevel}</td>
                  <td>
                    <span className={`status-pill ${
                      product.status === 'Out of Stock' ? 'status-canceled' :
                      product.status === 'Low' ? 'status-waiting' : 'status-done'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
