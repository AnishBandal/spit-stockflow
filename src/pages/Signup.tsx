import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Inventory Manager' | 'Warehouse Staff'>('Warehouse Staff');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allChecksPassed = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allChecksPassed) {
      toast({ title: 'Password does not meet requirements', variant: 'destructive' });
      return;
    }

    if (!passwordsMatch) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const result = await authService.signup(name, email, password, role);

    if (result.success) {
      toast({ title: 'Account created successfully!', description: 'Please log in with your credentials' });
      navigate('/login');
    } else {
      toast({ title: 'Signup failed', description: result.error, variant: 'destructive' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block">
          <div className="text-center space-y-4">
            <Package className="h-24 w-24 text-primary mx-auto" />
            <h2 className="text-3xl font-bold text-foreground">Join StockMaster</h2>
            <p className="text-muted-foreground">
              Start managing your inventory professionally
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="mb-6 lg:hidden text-center">
            <Package className="h-12 w-12 text-primary mx-auto mb-2" />
            <h2 className="text-2xl font-bold">StockMaster</h2>
          </div>

          <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

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
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warehouse Staff">Warehouse Staff</SelectItem>
                  <SelectItem value="Inventory Manager">Inventory Manager</SelectItem>
                </SelectContent>
              </Select>
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

            {password && (
              <div className="text-xs space-y-1 p-3 bg-muted/30 rounded-md">
                <PasswordCheck met={passwordChecks.length}>At least 8 characters</PasswordCheck>
                <PasswordCheck met={passwordChecks.uppercase}>One uppercase letter</PasswordCheck>
                <PasswordCheck met={passwordChecks.lowercase}>One lowercase letter</PasswordCheck>
                <PasswordCheck met={passwordChecks.number}>One number</PasswordCheck>
                <PasswordCheck met={passwordChecks.special}>One special character</PasswordCheck>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {confirmPassword && (
                <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-success' : 'text-destructive'}`}>
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading || !allChecksPassed || !passwordsMatch}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

const PasswordCheck = ({ met, children }: { met: boolean; children: React.ReactNode }) => (
  <div className={`flex items-center gap-2 ${met ? 'text-success' : 'text-muted-foreground'}`}>
    {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    <span>{children}</span>
  </div>
);
