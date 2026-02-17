'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Button, Select } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { AFRICAN_COUNTRIES, USER_ROLE_LABELS } from '@/utils/constants';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
  country: z.string().min(1, 'Please select a country'),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, error, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.CUSTOMER,
      acceptTerms: false,
    },
  });

  const roleOptions = [
    { value: UserRole.CUSTOMER, label: USER_ROLE_LABELS[UserRole.CUSTOMER] },
    { value: UserRole.DESIGNER, label: USER_ROLE_LABELS[UserRole.DESIGNER] },
    { value: UserRole.FABRIC_SELLER, label: USER_ROLE_LABELS[UserRole.FABRIC_SELLER] },
  ];

  const countryOptions = AFRICAN_COUNTRIES.map((country) => ({
    value: country,
    label: country,
  }));

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      clearError();
      setSuccessMessage('');

      const { confirmPassword: _confirmPassword, acceptTerms: _acceptTerms, ...registerData } = data;

      await registerUser(registerData);
      setSuccessMessage('Registration successful! Redirecting to dashboard...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-dark to-gold py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-dark mb-2">
              Join Our Community
            </h1>
            <p className="text-dark-lighter text-sm">
              Create an account to start your African fashion journey
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-dark border-b border-cream-dark pb-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('firstName')}
                  type="text"
                  label="First Name"
                  placeholder="John"
                  error={errors.firstName?.message}
                  autoComplete="given-name"
                />

                <Input
                  {...register('lastName')}
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  autoComplete="family-name"
                />
              </div>

              <Input
                {...register('username')}
                type="text"
                label="Username"
                placeholder="johndoe"
                error={errors.username?.message}
                autoComplete="username"
                helperText="Unique username for your profile"
              />

              <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                error={errors.email?.message}
                autoComplete="email"
              />

              <Input
                {...register('phone')}
                type="tel"
                label="Phone Number (Optional)"
                placeholder="+234 XXX XXX XXXX"
                error={errors.phone?.message}
                autoComplete="tel"
              />
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-dark border-b border-cream-dark pb-2">
                Account Details
              </h2>

              <Select
                {...register('role')}
                label="Account Type"
                options={roleOptions}
                error={errors.role?.message}
                helperText="Choose based on how you'll use the platform"
              />

              <Select
                {...register('country')}
                label="Country"
                options={countryOptions}
                placeholder="Select your country"
                error={errors.country?.message}
              />
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-dark border-b border-cream-dark pb-2">
                Security
              </h2>

              <Input
                {...register('password')}
                type="password"
                label="Password"
                placeholder="Enter a strong password"
                error={errors.password?.message}
                autoComplete="new-password"
                helperText="At least 8 characters"
              />

              <Input
                {...register('confirmPassword')}
                type="password"
                label="Confirm Password"
                placeholder="Re-enter your password"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register('acceptTerms')}
                    id="accept-terms"
                    type="checkbox"
                    className="h-4 w-4 text-gold focus:ring-gold border-cream-dark rounded cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="accept-terms" className="text-dark cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms" className="text-gold hover:text-gold-dark font-medium">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-gold hover:text-gold-dark font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-accent text-xs">{errors.acceptTerms.message}</p>
                  )}
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
              Create Account
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-dark-lighter">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-gold hover:text-gold-dark transition-colors"
                >
                  Sign in
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
    </div>
  );
}
