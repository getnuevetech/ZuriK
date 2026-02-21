'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';

type Role = 'customer' | 'designer' | 'fabric_seller';

const roles: { value: Role; label: string; description: string; icon: string }[] = [
  { value: 'customer', label: 'Customer', description: 'Shop authentic African fashion', icon: '🛍️' },
  { value: 'designer', label: 'Designer', description: 'Showcase and sell your designs', icon: '✂️' },
  { value: 'fabric_seller', label: 'Fabric Seller', description: 'Sell premium African fabrics', icon: '🧵' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const newErrors: Partial<typeof form> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, role: selectedRole });
      toast('success', 'Account created successfully!');
      router.push('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message || 'Registration failed. Please try again.';
      toast('error', Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-bold text-2xl text-white mb-2">
            <span className="text-secondary-400">✦</span> African Fashion
          </Link>
          <h1 className="text-3xl font-heading font-bold text-white mt-4">Create your account</h1>
          <p className="text-neutral-300 mt-2">Join the African fashion community</p>
        </div>

        <Card>
          <CardBody className="p-8">
            <GoogleSignInButton mode="signup" />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">or create account with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Role selection */}
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-3">I want to join as a...</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={[
                        'p-4 rounded-xl border-2 text-left transition-all',
                        selectedRole === role.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-neutral-200 hover:border-neutral-300',
                      ].join(' ')}
                    >
                      <div className="text-2xl mb-2">{role.icon}</div>
                      <div className="font-semibold text-neutral-900 text-sm">{role.label}</div>
                      <div className="text-xs text-neutral-500 mt-1">{role.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First name" type="text" placeholder="John" value={form.firstName} onChange={setField('firstName')} error={errors.firstName} autoComplete="given-name" />
                <Input label="Last name" type="text" placeholder="Doe" value={form.lastName} onChange={setField('lastName')} error={errors.lastName} autoComplete="family-name" />
              </div>

              <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={setField('email')} error={errors.email} autoComplete="email" />
              <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={setField('password')} error={errors.password} autoComplete="new-password" helperText="Must be at least 8 characters" />
              <Input label="Confirm password" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={setField('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
