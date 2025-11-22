import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await authService.requestOTP(email);

    if (result.success) {
      toast({ title: 'OTP sent!', description: 'Check your email for the 6-digit code' });
      setStep('verify');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await authService.verifyOTP(email, otp);

    if (result.success) {
      toast({ title: 'OTP verified!', description: 'Now set your new password' });
      setStep('reset');
    } else {
      toast({ title: 'Invalid OTP', description: result.error, variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allChecksPassed || !passwordsMatch) {
      toast({ title: 'Please fix password issues', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const result = await authService.resetPassword(email, password);

    if (result.success) {
      toast({ title: 'Password updated!', description: 'You can now login with your new password' });
      navigate('/login');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-6 text-center">
            <Package className="h-12 w-12 text-primary mx-auto mb-2" />
            <h2 className="text-2xl font-bold">StockMaster</h2>
          </div>

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          {step === 'request' && (
            <>
              <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                We'll send a 6-digit code to your email
              </p>

              <form onSubmit={handleRequestOTP} className="space-y-4">
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </form>
            </>
          )}

          {step === 'verify' && (
            <>
              <h1 className="text-2xl font-semibold mb-2">Verify OTP</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter the 6-digit code sent to {email}
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Email: {email}</p>
                </div>

                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <h1 className="text-2xl font-semibold mb-2">Set New Password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Choose a strong password for your account
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
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
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </>
          )}
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
