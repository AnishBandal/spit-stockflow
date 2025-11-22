import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { authService } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const user = authService.getCurrentUser();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = () => {
    toast({ title: 'Profile updated successfully' });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    toast({ title: 'Password changed successfully' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">My Profile</h2>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={user?.role} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <Input value="November 2025" disabled className="bg-muted" />
          </div>

          <Button onClick={handleUpdateProfile}>Update Profile</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleChangePassword}>Change Password</Button>
        </div>
      </Card>
    </div>
  );
}
