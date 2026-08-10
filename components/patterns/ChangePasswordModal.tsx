/**
 * SISMP — Change / Update Password Modal Component
 * Allows authenticated users to update their default or current password to a custom password.
 */
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and Confirmation password do not match.');
      return;
    }

    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 600));

    // Save custom password in localStorage mapped by user email / ID
    try {
      const userKey = user?.email || user?.id || 'default_user';
      const existing = localStorage.getItem('sismp_custom_user_passwords');
      const store = existing ? JSON.parse(existing) : {};
      store[userKey.toLowerCase()] = newPassword;
      localStorage.setItem('sismp_custom_user_passwords', JSON.stringify(store));
    } catch {
      // fallback
    }

    setIsSaving(false);
    setSuccessMsg('Your password has been updated successfully!');
    setTimeout(() => {
      onClose();
      setSuccessMsg('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="max-w-md w-full">
        <Card padding="lg" variant="default" className="shadow-2xl border-primary-200 space-y-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-foreground-subtle hover:text-foreground p-1 rounded-lg hover:bg-background"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Update Password
            </h2>
            <p className="text-xs text-foreground-muted">
              Update your temporary default password for <strong>{user?.email || 'Officer Account'}</strong>.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current / Default Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-foreground">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Input
              label="Confirm New Password"
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button variant="accent" type="submit" isLoading={isSaving} size="sm">
                Save New Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
