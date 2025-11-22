import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await authService.login(email, password);

    if (result.success) {
      toast({ title: 'Welcome back!', description: 'Login successful' });
      navigate('/dashboard');
    } else {
      toast({ 
        title: 'Login failed', 
        description: result.error,
        variant: 'destructive' 
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block">
          <div className="text-center space-y-4">
            <Package className="h-24 w-24 text-primary mx-auto" />
            <h2 className="text-3xl font-bold text-foreground">StockMaster</h2>
            <p className="text-muted-foreground">
              Professional inventory management for modern warehouses
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="mb-6 lg:hidden text-center">
            <Package className="h-12 w-12 text-primary mx-auto mb-2" />
            <h2 className="text-2xl font-bold">StockMaster</h2>
          </div>

          <h1 className="text-2xl font-semibold mb-6">Login to your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline">
              Create account
            </Link>
          </div>

          <Card className="mt-6 p-4 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-3">Demo Accounts</p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-1">Manager Account</p>
                <p><span className="font-medium">Email:</span> demo.manager@stockmaster.test</p>
                <p><span className="font-medium">Password:</span> password123</p>
                <p className="text-xs text-muted-foreground mt-1">Full access to all features</p>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold text-foreground mb-1">Staff Account</p>
                <p><span className="font-medium">Email:</span> staff@stockmaster.test</p>
                <p><span className="font-medium">Password:</span> password123</p>
                <p className="text-xs text-muted-foreground mt-1">Operations, transfers, and stock updates</p>
              </div>
            </div>
          </Card>
        </Card>
      </div>
    </div>
  );
}
