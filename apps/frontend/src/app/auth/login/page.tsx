'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      clearError();
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by the store
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-dark to-gold flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-dark mb-2">
            Welcome Back
          </h1>
          <p className="text-dark-lighter text-sm">
            Sign in to your African Fashion account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              error={errors.email?.message}
              autoComplete="email"
            />

            <Input
              {...register('password')}
              type="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gold focus:ring-gold border-cream-dark rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-dark cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-gold hover:text-gold-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Sign In
          </Button>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-dark-lighter">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-gold hover:text-gold-dark transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>

        {/* Decorative Elements */}
        <div className="mt-6 border-t border-cream-dark pt-6">
          <p className="text-center text-xs text-dark-lighter">
            🌍 Celebrating African Fashion & Culture
          </p>
        </div>
      </div>
    </div>
  );
}
